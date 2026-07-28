from rest_framework import serializers

class MLPredictInputSerializer(serializers.Serializer):
    provider = serializers.CharField(required=True, max_length=50)
    service = serializers.CharField(required=True, max_length=100)
    resource_type = serializers.CharField(required=True, max_length=100)
    region = serializers.CharField(required=False, max_length=100, default='us-east-1')
    cpu_utilization = serializers.FloatField(required=True, min_value=0.0, max_value=100.0)
    memory_utilization = serializers.FloatField(required=True, min_value=0.0, max_value=100.0)
    storage_gb = serializers.FloatField(required=True, min_value=0.0)
    network_gb = serializers.FloatField(required=True, min_value=0.0)
    environment = serializers.CharField(required=True, max_length=50)
    payment_type = serializers.CharField(required=True, max_length=50)
    status = serializers.CharField(required=True, max_length=50)
