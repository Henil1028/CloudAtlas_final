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

// ML Python Microservice Gateway
const mlRoutes = require('./routes/mlRoutes');
app.use('/api/ml', mlRoutes);

// AI Chat Assistant Route
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

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
    return res.status(400).json({ message: 'File size exceeds the 2 GB limit. Please split the CSV.' });
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
    let adminUser = await User.findOne({ email: 'admin1@cloudatlas.ai' });
    if (!adminUser) {
      await User.create({
        name: 'Super Admin',
        email: 'admin1@cloudatlas.ai',
        phoneNumber: '9876543210',
        password: 'CloudAtlasAdmin2026!',
        role: 'super_admin',
        isActive: true,
      });
      console.log('👤 Seeded Single Super Admin: admin1@cloudatlas.ai');
    } else {
      adminUser.password = 'CloudAtlasAdmin2026!';
      adminUser.role = 'super_admin';
      adminUser.isActive = true;
      await adminUser.save();
      console.log('👤 Synchronized Super Admin credentials for: admin1@cloudatlas.ai');
    }
  } catch (error) {
    console.error('❌ Failed to seed Super Admin 1:', error.message);
  }

  // Seed Sample Platform Accounts
  try {
    const User = require('./models/User');
    const sampleUsers = [
      { name: 'Alex Vance', email: 'devops@cloudatlas.io', phoneNumber: '9876543212', password: 'DemoPass123!', role: 'admin', isActive: true },
      { name: 'Sarah Chen', email: 'sarah.chen@finops.io', phoneNumber: '9876543213', password: 'DemoPass123!', role: 'user', isActive: true },
      { name: 'Marcus Wright', email: 'marcus.wright@cloudatlas.ai', phoneNumber: '9876543214', password: 'DemoPass123!', role: 'user', isActive: true },
      { name: 'Elena Rostova', email: 'elena.rostova@cloudatlas.ai', phoneNumber: '9876543215', password: 'DemoPass123!', role: 'admin', isActive: true }
    ];

    for (const u of sampleUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`👤 Seeded sample platform account: ${u.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to seed sample users:', error.message);
  }

  // Seed Mock Billing Data and Files if collection is empty
  try {
    const BillingData = require('./models/BillingData');
    const UploadedFile = require('./models/UploadedFile');
    const User = require('./models/User');

    const adminUser = await User.findOne({ email: 'admin1@cloudatlas.ai' });
    const neelUser = await User.findOne({ email: 'npanchal1812@gmail.com' });
    const primaryAdmin = neelUser || adminUser;

    if (primaryAdmin) {
      const count = await BillingData.countDocuments({});
      if (count === 0) {
        console.log('🔄 MongoDB BillingData is empty. Seeding mock cloud datasets...');

        // 1. Create file upload log histories
        const filesToSeed = [
          { filename: 'aws_q1_billing.csv', provider: 'aws', recordCount: 40, size: 154820, uploadedBy: primaryAdmin._id, status: 'success' },
          { filename: 'azure_prod_compute.csv', provider: 'azure', recordCount: 40, size: 124500, uploadedBy: primaryAdmin._id, status: 'success' },
          { filename: 'gcp_bigquery_exports.csv', provider: 'gcp', recordCount: 40, size: 189400, uploadedBy: primaryAdmin._id, status: 'success' }
        ];

        const createdFiles = await UploadedFile.insertMany(filesToSeed);

        // 2. Generate and Insert 120 billing records across AWS, Azure, GCP
        const providers = ['aws', 'azure', 'gcp'];
        const services = {
          aws: ['EC2', 'RDS', 'S3', 'Lambda', 'DynamoDB'],
          azure: ['Virtual Machines', 'SQL Database', 'Blob Storage', 'Functions', 'Cosmos DB'],
          gcp: ['Compute Engine', 'Cloud SQL', 'Cloud Storage', 'Cloud Functions', 'BigQuery'],
        };
        const regions = {
          aws: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
          azure: ['East US', 'West US 2', 'West Europe', 'Southeast Asia'],
          gcp: ['us-central1', 'us-east4', 'europe-west1', 'asia-east1'],
        };
        const usageTypes = ['ComputeInstance', 'DatabaseStorage', 'DataTransfer', 'APIRequest', 'IPAddress'];

        const now = new Date();
        const records = [];

        for (let i = 0; i < 120; i++) {
          const provider = providers[i % providers.length];
          const providerServices = services[provider];
          const service = providerServices[Math.floor(Math.random() * providerServices.length)];
          const region = regions[provider][Math.floor(Math.random() * regions[provider].length)];
          const usageType = usageTypes[Math.floor(Math.random() * usageTypes.length)];
          const matchingFile = createdFiles.find(f => f.provider === provider);

          const date = new Date();
          date.setDate(now.getDate() - Math.floor(Math.random() * 90));
          const cost = Math.round((Math.random() * 850 + 2.5) * 100) / 100;

          records.push({
            provider,
            date,
            service,
            region,
            usageType,
            cost,
            currency: 'USD',
            accountId: `${100000000000 + (i % 3) * 555555}`,
            uploadedBy: primaryAdmin._id,
            fileId: matchingFile ? matchingFile._id : null,
            uploadDate: new Date()
          });
        }

        await BillingData.insertMany(records);
        console.log('✅ Successfully seeded 120 mock billing records into MongoDB!');
      }
    }
  } catch (error) {
    console.error('❌ Failed to seed billing database:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
