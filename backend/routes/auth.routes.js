const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const { registerUser, loginUser, userDataProfile , logoutUser, updateUserProfile} = require('../controllers/userController');
const { auth, adminonly} = require('../middleware/auth');

router.post('/register',registerUser);
router.post('/login', loginUser);
router.get('/profile', auth , userDataProfile);
router.put('/profile', auth, updateUserProfile);
router.post('/logout', logoutUser);

// Basic route for testing
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
});


module.exports = router;
