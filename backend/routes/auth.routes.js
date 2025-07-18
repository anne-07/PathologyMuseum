const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const { registerUser, loginUser, userDataProfile, logoutUser, updateUserProfile, checkUserRole, determineRoleFromEmail } = require('../controllers/userController');
const { auth, adminonly} = require('../middleware/auth');

router.post('/register',registerUser);
router.post('/login', loginUser);
router.get('/profile', auth , userDataProfile);
router.put('/profile', auth, updateUserProfile);
router.post('/logout', logoutUser);
router.get('/check-role/:email', checkUserRole);

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

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      data: {
        token: jwtToken,
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
