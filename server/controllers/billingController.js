const fs = require('fs');
const axios = require('axios');
const BillingData = require('../models/BillingData');
const UploadedFile = require('../models/UploadedFile');
const AuditLog = require('../models/AuditLog');
const { validateBillingCSV } = require('../utils/billingValidator');
const { analyzeAnomalies, sendAnomalyNotificationEmail } = require('../utils/emailNotifier');

// @desc    Upload billing CSV
// @route   POST /api/billing/upload
// @access  Private (Super Admin, Admin, User)
const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    let { provider, targetEmail } = req.body;
    const lowerName = req.file.originalname.toLowerCase();
    
    // Override with filename hint only if filename explicitly names a provider
    if (lowerName.includes('azure') || lowerName.includes('microsoft')) {
      provider = 'azure';
    } else if (lowerName.includes('gcp') || lowerName.includes('google')) {
      provider = 'gcp';
    } else if (lowerName.includes('aws') || lowerName.includes('amazon')) {
      provider = 'aws';
    }
    // If provider still not set or invalid, default to 'aws' as last resort
    // (will be overridden by actual CSV row data below)
    if (!provider || !['aws', 'azure', 'gcp'].includes((provider || '').toLowerCase())) {
      provider = 'aws';
    }

    // Run CSV validation service
    const validation = await validateBillingCSV(req.file.path, provider.toLowerCase(), req.file.originalname);
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

    // Auto-detect provider from filename or record content
    const fileName = (req.file.originalname || '').toLowerCase();
    let detectedProv = (provider || 'aws').toLowerCase();
    if (fileName.includes('azure') || fileName.includes('microsoft')) {
      detectedProv = 'azure';
    } else if (fileName.includes('gcp') || fileName.includes('google')) {
      detectedProv = 'gcp';
    } else if (fileName.includes('aws') || fileName.includes('amazon')) {
      detectedProv = 'aws';
    }

    const records = validation.records.map((r) => {
      // Use the 'provider' column from CSV row directly if it's a known provider
      const csvProv = (r.provider || '').toLowerCase().trim();
      let recProv = ['aws', 'azure', 'gcp'].includes(csvProv) ? csvProv : detectedProv;

      // Fallback: scan row content for provider keywords
      if (!['aws', 'azure', 'gcp'].includes(recProv)) {
        const strRec = JSON.stringify(r).toLowerCase();
        if (strRec.includes('azure') || strRec.includes('microsoft') || strRec.includes('virtualmachines') || strRec.includes('blob')) {
          recProv = 'azure';
        } else if (strRec.includes('gcp') || strRec.includes('google') || strRec.includes('bigquery') || strRec.includes('compute')) {
          recProv = 'gcp';
        } else if (strRec.includes('aws') || strRec.includes('amazon') || strRec.includes('ec2') || strRec.includes('s3')) {
          recProv = 'aws';
        }
      }

      return {
        ...r,
        provider: recProv,
        uploadedBy: req.user._id,
        uploadDate: new Date(),
      };
    });

    // Store records in Database (or in-memory mock via Proxy insertMany)
    const savedRecords = await BillingData.insertMany(records);

    // Determine primary provider by counting occurrences across ALL records (most frequent wins)
    const providerCounts = {};
    savedRecords.forEach(r => {
      if (r.provider) providerCounts[r.provider] = (providerCounts[r.provider] || 0) + 1;
    });
    const detectedPrimaryProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || detectedProv;

    // Save File Upload history log
    const uploadedFile = await UploadedFile.create({
      filename: req.file.originalname,
      provider: detectedPrimaryProvider,
      recordCount: savedRecords.length,
      size: req.file.size,
      uploadedBy: req.user._id,
      status: 'success',
    });

    // Backfill fileId on the newly inserted billing records
    await BillingData.updateMany(
      { _id: { $in: savedRecords.map((r) => r._id) } },
      { $set: { fileId: uploadedFile._id } }
    );

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

    // ── Analyze Anomalies in Uploaded Dataset ────────────────────────────
    const anomalyAnalysis = analyzeAnomalies(savedRecords);

    // ── Send Email Notification to User's Gmail ─────────────────────────
    const recipientEmail = targetEmail || req.user.email;
    sendAnomalyNotificationEmail({
      userEmail: recipientEmail,
      userName: req.user.name,
      fileName: req.file.originalname,
      provider: detectedPrimaryProvider,
      recordCount: savedRecords.length,
      analysis: anomalyAnalysis,
    }).catch(err => console.error('⚠️  Anomaly push email skipped:', err.message));

    // ── Background ML Retrain (non-blocking) ──────────────────────────────
    // Fire-and-forget: trigger Django to retrain models on the new dataset
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      axios.post('http://localhost:8000/api/ml/retrain', {}, {
        headers: { Authorization: authHeader },
        timeout: 120000, // 2 minute timeout for training
      })
        .then(() => console.log('✅ ML models retrained on new upload'))
        .catch(err => console.warn('⚠️  ML retrain skipped (Django unavailable):', err.message));
    }

    res.status(201).json({
      message: 'Billing data uploaded and validated successfully',
      file: uploadedFile,
      recordsInserted: savedRecords.length,
      anomalySummary: {
        criticalCount: anomalyAnalysis.criticalCount,
        mediumCount: anomalyAnalysis.mediumCount,
        resolvedCount: anomalyAnalysis.resolvedCount,
        remainingCount: anomalyAnalysis.remainingCount,
        totalAnomalies: anomalyAnalysis.totalAnomalies,
        notificationSentTo: recipientEmail,
      },
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
    const { provider, service, region, costMin, costMax, dateMin, dateMax, search, sortBy, sortOrder, page = 1, limit = 10, fileId, scope } = req.query;

    let filter = {};
    if (fileId && fileId !== 'undefined' && fileId !== 'null') {
      try {
        const fileExists = await UploadedFile.exists({ _id: fileId });
        if (fileExists) {
          filter.fileId = fileId;
        } else {
          const latestFile = await UploadedFile.findOne({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
          if (latestFile) {
            filter.fileId = latestFile._id;
          } else {
            return res.json({
              records: [],
              pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 },
            });
          }
        }
      } catch (e) {
        filter.fileId = fileId;
      }
    } else if (scope !== 'all') {
      const latestFile = await UploadedFile.findOne({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
      if (latestFile) {
        filter.fileId = latestFile._id;
      } else if (!['super_admin', 'admin'].includes(req.user.role)) {
        filter.uploadedBy = req.user._id;
      }
    }

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
    const { fileId, scope } = req.query;
    let filter = {};
    if (fileId && fileId !== 'undefined' && fileId !== 'null') {
      try {
        const mongoose = require('mongoose');
        const objId = new mongoose.Types.ObjectId(fileId);
        const fileExists = await UploadedFile.exists({ _id: objId });
        if (fileExists) {
          filter = { $or: [{ fileId: objId }, { fileId: fileId }] };
        } else {
          // File was deleted — fall back to user's latest remaining file
          const isGlobal = scope === 'all' && ['super_admin', 'admin'].includes(req.user?.role);
          const userFilter = isGlobal ? {} : (req.user?._id ? { uploadedBy: req.user._id } : {});
          const latestFile = await UploadedFile.findOne(userFilter).sort({ createdAt: -1 });
          if (latestFile) {
            filter = { $or: [{ fileId: latestFile._id }, { fileId: String(latestFile._id) }] };
          } else {
            return res.json({
              totalCost: 0,
              averageCost: 0,
              totalRecords: 0,
              totalFiles: 0,
              providerSpend: { aws: 0, azure: 0, gcp: 0 },
              serviceSpend: [],
              dailySpend: [],
              monthlySpend: [],
              recentUploads: [],
            });
          }
        }
      } catch (e) {
        filter = { fileId };
      }
    } else {
      const isGlobal = scope === 'all' && ['super_admin', 'admin'].includes(req.user?.role);
      const userFilter = isGlobal ? {} : (req.user?._id ? { uploadedBy: req.user._id } : {});
      const latestFile = await UploadedFile.findOne(userFilter).sort({ createdAt: -1 });
      if (latestFile) {
        filter = { $or: [{ fileId: latestFile._id }, { fileId: String(latestFile._id) }] };
      } else {
        return res.json({
          totalCost: 0,
          averageCost: 0,
          totalRecords: 0,
          totalFiles: 0,
          providerSpend: { aws: 0, azure: 0, gcp: 0 },
          serviceSpend: [],
          dailySpend: [],
          monthlySpend: [],
          recentUploads: [],
        });
      }
    }

    let records = await BillingData.find(filter);

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
      const rawCost = r.cost ?? r.Cost ?? r.amount ?? r.price ?? r.BilledCost ?? 0;
      const cost = typeof rawCost === 'string' ? parseFloat(rawCost.replace(/[^0-9.-]+/g, '')) || 0 : Number(rawCost) || 0;
      totalCost += cost;

      // Provider
      const pKey = (r.provider || '').toLowerCase();
      if (pKey && providerMap[pKey] !== undefined) {
        providerMap[pKey] += cost;
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
    })).sort((a, b) => a.date.localeCompare(b.date));

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
      serviceSpend, // All unique services present in uploaded CSV
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
    const isAdmin = ['super_admin', 'admin'].includes(req.user.role);
    const filter = isAdmin ? {} : { uploadedBy: req.user._id };
    const records = await BillingData.find(filter);
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
    const isAdmin = ['super_admin', 'admin'].includes(req.user.role);
    const filter = isAdmin ? {} : { uploadedBy: req.user._id };
    const records = await BillingData.find(filter);
    const providers = [...new Set(records.map(r => r.provider))].sort();
    res.json(providers);
  } catch (error) {
    console.error('Get Providers Error:', error);
    res.status(500).json({ message: 'Server error retrieving unique providers list' });
  }
};

// @desc    Get uploaded file history for current user
// @route   GET /api/billing/files
// @access  Private
const getUploadedFiles = async (req, res) => {
  try {
    // Super Admins and Admins see all uploaded files; regular users see only their own
    const isAdmin = ['super_admin', 'admin'].includes(req.user.role);
    const filter = isAdmin ? { recordCount: { $gt: 0 } } : { uploadedBy: req.user._id, recordCount: { $gt: 0 } };
    const files = await UploadedFile.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ files });
  } catch (error) {
    console.error('Get Files Error:', error);
    res.status(500).json({ message: 'Server error retrieving uploaded files' });
  }
};

