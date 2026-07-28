import os
import jwt
import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from ml_service.training.trainer import train_and_evaluate_models
from ml_service.prediction.predictor import predict_cost
from ml_service.serializers import MLPredictInputSerializer
import pymongo

# Helper to verify Express JWT token in Django (matching Phase 3 settings)
def authorize_user(request, require_admin=False):
    """
    Decodes the JWT forwarded from the Node.js gateway.
    require_admin=True  → only super_admin can proceed (train/retrain/history)
    require_admin=False → both super_admin and user roles can proceed (predictions)
    """
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
        role = decoded.get('role', '')
        allowed_roles = ['super_admin', 'admin'] if require_admin else ['super_admin', 'admin', 'user']
        if role not in allowed_roles:
            raise AuthenticationFailed(f'Access forbidden: role "{role}" is not authorized for this endpoint')
        return decoded
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token has expired')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid signature token')

# @desc    Train ML Models and select best
# @route   POST /api/ml/train
# @access  Private (Super Admin)
@api_view(['POST'])
def train_models_view(request):
    authorize_user(request, require_admin=True)
    results = train_and_evaluate_models()
    if "error" in results:
        return Response(results, status=400)
    return Response(results)

# @desc    Retrain ML Models
# @route   POST /api/ml/retrain
# @access  Private (Super Admin)
@api_view(['POST'])
def retrain_models_view(request):
    authorize_user(request, require_admin=True)
    results = train_and_evaluate_models()
    if "error" in results:
        return Response(results, status=400)
    return Response({
        "message": "Model retrained successfully using the latest billing records.",
        **results
    })

# @desc    Predict Day Cost
# @route   POST /api/ml/predict/day
# @access  Private (Super Admin)
@api_view(['POST'])
def predict_day_view(request):
    user_payload = authorize_user(request, require_admin=False)
    serializer = MLPredictInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    results = predict_cost(serializer.validated_data, 'day', requested_by=user_payload.get('email', 'admin'))
    return Response(results)

# @desc    Predict Week Cost
# @route   POST /api/ml/predict/week
# @access  Private (Super Admin)
@api_view(['POST'])
def predict_week_view(request):
    user_payload = authorize_user(request, require_admin=False)
    serializer = MLPredictInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    results = predict_cost(serializer.validated_data, 'week', requested_by=user_payload.get('email', 'admin'))
    return Response(results)

# @desc    Predict Month Cost
# @route   POST /api/ml/predict/month
# @access  Private (Super Admin)
@api_view(['POST'])
def predict_month_view(request):
    user_payload = authorize_user(request, require_admin=False)
    serializer = MLPredictInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    results = predict_cost(serializer.validated_data, 'month', requested_by=user_payload.get('email', 'admin'))
    return Response(results)

# @desc    Get Model Training History Comparison Runs
# @route   GET /api/ml/runs
# @access  Private (Super Admin)
@api_view(['GET'])
def get_training_runs_view(request):
    authorize_user(request, require_admin=True)
    mongo_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/cloudatlas')
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
        client.server_info()
        db = client['cloudatlas']
        collection = db['modeltrainings']
        # Return last 30 training runs
        runs = list(collection.find().sort("trained_at", -1).limit(30))
        for r in runs:
            r['_id'] = str(r['_id'])
            if isinstance(r.get('trained_at'), datetime.datetime):
                r['trained_at'] = r['trained_at'].strftime('%Y-%m-%d %H:%M:%S')
        return Response(runs)
    except Exception as e:
        return Response({"error": f"Failed to fetch runs: {e}"}, status=500)

# @desc    Get Prediction logs history
# @route   GET /api/ml/history
# @access  Private (Super Admin)
@api_view(['GET'])
def get_prediction_history_view(request):
    authorize_user(request, require_admin=True)
    mongo_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/cloudatlas')
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
        client.server_info()
        db = client['cloudatlas']
        collection = db['predictionhistories']
        # Return last 50 predictions
        history = list(collection.find().sort("created_at", -1).limit(50))
        for h in history:
            h['_id'] = str(h['_id'])
            if isinstance(h.get('created_at'), datetime.datetime):
                h['created_at'] = h['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        return Response(history)
    except Exception as e:
        return Response({"error": f"Failed to fetch prediction history: {e}"}, status=500)
