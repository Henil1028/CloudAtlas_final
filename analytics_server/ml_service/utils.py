import os
import random
import datetime
import pandas as pd
import pymongo

def get_mock_ml_records():
    """
    Generates a mock dataset matching Phase 4 specs for model training fallback.
    """
    random.seed(42)
    providers = ['aws', 'azure', 'gcp']
    services = {
        'aws': ['EC2', 'RDS', 'S3', 'Lambda', 'DynamoDB'],
        'azure': ['Virtual Machines', 'SQL Database', 'Blob Storage', 'Functions', 'Cosmos DB'],
        'gcp': ['Compute Engine', 'Cloud SQL', 'Cloud Storage', 'Cloud Functions', 'BigQuery'],
    }
    regions = {
        'aws': ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
        'azure': ['East US', 'West US 2', 'West Europe', 'Southeast Asia'],
        'gcp': ['us-central1', 'us-east4', 'europe-west1', 'asia-east1'],
    }
    resource_types = {
        'aws': ['i3.xlarge', 'db.m5.large', 'S3-Standard', 'Lambda-Execution', 'DynamoDB-Provisioned'],
        'azure': ['D4s v3', 'GP_Gen5_4', 'LRS_Block', 'Serverless', 'Provisioned-RU'],
        'gcp': ['n2-standard-4', 'db-custom-2-7680', 'Standard-Bucket', 'CloudFunctions-Execution', 'BigQuery-OnDemand'],
    }
    
    environments = ['production', 'staging', 'development']
    payment_types = ['on_demand', 'savings_plan', 'reserved']
    statuses = ['active', 'stopped', 'terminated']
    
    now = datetime.datetime.now()
    records = []
    
    # Generate 200 records to ensure scikit-learn training is stable
    for i in range(200):
        provider = providers[i % len(providers)]
        service = random.choice(services[provider])
        region = random.choice(regions[provider])
        res_type = random.choice(resource_types[provider])
        env = random.choice(environments)
        pay_type = random.choice(payment_types)
        status = random.choice(statuses)
        
        # CPU/Mem/Storage/Network values
        cpu = round(random.uniform(5.0, 95.0), 2)
        mem = round(random.uniform(10.0, 90.0), 2)
        storage = round(random.uniform(0.0, 1000.0), 2)
        network = round(random.uniform(0.0, 500.0), 2)
        
        date = now - datetime.timedelta(days=random.randint(0, 90))
        
        # Base cost influenced by resources
        base_cost = (cpu * 1.5) + (mem * 0.8) + (storage * 0.15) + (network * 0.05)
        if pay_type == 'reserved':
            base_cost *= 0.6
        elif pay_type == 'savings_plan':
            base_cost *= 0.8
            
        cost = round(max(2.5, base_cost + random.uniform(-10.0, 10.0)), 2)
        
        records.append({
            'billing_id': f"mock-bill-{i}",
            'date': date.strftime('%Y-%m-%d'),
            'provider': provider,
            'account_id': str(100000000000 + (i % 3) * 555555),
            'service': service,
            'region': region,
            'usage_type': 'ComputeInstance' if i % 2 == 0 else 'DatabaseStorage',
            'resource_id': f"res-{provider}-{i}",
            'resource_type': res_type,
            'cpu_utilization': cpu,
            'memory_utilization': mem,
            'storage_gb': storage,
            'network_gb': network,
            'cost': cost,
            'currency': 'USD',
            'environment': env,
            'team': 'DevOps' if i % 2 == 0 else 'Data Science',
            'project_name': 'CloudAtlas',
            'billing_cycle': date.strftime('%Y-%m'),
            'payment_type': pay_type,
            'status': status
        })
    return records

def load_billing_data():
    """
    Connects to MongoDB and returns billing data as a Pandas DataFrame.
    If database connection fails, falls back to mock dataset.
    """
    mongo_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/cloudatlas')
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
        client.server_info() # Trigger connection check
        db = client['cloudatlas']
        # Node collection is usually 'billingdatas'
        collection = db['billingdatas']
        records = list(collection.find())
        
        if not records or len(records) == 0:
            print("MongoDB has no billing data. Falling back to mock data.")
            records = get_mock_ml_records()
        else:
            # Normalize records
            for r in records:
                r['billing_id'] = str(r.get('_id'))
                # Handle nested or alternate keys from Mongoose
                if 'usageType' in r and 'usage_type' not in r:
                    r['usage_type'] = r['usageType']
                if 'resourceType' in r and 'resource_type' not in r:
                    r['resource_type'] = r['resourceType']
                if 'cpuUtilization' in r and 'cpu_utilization' not in r:
                    r['cpu_utilization'] = r['cpuUtilization']
                if 'memoryUtilization' in r and 'memory_utilization' not in r:
                    r['memory_utilization'] = r['memoryUtilization']
                if 'storageGb' in r and 'storage_gb' not in r:
                    r['storage_gb'] = r['storageGb']
                if 'networkGb' in r and 'network_gb' not in r:
                    r['network_gb'] = r['networkGb']
                if 'paymentType' in r and 'payment_type' not in r:
                    r['payment_type'] = r['paymentType']
                if 'projectName' in r and 'project_name' not in r:
                    r['project_name'] = r['projectName']
                if 'billingCycle' in r and 'billing_cycle' not in r:
                    r['billing_cycle'] = r['billingCycle']
                
                # Make sure CPU/memory/storage/network exist, else fill defaults
                r['cpu_utilization'] = float(r.get('cpu_utilization', random.uniform(5, 95)))
                r['memory_utilization'] = float(r.get('memory_utilization', random.uniform(10, 90)))
                r['storage_gb'] = float(r.get('storage_gb', random.uniform(0, 500)))
                r['network_gb'] = float(r.get('network_gb', random.uniform(0, 200)))
                r['environment'] = r.get('environment', 'production')
                r['payment_type'] = r.get('payment_type', 'on_demand')
                r['status'] = r.get('status', 'active')
                
                # Convert dates to string ISO format
                if isinstance(r.get('date'), datetime.datetime):
                    r['date'] = r['date'].strftime('%Y-%m-%d')
                else:
                    r['date'] = str(r.get('date'))
        
        df = pd.DataFrame(records)
        return df
    except Exception as e:
        print(f"MongoDB connection failed: {e}. Falling back to mock data.")
        records = get_mock_ml_records()
        return pd.DataFrame(records)
