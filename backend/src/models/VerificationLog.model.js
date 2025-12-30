const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  credential: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential',
    required: true,
  },
  tokenId: {
    type: Number,
    required: true,
  },
  verifier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifierWallet: {
    type: String,
    lowercase: true,
  },
  verifierInfo: {
    organization: String,
    purpose: String,
    email: String,
  },
  result: {
    type: String,
    enum: ['valid', 'invalid', 'revoked', 'expired', 'not_found'],
    required: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  location: {
    country: String,
    city: String,
  },
}, {
  timestamps: true,
});

// Indexes for analytics
verificationLogSchema.index({ credential: 1, createdAt: -1 });
verificationLogSchema.index({ tokenId: 1 });
verificationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
