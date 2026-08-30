const ALLOWED_EVENTS = new Set(['paid', 'refunded', 'subscription.created', 'subscription.deleted']);

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function minor(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function safeEqual(a, b) {
  const left = String(a || '').toLowerCase();
  const right = String(b || '').toLowerCase();
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function validSignature(body, webhookKey) {
  if (!body?.signature || !webhookKey) return false;
  return safeEqual(body.signature, await sha256Hex(webhookKey));
}

function productKeys(body) {
  if (!Array.isArray(body?.items)) return null;
  const keys = body.items.map((item) => item?.product_key).filter(Boolean);
  return keys.length ? JSON.stringify(keys) : null;
}

function normalize(body) {
  const eventType = String(body?.type || '').toLowerCase();
  if (!ALLOWED_EVENTS.has(eventType)) throw new Error('unsupported_event');

  const transactionId = body?.id ? String(body.id) : null;
  const subscriptionId = body?.subscription_id ? String(body.subscription_id) : null;
  const identity = transactionId || subscriptionId;
  if (!identity) throw new Error('missing_event_identity');

  const grossMinor = eventType === 'paid' ? minor(body.price) : 0;
  const refundMinor = eventType === 'refunded' ? minor(body.amount_refunded) : 0;
  const payhipFeeMinor = eventType === 'paid' ? minor(body.payhip_fee) : 0;
  const processorFeeMinor = eventType === 'paid' ? minor(body.stripe_fee ?? body.paypal_fee ?? 0) : 0;
  const occurredAt = minor(
    body.date ??
    body.date_refunded ??
    body.date_subscription_deleted ??
    body.date_subscription_started ??
    body.date_created,
  ) || null;

  return {
    eventKey: `${eventType}:${identity}:${eventType === 'refunded' ? refundMinor : occurredAt || 0}`,
    eventType,
    transactionId,
    subscriptionId,
    currency: body?.currency ? String(body.currency).toUpperCase() : null,
    grossMinor,
    payhipFeeMinor,
    processorFeeMinor,
    refundMinor,
    productKeys: productKeys(body),
    occurredAt,
  };
}

async function storeEvent(db, event) {
  const result = await db.prepare(`
    INSERT OR IGNORE INTO payhip_events (
      event_key, event_type, transaction_id, subscription_id, currency,
      gross_minor, payhip_fee_minor, processor_fee_minor, refund_minor,
      product_keys, occurred_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event.eventKey,
    event.eventType,
    event.transactionId,
    event.subscriptionId,
    event.currency,
    event.grossMinor,
    event.payhipFeeMinor,
    event.processorFeeMinor,
    event.refundMinor,
    event.productKeys,
    event.occurredAt,
  ).run();

  return Number(result?.meta?.changes || 0) > 0;
}

async function metrics(db) {
  const money = await db.prepare(`
    SELECT
      currency,
      COALESCE(SUM(gross_minor), 0) AS gross_minor,
      COALESCE(SUM(payhip_fee_minor), 0) AS payhip_fee_minor,
      COALESCE(SUM(processor_fee_minor), 0) AS processor_fee_minor,
      COALESCE(SUM(refund_minor), 0) AS refund_minor,
      SUM(CASE WHEN event_type = 'paid' THEN 1 ELSE 0 END) AS sales,
      SUM(CASE WHEN event_type = 'refunded' THEN 1 ELSE 0 END) AS refunds
    FROM payhip_events
    WHERE event_type IN ('paid', 'refunded')
    GROUP BY currency
    ORDER BY currency
  `).all();

  const subs = await db.prepare(`
    SELECT
      SUM(CASE WHEN event_type = 'subscription.created' THEN 1 ELSE 0 END) AS created,
      SUM(CASE WHEN event_type = 'subscription.deleted' THEN 1 ELSE 0 END) AS deleted
    FROM payhip_events
  `).first();

  return {
    currencies: (money.results || []).map((row) => ({
      currency: row.currency || 'UNKNOWN',
      gross_minor: minor(row.gross_minor),
      payhip_fee_minor: minor(row.payhip_fee_minor),
      processor_fee_minor: minor(row.processor_fee_minor),
      refund_minor: minor(row.refund_minor),
      estimated_net_minor:
        minor(row.gross_minor) -
        minor(row.payhip_fee_minor) -
        minor(row.processor_fee_minor) -
        minor(row.refund_minor),
      sales: minor(row.sales),
      refunds: minor(row.refunds),
    })),
    subscriptions_created: minor(subs?.created),
    subscriptions_deleted: minor(subs?.deleted),
    generated_at: new Date().toISOString(),
    accounting_note: 'Amounts remain in minor currency units; estimated net subtracts fees reported by Payhip payloads and refunds.',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'payhip-telemetry' });
    }

    if (url.pathname === '/webhooks/payhip' && request.method === 'POST') {
      if (!env.WEBHOOK_KEY) return json({ error: 'webhook_key_missing' }, 503);

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'invalid_json' }, 400);
      }

      if (!(await validSignature(body, env.WEBHOOK_KEY))) {
        return json({ error: 'invalid_signature' }, 401);
      }

      try {
        const event = normalize(body);
        const inserted = await storeEvent(env.DB, event);
        return json({ ok: true, duplicate: !inserted }, 200);
      } catch (error) {
        const code = String(error?.message || error);
        if (code === 'unsupported_event') return json({ ok: true, ignored: true, reason: code }, 200);
        return json({ error: code }, 400);
      }
    }

    if (url.pathname === '/metrics' && request.method === 'GET') {
      if (!env.READ_TOKEN) return json({ error: 'read_token_missing' }, 503);
      const auth = request.headers.get('authorization') || '';
      if (!safeEqual(auth, `Bearer ${env.READ_TOKEN}`)) return json({ error: 'unauthorized' }, 401);
      return json(await metrics(env.DB));
    }

    return json({ error: 'not_found' }, 404);
  },
};
