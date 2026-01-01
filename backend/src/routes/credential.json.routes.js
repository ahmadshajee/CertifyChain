/**
 * Credentials Routes - JSON File Storage Version
 * Handles credential CRUD operations without blockchain
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const credentialStorage = require('../utils/credentialStorage');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/credentials-json
// @desc    Issue a new credential
// @access  Institution only
router.post('/', [
  body('studentName').trim().notEmpty().withMessage('Student name is required'),
  body('studentEmail').isEmail().withMessage('Valid student email is required'),
  body('credentialType').trim().notEmpty().withMessage('Credential type is required'),
  body('courseName').trim().notEmpty().withMessage('Course name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      institutionId,
      institutionName,
      institutionEmail,
      studentId,
      studentName,
      studentEmail,
      credentialType,
      courseName,
      grade,
      issueDate,
      expiryDate,
      description,
      ipfsHash
    } = req.body;

    const credential = credentialStorage.createCredential({
      institutionId,
      institutionName,
      institutionEmail,
      studentId,
      studentName,
      studentEmail,
      credentialType,
      courseName,
      grade,
      issueDate,
      expiryDate,
      description,
      ipfsHash
    });

    logger.info(`Credential issued: ${credential.id} by ${institutionEmail}`);

    res.status(201).json({
      success: true,
      message: 'Credential issued successfully',
      data: { credential },
    });
  } catch (error) {
    logger.error('Issue credential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to issue credential',
    });
  }
});

// @route   GET /api/credentials-json
// @desc    Get all credentials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const credentials = credentialStorage.getAllCredentials();
    res.json({
      success: true,
      data: { credentials },
    });
  } catch (error) {
    logger.error('Get credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credentials',
    });
  }
});

// @route   GET /api/credentials-json/stats
// @desc    Get credential statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const { institutionEmail } = req.query;
    const stats = credentialStorage.getStats(institutionEmail);
    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

// @route   GET /api/credentials-json/institution/:email
// @desc    Get credentials by institution
// @access  Institution
router.get('/institution/:email', async (req, res) => {
  try {
    const credentials = credentialStorage.getCredentialsByInstitution(req.params.email);
    res.json({
      success: true,
      data: { credentials },
    });
  } catch (error) {
    logger.error('Get institution credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credentials',
    });
  }
});

// @route   GET /api/credentials-json/student/:email
// @desc    Get credentials by student
// @access  Student
router.get('/student/:email', async (req, res) => {
  try {
    const credentials = credentialStorage.getCredentialsByStudent(req.params.email);
    res.json({
      success: true,
      data: { credentials },
    });
  } catch (error) {
    logger.error('Get student credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credentials',
    });
  }
});

// @route   GET /api/credentials-json/:id
// @desc    Get credential by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const credential = credentialStorage.getCredentialById(req.params.id);
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credential',
    });
  }
});

// @route   POST /api/credentials-json/:id/revoke
// @desc    Revoke a credential
// @access  Institution only
router.post('/:id/revoke', async (req, res) => {
  try {
    const credential = credentialStorage.revokeCredential(req.params.id);
    logger.info(`Credential revoked: ${req.params.id}`);
    res.json({
      success: true,
      message: 'Credential revoked successfully',
      data: { credential },
    });
  } catch (error) {
    logger.error('Revoke credential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to revoke credential',
    });
  }
});

// @route   GET /api/credentials-json/:id/verify
// @desc    Verify a credential
// @access  Public
router.get('/:id/verify', async (req, res) => {
  try {
    const result = credentialStorage.verifyCredential(req.params.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Verify credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify credential',
    });
  }
});

// @route   DELETE /api/credentials-json/:id
// @desc    Delete a credential (admin only)
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    credentialStorage.deleteCredential(req.params.id);
    logger.info(`Credential deleted: ${req.params.id}`);
    res.json({
      success: true,
      message: 'Credential deleted successfully',
    });
  } catch (error) {
    logger.error('Delete credential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete credential',
    });
  }
});

module.exports = router;
