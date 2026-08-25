import { access, readFile, readdir } from 'node:fs/promises';

const requiredFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'app/components/calculators.tsx',
  'app/components/payhip-offers.tsx',
  'app/herramientas/[slug]/page.tsx',
  'app/lib/payhip-products.ts',
  'app/lib/tools.ts',
  'app/pro/page.tsx',
  'app/sitemap.ts',
  'public/robots.txt',
  'public/site.webmanifest',
  'README.md',
  '.github/workflows/validate.yml',
];

const errors = [];

for (const file of requiredFiles) {
  try {
    await access(file);
  } catch {
    errors.push(`Falta el archivo obligatorio: ${file}`);
  }
}

const page = await readFile('app/page.tsx', 'utf8');
const layout = await readFile('app/layout.tsx', 'utf8');
const calculators = await readFile('app/components/calculators.tsx', 'utf8');
const payhipOffers = await readFile('app/components/payhip-offers.tsx', 'utf8');
const toolPage = await readFile('app/herramientas/[slug]/page.tsx', 'utf8');
const payhipProducts = await readFile('app/lib/payhip-products.ts', 'utf8');
const toolData = await readFile('app/lib/tools.ts', 'utf8');
const proPage = await readFile('app/pro/page.tsx', 'utf8');
const sitemap = await readFile('app/sitemap.ts', 'utf8');
const robots = await readFile('public/robots.txt', 'utf8');
const toolNames = [
  'Calculadora de margen',
  'Punto de equilibrio',
  'Comparador de comisiones',
  'Constructor de enlaces UTM',
  'Estimador de horas y cotización',
  'Diagnóstico de precios',
];
const retiredLabels = ['Próx' + 'imamente', 'En prepa' + 'ración'];

async function listProjectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  const ignoredDirectories = new Set(['.git', '.next', 'dist', 'node_modules']);

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const path = directory === '.' ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await listProjectFiles(path));
    else files.push(path);
  }

  return files;
}

const projectFiles = await listProjectFiles('.');
const zipFiles = projectFiles.filter((file) => file.toLowerCase().endsWith('.zip'));
const sourceFiles = projectFiles.filter((file) =>
  file !== 'scripts/validate-site.mjs' && /\.(?:css|json|md|mjs|ts|tsx|txt|ya?ml)$/i.test(file),
);
const sourceContents = (await Promise.all(sourceFiles.map((file) => readFile(file, 'utf8')))).join('\n');
const secretPatterns = [
  /MERCADO[_-]?PAGO[_-]?(?:ACCESS[_-]?TOKEN|API[_-]?KEY|SECRET)/i,
  /PAYHIP[_-]?(?:ACCESS[_-]?TOKEN|API[_-]?KEY|SECRET)/i,
  /sk_(?:live|test|proj)_[a-z0-9_-]{12,}/i,
];

