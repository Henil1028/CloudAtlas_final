const mongoose = require('mongoose');

const billingDataSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      enum: {
        values: ['aws', 'azure', 'gcp'],
        message: '{VALUE} is not a supported cloud provider',
      },
      lowercase: true,
    },
    date: {
      type: Date,
      required: [true, 'Billing date is required'],
    },
    service: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
    },
    usageType: {
      type: String,
      required: [true, 'Usage type is required'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    accountId: {
      type: String,
      default: 'N/A',
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
billingDataSchema.index({ provider: 1 });
billingDataSchema.index({ service: 1 });
billingDataSchema.index({ date: 1 });

const BillingData = mongoose.model('BillingData', billingDataSchema);

// --- In-Memory Mock Fallback Database ---
const inMemoryBillingDb = [];

// Seed some initial mock data so the dashboard looks beautiful on first run if in memory mode
const seedMockBillingData = () => {
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
  
  // Create 120 historical records spread across last 90 days
  for (let i = 0; i < 120; i++) {
    const provider = providers[i % providers.length];
    const providerServices = services[provider];
    const service = providerServices[Math.floor(Math.random() * providerServices.length)];
    const region = regions[provider][Math.floor(Math.random() * regions[provider].length)];
    const usageType = usageTypes[Math.floor(Math.random() * usageTypes.length)];
    
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 90));
    
    // Cost ranging from $2.50 to $850.00
    const cost = Math.round((Math.random() * 850 + 2.5) * 100) / 100;
    
    inMemoryBillingDb.push({
      _id: `mock-bill-${i}`,
      provider,
      date,
      service,
      region,
      usageType,
      cost,
      currency: 'USD',
      accountId: `${100000000000 + (i % 3) * 555555}`,
      uploadedBy: 'mock-admin-1',
      uploadDate: new Date(),
      createdAt: date,
      updatedAt: date,
    });
  }
};
seedMockBillingData();

class MockQuery {
  constructor(result) {
    this.result = result;
  }
  sort(options) {
    if (!this.result || !Array.isArray(this.result)) return this;
    
    const key = Object.keys(options)[0];
    const direction = options[key]; // 1 for asc, -1 for desc
    
    this.result.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      
      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
    
    return this;
  }
  skip(num) {
    if (this.result && Array.isArray(this.result)) {
      this.result = this.result.slice(num);
    }
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

class MockBillingModel {
  static find(filter = {}) {
    let list = [...inMemoryBillingDb];
    
    // Filter by provider
    if (filter.provider) {
      list = list.filter(b => b.provider === filter.provider.toLowerCase());
    }
    
    // Filter by service
    if (filter.service) {
      list = list.filter(b => b.service.toLowerCase().includes(filter.service.toLowerCase()));
    }
    
    // Filter by region
    if (filter.region) {
      list = list.filter(b => b.region.toLowerCase().includes(filter.region.toLowerCase()));
    }
    
    // Filter by cost range
    if (filter.cost && (filter.cost.$gte !== undefined || filter.cost.$lte !== undefined)) {
      if (filter.cost.$gte !== undefined) {
        list = list.filter(b => b.cost >= filter.cost.$gte);
      }
      if (filter.cost.$lte !== undefined) {
        list = list.filter(b => b.cost <= filter.cost.$lte);
      }
    }
    
    // Filter by date range
    if (filter.date && (filter.date.$gte !== undefined || filter.date.$lte !== undefined)) {
      const gte = filter.date.$gte ? new Date(filter.date.$gte).getTime() : 0;
      const lte = filter.date.$lte ? new Date(filter.date.$lte).getTime() : Infinity;
      list = list.filter(b => {
        const t = new Date(b.date).getTime();
        return t >= gte && t <= lte;
      });
    }

    // Filter by search keyword
    if (filter.$or) {
      const keyword = filter.$or[0].service?.$regex?.source || '';
      if (keyword) {
        list = list.filter(b => 
          b.service.toLowerCase().includes(keyword.toLowerCase()) || 
          b.region.toLowerCase().includes(keyword.toLowerCase()) || 
          b.usageType.toLowerCase().includes(keyword.toLowerCase())
        );
      }
    }

    return new MockQuery(list);
  }

  static findById(id) {
    const item = inMemoryBillingDb.find(b => String(b._id) === String(id));
    return new MockQuery(item || null);
  }

  static async create(data) {
    const record = {
      _id: 'mock-bill-' + Math.random().toString(36).substr(2, 9),
      ...data,
      date: new Date(data.date),
      cost: Number(data.cost),
      uploadDate: new Date(),
    };
    inMemoryBillingDb.push(record);
    return record;
  }

  static async insertMany(records) {
    const added = [];
    for (const data of records) {
      const record = {
        _id: 'mock-bill-' + Math.random().toString(36).substr(2, 9),
        ...data,
        date: new Date(data.date),
        cost: Number(data.cost),
        uploadDate: new Date(),
      };
      inMemoryBillingDb.push(record);
      added.push(record);
    }
    return added;
  }

  static async deleteMany(filter = {}) {
    const prevCount = inMemoryBillingDb.length;
    if (Object.keys(filter).length === 0) {
      inMemoryBillingDb.length = 0;
    } else {
      // Find matching items to delete
      // Currently deleteMany in our controller is used to delete records by uploadedBy or _id
      if (filter.uploadedBy) {
        let i = inMemoryBillingDb.length;
        while (i--) {
          if (String(inMemoryBillingDb[i].uploadedBy) === String(filter.uploadedBy)) {
            inMemoryBillingDb.splice(i, 1);
          }
        }
      }
    }
    return { deletedCount: prevCount - inMemoryBillingDb.length };
  }

  static async findByIdAndDelete(id) {
    const idx = inMemoryBillingDb.findIndex(b => String(b._id) === String(id));
    if (idx !== -1) {
      const removed = inMemoryBillingDb.splice(idx, 1);
      return removed[0];
    }
    return null;
  }

  static countDocuments(filter = {}) {
    // Return count through the query builder
    const query = MockBillingModel.find(filter);
    return new MockQuery(query.result.length);
  }
}

// Proxy wrapper
const BillingDataProxy = new Proxy(BillingData, {
  get(target, prop) {
    if (global.useInMemoryDb) {
      return MockBillingModel[prop];
    }
    return target[prop];
  },
});

module.exports = BillingDataProxy;
