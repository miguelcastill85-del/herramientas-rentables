const ALLOWED_EVENTS = new Set(['paid', 'refunded', 'subscription.created', 'subscription.deleted']);

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function safeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

function integer(value, field, positive = false) {
  if (value === null || value === undefined || value === '' || !['number', 'string'].includes(typeof value)) throw new Error(`invalid_${field}`);
  const n = typeof value === 'string' && !value.trim() ? NaN : Number(value);
  if (!Number.isSafeInteger(n) || n < (positive ? 1 : 0)) throw new Error(`invalid_${field}`);
  return n;
}

async function validSignature(body, webhookKey) {
  if (typeof body?.signature !== 'string' || !/^[a-f0-9]{64}$/i.test(body.signature)) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(webhookKey));
  const expected = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return safeEqual(body.signature.toLowerCase(), expected);
}

function normalize(body) {
  const eventType = String(body?.type || '').toLowerCase();
  if (!ALLOWED_EVENTS.has(eventType)) throw new Error('unsupported_event');
  const isMoneyEvent = eventType === 'paid' || eventType === 'refunded';
  const identity = isMoneyEvent ? body?.id : body?.subscription_id;
  if (typeof identity !== 'string' || !identity.trim() || identity.length > 200) throw new Error('missing_event_identity');
  const currency = isMoneyEvent ? String(body?.currency || '').toUpperCase() : null;
  if (isMoneyEvent && !/^[A-Z]{3}$/.test(currency)) throw new Error('invalid_currency');
  const timestamp = eventType === 'paid' ? body.date : eventType === 'refunded' ? body.date_refunded
    : eventType === 'subscription.created' ? body.date_subscription_started : body.date_subscription_deleted;
  const occurredAt = integer(timestamp, 'event_timestamp', true);
  const grossMinor = eventType === 'paid' ? integer(body.price, 'price') : 0;
  const refundMinor = eventType === 'refunded' ? integer(body.amount_refunded, 'refund', true) : 0;
  if (eventType === 'refunded' && refundMinor > integer(body.price, 'price')) throw new Error('refund_exceeds_price');
  const fee = body.stripe_fee ?? body.paypal_fee;
  const payhipFeeMinor = eventType === 'paid' && body.payhip_fee != null ? integer(body.payhip_fee, 'payhip_fee') : 0;
  const processorFeeMinor = eventType === 'paid' && fee != null ? integer(fee, 'processor_fee') : 0;
  const feesComplete = eventType === 'paid' && (grossMinor === 0 || (body.payhip_fee != null && fee != null));
  const keys = Array.isArray(body.items) ? body.items.map((item) => item?.product_key).filter((key) => typeof key === 'string') : [];
  return {
    eventKey: eventType === 'refunded' ? `${eventType}:${identity}:${occurredAt}:${refundMinor}` : `${eventType}:${identity}`,
    eventType, transactionId: isMoneyEvent ? identity : null, subscriptionId: isMoneyEvent ? null : identity,
    currency, grossMinor, payhipFeeMinor, processorFeeMinor, refundMinor,
    productKeys: keys.length ? JSON.stringify(keys) : null, occurredAt, feesComplete: feesComplete ? 1 : 0,
  };
}

