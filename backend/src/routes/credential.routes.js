const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Credential = require('../models/Credential.model');
const Institution = require('../models/Institution.model');
const auth = require('../middleware/auth');
const institutionOnly = require('../middleware/institutionOnly');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/credentials
// @desc    Create/issue a new credential
// @access  Private (Verified Institution)
router.post('/', [auth, institutionOnly], [
  body('studentWallet').trim().notEmpty(),
  body('studentName').trim().notEmpty(),
  body('studentId').trim().notEmpty(),
  body('credentialType').isIn(['degree', 'masters', 'phd', 'diploma', 'certificate', 'transcript', 'course', 'professional']),
  body('courseName').trim().notEmpty(),
  body('issueDate').isISO8601(),
  body('expiryDate').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Get institution
    const institution = await Institution.findOne({
      walletAddress: req.user.walletAddress,
      verificationStatus: 'verified',
    });

    if (!institution) {
      return res.status(403).json({
        success: false,
        message: 'Your institution must be verified to issue credentials',
      });
    }

    const credential = await Credential.create({
      institution: institution._id,
      institutionWallet: req.user.walletAddress,
      studentWallet: req.body.studentWallet.toLowerCase(),
      studentName: req.body.studentName,
      studentId: req.body.studentId,
      credentialType: req.body.credentialType,
      courseName: req.body.courseName,
      grade: req.body.grade,
      description: req.body.description,
      issueDate: new Date(req.body.issueDate),
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
      documentHash: req.body.documentHash,
      metadataHash: req.body.metadataHash,
      metadataUrl: req.body.metadataUrl,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Credential created successfully',
      data: { credential },
    });
  } catch (error) {
    logger.error('Create credential error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/credentials/:id/issue
// @desc    Mark credential as issued on blockchain
// @access  Private (Institution owner)
router.put('/:id/issue', [auth, institutionOnly], [
  body('tokenId').isInt({ min: 1 }),
  body('transactionHash').trim().notEmpty(),
  body('blockNumber').optional().isInt(),
], async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found',
      });
    }

    if (credential.institutionWallet !== req.user.walletAddress) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    credential.tokenId = req.body.tokenId;
    credential.transactionHash = req.body.transactionHash;
    credential.blockNumber = req.body.blockNumber;
    credential.status = 'issued';

    await credential.save();

    // Update institution stats
    await Institution.findByIdAndUpdate(credential.institution, {
      $inc: { credentialsIssued: 1 },
    });

    res.json({
      success: true,
      message: 'Credential marked as issued',
      data: { credential },
    });
  } catch (error) {
    logger.error('Issue credential error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/credentials/:id/revoke
// @desc    Revoke a credential
// @access  Private (Institution owner)
router.put('/:id/revoke', [auth, institutionOnly], [
  body('reason').trim().notEmpty(),
], async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found',
      });
    }

    if (credential.institutionWallet !== req.user.walletAddress) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (credential.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: 'Credential is already revoked',
      });
    }

    credential.status = 'revoked';
    credential.revokedAt = new Date();
    credential.revocationReason = req.body.reason;

    await credential.save();

    res.json({
      success: true,
      message: 'Credential revoked successfully',
      data: { credential },
    });
  } catch (error) {
    logger.error('Revoke credential error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/credentials/student/:address
// @desc    Get credentials for a student
// @access  Public
router.get('/student/:address', async (req, res) => {
  try {
    const credentials = await Credential.find({
      studentWallet: req.params.address.toLowerCase(),
      status: { $in: ['issued', 'revoked', 'expired'] },
    })
      .populate('institution', 'name logo verificationStatus')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      data: { credentials },
    });
  } catch (error) {
    logger.error('Get student credentials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/credentials/institution/:address
// @desc    Get credentials issued by an institution
// @access  Private (Institution owner)
router.get('/institution/:address', auth, async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();

    // Check authorization
    if (req.user.walletAddress !== address && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { institutionWallet: address };
    if (req.query.status) filter.status = req.query.status;

    const [credentials, total] = await Promise.all([
      Credential.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Credential.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        credentials,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get institution credentials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/credentials/:id
// @desc    Get credential by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id)
      .populate('institution', 'name logo verificationStatus walletAddress');

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found',
      });
    }

    res.json({
      success: true,
      data: { credential },
    });
  } catch (error) {
    logger.error('Get credential error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/credentials/token/:tokenId
// @desc    Get credential by blockchain token ID
// @access  Public
router.get('/token/:tokenId', async (req, res) => {
  try {
    const credential = await Credential.findOne({
      tokenId: parseInt(req.params.tokenId),
    }).populate('institution', 'name logo verificationStatus walletAddress');

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found',
      });
    }

    res.json({
      success: true,
      data: { credential },
    });
  } catch (error) {
    logger.error('Get credential by token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
