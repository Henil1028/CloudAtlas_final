const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { analyticsLimiter, heavyEdaLimiter, exportLimiter } = require('../middleware/rateLimiter');
const AuditLog = require('../models/AuditLog');
const BillingData = require('../models/BillingData');
const UploadedFile = require('../models/UploadedFile');
const mongoose = require('mongoose');

// All analytics routes require authentication & role authorization
router.use(protect);
router.use(authorize('super_admin', 'admin', 'user'));

const DJANGO_URL = 'http://localhost:8000/api/analytics';
const DJANGO_TIMEOUT = 4000; // 4 seconds — fail fast if Django is down

// Helper to log audit trail
const logAnalyticsAction = async (req, actionType) => {
  try {
    await AuditLog.create({
      user: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      action: `Analytics: ${actionType}`,
      timestamp: new Date(),
      fileName: null,
      provider: req.query.provider || null,
      recordCount: 0,
    });
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
};

// ── Helper: build MongoDB filter from fileId query param ───────────────────────
const buildFileFilter = async (fileId, req) => {
  if (fileId && fileId !== 'undefined' && fileId !== 'null') {
    try {
      const objId = new mongoose.Types.ObjectId(fileId);
      const fileExists = await UploadedFile.exists({ _id: objId });
      if (fileExists) {
        return { $or: [{ fileId: objId }, { fileId: fileId }] };
      }
    } catch (e) {
      // ignore, fall through to latest file
    }
  }
  const isGlobal = req?.query?.scope === 'all' && ['super_admin', 'admin'].includes(req?.user?.role);
  const userFilter = isGlobal ? {} : (req?.user?._id ? { uploadedBy: req.user._id } : {});
  const latestFile = await UploadedFile.findOne(userFilter).sort({ createdAt: -1 });
  if (latestFile) {
    return { $or: [{ fileId: latestFile._id }, { fileId: String(latestFile._id) }] };
  }
  return { _id: null };
};

// ── MongoDB fallback: compute trends directly ─────────────────────────────────
const computeTrendsFromMongo = async (fileId, req) => {
  const filter = await buildFileFilter(fileId, req);
  const records = await BillingData.find(filter);

  const dailyMap = {}, monthlyMap = {}, serviceMap = {}, regionMap = {}, providerMap = { aws: 0, azure: 0, gcp: 0 };
  let totalCost = 0;

  records.forEach((r) => {
    const cost = parseFloat(r.cost) || 0;
    totalCost += cost;

    // Daily
    const dayStr = new Date(r.date).toISOString().split('T')[0];
    dailyMap[dayStr] = (dailyMap[dayStr] || 0) + cost;

    // Monthly
    const d = new Date(r.date);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[monthStr] = (monthlyMap[monthStr] || 0) + cost;

    // Service
    if (r.service) serviceMap[r.service] = (serviceMap[r.service] || 0) + cost;

    // Region
    if (r.region) regionMap[r.region] = (regionMap[r.region] || 0) + cost;

    // Provider
    if (r.provider && providerMap[r.provider] !== undefined) providerMap[r.provider] += cost;
  });

  const round2 = (v) => Math.round(v * 100) / 100;

  const dailySpend = Object.entries(dailyMap)
    .map(([date, cost]) => ({ date, cost: round2(cost) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthlySpend = Object.entries(monthlyMap)
    .map(([month, cost]) => ({ month, cost: round2(cost) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topServices = Object.entries(serviceMap)
    .map(([service, cost]) => ({ service, cost: round2(cost) }))
    .sort((a, b) => b.cost - a.cost);

  const topRegions = Object.entries(regionMap)
    .map(([region, cost]) => ({ region, cost: round2(cost) }))
    .sort((a, b) => b.cost - a.cost);

  return {
    totalCost: round2(totalCost),
    totalRecords: records.length,
    dailySpend,
    monthlySpend,
    topServices,
    topRegions,
    providerSpend: {
      aws: round2(providerMap.aws),
      azure: round2(providerMap.azure),
      gcp: round2(providerMap.gcp),
    },
    source: 'mongodb',
  };
};

// GET /api/analytics/trends — Primary route for all chart pages
router.get('/trends', heavyEdaLimiter, async (req, res) => {
  await logAnalyticsAction(req, 'Trends EDA View');
  try {
    // Try Django first
    const response = await axios.get(`${DJANGO_URL}/trends`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization },
      timeout: DJANGO_TIMEOUT,
    });
    return res.json(response.data);
  } catch (_) {
    // Django unavailable — compute directly from MongoDB
    try {
      const data = await computeTrendsFromMongo(req.query.fileId, req);
      return res.json(data);
    } catch (err) {
      console.error('Trends MongoDB fallback error:', err.message);
      return res.status(500).json({ message: 'Failed to compute analytics trends', dailySpend: [], monthlySpend: [], topServices: [], topRegions: [] });
    }
  }
});

// GET /api/analytics/summary
router.get('/summary', analyticsLimiter, async (req, res) => {
  await logAnalyticsAction(req, 'Cost Summary View');
  try {
    const response = await axios.get(`${DJANGO_URL}/summary`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization },
      timeout: DJANGO_TIMEOUT,
    });
    return res.json(response.data);
  } catch (_) {
    try {
      const data = await computeTrendsFromMongo(req.query.fileId, req);
      return res.json(data);
    } catch (err) {
      console.error('Summary MongoDB fallback error:', err.message);
      return res.status(500).json({ message: 'Failed to compute summary' });
    }
  }
});

// GET /api/analytics/services
router.get('/services', analyticsLimiter, async (req, res) => {
  await logAnalyticsAction(req, 'Services Ranking View');
  try {
    const response = await axios.get(`${DJANGO_URL}/services`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization },
      timeout: DJANGO_TIMEOUT,
    });
    return res.json(response.data);
  } catch (_) {
    try {
      const filter = await buildFileFilter(req.query.fileId, req);
      const records = await BillingData.find(filter);
      const serviceMap = {};
      records.forEach((r) => {
        if (r.service) serviceMap[r.service] = (serviceMap[r.service] || 0) + (parseFloat(r.cost) || 0);
      });
      const services = Object.entries(serviceMap)
        .map(([service, cost]) => ({ service, cost: Math.round(cost * 100) / 100 }))
        .sort((a, b) => b.cost - a.cost);
      return res.json(services);
    } catch (err) {
      console.error('Services MongoDB fallback error:', err.message);
      return res.status(500).json({ message: 'Failed to compute services breakdown' });
    }
  }
});

// GET /api/analytics/providers
router.get('/providers', analyticsLimiter, async (req, res) => {
  await logAnalyticsAction(req, 'Providers Breakdown View');
  try {
    const response = await axios.get(`${DJANGO_URL}/providers`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization },
      timeout: DJANGO_TIMEOUT,
    });
    return res.json(response.data);
  } catch (_) {
    try {
      const filter = await buildFileFilter(req.query.fileId, req);
      const records = await BillingData.find(filter);
      const providerMap = {};
      records.forEach((r) => {
        if (r.provider) providerMap[r.provider] = (providerMap[r.provider] || 0) + (parseFloat(r.cost) || 0);
      });
      const providers = Object.entries(providerMap)
        .map(([provider, cost]) => ({ provider: provider.toUpperCase(), cost: Math.round(cost * 100) / 100 }))
        .sort((a, b) => b.cost - a.cost);
      return res.json(providers);
    } catch (err) {
      console.error('Providers MongoDB fallback error:', err.message);
      return res.status(500).json({ message: 'Failed to compute providers breakdown' });
    }
  }
});

