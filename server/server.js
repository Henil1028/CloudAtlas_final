const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const billingRoutes = require('./routes/billingRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet());

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all APIs
app.use('/api', apiLimiter);

// Auth Routes
app.use('/api/auth', authRoutes);

// Billing Ingestion Routes
app.use('/api/billing', billingRoutes);

// Analytics Python Microservice Gateway
const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// 404 Fallback
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size exceeds the 50 MB limit. Please split the CSV.' });
  }
  if (err.message && err.message.includes('Only CSV file uploads')) {
    return res.status(400).json({ message: err.message });
  }
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and seed Super Admins, then start the server
connectDB().then(async () => {
  try {
    const User = require('./models/User');
    const admins = [
      {
        name: 'Super Admin One',
        email: 'admin1@cloudatlas.ai',
        password: 'CloudAtlasAdmin2026!',
        role: 'super_admin',
      },
      {
        name: 'Super Admin Two',
        email: 'admin2@cloudatlas.ai',
        password: 'CloudAtlasManager2026!',
        role: 'super_admin',
      },
    ];

    for (const admin of admins) {
      const exists = await User.findOne({ email: admin.email });
      if (!exists) {
        await User.create(admin);
        console.log(`👤 Seeded Super Admin: ${admin.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to seed Super Admins:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
