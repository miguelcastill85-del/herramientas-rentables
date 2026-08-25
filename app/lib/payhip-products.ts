export type PayhipProduct = {
  kind: 'free' | 'premium';
  label: 'Gratis' | 'Premium';
  name: string;
  url: string;
  buttonLabel: string;
  description: string;
};

export const payhipProducts = {
  free: {
    kind: 'free',
    label: 'Gratis',
    name: 'Calculadora Gratis de Tarifa Freelance',
    url: 'https://payhip.com/b/lAtSg',
    buttonLabel: 'Descargar gratis',
    description: 'Una opción gratuita disponible en Payhip para empezar con un recurso centrado en la tarifa freelance.',
  },
  premium: {
    kind: 'premium',
    label: 'Premium',
    name: 'Sistema Freelance Rentable',
    url: 'https://payhip.com/b/doK54',
    buttonLabel: 'Ver sistema completo',
    description: 'Una opción premium disponible en Payhip para quienes buscan un sistema más completo.',
  },
} as const satisfies Record<'free' | 'premium', PayhipProduct>;

export const payhipProductList: PayhipProduct[] = [payhipProducts.free, payhipProducts.premium];