async function storeEvent(db, event) {
  const result = await db.prepare(`
    INSERT OR IGNORE INTO payhip_events (
      event_key, event_type, transaction_id, subscription_id, currency,
      gross_minor, payhip_fee_minor, processor_fee_minor, refund_minor,
      product_keys, occurred_at, fees_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(event.eventKey, event.eventType, event.transactionId, event.subscriptionId, event.currency,
    event.grossMinor, event.payhipFeeMinor, event.processorFeeMinor, event.refundMinor,
    event.productKeys, event.occurredAt, event.feesComplete).run();
  return Number(result?.meta?.changes || 0) > 0;
}

async function metrics(db) {
  const money = await db.prepare(`
    SELECT currency,
      SUM(gross_minor) AS gross_minor, SUM(payhip_fee_minor) AS payhip_fee_minor,
      SUM(processor_fee_minor) AS processor_fee_minor, SUM(refund_minor) AS refund_minor,
      SUM(CASE WHEN event_type = 'paid' AND gross_minor > 0 THEN 1 ELSE 0 END) AS sales,
      SUM(CASE WHEN event_type = 'paid' AND gross_minor = 0 THEN 1 ELSE 0 END) AS free_orders,
      SUM(CASE WHEN event_type = 'paid' AND gross_minor > 0 AND fees_complete = 0 THEN 1 ELSE 0 END) AS orders_with_unobserved_fees,
      SUM(CASE WHEN event_type = 'refunded' THEN 1 ELSE 0 END) AS refunds,
      SUM(CASE WHEN event_type = 'refunded' AND NOT EXISTS (
        SELECT 1 FROM payhip_events p WHERE p.event_type = 'paid' AND p.transaction_id = e.transaction_id AND p.currency = e.currency
      ) THEN 1 ELSE 0 END) AS refunds_without_observed_sale,
      (SELECT COUNT(*) FROM (
        SELECT transaction_id FROM payhip_events r WHERE r.event_type = 'refunded' AND r.currency = e.currency
        GROUP BY transaction_id HAVING COUNT(*) > 1
      )) AS transactions_with_multiple_refunds
    FROM payhip_events e WHERE event_type IN ('paid', 'refunded') GROUP BY currency ORDER BY currency
  `).all();
  const subs = await db.prepare(`
    SELECT SUM(CASE WHEN event_type = 'subscription.created' THEN 1 ELSE 0 END) AS created,
      SUM(CASE WHEN event_type = 'subscription.deleted' THEN 1 ELSE 0 END) AS deleted FROM payhip_events
  `).first();
  const observation = await db.prepare('SELECT COUNT(*) AS count, MIN(received_at) AS first_event_at FROM payhip_events').first();
  return {
    observation_state: Number(observation?.count) > 0 ? 'EVENTS_OBSERVED' : 'UNOBSERVED',
    first_event_at: observation?.first_event_at || null,
    currencies: (money.results || []).map((row) => ({
      ...row,
      estimated_net_minor: row.orders_with_unobserved_fees || row.refunds_without_observed_sale || row.transactions_with_multiple_refunds ? null
        : row.gross_minor - row.payhip_fee_minor - row.processor_fee_minor - row.refund_minor,
      coverage_state: row.orders_with_unobserved_fees || row.refunds_without_observed_sale || row.transactions_with_multiple_refunds ? 'PARTIAL' : 'OBSERVED_EVENTS_ONLY',
    })),
    subscriptions_created: Number(subs?.created || 0), subscriptions_deleted: Number(subs?.deleted || 0),
    available_cash_state: 'UNOBSERVED',
    generated_at: new Date().toISOString(),
    accounting_note: 'Native Payhip minor units, separated by currency. Estimated net is not available bank cash. Missing fees, an unmatched refund or multiple refund events for one transaction leave estimated net unobserved; the documented payload does not establish cumulative versus incremental partial refund amounts. Refund identity uses transaction, refund date and amount; same-date same-amount partial refunds cannot be distinguished by the documented payload.',
  };
}

const worker = {
  async fetch(request, env = {}) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      const ready = Boolean(env.DB && env.WEBHOOK_KEY && env.READ_TOKEN);
      if (!ready) return json({ ok: false, service: 'payhip-telemetry', error: 'configuration_incomplete' }, 503);
      try {
        await env.DB.prepare('SELECT fees_complete FROM payhip_events LIMIT 1').first();
        return json({ ok: true, service: 'payhip-telemetry', event_delivery: 'VERIFY_IN_AUTHENTICATED_METRICS' });
      } catch {
        return json({ ok: false, error: 'storage_unavailable' }, 503);
      }
    }
    if (url.pathname === '/webhooks/payhip' && request.method === 'POST') {
      if (!env.WEBHOOK_KEY || !env.DB) return json({ error: 'configuration_incomplete' }, 503);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
      if (!(await validSignature(body, env.WEBHOOK_KEY))) return json({ error: 'invalid_signature' }, 401);
      let event;
      try { event = normalize(body); } catch (error) {
        const code = String(error?.message || error);
        if (code === 'unsupported_event') return json({ ok: true, ignored: true }, 200);
        return json({ error: code }, 400);
      }
      try {
        const inserted = await storeEvent(env.DB, event);
        return json({ ok: true, duplicate: !inserted });
      } catch {
        return json({ error: 'storage_unavailable' }, 503);
      }
    }
    if (url.pathname === '/metrics' && request.method === 'GET') {
      if (!env.READ_TOKEN || !env.DB) return json({ error: 'configuration_incomplete' }, 503);
      const match = /^Bearer (.+)$/i.exec(request.headers.get('authorization') || '');
      if (!match || !safeEqual(match[1], env.READ_TOKEN)) return json({ error: 'unauthorized' }, 401);
      try { return json(await metrics(env.DB)); } catch { return json({ error: 'storage_unavailable' }, 503); }
    }
    return json({ error: 'not_found' }, 404);
  },
};

export default worker;
