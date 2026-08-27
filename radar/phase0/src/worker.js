import { opportunityDecision, priceRange, marginGuard } from './scoring.js';
import { listCompraAgil } from './mercado-publico.js';
import { publicSearchFallback } from './public-search-fallback.js';
import { radarDashboard } from './dashboard.js';
import { normalizePayhipEvent, payhipMetrics, persistPayhipEvent, verifyPayhipSignature } from './payhip.js';

const LIVE_KEYWORDS = ['tornillo', 'perno', 'anclaje', 'fijacion', 'ferreteria', 'materiales construccion'];
const FASTENER_TERMS = ['tornill', 'perno', 'anclaj', 'fijacion', 'tirafondo', 'autoperfor', 'vulcanita'];
const BASKET_TERMS = ['ferreter', 'materiales de construccion', 'materiales construccion', 'materiales para reparacion'];
const EXCLUDE_TERMS = ['quirurg', 'ortoped', 'implante', 'protes', 'osteosint', 'hospital', 'cateter', 'jeringa'];
const SERVICE_PREFIXES = ['servicio ', 'reparacion ', 'mantencion ', 'mantenimiento ', 'instalacion ', 'capacitacion ', 'arriendo '];
const LIVE_CACHE_SECONDS = 900;
const FALLBACK_CACHE_SECONDS = 300;
const TARGET_MIN_CLP = 300_000;
const TARGET_MAX_CLP = 3_000_000;
const SECONDARY_MIN_CLP = 150_000;
const SECONDARY_MAX_CLP = 7_000_000;

