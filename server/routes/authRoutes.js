const express = require('express');
const router = express.Router();
const { login, register, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateLogin,
  validateRegister,
  handleValidationErrors,
} = require('../utils/validators');

// Auth rate limiting applied to login & register
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);
router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);

// Protected routes
router.get('/profile', protect, getProfile);

module.exports = router;
