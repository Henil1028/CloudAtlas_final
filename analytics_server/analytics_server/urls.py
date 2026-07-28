from django.urls import path, include

urlpatterns = [
    path('api/analytics/', include('analytics.urls')),
    path('api/ml/', include('ml_service.urls')),
]
