/**
 * Authentication Routes - JSON File Storage Version
 * Uses JSON file instead of MongoDB for data persistence
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const jsonStorage = require('../utils/jsonStorage');
const logger = require('../utils/logger');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'accredchain-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const user = jsonStorage.getUserByToken(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('walletAddress').trim().notEmpty(),
  body('role').optional().isIn(['student', 'institution', 'verifier']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, name, walletAddress, role } = req.body;

    const result = await jsonStorage.registerUser({
      email,
      password,
      name,
      walletAddress: walletAddress.toLowerCase(),
      role: role || 'student',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login with email and password
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const result = await jsonStorage.loginUser(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials',
    });
  }
});

// @route   POST /api/auth/wallet/nonce
// @desc    Get nonce for wallet signature
// @access  Public
router.post('/wallet/nonce', [
  body('walletAddress').trim().notEmpty(),
], async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const address = walletAddress.toLowerCase();

    const result = jsonStorage.getNonce(address);

    res.json({
      success: true,
      data: {
        nonce: result.nonce,
      },
    });
  } catch (error) {
    logger.error('Nonce generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/auth/wallet/verify
// @desc    Verify wallet signature and login/register
// @access  Public
router.post('/wallet/verify', [
  body('walletAddress').trim().notEmpty(),
  body('signature').trim().notEmpty(),
  body('nonce').trim().notEmpty(),
  body('name').optional().trim(),
  body('email').optional().isEmail(),
], async (req, res) => {
  try {
    const { walletAddress, signature, nonce, name, email } = req.body;
    const address = walletAddress.toLowerCase();

    // Verify signature
    const message = `Sign this message to authenticate with AccredChain.\n\nNonce: ${nonce}`;
    
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address) {
        return res.status(401).json({
          success: false,
          message: 'Invalid signature',
        });
      }
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    // Check if user exists
    const data = jsonStorage.readData();
    let user = data.users.find(u => u.walletAddress === address);

    if (!user) {
      // Register new user with wallet
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email required for new users',
        });
      }

      const result = await jsonStorage.registerUser({
        walletAddress: address,
        name,
        email,
        password: Math.random().toString(36).slice(-12),
        role: 'student',
      });

      return res.json({
        success: true,
        message: 'Registration successful',
        data: {
          user: result.user,
          token: result.token,
        },
      });
    }

    // Login existing user
    const result = jsonStorage.verifyWalletLogin(address, nonce);

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    logger.error('Wallet verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during verification',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authMiddleware, (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    jsonStorage.logoutUser(token);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
});

module.exports = router;
