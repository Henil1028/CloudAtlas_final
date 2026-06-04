const fs = require('fs');
const BillingData = require('../models/BillingData');
const UploadedFile = require('../models/UploadedFile');
const AuditLog = require('../models/AuditLog');
const { validateBillingCSV } = require('../utils/billingValidator');

// @desc    Upload billing CSV
// @route   POST /api/billing/upload
// @access  Private (Super Admin)
const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const { provider } = req.body;
    if (!provider || !['aws', 'azure', 'gcp'].includes(provider.toLowerCase())) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Valid provider (aws, azure, gcp) is required' });
    }

    // Run CSV validation service
    const validation = await validateBillingCSV(req.file.path);
    if (!validation.isValid) {
      fs.unlinkSync(req.file.path);
      
      // Log failed audit log
      await AuditLog.create({
        user: req.user.email,
        ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
        action: 'File Ingestion Failed (Validation Error)',
        fileName: req.file.originalname,
        provider: provider.toLowerCase(),
        recordCount: 0,
      });

      return res.status(400).json({
        message: 'CSV validation failed',
        errors: validation.errors,
      });
    }

    const records = validation.records.map((r) => ({
      ...r,
      provider: provider.toLowerCase(),
      uploadedBy: req.user._id,
      uploadDate: new Date(),
    }));

    // Store records in Database (or in-memory mock via Proxy insertMany)
    const savedRecords = await BillingData.insertMany(records);

    // Save File Upload history log
    const uploadedFile = await UploadedFile.create({
      filename: req.file.originalname,
      provider: provider.toLowerCase(),
      recordCount: savedRecords.length,
      size: req.file.size,
      uploadedBy: req.user._id,
      status: 'success',
    });

    // Save Security Audit Log
    await AuditLog.create({
      user: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      action: 'File Ingestion Completed',
      fileName: req.file.originalname,
      provider: provider.toLowerCase(),
      recordCount: savedRecords.length,
    });

    // Delete temp file after storing
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'Billing data uploaded and validated successfully',
      file: uploadedFile,
      recordsInserted: savedRecords.length,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    // Cleanup file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error during file ingestion' });
  }
};

// @desc    Get paginated, filtered billing data list
// @route   GET /api/billing
// @access  Private
const getBillingData = async (req, res) => {
  try {
    const { provider, service, region, costMin, costMax, dateMin, dateMax, search, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Apply filters
    if (provider) {
      filter.provider = provider.toLowerCase();
    }
    if (service) {
      filter.service = service;
    }
    if (region) {
      filter.region = region;
    }
    
    // Min/Max cost
    if (costMin || costMax) {
      filter.cost = {};
      if (costMin) filter.cost.$gte = Number(costMin);
      if (costMax) filter.cost.$lte = Number(costMax);
    }

    // Min/Max date
    if (dateMin || dateMax) {
      filter.date = {};
      if (dateMin) filter.date.$gte = new Date(dateMin);
      if (dateMax) filter.date.$lte = new Date(dateMax);
    }

    // Search query
    if (search) {
      filter.$or = [
        { service: { $regex: new RegExp(search, 'i') } },
        { region: { $regex: new RegExp(search, 'i') } },
        { usageType: { $regex: new RegExp(search, 'i') } },
      ];
    }

    // Sort setup
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.date = -1; // default newest first
    }

    // Pagination calculations
    const skip = (Number(page) - 1) * Number(limit);

    // Run query
    const total = await BillingData.countDocuments(filter);
    const records = await BillingData.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      records,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get Billing Data Error:', error);
    res.status(500).json({ message: 'Server error retrieving billing records' });
  }
};

// @desc    Get single record
// @route   GET /api/billing/:id
// @access  Private
const getBillingDetail = async (req, res) => {
  try {
    const record = await BillingData.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Get Detail Error:', error);
    res.status(500).json({ message: 'Server error retrieving details' });
  }
};

// @desc    Delete single record
// @route   DELETE /api/billing/:id
// @access  Private (Super Admin)
const deleteBillingRecord = async (req, res) => {
  try {
    const record = await BillingData.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Log deletion
    await AuditLog.create({
      user: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      action: 'Delete Billing Record',
      provider: record.provider,
      recordCount: 1,
    });

    res.json({ message: 'Record successfully deleted', id: req.params.id });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error deleting record' });
  }
};

