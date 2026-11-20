function createTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      company_name TEXT,
      shipping_address TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      store_credit REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      grain_size TEXT NOT NULL,
      price_per_ton REAL NOT NULL,
      stock_tons INTEGER NOT NULL,
      description TEXT,
      datasheet_file TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT,
      company_name TEXT,
      shipping_address TEXT,
      phone TEXT,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vouchers (
      code TEXT PRIMARY KEY,
      credit_amount REAL NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      used_by_user_id INTEGER
    );
  `);
}

module.exports = { createTables };
