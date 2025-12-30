const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Don't include password by default in queries
  },
  role: {
    type: String,
    enum: ['student', 'institution', 'verifier', 'admin'],
    default: 'student',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
  },
  nonce: {
    type: String, // For wallet signature verification
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate random nonce for wallet auth
userSchema.methods.generateNonce = function() {
  this.nonce = Math.floor(Math.random() * 1000000).toString();
  return this.nonce;
};

module.exports = mongoose.model('User', userSchema);
