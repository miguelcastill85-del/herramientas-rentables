PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS agile_processes (
  process_code TEXT PRIMARY KEY,
  published_at TEXT,
  closes_at TEXT,
  buyer_id TEXT,
  buyer_name TEXT,
  buyer_region TEXT,
  title TEXT,
  description TEXT,
  budget_clp REAL,
  status TEXT,
  source TEXT NOT NULL,
  source_updated_at TEXT,
  raw_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agile_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  process_code TEXT NOT NULL,
  item_key TEXT,
  product_code TEXT,
  description TEXT,
  quantity REAL,
  unit TEXT,
  category TEXT,
  normalized_text TEXT,
  FOREIGN KEY(process_code) REFERENCES agile_processes(process_code) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_items_process ON agile_items(process_code);
CREATE INDEX IF NOT EXISTS idx_items_category ON agile_items(category);

CREATE TABLE IF NOT EXISTS agile_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  process_code TEXT NOT NULL,
  supplier_id TEXT,
  supplier_name TEXT,
  quoted_at TEXT,
  item_key TEXT,
  unit_price_clp REAL,
  total_price_clp REAL,
  selected INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  FOREIGN KEY(process_code) REFERENCES agile_processes(process_code) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_quotes_process ON agile_quotes(process_code);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier ON agile_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quotes_selected ON agile_quotes(selected);

CREATE TABLE IF NOT EXISTS buyer_metrics (
  buyer_id TEXT PRIMARY KEY,
  buyer_name TEXT,
  process_count INTEGER NOT NULL DEFAULT 0,
  quote_count INTEGER NOT NULL DEFAULT 0,
  selected_quote_count INTEGER NOT NULL DEFAULT 0,
  median_ticket_clp REAL,
  median_competitors REAL,
  repeat_purchase_score REAL,
  data_quality_score REAL,
  buyer_score REAL,
  score_confidence REAL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS category_metrics (
  category TEXT PRIMARY KEY,
  process_count INTEGER NOT NULL DEFAULT 0,
  total_budget_clp REAL,
  median_budget_clp REAL,
  median_competitors REAL,
  low_competition_share REAL,
  repeated_buyer_share REAL,
  price_observability REAL,
  outlier_share REAL,
  opportunity_market_score REAL,
  score_confidence REAL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  period TEXT,
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT,
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_loaded INTEGER NOT NULL DEFAULT 0,
  records_rejected INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  notes TEXT
);
