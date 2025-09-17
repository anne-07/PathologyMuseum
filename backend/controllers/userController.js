const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const { User } = require('../models');
const { generateToken } = require('../utils/generateToken')

// Function to determine role based on email domain
const determineRoleFromEmail = (email) => {
  // For medical education, we can use the institution's email domain
  const adminDomains = ['sitpune.edu.in']; // Add your institution's domain
  const domain = email.split('@')[1];
  return adminDomains.includes(domain) ? 'admin' : 'student';
};

// @Desc Register new user
// @route POST /api/auth/register
// @access Public
const registerUser = asyncHandler( async (req,res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username, email and password'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists'
      });
    }

    // Determine role based on email domain
    const role = determineRoleFromEmail(email);
    
    // Create new user with auto-determined role
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    //generateToken(res, user._id);
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Error creating user'
    });
  }
});


// @Desc Authenticate new user
// @route POST /api/auth/login
// @access Public


const loginUser = asyncHandler(async (req, res) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers
    });

    const { email, password } = req.body;
    
    // Validate request body
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    console.log('Login attempt:', { email });

    // Check if user exists and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password' 
      });
    }

    // Check if user has a password (in case they registered with OAuth)
    if (!user.password) {
      console.log('No password set for user (possibly registered with OAuth):', user.email);
      return res.status(401).json({
        status: 'error',
        message: 'No password set for this account. Please try a different login method.'
      });
    }

    // Check password
    console.log('Checking password for user:', user.email);
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password check result:', isPasswordValid);
    } catch (bcryptError) {
      console.error('Bcrypt compare error:', bcryptError);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred during authentication.'
      });
    }
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.email);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password' 
      });
    }

    // Determine if user should be admin based on email domain
    const isAdmin = determineRoleFromEmail(user.email) === 'admin';
    
    // If the user is not an admin but trying to access admin routes
    if (user.role !== 'admin' && isAdmin) {
      // Update user role if their email domain suggests they should be an admin
      user.role = 'admin';
      await user.save();
    }

    // Generate JWT token with fallback for JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'; // Add this line
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email); // Debug log

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'An error occurred during login. Please try again.'
    });
  }
});




// @Desc Get new user
// @route GET /api/auth/profile
// @access Private
const userDataProfile = asyncHandler( async (req,res) => {
  // const user = await User.findById(req.user._id).select('-password');
  // const user = {
    // _id: req.user._id,
    // username: req.user.username,
    // email: req.user.email,
    // role: req.user.role
  // }
  res.status(200).json({ 
    status: 'success',
    data:{
      user:{
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});


// @Desc Get new user
// @route GET /api/auth/profile
// @access Private
const logoutUser = asyncHandler( async (req,res) => {
  // res.cookie('jwt','',{
  //   httpOnly:true,
  //   expires: new Date(0)
  // })
  
  res.status(200).json({
    message: 'User logged out'
  });
});

// @Desc Update user profile
// @route PUT /api/auth/profile
// @access Private
const updateUserProfile = asyncHandler( async (req,res) => {
  const user = await User.findById(req.user._id);

  if(user){
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if(req.body.password) {
      // Require current password for authentication
      if (!req.body.currentPassword) {
        res.status(401);
        throw new Error('Current password is required to change your password');
      }
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
      }
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        }
      }
    });
  }else{
    res.status(404);
    throw new Error('User not found')
  }

  // res.json({message: 'User data profile'})
})



// generate JWT 
// const generateToken = (id) => {

// @desc Check if a user is an admin
// @route GET /api/auth/check-role/:email
// @access Public
const checkUserRole = asyncHandler(async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      role: user.role
    });
  } catch (error) {
    console.error('Check role error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error checking user role'
    });
  }
});

// @Desc   Forgot Password
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      return res.status(200).json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link.'
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // In a real application, you would send an email here with a link containing the resetToken
    // For example: `https://yourdomain.com/reset-password?token=${resetToken}`
    console.log('Password reset token:', resetToken);
    console.log('Reset link:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

    res.status(200).json({
      status: 'success',
      message: 'If your email is registered, you will receive a password reset link.',
      // In production, don't send the token in the response
      // This is just for development/testing
      token: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your request.'
    });
  }
});

// @Desc   Reset Password
// @route  POST /api/auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Token and new password are required'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by ID from token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    let message = 'An error occurred while resetting your password.';
    if (error.name === 'TokenExpiredError') {
      message = 'The password reset link has expired. Please request a new one.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid or expired token';
    }
    
    res.status(400).json({
      status: 'error',
      message
    });
  }
});

module.exports = {
  registerUser,
  loginUser,
  userDataProfile,
  updateUserProfile,
  logoutUser,
  checkUserRole,
  determineRoleFromEmail,
  forgotPassword,
  resetPassword
};