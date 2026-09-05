import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const CANONICAL_LOGO_SHA256 = '48929e9baf789d3d587b44412a71adcf13dd3e5eceb3218335a3a18b7c54c4ca';
const PALETTE = {
  ink: '#111214',
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
}

function svgOpen(width, height, dark = false) {
  const bg = dark ? PALETTE.ink : PALETTE.ivory;
  const fg = dark ? PALETTE.ivory : PALETTE.ink;
  return {
    fg,
    text: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="${bg}"/>
<style>
  .headline{font-family:Manrope,Inter,system-ui,sans-serif;font-weight:750;letter-spacing:-1.6px;fill:${fg}}
  .body{font-family:Inter,system-ui,sans-serif;font-weight:450;fill:${fg}}
  .label{font-family:Inter,system-ui,sans-serif;font-weight:650;letter-spacing:2.2px;fill:${PALETTE.deepGold}}
  .muted{font-family:Inter,system-ui,sans-serif;font-weight:450;fill:${dark ? '#D8D8D3' : PALETTE.graphite}}
</style>
`,
  };
}

function logoBlock(dataUri, x, y, w, h) {
  return `<image href="${dataUri}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
}

function lineText(lines, x, y, fontSize, lineGap, className = 'headline', max = 3) {
  const safe = (Array.isArray(lines) ? lines : [lines]).slice(0, max);
  return safe.map((line, i) => `<text class="${className}" x="${x}" y="${y + i * lineGap}" font-size="${fontSize}">${esc(line)}</text>`).join('\n');
}

function footer(d, fg, width, height) {
  return `
<line x1="72" y1="${height - 105}" x2="${width - 72}" y2="${height - 105}" stroke="${PALETTE.gold}" stroke-width="3"/>
<text class="muted" x="72" y="${height - 58}" font-size="24">SIGMA — Lo que importa, explicado.</text>
<text class="muted" x="${width - 72}" y="${height - 58}" font-size="18" text-anchor="end">${esc(d.publicationId)} · ${esc(d.knowledgeId)}</text>`;
}

function renderT01(d, logo) {
  const width = d.width ?? 1080;
  const height = d.height ?? 1350;
  const dark = Boolean(d.dark);
  const { fg, text: open } = svgOpen(width, height, dark);
  const lines = d.headlineLines ?? [d.headline];
  return `${open}
${logoBlock(logo, 72, 58, 150, 150)}
<text class="label" x="72" y="255" font-size="24">${esc((d.franchise ?? '').toUpperCase())}</text>
${lineText(lines, 72, 360, d.headlineSize ?? 72, 88, 'headline', 3)}
${d.anchor ? `<text class="headline" x="72" y="760" font-size="${d.anchorSize ?? 150}" fill="${PALETTE.gold}">${esc(d.anchor)}</text>` : ''}
${d.support ? lineText(d.support, 72, d.anchor ? 900 : 700, 34, 48, 'body', 4) : ''}
${footer(d, fg, width, height)}
</svg>`;
}

function renderT03(d, logo) {
  const width = d.width ?? 1080;
  const height = d.height ?? 1080;
  const dark = Boolean(d.dark);
  const { fg, text: open } = svgOpen(width, height, dark);
  return `${open}
${logoBlock(logo, 72, 54, 135, 135)}
<text class="label" x="72" y="240" font-size="23">${esc((d.franchise ?? 'EL NÚMERO QUE IMPORTA').toUpperCase())}</text>
<text class="headline" x="72" y="510" font-size="${d.numberSize ?? 180}" fill="${PALETTE.gold}">${esc(d.number)}</text>
${lineText(d.meaningLines ?? [d.meaning], 72, 640, 44, 58, 'headline', 3)}
${d.consequence ? lineText(d.consequence, 72, 830, 30, 42, 'body', 3) : ''}
${footer(d, fg, width, height)}
</svg>`;
}

function renderT04(d, logo) {
  const width = d.width ?? 1200;
  const height = d.height ?? 1200;
  const dark = Boolean(d.dark);
  const { fg, text: open } = svgOpen(width, height, dark);
  return `${open}
${logoBlock(logo, 76, 60, 150, 150)}
<text class="label" x="76" y="265" font-size="24">SIGMA · ${esc((d.franchise ?? 'ANÁLISIS').toUpperCase())}</text>
${lineText(d.headlineLines ?? [d.headline], 76, 390, 68, 82, 'headline', 3)}
${d.statementLines ? lineText(d.statementLines, 76, 690, 36, 52, 'body', 5) : ''}
${footer(d, fg, width, height)}
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
