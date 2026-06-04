const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { analyticsLimiter, heavyEdaLimiter, exportLimiter } = require('../middleware/rateLimiter');
const AuditLog = require('../models/AuditLog');

// All analytics routes require authentication & Super Admin role
router.use(protect);
router.use(authorize('super_admin'));

const DJANGO_URL = 'http://localhost:8000/api/analytics';

// Helper to log audit trail
const logAnalyticsAction = async (req, actionType) => {
  try {
    const filters = { ...req.query };
    await AuditLog.create({
      user: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      action: `Analytics: ${actionType}`,
      timestamp: new Date(),
      fileName: null,
      provider: filters.provider || null,
      recordCount: 0, // Computed dynamically in python
    });
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
};

// GET /api/analytics/summary
router.get('/summary', analyticsLimiter, async (req, res) => {
  try {
    await logAnalyticsAction(req, 'Cost Summary View');
    const response = await axios.get(`${DJANGO_URL}/summary`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Summary Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Analytics server unreachable' });
  }
});

// GET /api/analytics/quality
router.get('/quality', analyticsLimiter, async (req, res) => {
  try {
    await logAnalyticsAction(req, 'Data Quality View');
    const response = await axios.get(`${DJANGO_URL}/quality`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Quality Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Analytics server unreachable' });
  }
});

// GET /api/analytics/trends
router.get('/trends', heavyEdaLimiter, async (req, res) => {
  try {
    await logAnalyticsAction(req, 'Trends EDA View');
    const response = await axios.get(`${DJANGO_URL}/trends`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Trends Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Analytics server unreachable' });
  }
});

// GET /api/analytics/providers
router.get('/providers', analyticsLimiter, async (req, res) => {
  try {
    await logAnalyticsAction(req, 'Providers Breakdown View');
    const response = await axios.get(`${DJANGO_URL}/providers`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Providers Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Analytics server unreachable' });
  }
});

// GET /api/analytics/services
router.get('/services', analyticsLimiter, async (req, res) => {
  try {
    await logAnalyticsAction(req, 'Services Ranking View');
    const response = await axios.get(`${DJANGO_URL}/services`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Services Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Analytics server unreachable' });
  }
});

// GET /api/analytics/correlation
router.get('/correlation', heavyEdaLimiter, async (req, res) => {
  try {
    await logAnalyticsAction(req, 'Correlation Matrix View');
    const response = await axios.get(`${DJANGO_URL}/correlation`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Correlation Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Analytics server unreachable' });
  }
});

// GET /api/analytics/export
router.get('/export', exportLimiter, async (req, res) => {
  try {
    await logAnalyticsAction(req, 'Cleaned Data Export');
    const response = await axios.get(`${DJANGO_URL}/export`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization },
      responseType: req.query.format === 'csv' ? 'text' : 'json'
    });
    
    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="cloudatlas_cleaned_ml_ready.csv"');
      return res.send(response.data);
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Export Gateway Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Analytics server unreachable' });
  }
});

module.exports = router;
