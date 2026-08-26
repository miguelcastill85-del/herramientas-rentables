import worker from '../src/worker.js';

const response = await worker.fetch(new Request('https://radar.example/dashboard'), {});
if (response.status !== 200) throw new Error(`dashboard status ${response.status}`);
if (!String(response.headers.get('content-type')).startsWith('text/html')) {
  throw new Error(`unexpected dashboard content type: ${response.headers.get('content-type')}`);
}

const html = await response.text();
for (const expected of [
  'Radar de Compras Ágiles',
  '$300 mil–$3 M',
  '/api/opportunities/live?dashboard=',
  '/api/categories?dashboard=',
  'Búsqueda pública de respaldo',
  'Ranking histórico',
]) {
  if (!html.includes(expected)) throw new Error(`dashboard missing: ${expected}`);
}
if (html.includes('MERCADOPUBLICO_TICKET')) throw new Error('dashboard leaked secret name');
if (html.includes('TEST-TICKET')) throw new Error('dashboard leaked secret fixture');

console.log(JSON.stringify({ ok: true, bytes: html.length, contentType: response.headers.get('content-type') }));