// @desc    Delete an uploaded file and all its billing records
// @route   DELETE /api/billing/files/:id
// @access  Private
const deleteUploadedFile = async (req, res) => {
  try {
    const fileRecord = await UploadedFile.findByIdAndDelete(req.params.id);
    if (!fileRecord) {
      return res.status(404).json({ message: 'File record not found' });
    }

    // Cascade: remove all billing records associated with this file's ID
    await BillingData.deleteMany({ fileId: fileRecord._id });

    res.json({ message: 'Dataset and all associated billing records removed', id: req.params.id });
  } catch (error) {
    console.error('Delete File Error:', error);
    res.status(500).json({ message: 'Server error deleting dataset' });
  }
};

// @desc    Manually push anomaly email notification for a dataset to specified Gmail
// @route   POST /api/billing/notify-anomalies
// @access  Private
const notifyAnomalies = async (req, res) => {
  try {
    const { fileId, targetEmail } = req.body;
    const recipientEmail = targetEmail || req.user.email;

    let filter = {};
    let fileInfo = { filename: 'Latest Dataset', provider: 'multi-cloud', recordCount: 0 };

    if (fileId) {
      const fileRecord = await UploadedFile.findById(fileId);
      if (fileRecord) {
        filter = { fileId: fileRecord._id };
        fileInfo = {
          filename: fileRecord.filename,
          provider: fileRecord.provider,
          recordCount: fileRecord.recordCount,
        };
      }
    } else {
      const latestFile = await UploadedFile.findOne({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
      if (latestFile) {
        filter = { fileId: latestFile._id };
        fileInfo = {
          filename: latestFile.filename,
          provider: latestFile.provider,
          recordCount: latestFile.recordCount,
        };
      }
    }

    const records = await BillingData.find(filter);
    if (records.length === 0) {
      return res.status(404).json({ message: 'No billing records found to analyze for anomalies' });
    }

    fileInfo.recordCount = records.length;
    const anomalyAnalysis = analyzeAnomalies(records);

    const sent = await sendAnomalyNotificationEmail({
      userEmail: recipientEmail,
      userName: req.user.name,
      fileName: fileInfo.filename,
      provider: fileInfo.provider,
      recordCount: fileInfo.recordCount,
      analysis: anomalyAnalysis,
    });

    if (sent) {
      return res.json({
        message: `Anomaly push notification delivered to ${recipientEmail}`,
        recipientEmail,
        anomalySummary: {
          criticalCount: anomalyAnalysis.criticalCount,
          mediumCount: anomalyAnalysis.mediumCount,
          resolvedCount: anomalyAnalysis.resolvedCount,
          remainingCount: anomalyAnalysis.remainingCount,
          totalAnomalies: anomalyAnalysis.totalAnomalies,
        },
      });
    } else {
      return res.status(500).json({ message: 'Failed to send email via SMTP transporter. Check SMTP credentials.' });
    }
  } catch (error) {
    console.error('Notify Anomalies Error:', error);
    res.status(500).json({ message: 'Server error triggering anomaly notification' });
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
  getUploadedFiles,
  deleteUploadedFile,
  notifyAnomalies,
};

