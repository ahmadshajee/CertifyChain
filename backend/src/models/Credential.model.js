const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  // Blockchain data
  tokenId: {
    type: Number,
    unique: true,
    sparse: true, // Allow null until minted
  },
  transactionHash: {
    type: String,
  },
  blockNumber: {
    type: Number,
  },
  // Relations
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
  },
  institutionWallet: {
    type: String,
    required: true,
    lowercase: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  studentWallet: {
    type: String,
    required: true,
    lowercase: true,
  },
  // Credential details
  credentialType: {
    type: String,
    required: true,
    enum: ['degree', 'masters', 'phd', 'diploma', 'certificate', 'transcript', 'course', 'professional'],
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  studentId: {
    type: String,
    required: true,
    trim: true,
  },
  grade: {
    type: String,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  // Dates
  issueDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
  },
  // IPFS data
  documentHash: {
    type: String, // IPFS hash of the credential document
  },
  metadataHash: {
    type: String, // IPFS hash of the NFT metadata
  },
  metadataUrl: {
    type: String, // Full IPFS gateway URL
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'issued', 'revoked', 'expired'],
    default: 'draft',
  },
  revokedAt: {
    type: Date,
  },
  revocationReason: {
    type: String,
  },
  // Verification tracking
  verificationCount: {
    type: Number,
    default: 0,
  },
  lastVerifiedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
credentialSchema.index({ tokenId: 1 });
credentialSchema.index({ studentWallet: 1 });
credentialSchema.index({ institutionWallet: 1 });
credentialSchema.index({ status: 1 });
credentialSchema.index({ documentHash: 1 });

// Virtual for checking if expired
credentialSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

module.exports = mongoose.model('Credential', credentialSchema);
