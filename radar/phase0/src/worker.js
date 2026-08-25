import { opportunityDecision, priceRange, marginGuard } from './scoring.js';

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'radar-rentable-fase0' });
    }

    if (url.pathname === '/api/categories') {
      const query = await env.DB.prepare(
        'SELECT * FROM category_metrics ORDER BY opportunity_market_score DESC',
      ).all();
      return json({ items: query.results || [] });
    }

    if (url.pathname === '/api/analyze' && req.method === 'POST') {
      const body = await req.json();
      const historicalPrices = Array.isArray(body.historicalPrices) ? body.historicalPrices.map(Number) : [];
      const range = priceRange(historicalPrices);
      const targetPrice = Number(body.targetPrice || range.median || 0);
      const margin = marginGuard({
        price: targetPrice,
        cost: Number(body.cost || 0),
        shipping: Number(body.shipping || 0),
        other: Number(body.other || 0),
        minMarginPct: Number(body.minMarginPct || 12),
      });
      const decision = opportunityDecision({ ...body, expectedMarginPct: margin.marginPct });

      return json({
        decision,
        priceRange: range,
        margin,
        disclaimer: 'Score orientativo basado en datos; no garantiza adjudicación ni pago.',
      });
    }

    return json({ error: 'not_found' }, 404);
  },
};
