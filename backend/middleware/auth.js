const jwt = require('jsonwebtoken');
const { User } = require('../models');
const asyncHandler = require('express-async-handler')

const auth = async (req, res, next) => {
  try {
    //let token
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    console.log('Authorization header:', req.headers.authorization);

    //const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required, no token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log("Decoded ID:", decoded.id);
    const user = await User.findById(decoded.id).select('-password');
    console.log("Found User:", user);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
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

module.exports = { auth, adminOnly };
