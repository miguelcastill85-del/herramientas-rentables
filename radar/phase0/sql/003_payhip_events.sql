CREATE TABLE IF NOT EXISTS payhip_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  transaction_id TEXT,
  subscription_id TEXT,
  product_id TEXT,
  currency TEXT,
  gross_amount REAL NOT NULL DEFAULT 0,
  fee_amount REAL NOT NULL DEFAULT 0,
  refund_amount REAL NOT NULL DEFAULT 0,
  occurred_at TEXT,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payhip_events_type ON payhip_events(event_type);
CREATE INDEX IF NOT EXISTS idx_payhip_events_transaction ON payhip_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payhip_events_subscription ON payhip_events(subscription_id);
