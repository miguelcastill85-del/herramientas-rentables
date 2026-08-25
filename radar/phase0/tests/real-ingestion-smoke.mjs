import { listCompraAgil, getCompraAgil, listOrdenesCompra, getOrdenCompra, ddmmyyyy } from '../src/mercado-publico.js';
import { buildVerticalMetrics, scoreVerticals } from '../src/vertical-ranking.js';

function mockFetch(expected) {
  return async (url, options = {}) => {
    const u = String(url);
    const hit = expected.find(x => u.includes(x.match));
    if (!hit) throw new Error(`Unexpected URL: ${u}`);
    if (hit.headerTicket && options.headers?.ticket !== 'TEST') throw new Error('Compra Ágil ticket must be sent as header');
    if (hit.queryTicket && !u.includes('ticket=TEST')) throw new Error('v1 ticket must be sent as query param');
    return { ok: true, json: async () => hit.body };
  };
}

const fetchImpl = mockFetch([
  { match: '/v2/compra-agil?', headerTicket: true, body: { data: [{ id: 'CA-1' }] } },
  { match: '/v2/compra-agil/CA-1', headerTicket: true, body: { id: 'CA-1', estado: 'publicada' } },
  { match: 'ordenesdecompra.json?fecha=', queryTicket: true, body: { Listado: [{ Codigo: '1-AG26' }] } },
  { match: 'ordenesdecompra.json?codigo=', queryTicket: true, body: { Listado: [{ Codigo: '1-AG26', Tipo: 'AG' }] } },
]);

await listCompraAgil({ ticket: 'TEST', cambio_desde: '2026-08-25T00:00:00Z', fetchImpl });
await getCompraAgil({ ticket: 'TEST', codigo: 'CA-1', fetchImpl });
await listOrdenesCompra({ ticket: 'TEST', fecha: ddmmyyyy('2026-08-25T00:00:00Z'), fetchImpl });
await getOrdenCompra({ ticket: 'TEST', codigo: '1-AG26', fetchImpl });

const rows = [
  ...Array.from({ length: 10 }, (_, i) => ({ category: 'TI', budget_clp: 1000000 + i*10000, competitor_count: 7, buyer_id: `T${i%5}` })),
  ...Array.from({ length: 7 }, (_, i) => ({ category: 'FERRETERIA', budget_clp: 850000 + i*20000, competitor_count: 2, buyer_id: `F${i%2}` })),
  ...Array.from({ length: 4 }, (_, i) => ({ category: 'ASEO', budget_clp: 300000 + i*10000, competitor_count: 1, buyer_id: `A${i}` })),
];
const ranking = scoreVerticals(buildVerticalMetrics(rows));
if (ranking.length !== 3) throw new Error('ranking size failed');
if (ranking[0].category !== 'FERRETERIA') throw new Error(`expected FERRETERIA first, got ${ranking[0].category}`);
if (!ranking.every(x => x.market_score >= 0 && x.market_score <= 100)) throw new Error('score bounds failed');
console.log(JSON.stringify(ranking, null, 2));
