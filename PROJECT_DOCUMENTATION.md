# CloudAtlas AI — Comprehensive Technical Documentation & Presentation Guide

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Platform Architecture](#2-platform-architecture)
3. [Module & Feature Showcase](#3-module--feature-showcase)
4. [Machine Learning Models](#4-machine-learning-models)
5. [Database Schema Specifications](#5-database-schema-specifications)
6. [Security & Compliance Architecture](#6-security--compliance-architecture)
7. [Installation & Operational Deployment](#7-installation--operational-deployment)

---

## 1. Executive Summary & Problem Statement

Modern enterprises operate across multi-cloud environments (AWS, Azure, Google Cloud Platform), spending millions annually on cloud infrastructure. However, organizations face critical operational challenges:
- **Billing Opacity**: Cloud providers issue raw billing logs with millions of unaggregated rows.
- **Budget Breaches**: Unexpected usage spikes (unattached volumes, runaway serverless jobs) cause budget overruns before FinOps teams notice.
- **Lack of Predictive Insights**: Traditional dashboards show historical spend but cannot accurately predict future 90-day expenses under variable workload scale.

### The CloudAtlas Solution
**CloudAtlas AI** is a multi-cloud FinOps & predictive governance platform that solves these challenges through:
1. **Unified Multi-Cloud Ingestion**: Automated CSV dataset parsing for AWS, Azure, and GCP.
2. **PredictIQ Machine Learning Engine**: 90-day XGBoost time-series expenditure forecasting.
3. **One-Class SVM Anomaly Shield**: Unsupervised anomaly detection flagging billing spikes.
4. **What-If Workload Simulator**: Interactive scale testing to evaluate Reserved Instance savings and provider migration efficiency.

---

## 2. Platform Architecture

The system follows a 3-tier microservice architecture:

```
[ Frontend: React 19 + Vite ] ──(REST API + JWT)──> [ Backend: Node.js + Express ]
                                                            │
                                        ┌───────────────────┴───────────────────┐
                                        ▼                                       ▼
                             [(MongoDB Database)]               [(Python ML Retrain Pipeline)]
```

### Core Architecture Components
1. **Client Engine (`/client`)**: Built on React 19 and Vite 6. Uses Framer Motion for spring-animated UI components, GSAP with ScrollTrigger for smooth horizontal galleries, and Recharts for interactive analytics.
2. **Backend Gateway (`/server`)**: Node.js & Express REST API with JWT security guards, Mongoose ORM models, rate limiters, and Multer file upload pipelines.
3. **Global Data Event Bus (`DataContext.jsx`)**: A lightweight real-time signal bus notifying all application views to re-fetch when new billing datasets are ingested.

---

## 3. Module & Feature Showcase

### 🎨 Enterprise Home Page (`LandingPage.jsx`)
- **Cinematic Backdrop**: Drifting stardust particles and mouse-inertia radial auroras.
- **Interactive FinOps Sandbox**: 5 interactive tabs allowing visitors to test forecasting, anomaly detection, workload simulation, and AI recommendations live.
- **ROI Savings Calculator**: Interactive spend slider calculating annual net cost reductions ($5k – $500k+).
- **GSAP Horizontal Integration Gallery**: Sliding showcase of AWS, Azure, GCP, Kubernetes, Terraform IaC, and Databricks connectors.

### 🔐 Unified Authentication & Super Admin Gatekeeper (`AuthPage.jsx` & `AdminLoginPage.jsx`)
- **Segmented Pill Switcher**: Spring-animated glide between Sign In and Create Account.
- **6-Digit OTP Verification**: 2-minute countdown timer with resend controls.
- **Super Admin Gatekeeper Challenge**: Restricted portal (`/admin/login`) requiring Master Security Passcode (`HenilNeelProject`).

### 📊 Multi-Cloud Executive Dashboard (`DashboardPage.jsx`)
- Aggregates total monthly spend, average record cost, active provider distribution (AWS vs Azure vs GCP), and top expensive cloud services.

### 🔮 PredictIQ Forecast Engine (`PredictionsPage.jsx`)
- Generates 90-day spend predictions combining linear trend slope and Fourier seasonal sine components.
- Interactive **What-If Sliders** (CPU %, Memory %, Storage GB, Network Egress GB) dynamically modifying forecast trajectories.

### 🛡️ One-Class SVM Anomaly Shield (`AnomalyDetectionPage.jsx`)
- Identifies statistical outliers using z-score analysis and unsupervised One-Class SVM classifiers.
- Provides immediate mitigation recommendations (e.g., terminating orphan EBS volumes).

---

## 4. Machine Learning Models

### 1. PredictIQ Spend Regressor (XGBoost)
- **Objective**: Predict daily and monthly cost trajectories over a 90-day horizon.
- **Feature Pipeline**:
  $$\hat{y}_t = \text{Trend}(t) + \text{Seasonality}(t) + \sum \text{ResourceMultipliers}$$
- **Seasonality Formula**:
  $$\text{Seasonality}(t) = \sin(t \cdot 0.4) \cdot 0.09 \cdot \mu_{\text{cost}}$$

### 2. One-Class SVM Anomaly Detector
- **Objective**: Unsupervised anomaly detection on unlabelled billing logs.
- **Decision Boundary**: Fits a hypersphere around normal billing metrics. Data points outside the boundary are flagged as anomalies ($z \ge 1.6$).

---

## 5. Database Schema Specifications

### `BillingData` Schema (`server/models/BillingData.js`)
```javascript
{
  date: { type: Date, required: true },
  service: { type: String, required: true },
  cost: { type: Number, required: true },
  region: { type: String, default: 'us-east-1' },
  usageType: { type: String, default: 'Standard Usage' },
  provider: { type: String, enum: ['aws', 'azure', 'gcp'], required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  fileId: { type: Schema.Types.ObjectId, ref: 'UploadedFile' }
}
```

### `UploadedFile` Schema (`server/models/UploadedFile.js`)
```javascript
{
  filename: { type: String, required: true },
  provider: { type: String, required: true },
  recordCount: { type: Number, required: true },
  size: { type: Number },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['success', 'failed'], default: 'success' }
}
```

---

## 6. Security & Compliance Architecture

- **Zero-Trust JWT Security**: All API endpoints except login/register require a valid Bearer token.
- **Super Admin Security Gatekeeper**: Accessing administrative controls requires two layers: Gatekeeper Passcode (`HenilNeelProject`) followed by Super Admin credentials.
- **Rate Limiting**: Protected against brute-force and DDoS via `express-rate-limit`.
- **SOC2 Audit Logging**: Saves every authentication attempt, CSV upload, and record deletion to `AuditLog`.

---

## 7. Installation & Operational Deployment

1. **Start Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. **Start Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
3. Open browser at **[http://localhost:5173](http://localhost:5173)**.
