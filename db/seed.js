const fs = require('fs');
const db = require('./connection');
const { dbPath } = require('./connection');
const { createTables } = require('./schema');
const { hashPassword } = require('../services/auth');

const products = [
  ['river-pea-gravel', 'River Pea Gravel', 'garden', '8-16 mm', 52.0, 120, 'Smooth, rounded river gravel in warm beige and grey tones. Ideal for garden paths, planters and drainage beds.', 'river-pea-gravel.txt'],
  ['basalt-split', 'Basalt Split', 'construction', '16-32 mm', 41.5, 300, 'Dark, angular basalt chippings with excellent load-bearing properties for foundations and road base layers.', 'basalt-split.txt'],
  ['marble-pebbles', 'White Marble Pebbles', 'decorative', '12-20 mm', 138.0, 45, 'Bright white Carrara-style marble pebbles that make flowerbeds, ponds and entrance areas stand out.', 'marble-pebbles.txt'],
  ['driveway-dolomite', 'Driveway Dolomite', 'driveway', '5-11 mm', 47.0, 210, 'Light grey dolomite that binds well under tyres and stays bright after rain. Perfect for driveways and parking areas.', 'river-pea-gravel.txt'],
  ['quartz-gravel', 'Quartz Gravel', 'garden', '2-8 mm', 64.0, 80, 'Clean, frost-resistant quartz gravel for play areas, aquariums and garden design.', 'river-pea-gravel.txt'],
  ['porphyry-chippings', 'Porphyry Chippings', 'driveway', '8-11 mm', 58.5, 150, 'Reddish porphyry chippings with a durable, non-slip surface for driveways and courtyards.', 'basalt-split.txt']
];

function seed() {
  createTables(db);

  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  if (count > 0) return;

  const insertProduct = db.prepare(
    'INSERT INTO products (slug, name, category, grain_size, price_per_ton, stock_tons, description, datasheet_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertUser = db.prepare(
    'INSERT INTO users (email, password_hash, full_name, company_name, shipping_address, role, store_credit) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertOrder = db.prepare(
    'INSERT INTO orders (id, user_id, customer_name, company_name, shipping_address, phone, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );

  const run = db.transaction(() => {
    products.forEach((p) => insertProduct.run(...p));

    insertUser.run('admin@gravelcraft.local', hashPassword('admin123'), 'Shop Admin', 'GravelCraft Demo', '1 Quarry Road, Testville', 'admin', 0);
    insertUser.run('alice@example.com', hashPassword('alice123'), 'Alice Example', 'Example Landscaping', '12 Garden Lane, Sampletown', 'customer', 0);
    insertUser.run('bob@example.com', hashPassword('bob123'), 'Bob Sample', 'Sample Builders', '48 Foundation Street, Demoburg', 'customer', 0);

    insertOrder.run(1001, 2, 'Alice Example', 'Example Landscaping', '12 Garden Lane, Sampletown', '+00 555 0101', 520.0, 'shipped');
    insertItem.run(1001, 1, 10, 52.0);
    insertOrder.run(1002, 3, 'Bob Sample', 'Sample Builders', '48 Foundation Street, Demoburg', '+00 555 0102', 1245.0, 'processing');
    insertItem.run(1002, 2, 15, 41.5);
    insertItem.run(1002, 4, 13, 47.0);
    insertOrder.run(1003, 2, 'Alice Example', 'Example Landscaping', '12 Garden Lane, Sampletown', '+00 555 0101', 276.0, 'pending');
    insertItem.run(1003, 3, 2, 138.0);

    db.prepare('INSERT INTO vouchers (code, credit_amount, used) VALUES (?, ?, 0)').run('GRAVEL25', 25.0);
  });
  run();
}

function reset() {
  db.close();
  [dbPath, `${dbPath}-wal`, `${dbPath}-shm`].forEach((f) => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
}

if (require.main === module) {
  if (process.argv.includes('--reset')) {
    reset();
    const fresh = require('child_process').spawnSync(process.execPath, [__filename], { stdio: 'inherit' });
    process.exit(fresh.status);
  }
  seed();
  console.log('Database ready at', dbPath);
}

module.exports = { seed };
