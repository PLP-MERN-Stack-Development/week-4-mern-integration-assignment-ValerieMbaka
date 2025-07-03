const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */
module.exports = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token, authorization denied' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }
        
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ success: false, error: 'User account is deactivated' });
        }
        
        // Add user to request object
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired' });
        }
        
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};