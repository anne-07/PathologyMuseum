// backend/controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { token: googleToken } = req.body;  // Renamed to googleToken
    const ticket = await client.verifyIdToken({
      idToken: googleToken,  // Using the renamed variable
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { sub, email, name, picture } = ticket.getPayload();
    
    // Find or create user
    let user = await User.findOne({ googleId: sub });
    
    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        username: name,
        avatar: picture,
        isEmailVerified: true,
        role: 'student' // Default role
      });
    }
    
    // Generate JWT - using jwtToken as the variable name
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      status: 'success',
      token: jwtToken,  // Using the new variable name
      data: { user }
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Google authentication failed'
    });
  }
};