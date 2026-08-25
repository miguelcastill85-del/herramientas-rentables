function clamp01(v) { return Math.max(0, Math.min(1, Number(v) || 0)); }
function safeDiv(a, b) { return b ? a / b : 0; }

export function buildVerticalMetrics(rows) {
  const groups = new Map();
  for (const row of rows) {
    const category = row.category || 'OTROS';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(row);
  }

  return [...groups.entries()].map(([category, items]) => {
    const budgets = items.map(x => Number(x.budget_clp)).filter(v => Number.isFinite(v) && v > 0).sort((a,b)=>a-b);
    const competitors = items.map(x => Number(x.competitor_count)).filter(v => Number.isFinite(v) && v >= 0);
    const repeatBuyers = new Map();
    for (const x of items) repeatBuyers.set(x.buyer_id || x.buyer_name || 'unknown', (repeatBuyers.get(x.buyer_id || x.buyer_name || 'unknown') || 0) + 1);
    const lowCompetition = competitors.filter(v => v <= 3).length;
    const medianBudget = budgets.length ? budgets[Math.floor((budgets.length - 1) / 2)] : 0;
    const avgCompetitors = competitors.length ? competitors.reduce((a,b)=>a+b,0) / competitors.length : null;
    const repeatRate = safeDiv([...repeatBuyers.values()].filter(v => v >= 2).reduce((a,b)=>a+b,0), items.length);
    const priceCoverage = safeDiv(budgets.length, items.length);

    return {
      category,
      opportunities: items.length,
      median_budget_clp: medianBudget,
      avg_competitors: avgCompetitors,
      low_competition_rate: safeDiv(lowCompetition, competitors.length),
      repeat_buyer_rate: repeatRate,
      price_coverage: priceCoverage,
    };
  });
}

export function scoreVerticals(metrics) {
  const maxOpp = Math.max(1, ...metrics.map(x => x.opportunities));
  const maxBudget = Math.max(1, ...metrics.map(x => x.median_budget_clp));
  return metrics.map(m => {
    const demand = clamp01(Math.log1p(m.opportunities) / Math.log1p(maxOpp));
    const ticket = clamp01(Math.log1p(m.median_budget_clp) / Math.log1p(maxBudget));
    const competition = m.avg_competitors == null ? 0.25 : clamp01(1 - (Math.min(m.avg_competitors, 12) / 12));
    const repeat = clamp01(m.repeat_buyer_rate);
    const lowComp = clamp01(m.low_competition_rate);
    const dataQuality = clamp01(m.price_coverage);
    const score = 100 * (0.30*demand + 0.18*ticket + 0.18*competition + 0.14*repeat + 0.12*lowComp + 0.08*dataQuality);
    return { ...m, market_score: Number(score.toFixed(1)), components: { demand, ticket, competition, repeat, lowComp, dataQuality } };
  }).sort((a,b) => b.market_score - a.market_score);
}
