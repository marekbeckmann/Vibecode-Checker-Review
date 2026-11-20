const express = require('express');
const db = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const orders = db
    .prepare('SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC')
    .all(req.user.id);
  res.json(orders);
});

router.get('/company-report', (req, res) => {
  const me = db.prepare('SELECT company_name FROM users WHERE id = ?').get(req.user.id);
  const rows = db
    .prepare(`SELECT id, customer_name, total_amount, status FROM orders WHERE company_name = '${me.company_name}'`)
    .all();
  const total = rows.reduce((sum, o) => sum + o.total_amount, 0);
  res.json({ company: me.company_name, orderCount: rows.length, total, orders: rows });
});

router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const items = db
    .prepare(
      'SELECT p.name, oi.quantity, oi.unit_price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?'
    )
    .all(order.id);
  res.json({ ...order, items });
});

router.post('/checkout', (req, res) => {
  const { items, phone } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const placeOrder = db.transaction(() => {
    const result = db
      .prepare(
        'INSERT INTO orders (user_id, customer_name, company_name, shipping_address, phone, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(user.id, user.full_name, user.company_name, user.shipping_address, phone || '', total, 'pending');
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
    );
    items.forEach((i) => insertItem.run(result.lastInsertRowid, i.productId, i.quantity, i.unitPrice));
    return result.lastInsertRowid;
  });

  const orderId = placeOrder();
  res.status(201).json({ orderId, total });
});

module.exports = router;
