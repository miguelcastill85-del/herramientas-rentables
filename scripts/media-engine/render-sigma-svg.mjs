import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const CANONICAL_LOGO_SHA256 = '48929e9baf789d3d587b44412a71adcf13dd3e5eceb3218335a3a18b7c54c4ca';
const CANONICAL_LOGO_NATIVE = { width: 1536, height: 1536 };
const LOGO_CROPS = {
  symbol: { x: 430, y: 300, width: 690, height: 690 },
  lockup: { x: 275, y: 350, width: 991, height: 818 },
};
const PALETTE = {
  ink: '#111214',
  paper: '#FEFEFC',
  ivory: '#F7F5F0',
  graphite: '#42454A',
  gold: '#B88A2A',
  deepGold: '#7A571A',
};

function fail(message) {
  console.error(`SIGMA_RENDER_ERROR: ${message}`);
  process.exit(1);
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`cannot read JSON ${file}: ${error.message}`);
  }
}

function loadCanonicalLogo(file) {
  if (!file) fail('logoPath is required');
  const bytes = fs.readFileSync(file);
  const actual = sha256(bytes);
  if (actual !== CANONICAL_LOGO_SHA256) {
    fail(`canonical logo SHA mismatch: expected ${CANONICAL_LOGO_SHA256}, got ${actual}`);
  }
  return `data:image/jpeg;base64,${bytes.toString('base64')}`;
}

function validateInput(d) {
  if (d.brand !== 'SIGMA') fail('brand must be SIGMA');
  if (!['T01', 'T02', 'T03', 'T04'].includes(d.template)) fail('template must be T01, T02, T03 or T04');
  if (!d.publicationId) fail('publicationId is required');
  if (!d.knowledgeId) fail('knowledgeId is required');
  if (!d.logoPath) fail('logoPath is required');
  if (d.dark) fail('dark mode is disabled until a transparent canonical brand derivative is approved');
}

function svgOpen(width, height, d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<metadata>brand=SIGMA;publicationId=${esc(d.publicationId)};knowledgeId=${esc(d.knowledgeId)};logoSha256=${CANONICAL_LOGO_SHA256}</metadata>
<rect width="100%" height="100%" fill="${PALETTE.paper}"/>
<style>
  .headline{font-family:Manrope,Inter,system-ui,sans-serif;font-weight:750;letter-spacing:-1.6px;fill:${PALETTE.ink}}
  .body{font-family:Inter,system-ui,sans-serif;font-weight:450;fill:${PALETTE.ink}}
  .label{font-family:Inter,system-ui,sans-serif;font-weight:650;letter-spacing:2.2px;fill:${PALETTE.deepGold}}
  .muted{font-family:Inter,system-ui,sans-serif;font-weight:450;fill:${PALETTE.graphite}}
</style>
`;
}

function croppedLogo(dataUri, cropName, x, y, w, h) {
  const c = LOGO_CROPS[cropName];
  if (!c) fail(`unknown logo crop ${cropName}`);
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${c.x} ${c.y} ${c.width} ${c.height}" preserveAspectRatio="xMidYMid meet" overflow="hidden">
  <image href="${dataUri}" x="0" y="0" width="${CANONICAL_LOGO_NATIVE.width}" height="${CANONICAL_LOGO_NATIVE.height}" preserveAspectRatio="none"/>
</svg>`;
}

function lineText(lines, x, y, fontSize, lineGap, className = 'headline', max = 3) {
  const safe = (Array.isArray(lines) ? lines : [lines]).filter(Boolean).slice(0, max);
  return safe.map((line, i) => `<text class="${className}" x="${x}" y="${y + i * lineGap}" font-size="${fontSize}">${esc(line)}</text>`).join('\n');
}

function footer(width, height) {
  return `
<line x1="72" y1="${height - 105}" x2="${width - 72}" y2="${height - 105}" stroke="${PALETTE.gold}" stroke-width="3"/>
<text class="muted" x="72" y="${height - 58}" font-size="24">SIGMA — Lo que importa, explicado.</text>`;
}

