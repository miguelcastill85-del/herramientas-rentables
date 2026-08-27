const ALLOWED_EVENTS = new Set(['paid', 'refunded', 'subscription.created', 'subscription.deleted']);

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pick(body, paths) {
  for (const path of paths) {
    let value = body;
    for (const key of path.split('.')) value = value?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

function hex(bytes) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function expectedSignature(apiKey) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey)));
}

function safeEqual(a, b) {
  const left = String(a || '').toLowerCase();
  const right = String(b || '').toLowerCase();
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

export async function verifyPayhipSignature(signature, apiKey) {
  if (!signature || !apiKey) return false;
  return safeEqual(signature, await expectedSignature(apiKey));
}

export function normalizePayhipEvent(body) {
  const eventType = String(pick(body, ['type', 'event', 'event_type']) || '').toLowerCase();
  if (!ALLOWED_EVENTS.has(eventType)) throw new Error('unsupported_event');

  const transactionId = pick(body, ['transaction_id', 'transaction.id', 'sale.id', 'id']);
  const subscriptionId = pick(body, ['subscription_id', 'subscription.id']);
  const identity = transactionId || subscriptionId;
  if (!identity) throw new Error('missing_event_identity');

  const gross = number(pick(body, ['amount', 'gross_amount', 'price', 'sale.amount', 'transaction.amount']));
  const fee = number(pick(body, ['fee', 'fee_amount', 'payhip_fee', 'transaction.fee']));
  const refund = eventType === 'refunded'
    ? number(pick(body, ['refund_amount', 'amount', 'gross_amount', 'transaction.amount']))
    : 0;

  return {
    eventKey: `${eventType}:${identity}`,
    eventType,
    transactionId: transactionId ? String(transactionId) : null,
    subscriptionId: subscriptionId ? String(subscriptionId) : null,
    productId: pick(body, ['product_id', 'product.id']) ? String(pick(body, ['product_id', 'product.id'])) : null,
    currency: String(pick(body, ['currency', 'currency_code', 'transaction.currency']) || '').toUpperCase() || null,
    grossAmount: eventType === 'paid' ? gross : 0,
    feeAmount: eventType === 'paid' ? fee : 0,
    refundAmount: refund,
    occurredAt: pick(body, ['created_at', 'date', 'timestamp']) ? String(pick(body, ['created_at', 'date', 'timestamp'])) : null,
  };
}

export async function persistPayhipEvent(db, event) {
  const result = await db.prepare(`
    INSERT OR IGNORE INTO payhip_events
      (event_key, event_type, transaction_id, subscription_id, product_id, currency,
       gross_amount, fee_amount, refund_amount, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event.eventKey, event.eventType, event.transactionId, event.subscriptionId, event.productId,
    event.currency, event.grossAmount, event.feeAmount, event.refundAmount, event.occurredAt,
  ).run();
  return { inserted: Number(result?.meta?.changes || 0) > 0 };
}

export async function payhipMetrics(db) {
  const totals = await db.prepare(`
    SELECT
      COALESCE(SUM(gross_amount), 0) AS gross_sales,
      COALESCE(SUM(fee_amount), 0) AS payhip_fees,
      COALESCE(SUM(refund_amount), 0) AS refunds,
      COUNT(CASE WHEN event_type = 'paid' THEN 1 END) AS paid_events,
      COUNT(CASE WHEN event_type = 'refunded' THEN 1 END) AS refunded_events
    FROM payhip_events
  `).first();

  const subscriptions = await db.prepare(`
    SELECT
      SUM(CASE WHEN latest_type = 'subscription.created' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN latest_type = 'subscription.deleted' THEN 1 ELSE 0 END) AS cancelled
    FROM (
      SELECT p.subscription_id, p.event_type AS latest_type
      FROM payhip_events p
      JOIN (
        SELECT subscription_id, MAX(id) AS max_id
        FROM payhip_events
        WHERE subscription_id IS NOT NULL
        GROUP BY subscription_id
      ) latest ON latest.max_id = p.id
    )
  `).first();

  const gross = number(totals?.gross_sales);
  const fees = number(totals?.payhip_fees);
  const refunds = number(totals?.refunds);
  return {
    gross_sales: gross,
    payhip_fees: fees,
    refunds,
    estimated_net: gross - fees - refunds,
    paid_events: number(totals?.paid_events),
    refunded_events: number(totals?.refunded_events),
    subscriptions_active: number(subscriptions?.active),
    subscriptions_cancelled: number(subscriptions?.cancelled),
  };
}
