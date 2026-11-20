const express = require('express');
const db = require('../db/connection');
const { hashPassword, verifyPassword, signToken, setAuthCookie, clearAuthCookie } = require('../services/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, fullName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const result = db
    .prepare('INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)')
    .run(email, hashPassword(password), fullName || '', 'customer');
  const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);
  setAuthCookie(res, signToken(user));
  res.status(201).json({ id: user.id, email: user.email });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email || '');
  if (!user || !verifyPassword(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  setAuthCookie(res, signToken(user));
  res.json({ id: user.id, email: user.email, role: user.role });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

module.exports = router;
