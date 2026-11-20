const express = require('express');
const db = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

function verifyWithPartner(code) {
  return new Promise((resolve) => setTimeout(() => resolve(true), 50));
}

router.post('/redeem', async (req, res) => {
  const code = String((req.body && req.body.code) || '').trim().toUpperCase();
  const voucher = db.prepare('SELECT * FROM vouchers WHERE code = ?').get(code);
  if (!voucher) {
    return res.status(404).json({ error: 'Unknown voucher code' });
  }
  if (voucher.used === 1) {
    return res.status(400).json({ error: 'Voucher has already been used' });
  }

  await verifyWithPartner(code);

  db.prepare('UPDATE vouchers SET used = 1, used_by_user_id = ? WHERE code = ?').run(req.user.id, code);
  db.prepare('UPDATE users SET store_credit = store_credit + ? WHERE id = ?').run(voucher.credit_amount, req.user.id);

  const user = db.prepare('SELECT store_credit FROM users WHERE id = ?').get(req.user.id);
  res.json({ credited: voucher.credit_amount, storeCredit: user.store_credit });
});

module.exports = router;
