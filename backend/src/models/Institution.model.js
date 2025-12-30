const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  institutionType: {
    type: String,
    enum: ['university', 'college', 'training_center', 'online_platform', 'other'],
    default: 'university',
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
  },
  website: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
  },
  logo: {
    type: String, // IPFS hash or URL
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  // Blockchain data
  blockchainId: {
    type: Number, // ID from smart contract
  },
  isVerifiedOnChain: {
    type: Boolean,
    default: false,
  },
  // Verification status
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected'],
    default: 'pending',
  },
  verificationDocuments: [{
    name: String,
    ipfsHash: String,
    uploadedAt: Date,
  }],
  rejectionReason: {
    type: String,
  },
  verifiedAt: {
    type: Date,
  },
  // Statistics
  credentialsIssued: {
    type: Number,
    default: 0,
  },
  activeStudents: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
institutionSchema.index({ walletAddress: 1 });
institutionSchema.index({ verificationStatus: 1 });
institutionSchema.index({ country: 1 });

module.exports = mongoose.model('Institution', institutionSchema);
