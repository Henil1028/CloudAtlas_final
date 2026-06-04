from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from django.http import HttpResponse
from .pipeline import run_pipeline
import datetime
import random
import jwt
import os
import csv
import json

# Helper to verify Express JWT token in Django
def authorize_user(request):
    auth_header = request.headers.get('Authorization', None)
    if not auth_header:
        raise AuthenticationFailed('Authorization header is missing')
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise AuthenticationFailed('Authorization header must be Bearer token')
    
    token = parts[1]
    jwt_secret = os.environ.get('JWT_SECRET', 'cloudatlas-ai-super-secret-jwt-key-change-in-production')
    
    try:
        decoded = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        # Restrict to super_admin as requested
        if decoded.get('role') != 'super_admin':
            raise AuthenticationFailed('Access forbidden: Super Admin role required')
        return decoded
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token has expired')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid signature token')

# Mock data generator (replicates Express in-memory seed)
def get_mock_python_records():
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
    usage_types = ['ComputeInstance', 'DatabaseStorage', 'DataTransfer', 'APIRequest', 'IPAddress']

    now = datetime.datetime.now()
    records = []

    for i in range(120):
        provider = providers[i % len(providers)]
        provider_services = services[provider]
        service = random.choice(provider_services)
        region = random.choice(regions[provider])
        usage_type = random.choice(usage_types)
        
        date = now - datetime.timedelta(days=random.randint(0, 90))
        cost = round(random.random() * 850 + 2.5, 2)
        
        records.append({
            '_id': f"mock-bill-{i}",
            'provider': provider,
            'date': date.strftime('%Y-%m-%d'),
            'service': service,
            'region': region,
            'usageType': usage_type,
            'cost': cost,
            'currency': 'USD',
            'accountId': str(100000000000 + (i % 3) * 555555),
            'uploadedBy': 'mock-admin-1',
            'uploadDate': now.strftime('%Y-%m-%d'),
        })
    return records

# Retrieve records from MongoDB, fallback to mock python records
def get_billing_records():
    mongo_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/cloudatlas')
    import pymongo
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
        # Check connection validity
        client.server_info()
        db = client['cloudatlas']
        # Node Mongoose collections default pluralization check
        collection = db['billingdatas']
        records = list(collection.find())
        
        if len(records) == 0:
            return get_mock_python_records()
            
        for r in records:
            r['_id'] = str(r['_id'])
            # Ensure dates serialize cleanly
            if isinstance(r.get('date'), datetime.datetime):
                r['date'] = r['date'].strftime('%Y-%m-%d')
            if isinstance(r.get('uploadDate'), datetime.datetime):
                r['uploadDate'] = r['uploadDate'].strftime('%Y-%m-%d')
        return records
    except Exception:
        # Fallback to local python records
        return get_mock_python_records()

# Helper to filter records before analytics pipeline runs
def filter_records(records, query_params):
    if not records:
        return []
    import pandas as pd
    df = pd.DataFrame(records)
    
    # 1. Provider Filter (case-insensitive)
    provider = query_params.get('provider')
    if provider:
        df = df[df['provider'].str.strip().str.lower() == provider.strip().lower()]
        
    # 2. Service Filter (case-insensitive)
    service = query_params.get('service')
    if service:
        df = df[df['service'].str.strip().str.lower() == service.strip().lower()]
        
    # 3. Region Filter (case-insensitive)
    region = query_params.get('region')
    if region:
        df = df[df['region'].str.strip().str.lower() == region.strip().lower()]
        
    # 4. Usage Type Filter (case-insensitive)
    usage_type = query_params.get('usageType')
    if usage_type:
        df = df[df['usageType'].str.strip().str.lower() == usage_type.strip().lower()]
        
    # 5. Cost Range Filters
    cost_min = query_params.get('costMin')
    if cost_min:
        try:
            df = df[df['cost'].astype(float) >= float(cost_min)]
        except Exception:
            pass
    cost_max = query_params.get('costMax')
    if cost_max:
        try:
            df = df[df['cost'].astype(float) <= float(cost_max)]
        except Exception:
            pass
            
    # 6. Date Range Filters
    date_min = query_params.get('dateMin')
    if date_min:
        try:
            df = df[pd.to_datetime(df['date']) >= pd.to_datetime(date_min)]
        except Exception:
            pass
    date_max = query_params.get('dateMax')
    if date_max:
        try:
            df = df[pd.to_datetime(df['date']) <= pd.to_datetime(date_max)]
        except Exception:
            pass
            
    return df.to_dict(orient='records')

