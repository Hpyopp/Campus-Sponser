const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token nikalo header se ("Bearer eyJhbGci...")
            token = req.headers.authorization.split(' ')[1];

            // Verify karo
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // User dhundo DB mein
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Sab sahi hai, aage badho
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };