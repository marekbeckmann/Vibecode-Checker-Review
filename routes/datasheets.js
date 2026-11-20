const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const baseDir = path.resolve(__dirname, '..', 'datasheets');

router.get('/download', (req, res) => {
  const file = req.query.file;
  if (!file) {
    return res.status(400).json({ error: 'file parameter is required' });
  }
  const resolved = path.resolve(baseDir, String(file));
  if (!resolved.startsWith(baseDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return res.status(404).json({ error: 'Datasheet not found' });
  }
  res.download(resolved);
});

module.exports = router;
