const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['super_admin', 'admin', 'user'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    resetPasswordOtp: {
      type: String,
      default: undefined,
    },
    resetPasswordOtpExpires: {
      type: Date,
      default: undefined,
    },
    registrationOtp: {
      type: String,
      default: undefined,
    },
    registrationOtpExpires: {
      type: Date,
      default: undefined,
    },
    registrationOtpAttempts: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    resetPasswordOtpAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

// In-Memory Database Fallback
const inMemoryDb = [];

const seedInMemoryAdmins = async () => {
  // Prevent duplicate seeding
  if (inMemoryDb.some((u) => u.role === 'super_admin')) return;

  const salt = await bcrypt.genSalt(12);
  const hash1 = await bcrypt.hash('CloudAtlasAdmin2026!', salt);

  inMemoryDb.push(
    {
      _id: 'mock-admin-1',
      name: 'Super Admin',
      email: 'admin1@cloudatlas.ai',
      phoneNumber: '9876543210',
      password: hash1,
      role: 'super_admin',
      isActive: true,
      registrationOtpAttempts: 0,
      resetPasswordOtpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );
  console.log('📦 In-memory database seeded with 1 Super Admin account');
};
seedInMemoryAdmins().catch((err) => console.error('Seed error:', err));

class MockQuery {
  constructor(result) {
    this.result = result;
  }
  select() {
    return this;
  }
  lean() {
    return this;
  }
  then(onResolve, onReject) {
    return Promise.resolve(this.result).then(onResolve, onReject);
  }
  catch(onReject) {
    return Promise.resolve(this.result).catch(onReject);
  }
}

class MockUserModel {
  constructor(data) {
    Object.assign(this, data);
  }

  static find(query = {}) {
    const users = inMemoryDb.map((user) => ({
      ...user,
      toObject: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
      toJSON: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
    }));
    return new MockQuery(users);
  }

  static findOne(query) {
    if (!query) return new MockQuery(null);

    const user = inMemoryDb.find((u) => {
      if (query.role && u.role === query.role) return true;
      if (query.email && u.email === query.email.toLowerCase()) return true;
      if (query._id && String(u._id) === String(query._id)) return true;
      if (query.$or) {
        return query.$or.some((cond) => {
          if (cond.email && u.email === cond.email.toLowerCase()) return true;
          if (cond.phoneNumber && u.phoneNumber === cond.phoneNumber) return true;
          return false;
        });
      }
      return false;
    });

    if (!user) return new MockQuery(null);

    const userObj = {
      ...user,
      matchPassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      },
      save: async function () {
        const idx = inMemoryDb.findIndex(u => u._id === this._id);
        if (idx !== -1) {
          inMemoryDb[idx] = { ...this };
        }
        return this;
      },
      toObject: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
      toJSON: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
    };
    return new MockQuery(userObj);
  }

  static findById(id) {
    const user = inMemoryDb.find((u) => String(u._id) === String(id));
    if (!user) return new MockQuery(null);

    const userObj = {
      ...user,
      toObject: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
      toJSON: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
    };
    return new MockQuery(userObj);
  }

  static async create(data) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = {
      _id: 'mock-id-' + Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email.toLowerCase(),
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      role: data.role || 'user',
      isActive: data.isActive !== undefined ? data.isActive : true,
      registrationOtp: data.registrationOtp,
      registrationOtpExpires: data.registrationOtpExpires,
      registrationOtpAttempts: 0,
      resetPasswordOtpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryDb.push(newUser);

    const userObj = {
      ...newUser,
      toObject: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
      toJSON: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
    };
    return userObj;
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const idx = inMemoryDb.findIndex(u => String(u._id) === String(id));
    if (idx === -1) return null;
    const updatedUser = {
      ...inMemoryDb[idx],
      ...updateData,
      updatedAt: new Date()
    };
    inMemoryDb[idx] = updatedUser;
    return {
      ...updatedUser,
      toObject: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
      toJSON: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      }
    };
  }

  static async findByIdAndDelete(id) {
    const idx = inMemoryDb.findIndex(u => String(u._id) === String(id));
    if (idx === -1) return null;
    const deletedUser = inMemoryDb[idx];
    inMemoryDb.splice(idx, 1);
    return deletedUser;
  }
}

// Proxy wrapper that routes calls based on database connection state
const ModelProxy = new Proxy(User, {
  get(target, prop) {
    if (global.useInMemoryDb) {
      return MockUserModel[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useInMemoryDb) {
      return new MockUserModel(...args);
    }
    return new target(...args);
  },
});

module.exports = ModelProxy;
