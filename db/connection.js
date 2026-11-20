const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'gravelcraft.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

module.exports = db;
module.exports.dbPath = dbPath;