# @desc    Get analytics summary
# @route   GET /api/analytics/summary
# @access  Private (Super Admin)
@api_view(['GET'])
def get_analytics_summary(request):
    authorize_user(request)
    records = get_billing_records()
    records = filter_records(records, request.query_params)
    pipeline_results = run_pipeline(records)
    
    total_cost = float(df_sum := sum(r['cost'] for r in records))
    average_cost = pipeline_results['statistics']['mean']
    
    return Response({
        'totalCost': total_cost,
        'averageCost': average_cost,
        'statistics': pipeline_results['statistics'],
        'insights': pipeline_results['insights'],
    })

# @desc    Get data quality metrics
# @route   GET /api/analytics/quality
# @access  Private (Super Admin)
@api_view(['GET'])
def get_analytics_quality(request):
    authorize_user(request)
    records = get_billing_records()
    records = filter_records(records, request.query_params)
    pipeline_results = run_pipeline(records)
    return Response(pipeline_results['qualityReport'])

# @desc    Get cost trends
# @route   GET /api/analytics/trends
# @access  Private (Super Admin)
@api_view(['GET'])
def get_analytics_trends(request):
    authorize_user(request)
    records = get_billing_records()
    records = filter_records(records, request.query_params)
    pipeline_results = run_pipeline(records)
    return Response({
        'dailySpend': pipeline_results['dailySpend'],
        'monthlySpend': pipeline_results['monthlySpend'],
    })

# @desc    Get provider cost share
# @route   GET /api/analytics/providers
# @access  Private (Super Admin)
@api_view(['GET'])
def get_analytics_providers(request):
    authorize_user(request)
    records = get_billing_records()
    records = filter_records(records, request.query_params)
    pipeline_results = run_pipeline(records)
    return Response(pipeline_results['providerSpend'])

# @desc    Get service spend ranking
# @route   GET /api/analytics/services
# @access  Private (Super Admin)
@api_view(['GET'])
def get_analytics_services(request):
    authorize_user(request)
    records = get_billing_records()
    records = filter_records(records, request.query_params)
    pipeline_results = run_pipeline(records)
    return Response(pipeline_results['topServices'])

# @desc    Get correlation metrics
# @route   GET /api/analytics/correlation
# @access  Private (Super Admin)
@api_view(['GET'])
def get_analytics_correlation(request):
    authorize_user(request)
    records = get_billing_records()
    records = filter_records(records, request.query_params)
    pipeline_results = run_pipeline(records)
    return Response(pipeline_results['correlation'])

# @desc    Export cleaned dataset
# @route   GET /api/analytics/export
# @access  Private (Super Admin)
@api_view(['GET'])
def get_analytics_export(request):
    authorize_user(request)
    records = get_billing_records()
    records = filter_records(records, request.query_params)
    pipeline_results = run_pipeline(records)
    cleaned_records = pipeline_results['cleanedRecords']
    
    export_format = request.query_params.get('format', 'json').lower()
    
    if export_format == 'csv':
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="cloudatlas_cleaned_ml_ready.csv"'
        
        if len(cleaned_records) > 0:
            writer = csv.writer(response)
            # Use keys of first row as headers
            writer.writerow(cleaned_records[0].keys())
            for row in cleaned_records:
                writer.writerow(row.values())
        return response
        
    return Response(cleaned_records)