function renderT01(d, logo) {
  const width = d.width ?? 1080;
  const height = d.height ?? 1350;
  const open = svgOpen(width, height, d);
  const lines = d.headlineLines ?? [d.headline];
  return `${open}
${croppedLogo(logo, 'symbol', 72, 50, 118, 118)}
<text class="label" x="72" y="225" font-size="24">${esc((d.franchise ?? '').toUpperCase())}</text>
${lineText(lines, 72, 340, d.headlineSize ?? 72, d.headlineLineGap ?? 88, 'headline', 3)}
${d.anchor ? `<text class="headline" x="72" y="760" font-size="${d.anchorSize ?? 150}" style="fill:${PALETTE.gold}">${esc(d.anchor)}</text>` : ''}
${d.support ? lineText(d.support, 72, d.anchor ? 900 : 700, d.bodySize ?? 34, d.bodyLineGap ?? 48, 'body', 4) : ''}
${footer(width, height)}
</svg>`;
}

function renderT03(d, logo) {
  const width = d.width ?? 1080;
  const height = d.height ?? 1080;
  const open = svgOpen(width, height, d);
  return `${open}
${croppedLogo(logo, 'symbol', 72, 48, 106, 106)}
<text class="label" x="72" y="205" font-size="23">${esc((d.franchise ?? 'EL NÚMERO QUE IMPORTA').toUpperCase())}</text>
<text class="headline" x="72" y="500" font-size="${d.numberSize ?? 180}" style="fill:${PALETTE.gold}">${esc(d.number)}</text>
${lineText(d.meaningLines ?? [d.meaning], 72, 630, d.headlineSize ?? 44, d.headlineLineGap ?? 58, 'headline', 3)}
${d.consequence ? lineText(d.consequence, 72, 820, d.bodySize ?? 30, d.bodyLineGap ?? 42, 'body', 3) : ''}
${footer(width, height)}
</svg>`;
}

function renderT04(d, logo) {
  const width = d.width ?? 1200;
  const height = d.height ?? 1200;
  const open = svgOpen(width, height, d);
  return `${open}
${croppedLogo(logo, 'symbol', 76, 54, 112, 112)}
<text class="label" x="76" y="220" font-size="24">SIGMA · ${esc((d.franchise ?? 'ANÁLISIS').toUpperCase())}</text>
${lineText(d.headlineLines ?? [d.headline], 76, 360, d.headlineSize ?? 68, d.headlineLineGap ?? 82, 'headline', 3)}
${d.statementLines ? lineText(d.statementLines, 76, 690, d.bodySize ?? 36, d.bodyLineGap ?? 52, 'body', 5) : ''}
${footer(width, height)}
</svg>`;
}

function renderT02(d, logo, outputPath) {
  if (!Array.isArray(d.slides) || d.slides.length < 2) fail('T02 requires slides[]');
  const dir = outputPath.replace(/\.svg$/i, '');
  fs.mkdirSync(dir, { recursive: true });
  d.slides.forEach((slide, index) => {
    const one = {
      ...d,
      template: index === 0 ? 'T01' : 'T04',
      franchise: d.franchise,
      headlineLines: slide.headlineLines ?? [slide.headline],
      statementLines: slide.bodyLines ?? slide.statementLines,
      anchor: slide.anchor,
      support: slide.bodyLines,
      headlineSize: slide.headlineSize ?? d.headlineSize,
      headlineLineGap: slide.headlineLineGap ?? d.headlineLineGap,
      bodySize: slide.bodySize ?? d.bodySize,
      bodyLineGap: slide.bodyLineGap ?? d.bodyLineGap,
      publicationId: `${d.publicationId}-S${String(index + 1).padStart(2, '0')}`,
    };
    const svg = index === 0 ? renderT01(one, logo) : renderT04(one, logo);
    fs.writeFileSync(path.join(dir, `${String(index + 1).padStart(2, '0')}.svg`), svg);
  });
  console.log(`SIGMA_RENDER_PASS ${d.publicationId} ${d.slides.length} slides -> ${dir}`);
}

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) fail('usage: node render-sigma-svg.mjs <input.json> <output.svg|output-base.svg>');
const d = loadJson(inputPath);
validateInput(d);
const logo = loadCanonicalLogo(d.logoPath);

if (d.template === 'T02') {
  renderT02(d, logo, outputPath);
} else {
  const svg = d.template === 'T01' ? renderT01(d, logo) : d.template === 'T03' ? renderT03(d, logo) : renderT04(d, logo);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, svg);
  console.log(`SIGMA_RENDER_PASS ${d.publicationId} -> ${outputPath}`);
}
