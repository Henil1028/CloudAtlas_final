const rateLimit = require('express-rate-limit');

// Limit login/register requests
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased limit for development and testing
  message: {
    message: 'Too many authentication attempts. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // max 500 uploads per hour
  message: {
    message: 'Upload limit exceeded. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased limit for general API requests
  message: {
    message: 'Too many API requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Analytics rate limiters (Phase 3)
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // max 1000 requests per 15 minutes
  message: {
    message: 'Analytics request limit exceeded. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const heavyEdaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // max 500 requests per 15 minutes
  message: {
    message: 'Heavy EDA request limit exceeded. Prevent excessive CPU usage.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // max 200 exports per hour
  message: {
    message: 'Export limit exceeded. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ML Prediction rate limiter (Phase 4)
const predictionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // max 50 requests per hour
  message: {
    message: 'Prediction Limit Exceeded. Try Again Later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ML Training rate limiter (Phase 4)
const trainingLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // max 5 requests per 24 hours
  message: {
    message: 'Training Limit Exceeded. Prevent repeated expensive training.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  uploadLimiter,
  apiLimiter,
  analyticsLimiter,
  heavyEdaLimiter,
  exportLimiter,
  predictionLimiter,
  trainingLimiter,
};
