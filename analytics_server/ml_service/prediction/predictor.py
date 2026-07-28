import os
import joblib
import datetime
import pandas as pd
import numpy as np
import pymongo

def load_ml_assets():
    """
    Loads model, preprocessor, and metadata.
    If they don't exist, runs trainer first to ensure zero downtime.
    """
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
    model_path = os.path.join(models_dir, 'best_model.pkl')
    preprocessor_path = os.path.join(models_dir, 'preprocessor.pkl')
    metadata_path = os.path.join(models_dir, 'metadata.pkl')
    
    if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
        print("Model assets missing. Running training pipeline...")
        from ml_service.training.trainer import train_and_evaluate_models
        train_and_evaluate_models()
        
    model = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path)
    metadata = joblib.load(metadata_path)
    return model, preprocessor, metadata

def predict_cost(input_data, prediction_type, requested_by='super_admin'):
    """
    Predicts the future cloud cost (next day, week, or month) by shifting dates chronologically,
    running predictions through the fitted model, and aggregating.
    Logs results to MongoDB.
    """
    model, preprocessor, metadata = load_ml_assets()
    
    # Extract values from input
    provider = input_data.get('provider', 'aws').strip().lower()
    service = input_data.get('service', 'EC2').strip()
    resource_type = input_data.get('resource_type', 't2.medium').strip()
    region = input_data.get('region', 'us-east-1').strip()
    cpu = float(input_data.get('cpu_utilization', 40.0))
    mem = float(input_data.get('memory_utilization', 50.0))
    storage = float(input_data.get('storage_gb', 100.0))
    network = float(input_data.get('network_gb', 10.0))
    env = input_data.get('environment', 'production').strip().lower()
    payment_type = input_data.get('payment_type', 'on_demand').strip().lower()
    status = input_data.get('status', 'active').strip().lower()

    # Pre-calculate features that remain constant across days
    efficiency_score = round((cpu + mem) / 2.0, 2)
    
    # Establish forecasting date lists
    now = datetime.datetime.now()
    dates_list = []
    
    if prediction_type == 'day':
        dates_list = [now + datetime.timedelta(days=1)]
    elif prediction_type == 'week':
        dates_list = [now + datetime.timedelta(days=i) for i in range(1, 8)]
    elif prediction_type == 'month':
        dates_list = [now + datetime.timedelta(days=i) for i in range(1, 31)]
    else:
        raise ValueError(f"Invalid prediction_type: {prediction_type}")

    # Build features dataframe for each date
    rows = []
    for date in dates_list:
        rows.append({
            'provider': provider,
            'service': service,
            'region': region,
            'resource_type': resource_type,
            'environment': env,
            'payment_type': payment_type,
            'status': status,
            'cpu_utilization': cpu,
            'memory_utilization': mem,
            'storage_gb': storage,
            'network_gb': network,
            'resource_efficiency_score': efficiency_score,
            'cost_per_gb': 0.0,  # Computed at step 3, default to 0 for predict input
            'cost_per_cpu': 0.0,
            'rolling_7_day_cost': 0.0,
            'rolling_30_day_cost': 0.0,
            'cost_growth_rate': 0.0,
            'day_of_week_num': date.weekday(),
            'month': date.month,
            'quarter': (date.month - 1) // 3 + 1,
            'week_of_year': date.isocalendar()[1],
            'is_weekend': 1 if date.weekday() in [5, 6] else 0
        })
        
    df_pred = pd.DataFrame(rows)

    # Transform using saved preprocessor ColumnTransformer
    X_processed = preprocessor.transform(df_pred)

    # Make Predictions
    predictions = model.predict(X_processed)
    # Costs can't be negative
    predictions = np.clip(predictions, 0.0, None)
    
    total_predicted_cost = float(np.sum(predictions))

    # Calculate Confidence Score: 
    # Base confidence is model accuracy (R² %). 
    # If the user provides extreme input anomalies (e.g. CPU=100% and Memory=100%), 
    # the confidence degrades slightly.
    base_acc = metadata.get("accuracy", 80.0)
    
    # CPU/Mem deviation from balanced midpoint (50%)
    dev_cpu = abs(cpu - 50.0) / 50.0
    dev_mem = abs(mem - 50.0) / 50.0
    penalty = (dev_cpu + dev_mem) * 5.0 # Max 10% deduction
    
    confidence_score = float(max(60.0, min(99.0, base_acc - penalty)))

    # Save to MongoDB PredictionHistory, PredictionLogs
    mongo_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/cloudatlas')
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
        client.server_info()
        db = client['cloudatlas']
        
        # Mongoose pluralization defaults:
        # PredictionHistory -> predictionhistories
        # PredictionLogs -> predictionlogs
        hist_col = db['predictionhistories']
        log_col = db['predictionlogs']
        
        created_at_now = datetime.datetime.now()
        
        # Log PredictionHistory
        hist_col.insert_one({
            "prediction_type": prediction_type,
            "predicted_cost": round(total_predicted_cost, 2),
            "confidence_score": round(confidence_score, 2),
            "created_at": created_at_now,
            "requested_by": requested_by
        })
        
        # Log PredictionLogs
        log_col.insert_one({
            "input_data": {
                "provider": provider,
                "service": service,
                "resource_type": resource_type,
                "region": region,
                "cpu_utilization": cpu,
                "memory_utilization": mem,
                "storage_gb": storage,
                "network_gb": network,
                "environment": env,
                "payment_type": payment_type,
                "status": status
            },
            "prediction_result": round(total_predicted_cost, 2),
            "timestamp": created_at_now
        })
    except Exception as e:
        print(f"Failed to save prediction logs to MongoDB: {e}")

    return {
        "predicted_cost": round(total_predicted_cost, 2),
        "confidence_score": round(confidence_score, 2),
        "prediction_date": (now + datetime.timedelta(days=1)).strftime('%Y-%m-%d'),
        "prediction_type": prediction_type
    }
