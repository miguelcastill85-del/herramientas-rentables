import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'app/components/calculators.tsx',
  'app/herramientas/[slug]/page.tsx',
  'app/lib/tools.ts',
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
const toolPage = await readFile('app/herramientas/[slug]/page.tsx', 'utf8');
const toolData = await readFile('app/lib/tools.ts', 'utf8');
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
  [toolPage.includes('images: []'), 'Las herramientas sin imagen propia no deben heredar una imagen social genérica.'],
  [toolPage.includes("'@type': 'WebApplication'") && toolPage.includes('application/ld+json'), 'Cada herramienta debe incluir JSON-LD de aplicación web.'],
  [toolPage.includes('<h1>{tool.name}</h1>'), 'Cada herramienta debe mostrar un H1 único.'],
  [toolPage.includes('ToolCalculator') && toolPage.includes('Herramientas relacionadas'), 'Cada página debe incluir calculadora y herramientas relacionadas.'],
  [sitemap.includes('tools.map') && sitemap.includes('siteUrl'), 'El sitemap debe incluir la portada y las seis herramientas.'],
  [/User-agent:\s*\*/i.test(robots), 'robots.txt debe declarar un agente.'],
  [/Allow:\s*\//i.test(robots), 'robots.txt debe permitir el rastreo del sitio.'],
  [/Sitemap:\s*https:\/\//i.test(robots), 'robots.txt debe declarar el sitemap público.'],
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
