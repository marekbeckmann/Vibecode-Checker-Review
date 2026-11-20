const { verifyToken } = require('../services/auth');

function optionalAuth(req, res, next) {
  const token = req.cookies && req.cookies.auth_token;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch (err) {
      req.user = null;
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Please log in first' });
  }
  next();
}

module.exports = { optionalAuth, requireAuth };
