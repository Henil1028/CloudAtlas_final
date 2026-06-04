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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['super_admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'super_admin',
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
  const salt = await bcrypt.genSalt(12);
  const hash1 = await bcrypt.hash('CloudAtlasAdmin2026!', salt);
  const hash2 = await bcrypt.hash('CloudAtlasManager2026!', salt);

  inMemoryDb.push(
    {
      _id: 'mock-admin-1',
      name: 'Super Admin One',
      email: 'admin1@cloudatlas.ai',
      password: hash1,
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'mock-admin-2',
      name: 'Super Admin Two',
      email: 'admin2@cloudatlas.ai',
      password: hash2,
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );
};
seedInMemoryAdmins().catch((err) => console.error('Seed error:', err));

class MockQuery {
  constructor(result) {
    this.result = result;
  }
  select() {
    return this;
  }
  then(onResolve) {
    return Promise.resolve(this.result).then(onResolve);
  }
}

class MockUserModel {
  constructor(data) {
    Object.assign(this, data);
  }

  static findOne({ email }) {
    const user = inMemoryDb.find((u) => u.email === email.toLowerCase());
    if (!user) return new MockQuery(null);

    const userObj = {
      ...user,
      matchPassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
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
      password: hashedPassword,
      role: 'super_admin',
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