const checks = [
  [page.includes('<main'), 'La página debe incluir un elemento <main>.'],
  [page.includes('<h1'), 'La página debe incluir un encabezado <h1>.'],
  [page.includes('skip-link'), 'La página debe incluir un enlace para saltar al contenido.'],
  [calculators.includes('aria-live'), 'Los resultados dinámicos deben anunciarse con aria-live.'],
  [page.includes('type="search"'), 'El buscador debe usar un campo de tipo search.'],
  [toolNames.every((name) => toolData.includes(name)), 'Deben existir las seis herramientas solicitadas.'],
  [retiredLabels.every((label) => !page.includes(label) && !toolData.includes(label)), 'No deben quedar estados de herramientas no disponibles.'],
  [page.includes('Abrir herramienta'), 'Las tarjetas deben incluir una acción para abrir cada herramienta.'],
  [page.includes('href={tool.path}'), 'Cada tarjeta debe enlazar a la página individual de su herramienta.'],
  [calculators.includes('new URL(') && calculators.includes('new URLSearchParams('), 'El constructor UTM debe usar URL y URLSearchParams.'],
  [calculators.includes('navigator.clipboard.writeText'), 'El constructor UTM debe permitir copiar el enlace.'],
  [calculators.includes('Comisión y margen objetivo deben sumar menos de 100%'), 'El diagnóstico de precios debe impedir divisiones inválidas.'],
  [page.includes('Datos en tu navegador') && toolPage.includes('no se envían a servidores'), 'La interfaz debe explicar que los cálculos son privados.'],
  [layout.includes('lang="es-CL"'), 'El idioma del documento debe ser es-CL.'],
  [layout.includes('description:'), 'La configuración SEO debe incluir una descripción.'],
  [layout.includes('alternates: { canonical:'), 'La configuración SEO debe incluir una URL canónica.'],
  [layout.includes('openGraph:'), 'La configuración SEO debe incluir Open Graph.'],
  [layout.includes('application/ld+json'), 'La página debe incluir datos estructurados JSON-LD.'],
  [toolPage.includes('generateStaticParams'), 'Las rutas de herramientas deben generarse estáticamente.'],
  [toolPage.includes('generateMetadata'), 'Cada herramienta debe generar metadatos individuales.'],
  [toolPage.includes('alternates: { canonical }'), 'Cada herramienta debe declarar su URL canónica.'],
  [toolPage.includes('openGraph:') && toolPage.includes('twitter:'), 'Cada herramienta debe incluir Open Graph y Twitter metadata.'],
  [toolPage.includes('main/public/og.png') && toolPage.includes('images: [socialImage]'), 'Las herramientas deben usar la imagen social existente en Open Graph y Twitter.'],
  [toolPage.includes("'@type': 'WebApplication'") && toolPage.includes('application/ld+json'), 'Cada herramienta debe incluir JSON-LD de aplicación web.'],
  [toolPage.includes('<h1>{tool.name}</h1>'), 'Cada herramienta debe mostrar un H1 único.'],
  [toolPage.includes('ToolCalculator') && toolPage.includes('Herramientas relacionadas'), 'Cada página debe incluir calculadora y herramientas relacionadas.'],
  [payhipProducts.includes("name: 'Calculadora Gratis de Tarifa Freelance'") && payhipProducts.includes("url: 'https://payhip.com/b/lAtSg'"), 'La configuración debe incluir el producto gratuito existente de Payhip.'],
  [payhipProducts.includes("name: 'Sistema Freelance Rentable'") && payhipProducts.includes("url: 'https://payhip.com/b/doK54'"), 'La configuración debe incluir el producto premium existente de Payhip.'],
  [payhipProducts.includes("buttonLabel: 'Descargar gratis'") && payhipProducts.includes("buttonLabel: 'Ver sistema completo'") && payhipOffers.includes('{product.buttonLabel}'), 'El embudo debe mostrar las dos acciones solicitadas.'],
  [payhipOffers.includes('target="_blank"') && payhipOffers.includes('rel="noopener noreferrer"'), 'Los enlaces a Payhip deben abrirse de forma segura.'],
  [toolPage.includes("tool.id === 'estimate'") && toolPage.includes('<PayhipOffers />'), 'La calculadora de cotización debe mostrar el embudo después del resultado.'],
  [page.includes('href="/pro"'), 'La portada debe enlazar discretamente a /pro.'],
  [proPage.includes('<h1 id="pro-title">') && proPage.includes('<PayhipOffers variant="page" />') && proPage.includes('payhipProducts.free.name') && proPage.includes('payhipProducts.premium.name'), '/pro debe presentar ambas opciones con un H1 único.'],
  [proPage.includes('alternates: { canonical }') && proPage.includes('openGraph:') && proPage.includes('twitter:'), '/pro debe incluir canonical, Open Graph y Twitter metadata.'],
  [proPage.includes('main/public/og.png'), '/pro debe usar la imagen social existente.'],
  [sitemap.includes("url: `${siteUrl}/pro`"), 'El sitemap debe incluir /pro.'],
  [sitemap.includes('tools.map') && sitemap.includes('siteUrl'), 'El sitemap debe incluir la portada y las seis herramientas.'],
  [/User-agent:\s*\*/i.test(robots), 'robots.txt debe declarar un agente.'],
  [/Allow:\s*\//i.test(robots), 'robots.txt debe permitir el rastreo del sitio.'],
  [/Sitemap:\s*https:\/\//i.test(robots), 'robots.txt debe declarar el sitemap público.'],
  [zipFiles.length === 0, `No se permiten archivos ZIP en el repositorio: ${zipFiles.join(', ')}`],
  [secretPatterns.every((pattern) => !pattern.test(sourceContents)), 'No se permiten tokens, API keys ni credenciales de Payhip o Mercado Pago.'],
  [!payhipOffers.includes('<form') && !payhipOffers.includes('fetch('), 'El sitio no debe implementar checkout propio ni llamadas a la API de Payhip.'],
  [!page.includes('Your site is taking shape'), 'No debe quedar contenido del proyecto inicial.'],
];

for (const [passes, message] of checks) {
  if (!passes) errors.push(message);
}

if (errors.length > 0) {
  console.error('Validación de contenido fallida:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validación de contenido correcta (${requiredFiles.length} archivos, ${checks.length} reglas).`);
