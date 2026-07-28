import time
import os
import datetime
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pymongo

from ml_service.training.pipeline import preprocess_and_feature_engineer, TARGET_VAR, NUMERICAL_FEATURES, CATEGORICAL_FEATURES
from ml_service.utils import load_billing_data

# Ensure directory for models exists
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def train_and_evaluate_models():
    """
    Loads billing data, runs preprocessing/feature engineering, trains 5 models,
    evaluates them, logs results to MongoDB, and dumps model artifacts.
    """
    df = load_billing_data()
    if len(df) < 5:
        return {"error": "Insufficient billing records to train ML models."}

    # Preprocess & Feature Engineer
    X_processed, y, preprocessor = preprocess_and_feature_engineer(df, is_training=True)

    # 80/20 Train Test Split
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42)

    models_metrics = []
    trained_models = {}

    # Helper to calculate MAPE
    def get_mape(y_true, y_pred):
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        return float(np.mean(np.abs((y_true - y_pred) / np.clip(y_true, 1.0, None))) * 100)

    # 1. Multiple Linear Regression (All Features)
    start_t = time.time()
    mlr = LinearRegression()
    mlr.fit(X_train, y_train)
    t_time = time.time() - start_t

    start_p = time.time()
    y_pred = mlr.predict(X_test)
    p_time = time.time() - start_p

    models_metrics.append({
        "model_name": "Multiple Linear Regression",
        "mae": round(mean_absolute_error(y_test, y_pred), 4),
        "mse": round(mean_squared_error(y_test, y_pred), 4),
        "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 4),
        "r2": round(r2_score(y_test, y_pred), 4),
        "mape": round(get_mape(y_test, y_pred), 2),
        "training_time": round(t_time, 4),
        "prediction_time": round(p_time, 4)
    })
    trained_models["Multiple Linear Regression"] = (mlr, False)

    # 2. Polynomial Regression (Degree 2 on All Features)
    start_t = time.time()
    poly_pipe = Pipeline([
        ('poly', PolynomialFeatures(degree=2, include_bias=False)),
        ('lr', LinearRegression())
    ])
    poly_pipe.fit(X_train, y_train)
    t_time = time.time() - start_t

    start_p = time.time()
    y_pred = poly_pipe.predict(X_test)
    p_time = time.time() - start_p

    models_metrics.append({
        "model_name": "Polynomial Regression",
        "mae": round(mean_absolute_error(y_test, y_pred), 4),
        "mse": round(mean_squared_error(y_test, y_pred), 4),
        "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 4),
        "r2": round(r2_score(y_test, y_pred), 4),
        "mape": round(get_mape(y_test, y_pred), 2),
        "training_time": round(t_time, 4),
        "prediction_time": round(p_time, 4)
    })
    trained_models["Polynomial Regression"] = (poly_pipe, False)

    # 3. Random Forest Regressor
    start_t = time.time()
    rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    t_time = time.time() - start_t

    start_p = time.time()
    y_pred = rf.predict(X_test)
    p_time = time.time() - start_p

    models_metrics.append({
        "model_name": "Random Forest Regressor",
        "mae": round(mean_absolute_error(y_test, y_pred), 4),
        "mse": round(mean_squared_error(y_test, y_pred), 4),
        "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 4),
        "r2": round(r2_score(y_test, y_pred), 4),
        "mape": round(get_mape(y_test, y_pred), 2),
        "training_time": round(t_time, 4),
        "prediction_time": round(p_time, 4)
    })
    trained_models["Random Forest Regressor"] = (rf, False)

    # 4. XGBoost Regressor
    start_t = time.time()
    xgb = XGBRegressor(n_estimators=150, learning_rate=0.08, max_depth=6, random_state=42, n_jobs=-1)
    xgb.fit(X_train, y_train)
    t_time = time.time() - start_t

    start_p = time.time()
    y_pred = xgb.predict(X_test)
    p_time = time.time() - start_p

    models_metrics.append({
        "model_name": "XGBoost Regressor",
        "mae": round(mean_absolute_error(y_test, y_pred), 4),
        "mse": round(mean_squared_error(y_test, y_pred), 4),
        "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 4),
        "r2": round(r2_score(y_test, y_pred), 4),
        "mape": round(get_mape(y_test, y_pred), 2),
        "training_time": round(t_time, 4),
        "prediction_time": round(p_time, 4)
    })
    trained_models["XGBoost Regressor"] = (xgb, False)

    # Identify Best Model (based on RMSE and R2)
    # We sort by RMSE ascending
    sorted_metrics = sorted(models_metrics, key=lambda x: x["rmse"])
    best_metric = sorted_metrics[0]
    best_model_name = best_metric["model_name"]
    best_model_obj, is_special_feature = trained_models[best_model_name]

    # Save best_model.pkl, scaler.pkl, encoder.pkl using Joblib
    # Note: ColumnTransformer preprocessor contains both scaler and encoder.
    scaler = preprocessor.named_transformers_['num']
    encoder = preprocessor.named_transformers_['cat']

    joblib.dump(best_model_obj, os.path.join(MODELS_DIR, 'best_model.pkl'))
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))
    joblib.dump(encoder, os.path.join(MODELS_DIR, 'encoder.pkl'))
    # Also save the preprocessor configuration for easier pipeline loading
    joblib.dump(preprocessor, os.path.join(MODELS_DIR, 'preprocessor.pkl'))
    
    # Save a small text file keeping track of the metadata of the best model
    meta = {
        "best_model_name": best_model_name,
        "is_special_feature": is_special_feature,
        "accuracy": round(best_metric["r2"] * 100, 2), # R² expressed as accuracy %
        "rmse": best_metric["rmse"],
        "mae": best_metric["mae"],
        "mape": best_metric["mape"],
        "training_time": best_metric["training_time"],
        "trained_at": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    joblib.dump(meta, os.path.join(MODELS_DIR, 'metadata.pkl'))

    # Save to MongoDB ModelTraining collection
    mongo_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/cloudatlas')
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
        client.server_info()
        db = client['cloudatlas']
        # Mongoose pluralizes ModelTraining to modeltrainings
        collection = db['modeltrainings']
        
        # Save training metrics for all models
        trained_at_now = datetime.datetime.now()
        for metric in models_metrics:
            collection.insert_one({
                "model_name": metric["model_name"],
                "accuracy": round(metric["r2"] * 100, 2), # R² score representation
                "rmse": metric["rmse"],
                "mae": metric["mae"],
                "training_time": metric["training_time"],
                "trained_at": trained_at_now
            })
    except Exception as e:
        print(f"Failed to log ModelTraining to MongoDB: {e}")

    return {
        "best_model": best_model_name,
        "accuracy": meta["accuracy"],
        "rmse": meta["rmse"],
        "mae": meta["mae"],
        "training_time": meta["training_time"],
        "comparison": models_metrics
    }
