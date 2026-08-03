import pandas as pd
import numpy as np

def run_pipeline(records):
    """
    Runs the complete Data Cleaning, Feature Engineering, EDA, and Statistical Analysis pipeline.
    Returns cleaned dataset (as list of dicts), quality report, and analytical summaries.
    """
    if not records or len(records) == 0:
        return get_empty_results()

    # Convert Mongo records to Pandas DataFrame
    df = pd.DataFrame(records)
    
    # Track raw metrics for quality report
    raw_count = len(df)
    
    # ----------------------------------------------------
    # MODULE 2: DATA CLEANING ENGINE
    # ----------------------------------------------------
    
    # 1. Handle missing values: cost fillna 0, strings fillna 'unknown'
    missing_cost_count = df['cost'].isna().sum()
    df['cost'] = df['cost'].fillna(0.0)
    
    for col in ['service', 'region', 'usageType', 'provider']:
      if col in df.columns:
        df[col] = df[col].fillna('unknown')

    # 2. Check and drop duplicate records (emulate drop_duplicates)
    duplicate_count = df.duplicated(subset=['provider', 'date', 'service', 'region', 'usageType', 'cost']).sum()
    df = df.drop_duplicates(subset=['provider', 'date', 'service', 'region', 'usageType', 'cost'])
    
    # 3. Convert Types: Cost to float, Date to datetime
    df['cost'] = df['cost'].astype(float)
    df['date'] = pd.to_datetime(df['date'])
    
    # 4. Standardise names & auto-detect actual provider from services if mapped incorrectly
    df['provider'] = df['provider'].str.strip().str.lower()
    df['service'] = df['service'].str.strip()
    df['region'] = df['region'].str.strip()
    df['usageType'] = df['usageType'].str.strip()

    def refine_provider(row):
        prov = str(row['provider']).strip().lower()
        if prov in ['aws', 'azure', 'gcp']:
            return prov
        serv = str(row['service']).lower()
        if 'azure' in serv or 'virtual machines' in serv or 'blob' in serv or 'cosmos' in serv:
            return 'azure'
        elif 'gcp' in serv or 'bigquery' in serv or 'google' in serv or 'compute engine' in serv:
            return 'gcp'
        elif 'ec2' in serv or 's3' in serv or 'rds' in serv or 'dynamodb' in serv or 'aws' in serv:
            return 'aws'
        return 'aws'

    df['provider'] = df.apply(refine_provider, axis=1)

    cleaned_count = len(df)

    # ----------------------------------------------------
    # MODULE 3: DATA QUALITY REPORT
    # ----------------------------------------------------
    null_percentage = round((df.isna().sum().sum() / (len(df) * len(df.columns))) * 100, 2) if len(df) > 0 else 0.0
    
    # Quality Score: Deduct points for duplicates, missing records
    deduction = (duplicate_count / raw_count * 15) + (missing_cost_count / raw_count * 30) if raw_count > 0 else 0
    quality_score = max(0, min(100, int(100 - deduction)))

    quality_report = {
        'totalRecords': raw_count,
        'cleanedRecords': cleaned_count,
        'missingValues': int(missing_cost_count),
        'duplicateRecords': int(duplicate_count),
        'nullPercentage': null_percentage,
        'qualityScore': quality_score,
    }

    # ----------------------------------------------------
    # MODULE 4: FEATURE ENGINEERING
    # ----------------------------------------------------
    df['day'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['week_number'] = df['date'].dt.isocalendar().week.astype(int)
    df['quarter'] = df['date'].dt.quarter
    df['day_of_week'] = df['date'].dt.day_name()
    df['is_weekend'] = df['date'].dt.dayofweek.isin([5, 6]).astype(int)

    # Calculate rolling cumulative costs or percentages
    df_sorted = df.sort_values('date')
    
    # Cost growth MoM (mock index level calculations)
    monthly_costs = df_sorted.groupby(['year', 'month'])['cost'].sum().reset_index()
    monthly_costs['prev_cost'] = monthly_costs['cost'].shift(1)
    monthly_costs['growth_pct'] = ((monthly_costs['cost'] - monthly_costs['prev_cost']) / monthly_costs['prev_cost'] * 100).fillna(0.0)

    # ----------------------------------------------------
    # MODULE 5 & 6: EDA & STATISTICAL ANALYSIS
    # ----------------------------------------------------
    stats = {
        'mean': round(float(df['cost'].mean()), 2) if len(df) > 0 else 0,
        'median': round(float(df['cost'].median()), 2) if len(df) > 0 else 0,
        'variance': round(float(df['cost'].var()), 2) if len(df) > 1 else 0,
        'std_dev': round(float(df['cost'].std()), 2) if len(df) > 1 else 0,
        'min': round(float(df['cost'].min()), 2) if len(df) > 0 else 0,
        'max': round(float(df['cost'].max()), 2) if len(df) > 0 else 0,
        'percentile_25': round(float(np.percentile(df['cost'], 25)), 2) if len(df) > 0 else 0,
        'percentile_75': round(float(np.percentile(df['cost'], 75)), 2) if len(df) > 0 else 0,
    }

    # Top spending regions, services, providers
    provider_spend = df.groupby('provider')['cost'].sum().round(2).to_dict()
    service_spend_df = df.groupby('service')['cost'].sum().reset_index().sort_values('cost', ascending=False)
    region_spend_df = df.groupby('region')['cost'].sum().reset_index().sort_values('cost', ascending=False)

    top_services = service_spend_df.head(10).to_dict(orient='records')
    top_regions = region_spend_df.head(10).to_dict(orient='records')

    # Cost trends
    daily_spend_df = df.groupby(df['date'].dt.date)['cost'].sum().reset_index()
    daily_spend_df['date'] = daily_spend_df['date'].astype(str)
    daily_trends = daily_spend_df.to_dict(orient='records')

    monthly_trends = []
    for _, row in monthly_costs.iterrows():
        monthly_trends.append({
            'month': f"{int(row['year'])}-{StringMonth(row['month'])}",
            'cost': round(float(row['cost']), 2),
            'growth': round(float(row['growth_pct']), 2)
        })

    # ----------------------------------------------------
    # MODULE 7: CORRELATION ANALYSIS
    # ----------------------------------------------------
    # To compute correlations, we convert key categories to numeric categories
    corr_df = df[['cost', 'day', 'month', 'year', 'week_number', 'is_weekend']].copy()
    
    # Add category codes for categorical columns
    corr_df['provider_code'] = df['provider'].astype('category').cat.codes
    corr_df['service_code'] = df['service'].astype('category').cat.codes
    corr_df['region_code'] = df['region'].astype('category').cat.codes

    corr_matrix = corr_df.corr().fillna(0.0).round(3).to_dict()

    # ----------------------------------------------------
    # MODULE 9: BUSINESS INSIGHTS ENGINE
    # ----------------------------------------------------
    most_expensive_provider = max(provider_spend, key=provider_spend.get) if provider_spend else 'N/A'
    most_expensive_service = top_services[0]['service'] if top_services else 'N/A'
    highest_cost_region = top_regions[0]['region'] if top_regions else 'N/A'

    growth_percentage = monthly_trends[-1]['growth'] if len(monthly_trends) > 1 else 0.0

    insights = [
        f"Most expensive cloud provider is {most_expensive_provider.upper()} representing {format_percent(provider_spend.get(most_expensive_provider, 0), df['cost'].sum())}% of total spend.",
        f"Top spending service is '{most_expensive_service}' with a cost footprint of {format_currency(top_services[0]['cost'] if top_services else 0)}.",
        f"Highest cost region identified is {highest_cost_region}.",
        f"Cost growth trends indicate a {growth_percentage}% change month-over-month.",
        "Engineering features suggest weekend usage represents " + str(round((df[df['is_weekend'] == 1]['cost'].sum() / df['cost'].sum() * 100), 1) if df['cost'].sum() > 0 else 0) + "% of total spend."
    ]

    # Convert datetime column to string for JSON serializer compatibility
    df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    ml_ready_records = df.to_dict(orient='records')

    return {
        'cleanedRecords': ml_ready_records,
        'qualityReport': quality_report,
        'statistics': stats,
        'providerSpend': provider_spend,
        'topServices': top_services,
        'topRegions': top_regions,
        'dailySpend': daily_trends,
        'monthlySpend': monthly_trends,
        'correlation': corr_matrix,
        'insights': insights,
    }

def StringMonth(m):
    return str(int(m)).zfill(2)

def format_percent(val, total):
    if total == 0: return 0
    return round((val / total) * 100, 1)

def format_currency(val):
    return f"${val:,.2f}"

def get_empty_results():
    return {
        'cleanedRecords': [],
        'qualityReport': {
            'totalRecords': 0,
            'cleanedRecords': 0,
            'missingValues': 0,
            'duplicateRecords': 0,
            'nullPercentage': 0.0,
            'qualityScore': 100,
        },
        'statistics': {
            'mean': 0, 'median': 0, 'variance': 0, 'std_dev': 0, 'min': 0, 'max': 0,
            'percentile_25': 0, 'percentile_75': 0,
        },
        'providerSpend': {'aws': 0, 'azure': 0, 'gcp': 0},
        'topServices': [],
        'topRegions': [],
        'dailySpend': [],
        'monthlySpend': [],
        'correlation': {},
        'insights': ['No billing records loaded in memory.'],
    }
