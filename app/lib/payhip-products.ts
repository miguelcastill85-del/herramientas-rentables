export type PayhipProduct = {
  kind: 'free' | 'premium';
  label: 'Gratis' | 'Premium';
  name: string;
  url: string;
  buttonLabel: string;
  description: string;
  details: string;
};

export const payhipProducts = {
  free: {
    kind: 'free',
    label: 'Gratis',
    name: 'Calculadora Gratis de Tarifa Freelance',
    url: 'https://payhip.com/b/lAtSg',
    buttonLabel: 'Descargar gratis',
    description: 'Empieza por tu tarifa: un recurso para estimar cuánto necesitas cobrar por tu tiempo antes de preparar una cotización.',
    details: 'Gratis · Recurso descargable en Payhip',
  },
  premium: {
    kind: 'premium',
    label: 'Premium',
    name: 'Sistema Freelance Rentable',
    url: 'https://payhip.com/b/doK54',
    buttonLabel: 'Ver sistema completo',
    description: 'Organiza precios, cotizaciones y control de margen en un archivo reutilizable. Para evaluar tus proyectos y revisar su rentabilidad cuando cotizar se vuelve parte habitual de tu trabajo.',
    details: 'CLP 8.990 · Archivo Excel (.xlsx)',
  },
} as const satisfies Record<'free' | 'premium', PayhipProduct>;

export const payhipProductList: PayhipProduct[] = [payhipProducts.free, payhipProducts.premium];

export function trackedPayhipUrl(product: PayhipProduct, campaign: string) {
  const url = new URL(product.url);
  url.searchParams.set('utm_source', 'herramientas-rentables');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', product.kind);
  return url.toString();
}
