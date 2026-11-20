const express = require('express');
const db = require('../db/connection');

const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  const products = category
    ? db.prepare('SELECT * FROM products WHERE category = ?').all(category)
    : db.prepare('SELECT * FROM products').all();
  const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all().map((r) => r.category);
  res.render('index', { title: 'Home', products, categories, activeCategory: category || '' });
});

router.get('/search', (req, res) => {
  const query = String(req.query.q || '');
  const products = query
    ? db
        .prepare('SELECT * FROM products WHERE name LIKE ? OR description LIKE ?')
        .all(`%${query}%`, `%${query}%`)
    : [];
  res.render('search', { title: 'Search', query, products });
});

router.get('/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).render('error', { title: 'Not found', message: 'Product not found' });
  }
  res.render('product', { title: product.name, product });
});

router.get('/cart', (req, res) => res.render('cart', { title: 'Your cart' }));
router.get('/login', (req, res) => res.render('login', { title: 'Log in' }));
router.get('/register', (req, res) => res.render('register', { title: 'Register' }));

router.get('/account', (req, res) => {
  if (!req.user) return res.redirect('/login');
  const user = db
    .prepare('SELECT id, email, full_name, company_name, shipping_address, store_credit FROM users WHERE id = ?')
    .get(req.user.id);
  const orders = db
    .prepare('SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC')
    .all(req.user.id);
  res.render('account', { title: 'My account', account: user, orders });
});

router.get('/impressum', (req, res) => res.render('impressum', { title: 'Impressum' }));
router.get('/datenschutz', (req, res) => res.render('datenschutz', { title: 'Datenschutzerklärung' }));

module.exports = router;
