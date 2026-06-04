const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      enum: {
        values: ['aws', 'azure', 'gcp'],
        message: '{VALUE} is not a valid provider',
      },
      lowercase: true,
    },
    recordCount: {
      type: Number,
      required: [true, 'Record count is required'],
      min: 0,
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);

// --- In-Memory Mock Fallback Database ---
const inMemoryFilesDb = [];

// Seed 3 initial file logs to match our seeded billing data
const seedMockFiles = () => {
  inMemoryFilesDb.push(
    {
      _id: 'mock-file-1',
      filename: 'aws_q1_billing.csv',
      provider: 'aws',
      recordCount: 40,
      size: 154820,
      uploadedBy: 'mock-admin-1',
      uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'success',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      _id: 'mock-file-2',
      filename: 'azure_prod_compute.csv',
      provider: 'azure',
      recordCount: 40,
      size: 124500,
      uploadedBy: 'mock-admin-1',
      uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'success',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      _id: 'mock-file-3',
      filename: 'gcp_bigquery_exports.csv',
      provider: 'gcp',
      recordCount: 40,
      size: 189400,
      uploadedBy: 'mock-admin-1',
      uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'success',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  );
};
seedMockFiles();

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

class MockUploadedFileModel {
  static find(filter = {}) {
    let list = [...inMemoryFilesDb];
    if (filter.uploadedBy) {
      list = list.filter(f => String(f.uploadedBy) === String(filter.uploadedBy));
    }
    return new MockQuery(list);
  }

  static findById(id) {
    const item = inMemoryFilesDb.find(f => String(f._id) === String(id));
    return new MockQuery(item || null);
  }

  static async create(data) {
    const record = {
      _id: 'mock-file-' + Math.random().toString(36).substr(2, 9),
      ...data,
      uploadDate: new Date(),
      createdAt: new Date(),
    };
    inMemoryFilesDb.push(record);
    return record;
  }

  static countDocuments(filter = {}) {
    const list = MockUploadedFileModel.find(filter).result;
    return new MockQuery(list.length);
  }
}

const UploadedFileProxy = new Proxy(UploadedFile, {
  get(target, prop) {
    if (global.useInMemoryDb) {
      return MockUploadedFileModel[prop];
    }
    return target[prop];
  },
});

module.exports = UploadedFileProxy;
