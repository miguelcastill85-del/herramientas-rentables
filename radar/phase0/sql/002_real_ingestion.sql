CREATE TABLE IF NOT EXISTS sync_state (
  source TEXT PRIMARY KEY,
  cursor TEXT,
  last_success_at TEXT,
  last_error TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS compra_agil_raw (
  codigo TEXT PRIMARY KEY,
  estado TEXT,
  published_at TEXT,
  changed_at TEXT,
  buyer_id TEXT,
  buyer_name TEXT,
  region TEXT,
  title TEXT,
  budget_clp REAL,
  competitor_count INTEGER,
  selected_supplier_id TEXT,
  selected_amount_clp REAL,
  category TEXT,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ordenes_compra_raw (
  codigo TEXT PRIMARY KEY,
  tipo TEXT,
  estado TEXT,
  created_at TEXT,
  buyer_id TEXT,
  buyer_name TEXT,
  supplier_id TEXT,
  supplier_name TEXT,
  total_clp REAL,
  source_process_code TEXT,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vertical_rankings (
  as_of_date TEXT NOT NULL,
  category TEXT NOT NULL,
  opportunities INTEGER NOT NULL,
  median_budget_clp REAL,
  avg_competitors REAL,
  low_competition_rate REAL,
  repeat_buyer_rate REAL,
  price_coverage REAL,
  market_score REAL NOT NULL,
  components_json TEXT NOT NULL,
  PRIMARY KEY (as_of_date, category)
);

CREATE INDEX IF NOT EXISTS idx_ca_changed_at ON compra_agil_raw(changed_at);
CREATE INDEX IF NOT EXISTS idx_ca_category ON compra_agil_raw(category);
CREATE INDEX IF NOT EXISTS idx_ca_buyer ON compra_agil_raw(buyer_id);
CREATE INDEX IF NOT EXISTS idx_oc_created_at ON ordenes_compra_raw(created_at);
CREATE INDEX IF NOT EXISTS idx_oc_type ON ordenes_compra_raw(tipo);
CREATE INDEX IF NOT EXISTS idx_rank_score ON vertical_rankings(as_of_date, market_score DESC);
