const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/uploadMiddleware');
const {
  uploadCSV,
  getBillingData,
  getBillingDetail,
  deleteBillingRecord,
  getSummary,
  getServices,
  getProviders,
} = require('../controllers/billingController');

// All routes here require active user authentication session
router.use(protect);

// Analytical metrics routes
router.get('/summary', getSummary);
router.get('/providers', getProviders);
router.get('/services', getServices);

// General data list routes
router.get('/', getBillingData);
router.get('/:id', getBillingDetail);

// Ingestion upload - strictly limited to Super Admins & governed by upload rate limiters
router.post('/upload', authorize('super_admin'), uploadLimiter, upload.single('file'), uploadCSV);

// Delete record - strictly limited to Super Admins
router.delete('/:id', authorize('super_admin'), deleteBillingRecord);

module.exports = router;
