const PUBLIC_SEARCH_BASE = 'https://buscador.mercadopublico.cl/compra-agil';

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function buildPublicCompraAgilSearch(keyword, now = new Date()) {
  const end = new Date(now);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 7);

  const url = new URL(PUBLIC_SEARCH_BASE);
  url.searchParams.set('date_from', isoDate(start));
  url.searchParams.set('date_to', isoDate(end));
  url.searchParams.set('keywords', keyword);
  url.searchParams.set('order_by', 'recent');
  url.searchParams.set('region', 'all');
  return url.toString();
}

export function publicSearchFallback(keywords, reason = 'api_unavailable') {
  return {
    source: 'Mercado Público - buscador público de Compra Ágil',
    mode: 'public_search_fallback',
    api_status: reason,
    keywords,
    total: 0,
    items: [],
    searches: keywords.map((keyword) => ({
      keyword,
      url: buildPublicCompraAgilSearch(keyword),
    })),
    generated_at: new Date().toISOString(),
    disclaimer:
      'La API autenticada no está disponible. Usa los enlaces oficiales del buscador público y verifica estado, especificaciones, plazos y condiciones antes de cotizar.',
  };
}
