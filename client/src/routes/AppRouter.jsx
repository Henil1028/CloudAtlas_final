import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { UploadPage } from '../pages/UploadPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { PredictionsPage } from '../pages/PredictionsPage';
import { ModelTrainingPage } from '../pages/ModelTrainingPage';
import { SimulatorPage } from '../pages/SimulatorPage';
import { RiskAssessmentPage } from '../pages/RiskAssessmentPage';
import { AnomalyDetectionPage } from '../pages/AnomalyDetectionPage';
import { InsightEnginePage } from '../pages/InsightEnginePage';
import { DatasetsPage } from '../pages/DatasetsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { UsersPage } from '../pages/UsersPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { DataContextProvider } from '../context/DataContext';

export const AppRouter = () => {
  const { token, user } = useAuth();

  return (
    <DataContextProvider>
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Pages (Only accessible when not logged in; redirect to dashboard if logged in) */}
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/login" replace />}
      />
      <Route
        path="/admin/login"
        element={token && user?.role === 'super_admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage />}
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={<Navigate to="/predictions" replace />}
      />

      <Route
        path="/predictions"
        element={
          <ProtectedRoute>
            <PredictionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/model-training"
        element={
          <ProtectedRoute>
            <ModelTrainingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulator"
        element={
          <ProtectedRoute>
            <SimulatorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/risk-assessment"
        element={
          <ProtectedRoute>
            <RiskAssessmentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/anomalies"
        element={
          <ProtectedRoute>
            <AnomalyDetectionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <InsightEnginePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/datasets"
        element={
          <ProtectedRoute>
            <DatasetsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </DataContextProvider>
  );
};