// @desc    Get summary statistics and analytics
// @route   GET /api/billing/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    // To support consistent fallback, load all records matching filters or full database
    const records = await BillingData.find({});

    if (records.length === 0) {
      return res.json({
        totalCost: 0,
        averageCost: 0,
        totalRecords: 0,
        providerSpend: { aws: 0, azure: 0, gcp: 0 },
        serviceSpend: [],
        dailySpend: [],
        monthlySpend: [],
        topExpensiveServices: [],
      });
    }

    let totalCost = 0;
    const providerMap = { aws: 0, azure: 0, gcp: 0 };
    const serviceMap = {};
    const dailyMap = {};
    const monthlyMap = {};

    records.forEach((r) => {
      const cost = Number(r.cost);
      totalCost += cost;

      // Provider
      if (r.provider && providerMap[r.provider] !== undefined) {
        providerMap[r.provider] += cost;
      }

      // Service
      serviceMap[r.service] = (serviceMap[r.service] || 0) + cost;

      // Daily Cost
      const dateStr = new Date(r.date).toISOString().split('T')[0];
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + cost;

      // Monthly Cost
      const dateObj = new Date(r.date);
      const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[monthStr] = (monthlyMap[monthStr] || 0) + cost;
    });

    // Format top services list
    const serviceSpend = Object.keys(serviceMap).map((srv) => ({
      service: srv,
      cost: Math.round(serviceMap[srv] * 100) / 100,
    })).sort((a, b) => b.cost - a.cost);

    // Format Daily spend list
    const dailySpend = Object.keys(dailyMap).map((date) => ({
      date,
      cost: Math.round(dailyMap[date] * 100) / 100,
    })).sort((a, b) => a.date.localeCompare(b.date)).slice(-30); // limit to last 30 active days

    // Format Monthly spend list
    const monthlySpend = Object.keys(monthlyMap).map((month) => ({
      month,
      cost: Math.round(monthlyMap[month] * 100) / 100,
    })).sort((a, b) => a.month.localeCompare(b.month));

    // File Tracking count
    const totalFiles = await UploadedFile.countDocuments({});

    res.json({
      totalCost: Math.round(totalCost * 100) / 100,
      averageCost: Math.round((totalCost / records.length) * 100) / 100,
      totalRecords: records.length,
      totalFiles,
      providerSpend: {
        aws: Math.round(providerMap.aws * 100) / 100,
        azure: Math.round(providerMap.azure * 100) / 100,
        gcp: Math.round(providerMap.gcp * 100) / 100,
      },
      serviceSpend: serviceSpend.slice(0, 10), // Top 10 services
      dailySpend,
      monthlySpend,
      recentUploads: await UploadedFile.find({}).sort({ createdAt: -1 }).limit(5),
    });
  } catch (error) {
    console.error('Summary Error:', error);
    res.status(500).json({ message: 'Server error compiling cost summaries' });
  }
};

// @desc    Get unique services list
// @route   GET /api/billing/services
// @access  Private
const getServices = async (req, res) => {
  try {
    // If in memory fallback or database, fetch unique services list
    const records = await BillingData.find({});
    const services = [...new Set(records.map(r => r.service))].sort();
    res.json(services);
  } catch (error) {
    console.error('Get Services Error:', error);
    res.status(500).json({ message: 'Server error retrieving unique services list' });
  }
};

// @desc    Get unique providers list
// @route   GET /api/billing/providers
// @access  Private
const getProviders = async (req, res) => {
  try {
    const records = await BillingData.find({});
    const providers = [...new Set(records.map(r => r.provider))].sort();
    res.json(providers);
  } catch (error) {
    console.error('Get Providers Error:', error);
    res.status(500).json({ message: 'Server error retrieving unique providers list' });
  }
};

module.exports = {
  uploadCSV,
  getBillingData,
  getBillingDetail,
  deleteBillingRecord,
  getSummary,
  getServices,
  getProviders,
};
