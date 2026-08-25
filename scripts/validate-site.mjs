import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
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
const robots = await readFile('public/robots.txt', 'utf8');

const checks = [
  [page.includes('<main'), 'La página debe incluir un elemento <main>.'],
  [page.includes('<h1'), 'La página debe incluir un encabezado <h1>.'],
  [page.includes('skip-link'), 'La página debe incluir un enlace para saltar al contenido.'],
  [page.includes('aria-live'), 'Los resultados dinámicos deben anunciarse con aria-live.'],
  [page.includes('type="search"'), 'El buscador debe usar un campo de tipo search.'],
  [layout.includes('lang="es-CL"'), 'El idioma del documento debe ser es-CL.'],
  [layout.includes('description:'), 'La configuración SEO debe incluir una descripción.'],
  [layout.includes('openGraph:'), 'La configuración SEO debe incluir Open Graph.'],
  [layout.includes('application/ld+json'), 'La página debe incluir datos estructurados JSON-LD.'],
  [/User-agent:\s*\*/i.test(robots), 'robots.txt debe declarar un agente.'],
  [/Allow:\s*\//i.test(robots), 'robots.txt debe permitir el rastreo del sitio.'],
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