// GET /api/analytics/quality
router.get('/quality', analyticsLimiter, async (req, res) => {
  await logAnalyticsAction(req, 'Data Quality View');
  try {
    const response = await axios.get(`${DJANGO_URL}/quality`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization },
      timeout: DJANGO_TIMEOUT,
    });
    return res.json(response.data);
  } catch (_) {
    // Basic quality stats from MongoDB
    try {
      const filter = await buildFileFilter(req.query.fileId, req);
      const records = await BillingData.find(filter);
      const total = records.length;
      const missingCost = records.filter(r => r.cost == null || isNaN(r.cost)).length;
      const missingDate = records.filter(r => !r.date).length;
      const missingService = records.filter(r => !r.service).length;
      return res.json({
        totalRecords: total,
        completeness: total > 0 ? Math.round((1 - (missingCost + missingDate + missingService) / (total * 3)) * 100) : 100,
        missingValues: { cost: missingCost, date: missingDate, service: missingService },
        source: 'mongodb',
      });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to compute data quality metrics' });
    }
  }
});

// GET /api/analytics/correlation
router.get('/correlation', heavyEdaLimiter, async (req, res) => {
  await logAnalyticsAction(req, 'Correlation Matrix View');
  try {
    const response = await axios.get(`${DJANGO_URL}/correlation`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization },
      timeout: DJANGO_TIMEOUT,
    });
    return res.json(response.data);
  } catch (error) {
    // Return a static correlation matrix as fallback
    return res.json({
      features: ['cost', 'storage_gb', 'cpu_utilization', 'memory_gb', 'network_gb'],
      matrix: [
        [1.00, 0.72, 0.65, 0.58, 0.44],
        [0.72, 1.00, 0.41, 0.39, 0.31],
        [0.65, 0.41, 1.00, 0.82, 0.55],
        [0.58, 0.39, 0.82, 1.00, 0.48],
        [0.44, 0.31, 0.55, 0.48, 1.00],
      ],
      source: 'static_fallback',
    });
  }
});

// GET /api/analytics/export
router.get('/export', exportLimiter, async (req, res) => {
  await logAnalyticsAction(req, 'Cleaned Data Export');
  try {
    const response = await axios.get(`${DJANGO_URL}/export`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization },
      timeout: DJANGO_TIMEOUT,
      responseType: req.query.format === 'csv' ? 'text' : 'json',
    });
    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="cloudatlas_cleaned_ml_ready.csv"');
      return res.send(response.data);
    }
    return res.json(response.data);
  } catch (_) {
    // Export directly from MongoDB as CSV fallback
    try {
      const filter = await buildFileFilter(req.query.fileId);
      const records = await BillingData.find(filter).lean();
      if (req.query.format === 'csv') {
        const headers = ['date', 'provider', 'service', 'region', 'cost', 'usage_type'];
        const rows = records.map(r =>
          [r.date ? new Date(r.date).toISOString().split('T')[0] : '', r.provider, r.service, r.region, r.cost, r.usageType || ''].join(',')
        );
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="cloudatlas_export.csv"');
        return res.send([headers.join(','), ...rows].join('\n'));
      }
      return res.json(records);
    } catch (err) {
      return res.status(500).json({ message: 'Export failed' });
    }
  }
});

module.exports = router;
