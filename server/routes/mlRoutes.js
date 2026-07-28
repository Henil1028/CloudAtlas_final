const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { predictionLimiter, trainingLimiter, apiLimiter } = require('../middleware/rateLimiter');
const AuditLog = require('../models/AuditLog');

// All ML routes require active JWT session and authorized privileges
router.use(protect);
router.use(authorize('super_admin', 'admin', 'user'));

const DJANGO_ML_URL = 'http://localhost:8000/api/ml';

// Helper to log ML Audit Actions
const logMlAuditAction = async (req, action, details = {}) => {
  try {
    await AuditLog.create({
      user: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      action: `ML: ${action}`,
      timestamp: new Date(),
      fileName: null,
      provider: req.body.provider || null,
      recordCount: 0,
    });
  } catch (error) {
    console.error('ML Audit Log Error:', error.message);
  }
};

// POST /api/ml/train
router.post('/train', trainingLimiter, async (req, res) => {
  try {
    await logMlAuditAction(req, 'Model Training Initialized');
    const response = await axios.post(`${DJANGO_ML_URL}/train`, {}, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('ML Train Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'ML service unreachable' });
  }
});

// POST /api/ml/retrain
router.post('/retrain', trainingLimiter, async (req, res) => {
  try {
    await logMlAuditAction(req, 'Model Retraining Triggered');
    const response = await axios.post(`${DJANGO_ML_URL}/retrain`, {}, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('ML Retrain Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'ML service unreachable' });
  }
});

// POST /api/ml/predict/day
router.post('/predict/day', predictionLimiter, async (req, res) => {
  try {
    const response = await axios.post(`${DJANGO_ML_URL}/predict/day`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    await logMlAuditAction(req, 'Daily Cost Prediction', { result: response.data.predicted_cost });
    res.json(response.data);
  } catch (error) {
    console.error('Predict Day Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'ML service unreachable' });
  }
});

// POST /api/ml/predict/week
router.post('/predict/week', predictionLimiter, async (req, res) => {
  try {
    const response = await axios.post(`${DJANGO_ML_URL}/predict/week`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    await logMlAuditAction(req, 'Weekly Cost Prediction', { result: response.data.predicted_cost });
    res.json(response.data);
  } catch (error) {
    console.error('Predict Week Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'ML service unreachable' });
  }
});

// POST /api/ml/predict/month
router.post('/predict/month', predictionLimiter, async (req, res) => {
  try {
    const response = await axios.post(`${DJANGO_ML_URL}/predict/month`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    await logMlAuditAction(req, 'Monthly Cost Prediction', { result: response.data.predicted_cost });
    res.json(response.data);
  } catch (error) {
    console.error('Predict Month Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'ML service unreachable' });
  }
});

// GET /api/ml/runs
router.get('/runs', apiLimiter, async (req, res) => {
  try {
    const response = await axios.get(`${DJANGO_ML_URL}/runs`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('ML Runs History Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'ML service unreachable' });
  }
});

// GET /api/ml/history
router.get('/history', apiLimiter, async (req, res) => {
  try {
    const response = await axios.get(`${DJANGO_ML_URL}/history`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('ML Predictions History Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'ML service unreachable' });
  }
});

module.exports = router;
