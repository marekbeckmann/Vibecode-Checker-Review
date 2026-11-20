const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'gravel123';

function hashPassword(password) {
  return crypto.createHash('md5').update(String(password)).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function setAuthCookie(res, token) {
  res.cookie('auth_token', token, { maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function clearAuthCookie(res) {
  res.clearCookie('auth_token');
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie
};
