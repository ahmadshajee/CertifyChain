const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User.model');
const logger = require('../utils/logger');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
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

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { walletAddress: walletAddress.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or wallet already exists',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      walletAddress: walletAddress.toLowerCase(),
      role: role || 'student',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
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

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
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

    let user = await User.findOne({ walletAddress: address });

    if (!user) {
      // Create a temporary nonce for new users
      const nonce = Math.floor(Math.random() * 1000000).toString();
      return res.json({
        success: true,
        data: {
          nonce,
          isNewUser: true,
        },
      });
    }

    // Generate new nonce
    const nonce = user.generateNonce();
    await user.save();

    res.json({
      success: true,
      data: {
        nonce,
        isNewUser: false,
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
    const message = `Sign this message to authenticate with CertifyChain.\n\nNonce: ${nonce}`;
    
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

    // Find or create user
    let user = await User.findOne({ walletAddress: address });

    if (!user) {
      // Register new user
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email required for new users',
        });
      }

      user = await User.create({
        walletAddress: address,
        name,
        email,
        password: Math.random().toString(36).slice(-12), // Random password for wallet users
        role: 'student',
      });
    }

    // Update nonce and last login
    user.generateNonce();
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Wallet verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
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

module.exports = router;
