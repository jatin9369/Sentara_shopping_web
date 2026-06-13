const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sentara_jwt_secret_2024';

/**
 * authenticate - Required auth middleware
 * Verifies Authorization: Bearer <token> header
 * Attaches req.user = { id, mobile, name } if valid
 * Returns 401 if token missing or invalid
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      mobile: decoded.mobile,
      name: decoded.name
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

/**
 * optionalAuth - Optional auth middleware
 * Sets req.user if valid token present, continues without error if not
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      mobile: decoded.mobile,
      name: decoded.name
    };
    next();
  } catch (err) {
    // Token invalid or expired — just continue without user
    req.user = null;
    next();
  }
};

module.exports = { authenticate, optionalAuth, JWT_SECRET };
