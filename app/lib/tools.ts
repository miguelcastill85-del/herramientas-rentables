export type Category = 'Finanzas' | 'Marketing' | 'Ventas' | 'Operaciones';
export type ToolId = 'margin' | 'break-even' | 'commissions' | 'utm' | 'estimate' | 'pricing';

export type ToolDefinition = {
  id: ToolId;
  slug: string;
  path: string;
  name: string;
  shortName: string;
  description: string;
  category: Category;
  code: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  resultMeaning: string[];
  methodology: string[];
  example: string;
  related: ToolId[];
};

export const siteUrl = 'https://herramientas-rentables-negocios.miguelcastill85.chatgpt.site';

export const tools: ToolDefinition[] = [
  {
    id: 'margin',
    slug: 'margen',
    path: '/herramientas/margen',
    name: 'Calculadora de margen',
    shortName: 'Margen mensual',
    description: 'Conoce tu utilidad mensual, tus costos variables y el porcentaje real que conserva tu negocio.',
    category: 'Finanzas',
    code: '01',
    seoTitle: 'Calculadora de margen gratis para negocios',
    seoDescription: 'Calcula utilidad, costos variables y margen mensual gratis. Tus datos se procesan únicamente en tu navegador.',
    intro: 'Convierte ventas y costos en una lectura rápida de la rentabilidad mensual de tu negocio. El indicador visual permite reconocer de inmediato si el resultado es positivo, neutro o negativo.',
    resultMeaning: [
      'La utilidad estimada es el dinero que queda después de descontar costos fijos y variables.',
      'El margen expresa esa utilidad como porcentaje de las ventas, para comparar períodos o negocios de distinto tamaño.',
      'Los costos variables monetarios muestran cuánto representan en pesos según el nivel de ventas ingresado.',
    ],
    methodology: [
      'Costos variables = ventas × porcentaje de costos variables.',
      'Utilidad = ventas − costos fijos − costos variables.',
      'Margen = utilidad ÷ ventas × 100.',
    ],
    example: 'Con ventas de $2.500.000, costos fijos de $900.000 y costos variables de 12%, los costos variables son $300.000, la utilidad es $1.300.000 y el margen es 52%.',
    related: ['break-even', 'pricing', 'commissions'],
  },
  {
    id: 'break-even',
    slug: 'punto-de-equilibrio',
    path: '/herramientas/punto-de-equilibrio',
    name: 'Punto de equilibrio',
    shortName: 'Punto de equilibrio',
    description: 'Calcula cuántas ventas y cuánta facturación necesitas para cubrir todos tus costos.',
    category: 'Finanzas',
    code: '02',
    seoTitle: 'Calculadora de punto de equilibrio gratis',
    seoDescription: 'Calcula las unidades y la facturación necesarias para cubrir costos fijos y variables directamente en tu navegador.',
    intro: 'Estima el volumen mínimo de ventas necesario para que los ingresos cubran los costos del negocio. Por debajo de ese nivel hay pérdida; por encima comienza a generarse utilidad.',
    resultMeaning: [
      'El margen de contribución indica cuánto aporta cada venta para cubrir costos fijos.',
      'Las unidades de equilibrio son la cantidad mínima de ventas completas necesarias para no perder dinero.',
      'La facturación de equilibrio traduce esas unidades al ingreso total requerido.',
    ],
    methodology: [
      'Contribución por unidad = precio medio − costo variable por venta.',
      'Unidades de equilibrio = costos fijos ÷ contribución por unidad, redondeadas hacia arriba.',
      'Facturación necesaria = unidades de equilibrio × precio medio.',
    ],
    example: 'Con $900.000 de costos fijos, un precio de $25.000 y un costo variable de $10.000, cada venta aporta $15.000. Se necesitan 60 ventas y $1.500.000 de facturación.',
    related: ['margin', 'pricing', 'estimate'],
  },
  {
    id: 'commissions',
    slug: 'comparador-comisiones',
    path: '/herramientas/comparador-comisiones',
    name: 'Comparador de comisiones',
    shortName: 'Comparador de comisiones',
    description: 'Compara dos canales de cobro y descubre cuál deja más ingreso neto en tu negocio.',
    category: 'Ventas',
    code: '03',
    seoTitle: 'Comparador de comisiones de venta gratis',
    seoDescription: 'Compara comisión porcentual y tarifa fija de dos canales para saber cuál deja más ingreso neto a tu negocio.',
    intro: 'Compara pasarelas, marketplaces o canales de pago que combinan una comisión porcentual con una tarifa fija por transacción. Así puedes elegir según tu ticket y volumen reales.',
    resultMeaning: [
      'El costo total suma la comisión sobre ventas y todas las tarifas fijas del mes.',
      'El ingreso neto es la venta bruta que queda después de descontar el costo del canal.',
      'La diferencia muestra cuánto dinero adicional conserva el negocio con la opción más conveniente.',
    ],
    methodology: [
      'Ventas brutas = valor promedio × número mensual de ventas.',
      'Costo del canal = ventas brutas × comisión + número de ventas × tarifa fija.',
      'Ingreso neto = ventas brutas − costo total del canal.',
    ],
    example: 'Para 120 ventas de $35.000, el comparador calcula el costo mensual de cada canal y señala cuál conserva más de los $4.200.000 vendidos.',
    related: ['margin', 'pricing', 'utm'],
  },
  {
    id: 'utm',
    slug: 'utm',
    path: '/herramientas/utm',
    name: 'Constructor de enlaces UTM',
    shortName: 'Constructor UTM',
    description: 'Crea enlaces de campaña válidos, ordenados y listos para copiar sin enviar datos a servidores.',
    category: 'Marketing',
    code: '04',
    seoTitle: 'Constructor de enlaces UTM gratis',
    seoDescription: 'Genera una URL con parámetros UTM válidos para tus campañas. Funciona gratis y procesa todo en tu navegador.',
    intro: 'Crea un enlace etiquetado para identificar la fuente, el medio y la campaña en tus herramientas de analítica. Conserva los parámetros existentes de la URL y agrega o actualiza los UTM.',
    resultMeaning: [
      'utm_source identifica la plataforma o fuente que envía la visita.',
      'utm_medium describe el tipo de canal, por ejemplo social, email o cpc.',
      'utm_campaign agrupa enlaces que pertenecen a una misma iniciativa; term y content permiten mayor detalle.',
    ],
    methodology: [
      'La URL base se valida con la API URL del navegador y solo acepta protocolos http o https.',
      'Los parámetros se construyen con URLSearchParams para codificar caracteres de forma segura.',
      'El enlace final se genera y copia localmente; ningún valor se envía a un servidor.',
    ],
    example: 'Una campaña “lanzamiento” en Instagram puede usar source=instagram, medium=social y campaign=lanzamiento para distinguir esas visitas.',
    related: ['commissions', 'pricing', 'margin'],
  },
  {
    id: 'estimate',
    slug: 'cotizacion',
    path: '/herramientas/cotizacion',
    name: 'Estimador de horas y cotización',
    shortName: 'Estimador de cotización',
    description: 'Convierte horas, tarifa, complejidad y contingencia en una cotización sostenible.',
    category: 'Operaciones',
    code: '05',
    seoTitle: 'Estimador de horas y cotización gratis',
    seoDescription: 'Calcula una cotización recomendada con horas, tarifa, complejidad, contingencia y costos externos desde tu navegador.',
    intro: 'Organiza los componentes principales de un presupuesto de servicios y evita cotizar solo las horas ideales. El cálculo hace explícitos el ajuste de complejidad, la contingencia y los costos externos.',
    resultMeaning: [
      'El costo base corresponde a las horas estimadas multiplicadas por la tarifa.',
      'El ajuste por complejidad reconoce trabajo adicional mediante un multiplicador transparente.',
      'La contingencia protege frente a variaciones de alcance; la cotización final incorpora también los costos externos.',
    ],
    methodology: [
      'Costo base = horas × tarifa por hora.',
      'Complejidad baja usa ×1,00; media ×1,20; alta ×1,40.',
      'Contingencia = subtotal ajustado × margen de seguridad. Los costos externos se agregan al final.',
    ],
    example: 'Treinta horas a $25.000, complejidad media, 15% de seguridad y $100.000 externos producen una cotización recomendada de $1.135.000.',
    related: ['pricing', 'margin', 'break-even'],
  },
  {
    id: 'pricing',
    slug: 'diagnostico-precios',
    path: '/herramientas/diagnostico-precios',
    name: 'Diagnóstico de precios',
    shortName: 'Diagnóstico de precios',
    description: 'Mide tu margen actual y calcula el precio necesario para alcanzar tu objetivo.',
    category: 'Ventas',
    code: '06',
    seoTitle: 'Diagnóstico de precios y margen objetivo',
    seoDescription: 'Calcula utilidad, margen actual y precio mínimo recomendado para alcanzar tu margen objetivo sin enviar datos.',
    intro: 'Evalúa si tu precio cubre costos, comisión y margen objetivo. Además de mostrar la situación actual, calcula el precio mínimo que satisface todos esos componentes.',
    resultMeaning: [
      'La utilidad actual descuenta costo unitario, costos fijos asignados y comisión.',
      'El margen actual permite comparar esa utilidad con el precio de venta.',
      'El precio recomendado es el mínimo matemático para alcanzar el margen objetivo; el diagnóstico resume la distancia respecto de esa meta.',
    ],
    methodology: [
      'Utilidad actual = precio − costo unitario − costos fijos por venta − comisión monetaria.',
      'Margen actual = utilidad actual ÷ precio × 100.',
      'Precio recomendado = costos totales ÷ (1 − comisión − margen objetivo). La suma de comisión y objetivo debe ser menor que 100%.',
    ],
    example: 'Con precio de $35.000, $17.000 de costos, 3,2% de comisión y objetivo de 30%, el cálculo indica si el precio cumple la meta y cuánto debería ajustarse.',
    related: ['margin', 'break-even', 'estimate'],
  },
];

export function getToolById(id: ToolId) {
  return tools.find((tool) => tool.id === id);
}

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
