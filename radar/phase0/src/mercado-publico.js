const API_V2 = 'https://api2.mercadopublico.cl';
const API_V1 = 'https://api.mercadopublico.cl/servicios/v1/publico';

function requireTicket(ticket) {
  if (!ticket) throw new Error('MERCADOPUBLICO_TICKET is required');
}

async function readJson(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Mercado Público HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
  return response.json();
}

export async function listCompraAgil({ ticket, fetchImpl = fetch, ...params }) {
  requireTicket(ticket);
  const url = new URL('/v2/compra-agil', API_V2);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  return readJson(await fetchImpl(url, { headers: { ticket, accept: 'application/json' } }));
}

export async function getCompraAgil({ ticket, codigo, fetchImpl = fetch }) {
  requireTicket(ticket);
  if (!codigo) throw new Error('codigo is required');
  const url = new URL(`/v2/compra-agil/${encodeURIComponent(codigo)}`, API_V2);
  return readJson(await fetchImpl(url, { headers: { ticket, accept: 'application/json' } }));
}

export async function listOrdenesCompra({ ticket, fecha, estado = 'todos', fetchImpl = fetch }) {
  requireTicket(ticket);
  const url = new URL(`${API_V1}/ordenesdecompra.json`);
  if (fecha) url.searchParams.set('fecha', fecha);
  if (estado) url.searchParams.set('estado', estado);
  url.searchParams.set('ticket', ticket);
  return readJson(await fetchImpl(url, { headers: { accept: 'application/json' } }));
}

export async function getOrdenCompra({ ticket, codigo, fetchImpl = fetch }) {
  requireTicket(ticket);
  if (!codigo) throw new Error('codigo is required');
  const url = new URL(`${API_V1}/ordenesdecompra.json`);
  url.searchParams.set('codigo', codigo);
  url.searchParams.set('ticket', ticket);
  return readJson(await fetchImpl(url, { headers: { accept: 'application/json' } }));
}

export function ddmmyyyy(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) throw new Error('invalid date');
  return `${String(d.getUTCDate()).padStart(2, '0')}${String(d.getUTCMonth() + 1).padStart(2, '0')}${d.getUTCFullYear()}`;
}
