const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware - verifies user is authenticated
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized - user not found' });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({ message: 'Not authorized - token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized - no token' });
    }
};

// Admin middleware - checks if user is admin (must be used AFTER protect)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { protect, admin };