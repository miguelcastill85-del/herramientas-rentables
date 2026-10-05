import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import worker from '../src/worker.js';

const webhookKey = 'synthetic-webhook-key';
const signature = createHash('sha256').update(webhookKey).digest('hex');
const readToken = 'Synthetic-CaseSensitive-Token';
function database() {
  const sqlite = new DatabaseSync(':memory:');
  for (const name of ['001_schema.sql', '002_integrity.sql']) sqlite.exec(readFileSync(new URL(`../sql/${name}`, import.meta.url), 'utf8'));
  return {
    sqlite,
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      let args = [];
      return { bind(...values) { args = values; return this; },
        async run() { const result = statement.run(...args); return { meta: { changes: Number(result.changes) } }; },
        async all() { return { results: statement.all(...args) }; },
        async first() { return statement.get(...args) || null; } };
    },
  };
}
function environment(t) {
  const DB = database(); t.after(() => DB.sqlite.close());
  return { DB, WEBHOOK_KEY: webhookKey, READ_TOKEN: readToken };
}
const payment = { type: 'paid', id: 'transaction-1', currency: 'USD', price: 900,
  payhip_fee: 33, stripe_fee: 48, date: 1703693218, signature };
function send(env, payload) { return worker.fetch(new Request('https://test.invalid/webhooks/payhip', {
  method: 'POST', body: JSON.stringify(payload), headers: { 'content-type': 'application/json' },
}), env); }
async function metrics(env, token = readToken) {
  return worker.fetch(new Request('https://test.invalid/metrics', { headers: { authorization: `Bearer ${token}` } }), env);
}

test('el token privado distingue mayúsculas de minúsculas', async (t) => {
  const env = environment(t);
  assert.equal((await metrics(env, readToken.toLowerCase())).status, 401);
  assert.equal((await metrics(env)).status, 200);
});

test('no registra eventos con firma inválida ni importes corruptos', async (t) => {
  const env = environment(t);
  assert.equal((await send(env, { ...payment, signature: '0'.repeat(64) })).status, 401);
  for (const price of [null, '', ' ', true, [], ['900'], {}, -1, 900.5, 'not-a-number']) {
    assert.equal((await send(env, { ...payment, price })).status, 400);
  }
  assert.equal(env.DB.sqlite.prepare('SELECT COUNT(*) AS count FROM payhip_events').get().count, 0);
});

test('reintentos de la misma venta cuentan una sola vez aunque cambie la fecha', async (t) => {
  const env = environment(t);
  assert.equal((await send(env, payment)).status, 200);
  const duplicate = await send(env, { ...payment, date: payment.date + 1 });
  assert.equal((await duplicate.json()).duplicate, true);
  const data = await (await metrics(env)).json();
  assert.equal(data.currencies[0].sales, 1);
  assert.equal(data.currencies[0].estimated_net_minor, 819);
  assert.equal(data.available_cash_state, 'UNOBSERVED');
});

test('un reembolso completo no duplica al reintentarse', async (t) => {
  const env = environment(t); await send(env, payment);
  const refund = { ...payment, type: 'refunded', amount_refunded: 900, date_refunded: payment.date + 10 };
  await send(env, refund); await send(env, refund);
  const row = (await (await metrics(env)).json()).currencies[0];
  assert.equal(row.refunds, 1); assert.equal(row.refund_minor, 900);
  assert.equal(row.estimated_net_minor, -81);
});

test('dos reembolsos parciales iguales en fechas distintas se conservan y suspenden el neto automático', async (t) => {
  const env = environment(t); await send(env, payment);
  await send(env, { ...payment, type: 'refunded', amount_refunded: 100, date_refunded: payment.date + 10 });
  await send(env, { ...payment, type: 'refunded', amount_refunded: 100, date_refunded: payment.date + 20 });
  const row = (await (await metrics(env)).json()).currencies[0];
  assert.equal(row.refunds, 2); assert.equal(row.transactions_with_multiple_refunds, 1);
  assert.equal(row.estimated_net_minor, null);
});

test('una descarga gratuita no cuenta como venta pagada', async (t) => {
  const env = environment(t); await send(env, { ...payment, price: 0, payhip_fee: 0, stripe_fee: 0 });
  const row = (await (await metrics(env)).json()).currencies[0];
  assert.equal(row.sales, 0); assert.equal(row.free_orders, 1); assert.equal(row.estimated_net_minor, 0);
});

test('las comisiones ausentes y el reembolso sin venta previa quedan sin neto estimado', async (t) => {
  const env = environment(t); const noFee = { ...payment }; delete noFee.stripe_fee;
  await send(env, noFee);
  await send(env, { ...payment, id: 'unobserved-sale', type: 'refunded', amount_refunded: 100, date_refunded: payment.date + 10 });
  const row = (await (await metrics(env)).json()).currencies[0];
  assert.equal(row.orders_with_unobserved_fees, 1); assert.equal(row.refunds_without_observed_sale, 1);
  assert.equal(row.estimated_net_minor, null); assert.equal(row.coverage_state, 'PARTIAL');
});

test('la moneda se agrega por separado y los datos personales no se guardan', async (t) => {
  const env = environment(t); await send(env, { ...payment, email: 'synthetic@example.invalid', ip_address: '192.0.2.1', customer_name: 'Synthetic' });
  await send(env, { ...payment, id: 'transaction-clp', currency: 'CLP', price: 8990 });
  const data = await (await metrics(env)).json(); assert.deepEqual(data.currencies.map((row) => row.currency), ['CLP', 'USD']);
  const rows = env.DB.sqlite.prepare('SELECT * FROM payhip_events').all();
  assert.equal(JSON.stringify(rows).includes('synthetic@example.invalid'), false);
  assert.equal(JSON.stringify(rows).includes('192.0.2.1'), false);
});

test('una base sin eventos sigue sin observación y una configuración incompleta no pasa health', async (t) => {
  const env = environment(t);
  const data = await (await metrics(env)).json(); assert.equal(data.observation_state, 'UNOBSERVED'); assert.deepEqual(data.currencies, []);
  assert.equal((await worker.fetch(new Request('https://test.invalid/health'), {})).status, 503);
  assert.equal((await worker.fetch(new Request('https://test.invalid/health'), env)).status, 200);
});

test('un fallo de persistencia devuelve 503 para permitir reintentos sin exponer detalles internos', async () => {
  const env = { WEBHOOK_KEY: webhookKey, DB: { prepare() { throw Error('sensitive-storage-detail'); } } };
  const response = await send(env, payment); assert.equal(response.status, 503);
  assert.equal((await response.text()).includes('sensitive-storage-detail'), false);
});


test('altas y bajas de suscripción se deduplican por su identidad y tipo', async (t) => {
  const env = environment(t);
  const created = { type: 'subscription.created', subscription_id: 'subscription-1', date_subscription_started: 1703694529, signature };
  const deleted = { type: 'subscription.deleted', subscription_id: 'subscription-1', date_subscription_deleted: 1703694700, signature };
  await send(env, created); await send(env, { ...created, date_subscription_started: 1703694530 });
  await send(env, deleted); await send(env, deleted);
  const data = await (await metrics(env)).json();
  assert.equal(data.subscriptions_created, 1); assert.equal(data.subscriptions_deleted, 1);
  assert.deepEqual(data.currencies, []);
});
