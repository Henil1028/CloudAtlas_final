const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: [true, 'User is required'],
      trim: true,
    },
    ipAddress: {
      type: String,
      required: [true, 'IP Address is required'],
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    provider: {
      type: String,
      trim: true,
      default: null,
      lowercase: true,
    },
    recordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// --- In-Memory Mock Fallback Database ---
const inMemoryAuditDb = [];

// Seed 3 logs matching default seeding
const seedMockAudits = () => {
  inMemoryAuditDb.push(
    {
      _id: 'mock-audit-1',
      user: 'admin1@cloudatlas.ai',
      ipAddress: '127.0.0.1',
      action: 'File Upload Ingestion',
      fileName: 'aws_q1_billing.csv',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      provider: 'aws',
      recordCount: 40,
    },
    {
      _id: 'mock-audit-2',
      user: 'admin1@cloudatlas.ai',
      ipAddress: '127.0.0.1',
      action: 'File Upload Ingestion',
      fileName: 'azure_prod_compute.csv',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      provider: 'azure',
      recordCount: 40,
    },
    {
      _id: 'mock-audit-3',
      user: 'admin1@cloudatlas.ai',
      ipAddress: '127.0.0.1',
      action: 'File Upload Ingestion',
      fileName: 'gcp_bigquery_exports.csv',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      provider: 'gcp',
      recordCount: 40,
    }
  );
};
seedMockAudits();

class MockQuery {
  constructor(result) {
    this.result = result;
  }
  sort(options) {
    if (!this.result || !Array.isArray(this.result)) return this;
    const key = Object.keys(options)[0];
    const direction = options[key];
    this.result.sort((a, b) => {
      if (a[key] < b[key]) return -1 * direction;
      if (a[key] > b[key]) return 1 * direction;
      return 0;
    });
    return this;
  }
  limit(num) {
    if (this.result && Array.isArray(this.result)) {
      this.result = this.result.slice(0, num);
    }
    return this;
  }
  then(onResolve) {
    return Promise.resolve(this.result).then(onResolve);
  }
}

class MockAuditModel {
  static find(filter = {}) {
    let list = [...inMemoryAuditDb];
    if (filter.user) {
      list = list.filter(a => a.user === filter.user);
    }
    return new MockQuery(list);
  }

  static async create(data) {
    const record = {
      _id: 'mock-audit-' + Math.random().toString(36).substr(2, 9),
      ...data,
      timestamp: new Date(),
      createdAt: new Date(),
    };
    inMemoryAuditDb.push(record);
    return record;
  }

  static countDocuments(filter = {}) {
    const list = MockAuditModel.find(filter).result;
    return new MockQuery(list.length);
  }
}

const AuditLogProxy = new Proxy(AuditLog, {
  get(target, prop) {
    if (global.useInMemoryDb) {
      return MockAuditModel[prop];
    }
    return target[prop];
  },
});

module.exports = AuditLogProxy;
