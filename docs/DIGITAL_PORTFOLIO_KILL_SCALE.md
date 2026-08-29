# Digital Portfolio — economic kill/scale gates

Scope: digital products only. ChileCompra / Mercado Público / Compra Ágil is explicitly excluded.

## North-star metrics

Only economic or purchase-intent signals can trigger scaling:

1. completed paid orders;
2. net cash actually available after platform/payment fees and refunds;
3. checkout clicks / checkout starts;
4. purchase conversion where denominator is attributable checkout/product traffic;
5. refunds/chargebacks;
6. active paid subscriptions, if a subscription product is introduced.

Page views, impressions and downloads alone never trigger SCALE.

## Capacity until transaction telemetry is connected

- Kit Freelance Rentable + free calculator funnel: 80%.
- Indie Game Budget & Break-even Planner / itch.io: 20% maximum.
- Any business requiring inventory, merchandise financing or routine manual fulfillment: 0%.

## Gates

### SCALE

Scale a product/channel only when at least one of these is observed in a rolling 7-day window:

- >= 2 paid orders with positive estimated net cash; or
- >= 1 paid order plus >= 3 attributable checkout starts and no refund; or
- >= 5 checkout starts with >= 10% checkout-to-purchase conversion once purchases are measurable.

Scaling means improving the proven product page/funnel, adding adjacent zero-cost distribution, and reusing the same asset. It does not mean adding paid ads.

### HOLD / ITERATE

If there are checkout starts but no purchase after 10 attributable checkout starts, change one commercial variable at a time (offer, price, proof, product-page copy or checkout friction) and restart the gate window.

### KILL / REDUCE

Reduce a product/channel to <= 10% capacity when either condition occurs:

- 14 days with zero checkout starts despite attributable product traffic; or
- 20 attributable checkout starts with zero purchases after one controlled iteration.

Kill a channel when its payout mechanics make the first-30-day cash objective structurally implausible and another active zero-upfront channel has faster payout.

## Current channel economics verified 2026-08-29

- Payhip Free: US$0/month + 5% Payhip transaction fee; payment-processor fees are additional. Payhip states sales are deposited immediately after a transaction completes. Keep Free until measured fee savings justify a paid plan.
- itch.io Payouts: revenue becomes eligible 7 days after purchase; payout review requires at least 7 days and is typically 10–14 days; tax interview and minimum US$5 available balance apply. Therefore itch.io remains secondary for the first-30-day cash objective.

## Measurement blocker

No sales, net cash, checkout starts or conversion rate may be invented. Until private storefront/payment telemetry is connected, report those values as **unobserved**, not zero. The next infrastructure priority is a Payhip-focused measurement path that is independent of all closed business lines.
