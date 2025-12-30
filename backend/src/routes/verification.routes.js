const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Credential = require('../models/Credential.model');
const VerificationLog = require('../models/VerificationLog.model');
const Institution = require('../models/Institution.model');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/verify/:identifier
// @desc    Verify a credential by token ID or document hash
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let credential;

    // Check if identifier is a number (token ID) or string (hash)
    if (!isNaN(identifier)) {
      credential = await Credential.findOne({
        tokenId: parseInt(identifier),
      }).populate('institution', 'name logo verificationStatus walletAddress registrationNumber');
    } else {
      credential = await Credential.findOne({
        $or: [
          { documentHash: identifier },
          { metadataHash: identifier },
        ],
      }).populate('institution', 'name logo verificationStatus walletAddress registrationNumber');
    }

    if (!credential) {
      // Log failed verification
      await VerificationLog.create({
        credential: null,
        tokenId: parseInt(identifier) || 0,
        result: 'not_found',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Credential not found',
        data: null,
      });
    }

    // Determine verification result
    let result = 'valid';
    let isValid = true;

    if (credential.status === 'revoked') {
      result = 'revoked';
      isValid = false;
    } else if (credential.expiryDate && new Date() > credential.expiryDate) {
      result = 'expired';
      isValid = false;
    } else if (credential.status !== 'issued') {
      result = 'invalid';
      isValid = false;
    }

    // Log verification
    await VerificationLog.create({
      credential: credential._id,
      tokenId: credential.tokenId,
      result,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      verifierInfo: {
        organization: req.query.organization,
        purpose: req.query.purpose,
      },
    });

    // Update verification count
    await Credential.findByIdAndUpdate(credential._id, {
      $inc: { verificationCount: 1 },
      lastVerifiedAt: new Date(),
    });

    res.json({
      success: true,
      verified: isValid,
      result,
      data: {
        credential: {
          tokenId: credential.tokenId,
          credentialType: credential.credentialType,
          courseName: credential.courseName,
          studentName: credential.studentName,
          studentId: credential.studentId,
          grade: credential.grade,
          issueDate: credential.issueDate,
          expiryDate: credential.expiryDate,
          status: credential.status,
          documentHash: credential.documentHash,
          transactionHash: credential.transactionHash,
        },
        institution: {
          name: credential.institution.name,
          logo: credential.institution.logo,
          isVerified: credential.institution.verificationStatus === 'verified',
          registrationNumber: credential.institution.registrationNumber,
          walletAddress: credential.institution.walletAddress,
        },
        verification: {
          verifiedAt: new Date(),
          verificationCount: credential.verificationCount + 1,
        },
      },
    });
  } catch (error) {
    logger.error('Verification error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Server error during verification',
    });
  }
});

// @route   POST /api/verify/batch
// @desc    Verify multiple credentials at once
// @access  Public
router.post('/batch', [
  body('identifiers').isArray({ min: 1, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { identifiers } = req.body;
    const results = [];

    for (const identifier of identifiers) {
      let credential;
      
      if (!isNaN(identifier)) {
        credential = await Credential.findOne({
          tokenId: parseInt(identifier),
        }).populate('institution', 'name verificationStatus');
      } else {
        credential = await Credential.findOne({
          $or: [
            { documentHash: identifier },
            { metadataHash: identifier },
          ],
        }).populate('institution', 'name verificationStatus');
      }

      if (!credential) {
        results.push({
          identifier,
          verified: false,
          result: 'not_found',
        });
        continue;
      }

      let result = 'valid';
      let isValid = true;

      if (credential.status === 'revoked') {
        result = 'revoked';
        isValid = false;
      } else if (credential.expiryDate && new Date() > credential.expiryDate) {
        result = 'expired';
        isValid = false;
      } else if (credential.status !== 'issued') {
        result = 'invalid';
        isValid = false;
      }

      results.push({
        identifier,
        verified: isValid,
        result,
        tokenId: credential.tokenId,
        studentName: credential.studentName,
        courseName: credential.courseName,
        institutionName: credential.institution.name,
      });
    }

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: identifiers.length,
          verified: results.filter(r => r.verified).length,
          failed: results.filter(r => !r.verified).length,
        },
      },
    });
  } catch (error) {
    logger.error('Batch verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/verify/history/:tokenId
// @desc    Get verification history for a credential
// @access  Public
router.get('/history/:tokenId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      VerificationLog.find({ tokenId: parseInt(req.params.tokenId) })
        .select('-ipAddress')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      VerificationLog.countDocuments({ tokenId: parseInt(req.params.tokenId) }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get verification history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/verify/stats
// @desc    Get verification statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalVerifications, todayVerifications, weeklyStats] = await Promise.all([
      VerificationLog.countDocuments(),
      VerificationLog.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      VerificationLog.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
            valid: {
              $sum: { $cond: [{ $eq: ['$result', 'valid'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalVerifications,
        todayVerifications,
        weeklyStats,
      },
    });
  } catch (error) {
    logger.error('Get verification stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
