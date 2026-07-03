CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  base_url TEXT,
  search_url TEXT,
  trust_score INTEGER DEFAULT 3,
  shipping_to_estonia REAL DEFAULT 0,
  integration_type TEXT DEFAULT 'planned',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  normalized_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  aliases TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  shop_id TEXT NOT NULL,
  shop_product_name TEXT,
  price REAL NOT NULL,
  old_price REAL,
  currency TEXT DEFAULT 'EUR',
  stock_status TEXT,
  product_url TEXT,
  image_url TEXT,
  last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  shop_id TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'EUR',
  checked_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS price_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  target_price REAL NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
