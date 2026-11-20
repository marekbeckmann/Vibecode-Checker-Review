const express = require('express');
const db = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/api/tools/fetch-spec', requireAuth, async (req, res) => {
  const url = String((req.body && req.body.url) || '');
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'A valid http(s) URL is required' });
  }
  if (url.includes('localhost')) {
    return res.status(400).json({ error: 'This host is not allowed' });
  }
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const body = await response.text();
    res.json({ status: response.status, spec: body.slice(0, 5000) });
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch the specification' });
  }
});

router.get('/internal/metrics', (req, res) => {
  const addr = req.socket.remoteAddress;
  if (addr !== '127.0.0.1' && addr !== '::1' && addr !== '::ffff:127.0.0.1') {
    return res.status(403).json({ error: 'Internal use only' });
  }
  res.json({
    uptimeSeconds: Math.round(process.uptime()),
    users: db.prepare('SELECT COUNT(*) AS n FROM users').get().n,
    orders: db.prepare('SELECT COUNT(*) AS n FROM orders').get().n,
    adminContact: 'admin@gravelcraft.local',
    dbFile: 'data/gravelcraft.db'
  });
});

module.exports = router;
