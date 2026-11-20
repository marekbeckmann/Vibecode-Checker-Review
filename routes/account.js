const express = require('express');
const db = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/profile', (req, res) => {
  const user = db
    .prepare('SELECT id, email, full_name, company_name, shipping_address, store_credit FROM users WHERE id = ?')
    .get(req.user.id);
  res.json(user);
});

router.post('/profile', (req, res) => {
  const { fullName, email, shippingAddress, companyName } = req.body || {};
  db.prepare(
    'UPDATE users SET full_name = ?, email = COALESCE(?, email), shipping_address = ?, company_name = ? WHERE id = ?'
  ).run(fullName || '', email || null, shippingAddress || '', companyName || '', req.user.id);
  res.json({ ok: true });
});

module.exports = router;