function json(payload, status = 200, headers = {}) { return new Response(JSON.stringify(payload, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } }); }
function text(value) { return String(value || '').toLowerCase(); }
function normalize(value) { return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function flattenText(value) { if (value == null) return ''; if (typeof value === 'string' || typeof value === 'number') return String(value); if (Array.isArray(value)) return value.map(flattenText).join(' '); if (typeof value === 'object') return Object.values(value).map(flattenText).join(' '); return ''; }
function numeric(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function unwrapList(payload) { if (!payload || payload.success !== 'OK') return []; const root = payload.payload || {}; return Array.isArray(root.items) ? root.items : []; }
function getBudget(item) { return numeric(item?.montos?.monto_disponible_clp ?? item?.presupuesto?.monto_disponible_clp ?? item?.monto_disponible_clp); }
function getOffers(item) { const raw = item?.resumen?.total_ofertas_recibidas ?? item?.total_ofertas_recibidas ?? item?.resumen?.cantidad_ofertas; const n = Number(raw); return Number.isFinite(n) ? n : null; }
function getCall(item) { return numeric(item?.convocatoria?.estado_convocatoria ?? item?.estado_convocatoria, 0); }
function getClosing(item) { return item?.fechas?.fecha_cierre || item?.fecha_cierre || null; }
function ticketBand(budget) { if (budget >= TARGET_MIN_CLP && budget <= TARGET_MAX_CLP) return 'objetivo'; if (budget >= SECONDARY_MIN_CLP && budget <= SECONDARY_MAX_CLP) return 'secundario'; return 'bajo_o_fuera_de_rango'; }
function isLikelyService(item) { const title = normalize(item?.nombre || item?.titulo || '').trim(); return SERVICE_PREFIXES.some((prefix) => title.startsWith(prefix)); }
function relevanceScore(item) { const combined = normalize(flattenText(item)); const fastenerHits = FASTENER_TERMS.filter((term) => combined.includes(term)).length; const basketHits = BASKET_TERMS.filter((term) => combined.includes(term)).length; if (fastenerHits > 0 && basketHits > 0) return 1; if (fastenerHits > 0) return Math.min(1, 0.72 + fastenerHits * 0.1); if (basketHits > 0) return Math.min(0.82, 0.62 + basketHits * 0.08); return 0; }
function scoreLiveOpportunity(item) { const budget = getBudget(item); const offers = getOffers(item); const call = getCall(item); const relevance = relevanceScore(item); const competition = offers == null ? 0.45 : Math.max(0, 1 - Math.min(offers, 10) / 10); const band = ticketBand(budget); const ticketFit = band === 'objetivo' ? 1 : band === 'secundario' ? 0.65 : budget > 0 ? 0.2 : 0.3; const firstCall = call === 1 ? 1 : call === 2 ? 0.6 : 0.5; return Math.round(100 * (0.38 * relevance + 0.27 * competition + 0.25 * ticketFit + 0.1 * firstCall)); }
function cleanOpportunity(item) { const combined = normalize(flattenText(item)); if (relevanceScore(item) <= 0 || EXCLUDE_TERMS.some((term) => combined.includes(term)) || isLikelyService(item)) return null; const budget = getBudget(item); return { codigo: item?.codigo || item?.id || null, nombre: item?.nombre || item?.titulo || null, descripcion: item?.descripcion || null, estado: item?.estado?.codigo || item?.estado || 'publicada', llamado: getCall(item) || null, fecha_publicacion: item?.fechas?.fecha_publicacion || item?.fecha_publicacion || null, fecha_cierre: getClosing(item), monto_disponible_clp: budget || null, ticket_band: ticketBand(budget), ofertas_recibidas: getOffers(item), organismo: item?.institucion?.organismo_comprador || item?.organismo_comprador || null, region: item?.institucion?.nombre_region || item?.institucion?.region || item?.region || null, productos: Array.isArray(item?.productos_solicitados) ? item.productos_solicitados.slice(0, 12).map((p) => ({ nombre: p?.nombre || null, descripcion: p?.descripcion || null, cantidad: p?.cantidad ?? null, unidad: p?.unidad_medida || p?.unidad || null })) : [], score: scoreLiveOpportunity(item) }; }
function fallbackResponse(reason) { const payload = publicSearchFallback(LIVE_KEYWORDS, reason); payload.focus = 'canastas_ferreteria_mantenimiento'; payload.target_budget_clp = { min: TARGET_MIN_CLP, max: TARGET_MAX_CLP }; return json(payload, 200, { 'cache-control': `public, max-age=60, s-maxage=${FALLBACK_CACHE_SECONDS}` }); }
function externalApiFailureReason(error) { const message = String(error?.message || error); if (/Mercado Público HTTP 403|Forbidden/i.test(message)) return 'forbidden'; if (/Mercado Público HTTP 401|Unauthorized/i.test(message)) return 'unauthorized'; if (/Mercado Público HTTP 429/i.test(message)) return 'rate_limited'; if (/Mercado Público HTTP 5\d\d|fetch failed|network|ECONN|ETIMEDOUT/i.test(message)) return 'api_unavailable'; return null; }

async function liveMaintenanceOpportunities(env) {
  if (!env.MERCADOPUBLICO_TICKET) return fallbackResponse('ticket_missing');
  const seen = new Map(); const queries = [];
  for (const q of LIVE_KEYWORDS) { const response = await listCompraAgil({ ticket: env.MERCADOPUBLICO_TICKET, estado: 'publicada', q, tamano_pagina: 50, numero_pagina: 1, ordenar_por: 'FechaPublicacion' }); const items = unwrapList(response); queries.push({ q, count: items.length }); for (const item of items) { const codigo = item?.codigo || item?.id; if (codigo && !seen.has(codigo)) seen.set(codigo, item); } }
  const items = [...seen.values()].map(cleanOpportunity).filter(Boolean).sort((a, b) => { const bandWeight = { objetivo: 2, secundario: 1, bajo_o_fuera_de_rango: 0 }; return (bandWeight[b.ticket_band] || 0) - (bandWeight[a.ticket_band] || 0) || b.score - a.score || String(a.fecha_cierre || '').localeCompare(String(b.fecha_cierre || '')); }).slice(0, 50);
  return json({ source: 'Mercado Público API v2 - Compra Ágil', mode: 'api_v2', focus: 'canastas_ferreteria_mantenimiento', status: 'publicada', target_budget_clp: { min: TARGET_MIN_CLP, max: TARGET_MAX_CLP }, keywords: LIVE_KEYWORDS, queries, total: items.length, items, generated_at: new Date().toISOString(), disclaimer: 'Radar informativo. Verifica especificaciones, plazos y condiciones en Mercado Público antes de cotizar.' }, 200, { 'cache-control': `public, max-age=60, s-maxage=${LIVE_CACHE_SECONDS}` });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/dashboard' && req.method === 'GET') return radarDashboard();
    if (url.pathname === '/health') return json({ ok: true, service: 'radar-rentable-fase0' });
    if (url.pathname === '/api/categories') { const query = await env.DB.prepare('SELECT * FROM category_metrics ORDER BY opportunity_market_score DESC').all(); return json({ items: query.results || [] }); }

    if (url.pathname === '/api/webhooks/payhip' && req.method === 'POST') {
      if (!env.PAYHIP_API_KEY) return json({ error: 'payhip_secret_missing' }, 503);
      const signature = req.headers.get('signature') || req.headers.get('x-payhip-signature');
      if (!(await verifyPayhipSignature(signature, env.PAYHIP_API_KEY))) return json({ error: 'invalid_signature' }, 401);
      try { const event = normalizePayhipEvent(await req.json()); const stored = await persistPayhipEvent(env.DB, event); return json({ ok: true, duplicate: !stored.inserted }, stored.inserted ? 201 : 200); }
      catch (error) { const detail = String(error?.message || error); return json({ error: detail }, detail === 'unsupported_event' ? 202 : 400); }
    }

    if (url.pathname === '/api/metrics/payhip' && req.method === 'GET') return json({ ...(await payhipMetrics(env.DB)), generated_at: new Date().toISOString() });

    if (url.pathname === '/api/opportunities/live' && req.method === 'GET') { try { return await liveMaintenanceOpportunities(env); } catch (error) { const reason = externalApiFailureReason(error); if (reason) return fallbackResponse(reason); return json({ error: 'mercadopublico_unavailable', detail: String(error?.message || error).slice(0, 300) }, 502); } }
    if (url.pathname === '/api/analyze' && req.method === 'POST') { const body = await req.json(); const historicalPrices = Array.isArray(body.historicalPrices) ? body.historicalPrices.map(Number) : []; const range = priceRange(historicalPrices); const targetPrice = Number(body.targetPrice || range.median || 0); const margin = marginGuard({ price: targetPrice, cost: Number(body.cost || 0), shipping: Number(body.shipping || 0), other: Number(body.other || 0), minMarginPct: Number(body.minMarginPct || 12) }); const decision = opportunityDecision({ ...body, expectedMarginPct: margin.marginPct }); return json({ decision, priceRange: range, margin, disclaimer: 'Score orientativo basado en datos; no garantiza adjudicación ni pago.' }); }
    return json({ error: 'not_found' }, 404);
  },
};
