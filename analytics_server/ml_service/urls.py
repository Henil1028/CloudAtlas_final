from django.urls import path
from . import views

urlpatterns = [
    path('train', views.train_models_view, name='train_models'),
    path('retrain', views.retrain_models_view, name='retrain_models'),
    path('predict/day', views.predict_day_view, name='predict_day'),
    path('predict/week', views.predict_week_view, name='predict_week'),
    path('predict/month', views.predict_month_view, name='predict_month'),
    path('runs', views.get_training_runs_view, name='training_runs'),
    path('history', views.get_prediction_history_view, name='prediction_history'),
]
