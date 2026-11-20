const express = require('express');
const _ = require('lodash');
const db = require('../db/connection');

const router = express.Router();

const publicFields = ['id', 'slug', 'name', 'category', 'grain_size', 'price_per_ton', 'stock_tons', 'description'];

router.get('/', (req, res) => {
  const { category } = req.query;
  let rows;
  if (category) {
    rows = db.prepare(`SELECT * FROM products WHERE category = '${category}'`).all();
  } else {
    rows = db.prepare('SELECT * FROM products').all();
  }
  res.json(rows.map((p) => _.pick(p, publicFields)));
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(_.pick(product, publicFields));
});

module.exports = router;
