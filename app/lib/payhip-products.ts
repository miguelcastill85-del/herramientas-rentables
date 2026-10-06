export type PayhipProduct = {
  kind: 'free' | 'premium' | 'intelligence';
  label: 'Gratis' | 'Premium' | 'Avanzado v2.2';
  name: string;
  url: string;
  buttonLabel: string;
  description: string;
  details: string;
  compatibility?: string;
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
  intelligence: {
    kind: 'intelligence',
    label: 'Avanzado v2.2',
    name: 'Freelancer Pricing Intelligence System v2.2',
    url: 'https://payhip.com/b/cv4oQ',
    buttonLabel: 'Ver sistema v2.2',
    description: 'Conecta tarifa protegida, cotización, alcance y negociación en 19 módulos. Incluye historial para 100 proyectos y una guía de inicio de nueve páginas.',
    details: 'CLP 19.990 · Excel (.xlsx) · Contenido en inglés',
    compatibility: 'Cálculos verificados con LibreOffice; la interfaz nativa de Excel y la compatibilidad con Google Sheets no se han validado.',
  },
} as const satisfies Record<'free' | 'premium' | 'intelligence', PayhipProduct>;

export const payhipProductList: PayhipProduct[] = [payhipProducts.free, payhipProducts.premium, payhipProducts.intelligence];

export function trackedPayhipUrl(product: PayhipProduct, campaign: string) {
  const url = new URL(product.url);
  url.searchParams.set('utm_source', 'herramientas-rentables');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', product.kind);
  return url.toString();
}
