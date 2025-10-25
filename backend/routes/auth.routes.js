const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const { registerUser, loginUser, userDataProfile, logoutUser, updateUserProfile, checkUserRole, determineRoleFromEmail, forgotPassword, resetPassword } = require('../controllers/userController');
const { auth, adminOnly, generateTokens, setTokenCookies } = require('../middleware/auth');

router.post('/register',registerUser);
router.post('/login', loginUser);
router.get('/profile', auth , userDataProfile);
router.put('/profile', auth, updateUserProfile);
router.post('/logout', logoutUser);
router.get('/check-role/:email', checkUserRole);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token provided'
      });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
    
    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    // Set the new tokens in HTTP-only cookies
    setTokenCookies(res, { accessToken, refreshToken: newRefreshToken });

    // Send success response (tokens are in HTTP-only cookies)
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          username: user.username
        }
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired refresh token'
    });
  }
});

const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });

    if (!ticket) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Google token'
      });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Google token payload'
      });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      // Create new user with Google account (no password needed)
      user = await User.create({
        googleId,
        email,
        username: name,
        role: determineRoleFromEmail(email),
        password: null // Explicitly set password to null for Google users
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Set HTTP-only cookies
    setTokenCookies(res, { accessToken, refreshToken });

    // Return user data (tokens are in cookies)
    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Google authentication failed'
    });
  }
});

// Basic route for testing
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
});

module.exports = router;
