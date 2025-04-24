const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
    const token = jwt.sign(
        //{ id: user._id, role: user.role },
        {userId},
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
    //COOKIE IN WEB
    res.cookie('jwt',token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

module.exports = {generateToken};