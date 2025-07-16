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
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Debug log

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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

module.exports = {
  registerUser,
  loginUser,
  userDataProfile,
  logoutUser,
  updateUserProfile,
  checkUserRole,
  determineRoleFromEmail
};