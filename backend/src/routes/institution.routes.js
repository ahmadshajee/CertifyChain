const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Institution = require('../models/Institution.model');
const User = require('../models/User.model');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/institutions/register
// @desc    Register a new institution
// @access  Private
router.post('/register', auth, [
  body('name').trim().notEmpty(),
  body('registrationNumber').trim().notEmpty(),
  body('institutionType').isIn(['university', 'college', 'training_center', 'online_platform', 'other']),
  body('country').trim().notEmpty(),
  body('email').isEmail(),
  body('website').optional().isURL(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if already registered
    const existingInstitution = await Institution.findOne({
      $or: [
        { walletAddress: req.user.walletAddress },
        { registrationNumber: req.body.registrationNumber },
      ],
    });

    if (existingInstitution) {
      return res.status(400).json({
        success: false,
        message: 'Institution already registered with this wallet or registration number',
      });
    }

    const institution = await Institution.create({
      user: req.user.id,
      walletAddress: req.user.walletAddress,
      ...req.body,
    });

    // Update user role
    await User.findByIdAndUpdate(req.user.id, { role: 'institution' });

    res.status(201).json({
      success: true,
      message: 'Institution registered successfully',
      data: { institution },
    });
  } catch (error) {
    logger.error('Institution registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/institutions
// @desc    Get all verified institutions
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('country').optional().trim(),
  query('type').optional().isIn(['university', 'college', 'training_center', 'online_platform', 'other']),
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      verificationStatus: 'verified',
      isActive: true,
    };

    if (req.query.country) filter.country = req.query.country;
    if (req.query.type) filter.institutionType = req.query.type;

    const [institutions, total] = await Promise.all([
      Institution.find(filter)
        .select('-verificationDocuments -rejectionReason')
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      Institution.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        institutions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get institutions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/institutions/:id
// @desc    Get institution by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id)
      .select('-verificationDocuments -rejectionReason');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    res.json({
      success: true,
      data: { institution },
    });
  } catch (error) {
    logger.error('Get institution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/institutions/wallet/:address
// @desc    Get institution by wallet address
// @access  Public
router.get('/wallet/:address', async (req, res) => {
  try {
    const institution = await Institution.findOne({
      walletAddress: req.params.address.toLowerCase(),
    }).select('-verificationDocuments -rejectionReason');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    res.json({
      success: true,
      data: { institution },
    });
  } catch (error) {
    logger.error('Get institution by wallet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/institutions/:id
// @desc    Update institution details
// @access  Private (Institution owner)
router.put('/:id', auth, [
  body('website').optional().isURL(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('description').optional().trim().isLength({ max: 1000 }),
], async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    // Check ownership
    if (institution.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this institution',
      });
    }

    const allowedUpdates = ['website', 'email', 'phone', 'description', 'logo', 'address'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedInstitution = await Institution.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Institution updated successfully',
      data: { institution: updatedInstitution },
    });
  } catch (error) {
    logger.error('Update institution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/institutions/:id/request-verification
// @desc    Request verification for institution
// @access  Private (Institution owner)
router.post('/:id/request-verification', auth, [
  body('documents').isArray({ min: 1 }),
  body('documents.*.name').trim().notEmpty(),
  body('documents.*.ipfsHash').trim().notEmpty(),
], async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    if (institution.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (institution.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Institution is already verified',
      });
    }

    if (institution.verificationStatus === 'under_review') {
      return res.status(400).json({
        success: false,
        message: 'Verification request is already under review',
      });
    }

    institution.verificationDocuments = req.body.documents.map(doc => ({
      ...doc,
      uploadedAt: new Date(),
    }));
    institution.verificationStatus = 'under_review';
    institution.rejectionReason = '';

    await institution.save();

    res.json({
      success: true,
      message: 'Verification request submitted successfully',
      data: { institution },
    });
  } catch (error) {
    logger.error('Request verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/institutions/:id/verify
// @desc    Approve institution verification (Admin only)
// @access  Private (Admin)
router.post('/:id/verify', [auth, adminOnly], async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    institution.verificationStatus = 'verified';
    institution.verifiedAt = new Date();

    await institution.save();

    res.json({
      success: true,
      message: 'Institution verified successfully',
      data: { institution },
    });
  } catch (error) {
    logger.error('Verify institution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/institutions/:id/reject
// @desc    Reject institution verification (Admin only)
// @access  Private (Admin)
router.post('/:id/reject', [auth, adminOnly], [
  body('reason').trim().notEmpty(),
], async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    institution.verificationStatus = 'rejected';
    institution.rejectionReason = req.body.reason;

    await institution.save();

    res.json({
      success: true,
      message: 'Institution verification rejected',
      data: { institution },
    });
  } catch (error) {
    logger.error('Reject institution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/institutions/pending/list
// @desc    Get pending verification requests (Admin only)
// @access  Private (Admin)
router.get('/pending/list', [auth, adminOnly], async (req, res) => {
  try {
    const institutions = await Institution.find({
      verificationStatus: 'under_review',
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { institutions },
    });
  } catch (error) {
    logger.error('Get pending institutions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
