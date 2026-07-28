import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# Target and features lists
TARGET_VAR = 'cost'
CATEGORICAL_FEATURES = [
    'provider', 'service', 'region', 'resource_type', 
    'environment', 'payment_type', 'status'
]
NUMERICAL_FEATURES = [
    'cpu_utilization', 'memory_utilization', 'storage_gb', 'network_gb',
    'resource_efficiency_score', 'cost_per_gb', 'cost_per_cpu',
    'rolling_7_day_cost', 'rolling_30_day_cost', 'cost_growth_rate',
    'day_of_week_num', 'month', 'quarter', 'week_of_year', 'is_weekend'
]

def preprocess_and_feature_engineer(df, is_training=True, preprocessor=None):
    """
    Cleans data, creates new features, and processes them for model training or inference.
    If is_training=True, fits new preprocessor (OneHotEncoder + StandardScaler) and returns it.
    If is_training=False, uses the passed preprocessor to transform features.
    """
    df = df.copy()

    # 1. Cleaning & Imputation
    df[TARGET_VAR] = df[TARGET_VAR].fillna(0.0).astype(float)
    
    # Numeric features defaults
    for col in ['cpu_utilization', 'memory_utilization', 'storage_gb', 'network_gb']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)

    # String features defaults
    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].astype(str).fillna('unknown').str.strip().str.lower()

    if is_training:
        # Deduplicate on training data
        subset_cols = ['provider', 'date', 'service', 'region', 'resource_type', TARGET_VAR]
        df = df.drop_duplicates(subset=[c for c in subset_cols if c in df.columns])

    # 2. Date conversion & Feature Engineering
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)

    df['day_of_week'] = df['date'].dt.day_name()
    df['day_of_week_num'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['quarter'] = df['date'].dt.quarter
    df['week_of_year'] = df['date'].dt.isocalendar().week.astype(int)
    df['is_weekend'] = df['date'].dt.dayofweek.isin([5, 6]).astype(int)

    # Rolling average costs (overall chronological runrate)
    df['rolling_7_day_cost'] = df[TARGET_VAR].rolling(window=7, min_periods=1).mean().round(2)
    df['rolling_30_day_cost'] = df[TARGET_VAR].rolling(window=30, min_periods=1).mean().round(2)

    # Month over month growth rate
    prev_cost = df[TARGET_VAR].shift(1).fillna(df[TARGET_VAR].mean())
    df['cost_growth_rate'] = (((df[TARGET_VAR] - prev_cost) / prev_cost.replace(0, 1.0)) * 100).round(2)

    # Utilization efficiency score
    df['resource_efficiency_score'] = ((df['cpu_utilization'] + df['memory_utilization']) / 2.0).round(2)

    # Cost ratios
    df['cost_per_gb'] = (df[TARGET_VAR] / df['storage_gb'].clip(lower=1.0)).round(4)
    df['cost_per_cpu'] = (df[TARGET_VAR] / df['cpu_utilization'].clip(lower=1.0)).round(4)

    # 3. Model Preprocessing (Encoding and Scaling)
    features = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
    
    # Ensure all required features are present in the dataframe
    for f in features:
        if f not in df.columns:
            df[f] = 0.0 if f in NUMERICAL_FEATURES else 'unknown'

    X = df[features]
    y = df[TARGET_VAR]

    if is_training:
        # Fit ColumnTransformer with standard scaler for numeric features and one hot encoder for categoricals
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), NUMERICAL_FEATURES),
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES)
            ]
        )
        X_processed = preprocessor.fit_transform(X)
        return X_processed, y, preprocessor
    else:
        # Transform using pre-fitted transformers
        X_processed = preprocessor.transform(X)
        return X_processed, y, preprocessor
