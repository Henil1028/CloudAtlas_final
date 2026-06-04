const rateLimit = require('express-rate-limit');

// Limit login/register requests
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per 15 minutes
  message: {
    message: 'Too many login attempts. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // max 20 uploads per hour
  message: {
    message: 'Upload limit exceeded. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes
  message: {
    message: 'Too many API requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Analytics rate limiters (Phase 3)
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    message: 'Analytics request limit exceeded. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const heavyEdaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    message: 'Heavy EDA request limit exceeded. Prevent excessive CPU usage.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    message: 'Export limit exceeded. Try again later.',
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
};
