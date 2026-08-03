from django.urls import path
from . import views

urlpatterns = [
    path('summary', views.get_analytics_summary, name='analytics_summary'),
    path('quality', views.get_analytics_quality, name='analytics_quality'),
    path('trends', views.get_analytics_trends, name='analytics_trends'),
    path('providers', views.get_analytics_providers, name='analytics_providers'),
    path('services', views.get_analytics_services, name='analytics_services'),
    path('correlation', views.get_analytics_correlation, name='analytics_correlation'),
    path('export', views.get_analytics_export, name='analytics_export'),
    path('migration-intelligence', views.get_migration_intelligence, name='analytics_migration_intelligence'),
]
