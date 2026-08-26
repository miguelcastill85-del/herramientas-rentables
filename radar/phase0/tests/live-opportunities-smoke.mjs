import worker from '../src/worker.js';

const calls = [];
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (options.headers?.ticket !== 'TEST-TICKET') throw new Error('ticket was not sent in header');
  const u = new URL(url);
  if (u.pathname !== '/v2/compra-agil') throw new Error(`unexpected path ${u.pathname}`);
  if (u.searchParams.get('estado') !== 'publicada') throw new Error('expected publicada filter');
  const q = u.searchParams.get('q');
  return new Response(JSON.stringify({
    success: 'OK',
    payload: {
      items: [
        {
          codigo: `CA-${q}`,
          nombre: `Compra de ${q} para mantenimiento`,
          descripcion: 'Materiales de ferretería',
          estado: { codigo: 'publicada' },
          convocatoria: { estado_convocatoria: 1 },
          fechas: { fecha_publicacion: '2026-08-26T10:00:00Z', fecha_cierre: '2026-08-27T10:00:00Z' },
          montos: { monto_disponible_clp: 900000 },
          resumen: { total_ofertas_recibidas: 2 },
          institucion: { organismo_comprador: 'Municipalidad Demo', nombre_region: 'Región Metropolitana de Santiago' },
          productos_solicitados: [{ nombre: `${q} zincado`, cantidad: 100, unidad_medida: 'unidad' }],
        },
        {
          codigo: `MED-${q}`,
          nombre: `Tornillo quirúrgico ${q}`,
          descripcion: 'Implante médico',
          estado: { codigo: 'publicada' },
        },
      ],
    },
  }), { status: 200, headers: { 'content-type': 'application/json' } });
};

const req = new Request('https://radar.example/api/opportunities/live');
const response = await worker.fetch(req, { MERCADOPUBLICO_TICKET: 'TEST-TICKET' });
if (response.status !== 200) throw new Error(`unexpected status ${response.status}`);
const body = await response.json();
if (body.total !== 4) throw new Error(`expected four clean deduplicated opportunities, got ${body.total}`);
if (body.items.some((item) => JSON.stringify(item).toLowerCase().includes('quirúrg'))) throw new Error('medical opportunity leaked through filter');
if (calls.length !== 4) throw new Error(`expected four API calls, got ${calls.length}`);
if (!calls.every((call) => !call.url.includes('TEST-TICKET'))) throw new Error('ticket leaked in URL');
if (!calls.every((call) => new URL(call.url).searchParams.get('tamano_pagina') === '50')) throw new Error('page size guard missing');
console.log(JSON.stringify({ ok: true, total: body.total, calls: calls.length }));
