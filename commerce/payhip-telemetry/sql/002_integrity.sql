ALTER TABLE payhip_events ADD COLUMN fees_complete INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payhip_paid_identity
ON payhip_events(transaction_id) WHERE event_type = 'paid';

CREATE UNIQUE INDEX IF NOT EXISTS idx_payhip_subscription_identity
ON payhip_events(event_type, subscription_id)
WHERE event_type IN ('subscription.created', 'subscription.deleted');
