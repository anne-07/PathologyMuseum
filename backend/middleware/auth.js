const jwt = require('jsonwebtoken');
const { User } = require('../models');
const asyncHandler = require('express-async-handler')

const generateTokens = (user) => {
  // Generate access token (15 minutes)
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' }
  );

  // Generate refresh token (7 days)
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const setTokenCookies = (res, { accessToken, refreshToken }) => {
  const isProd = process.env.NODE_ENV === 'production';
  // For cross-origin requests (different domains), use 'none' with secure
  const sameSiteValue = isProd ? 'none' : 'lax';
  const common = {
    httpOnly: true,
    secure: isProd, // HTTPS only in production (required for sameSite: 'none')
    sameSite: sameSiteValue,
    path: '/',
  };

  // Set access token in HTTP-only cookie
  res.cookie('accessToken', accessToken, {
    ...common,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    ...common,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

const auth = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.split(' ')[1];
    
    // If not in header, try to get from cookies
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required, no token'
      });
    }

    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // If token is expired, try to refresh it
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Access token expired',
        shouldRefresh: true
      });
    }
    
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      error: error.message
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = { 
  auth, 
  adminOnly, 
  generateTokens, 
  setTokenCookies, 
  clearTokenCookies 
};
