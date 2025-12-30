const Institution = require('../models/Institution.model');

/**
 * Institution only middleware
 * Checks if the authenticated user is from a verified institution
 */
const institutionOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'institution' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Institution privileges required.',
    });
  }

  // For admins, skip institution check
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if institution exists and is verified
  try {
    const institution = await Institution.findOne({
      walletAddress: req.user.walletAddress,
    });

    if (!institution) {
      return res.status(403).json({
        success: false,
        message: 'Institution not registered',
      });
    }

    if (institution.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Institution not verified. Please complete verification first.',
      });
    }

    if (!institution.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Institution account is deactivated',
      });
    }

    // Attach institution to request
    req.institution = institution;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = institutionOnly;
