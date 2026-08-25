export function clamp01(x) {
  return Math.max(0, Math.min(1, Number(x) || 0));
}

// Explicable y auditable. Ningún score se presenta como probabilidad real sin calibración histórica.
export function opportunityDecision(input) {
  const match = clamp01(input.catalogMatch);
  const margin = clamp01((input.expectedMarginPct ?? 0) / 25);
  const buyer = clamp01(input.buyerScore ?? 0.5);
  const competition = 1 - clamp01((input.expectedCompetitors ?? 8) / 12);
  const logistics = clamp01(input.logisticsScore ?? 0.5);
  const cash = clamp01(input.cashflowScore ?? 0.5);
  const score = 100 * (
    0.30 * match +
    0.20 * margin +
    0.15 * buyer +
    0.15 * competition +
    0.10 * logistics +
    0.10 * cash
  );
  const confidence = clamp01(input.dataConfidence ?? 0.25);
  const decision = score >= 75 && confidence >= 0.45 ? 'GO' : score < 50 ? 'NO_GO' : 'REVIEW';
  return { score: Math.round(score), confidence: Number(confidence.toFixed(2)), decision };
}

export function priceRange(prices) {
  const xs = prices.filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b);
  if (xs.length < 5) {
    return { low: null, median: null, high: null, confidence: 0, warning: 'muestra_insuficiente' };
  }
  const q = (p) => {
    const i = (xs.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return xs[lo] + (xs[hi] - xs[lo]) * (i - lo);
  };
  return {
    low: Math.round(q(0.25)),
    median: Math.round(q(0.5)),
    high: Math.round(q(0.75)),
    confidence: Math.min(1, xs.length / 40),
  };
}

export function marginGuard({ price, cost, shipping = 0, other = 0, minMarginPct = 12 }) {
  const totalCost = cost + shipping + other;
  const margin = price > 0 ? ((price - totalCost) / price) * 100 : -Infinity;
  return { totalCost, marginPct: Number(margin.toFixed(1)), safe: margin >= minMarginPct };
}
