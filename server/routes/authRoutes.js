const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getProfile,
  forgotPassword,
  verifyOtp,
  verifyOtpOnly,
  verifyRegistration,
  resendRegistrationOtp,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateLogin,
  validateRegister,
  handleValidationErrors,
} = require('../utils/validators');

// Auth rate limiting applied to login & register
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);
router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/verify-registration', authLimiter, verifyRegistration);
router.post('/resend-registration-otp', authLimiter, resendRegistrationOtp);

// Protected user count endpoint (authenticated users only)
router.get('/user-count', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const usersList = await User.find({});
    const count = usersList.length;
    res.json({ count });
  } catch (error) {
    console.error('Fetch User Count Error:', error);
    res.status(500).json({ message: 'Server error retrieving user count' });
  }
});

// Password recovery
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp-only', authLimiter, verifyOtpOnly);
router.post('/verify-otp', authLimiter, verifyOtp);

// Protected routes
router.get('/profile', protect, getProfile);

// Admin User CRUD routes
router.get('/users', protect, authorize('super_admin'), getAllUsers);
router.post('/users', protect, authorize('super_admin'), createUser);
router.put('/users/:id', protect, authorize('super_admin'), updateUser);
router.delete('/users/:id', protect, authorize('super_admin'), deleteUser);

module.exports = router;
