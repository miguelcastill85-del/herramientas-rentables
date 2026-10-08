#!/usr/bin/env python3
"""P02: 32-second factual tutorial assembled from immutable real UI captures.

Run from any directory: python3 docs/marketing/p02/render_p02.py
Requires Pillow, ffmpeg and the installed DejaVu Sans font. No network or paid API.
The source screenshots are never modified. Crop geometry is explicit below.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import subprocess

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'sources'
WORK = ROOT / 'render'
OUT = ROOT / 'deliverables'
for directory in (WORK, OUT):
    directory.mkdir(parents=True, exist_ok=True)

W, H, FPS = 1080, 1920, 30
BG = '#122B24'
PAPER = '#F6F4EA'
LIME = '#D9FD64'
MUTED = '#BCCBC4'
FONT_ROOT = Path('/usr/share/fonts/truetype/dejavu')
FONT = FONT_ROOT / 'DejaVuSans.ttf'
BOLD = FONT_ROOT / 'DejaVuSans-Bold.ttf'
SOURCES = {
    'form': SRC / 'P02_02_formulario_real.jpg',
    'result': SRC / 'P02_03_resultado_real.jpg',
    'summary': SRC / 'P02_04_resumen_copiado.jpg',
}
images = {key: Image.open(value).convert('RGB') for key, value in SOURCES.items()}

def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)

def put(im, text, xy, size=34, fill=PAPER, bold=False, max_width=908, spacing=14):
    """Exact text with explicit wrapping; fail if a line exceeds the safe width."""
    draw = ImageDraw.Draw(im)
    f = font(size, bold)
    x, y = xy
    lines = []
    for paragraph in text.split('\n'):
        line = ''
        for word in paragraph.split(' '):
            candidate = word if not line else line + ' ' + word
            if draw.textlength(candidate, font=f) > max_width:
                if not line:
                    raise ValueError('Unbreakable text exceeds safe bounds: ' + word)
                lines.append(line)
                line = word
            else:
                line = candidate
        lines.append(line)
    for line in lines:
        if draw.textlength(line, font=f) > max_width:
            raise ValueError('Text exceeds safe bounds: ' + line)
        draw.text((x, y), line, font=f, fill=fill, stroke_width=0)
        y += size + spacing
    return y

def base(label, step=None):
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((88, 164, 154, 230), radius=18, fill=LIME)
    put(im, 'HR', (99, 181), size=28, fill=BG, bold=True, max_width=60)
    put(im, 'HERRAMIENTAS RENTABLES', (178, 165), size=29, bold=True)
    put(im, 'COTIZADOR GRATIS · CHILE', (178, 211), size=25, fill=MUTED)
    d.line((88, 278, 980, 278), fill='#36534A', width=2)
    put(im, label, (88, 325), size=28, fill=LIME, bold=True)
    put(im, 'Ejemplo ilustrativo en CLP · Capturas reales', (88, 1670), size=25, fill=MUTED)
    for i in range(4):
        x = 88 + i * 225
        d.rounded_rectangle((x, 1734, x + 207, 1740), radius=3,
                            fill=LIME if step and i < step else '#36534A')
    return im

def screen(im, source, box, xy, width=900):
    original = images[source]
    if not (0 <= box[0] < box[2] <= original.width and 0 <= box[1] < box[3] <= original.height):
        raise ValueError('Crop outside immutable source')
    crop = original.crop(box)
    height = round(crop.height * width / crop.width)
    crop = crop.resize((width, height), Image.Resampling.LANCZOS)
    x, y = xy
    if x < 0 or y < 0 or x + width > W or y + height > 1650:
        raise ValueError('Screen panel outside safe geometry')
    im.paste(crop, xy)
    return {'source': str(SOURCES[source].relative_to(ROOT)), 'crop': list(box),
            'placement': {'x': x, 'y': y, 'width': width, 'height': height}}

scenes = []

def save(im, name, seconds, text, panels):
    path = WORK / name
    im.save(path, optimize=True)
    scenes.append({'frame': str(path.relative_to(ROOT)), 'seconds': seconds,
                   'text': text, 'panels': panels})

im = base('ANTES DE ENVIAR')
put(im, 'Tu cotización\nnecesita más\nque un precio.', (88, 416), size=78, bold=True)
put(im, '4 pasos con un ejemplo real.', (88, 777), size=35)
p = screen(im, 'result', (121, 372, 1213, 705), (88, 957))
put(im, 'Tiempo. Costos. Alcance. Anticipo.', (88, 1414), size=34, fill=LIME)
save(im, 'scene_01.png', 4, 'Tu cotización necesita más que un precio. Cuatro pasos con un ejemplo real.', [p])
im.save(OUT / 'P02_portada.png', optimize=True)

im = base('01 / TIEMPO', 1)
put(im, 'Cuenta todas\nlas horas.', (88, 415), size=78, bold=True)
p = screen(im, 'form', (121, 96, 656, 491), (88, 705))
put(im, '48 h × CLP 10.000/h', (88, 1430), size=43, fill=LIME, bold=True)
put(im, 'Trabajo, reuniones y revisiones.', (88, 1540), size=32)
save(im, 'scene_02.png', 5, '1. Cuenta todas las horas: trabajo, reuniones y revisiones. Ejemplo: 48 horas, tarifa CLP 10.000 por hora.', [p])

im = base('02 / COSTOS', 2)
put(im, 'Incluye lo que\nte cuesta entregar.', (88, 415), size=65, bold=True)
p = screen(im, 'form', (140, 319, 604, 491), (88, 727))
put(im, 'Costos externos: CLP 30.000', (88, 1170), size=40, fill=LIME, bold=True)
put(im, 'Contingencia: 10%\nMargen objetivo: 20%', (88, 1310), size=36)
put(im, 'Complejidad del ejemplo: baja (×1).', (88, 1500), size=29, fill=MUTED)
save(im, 'scene_03.png', 5, '2. Incluye costos externos. En este ejemplo son CLP 30.000, con contingencia 10%, margen objetivo 20% y complejidad baja, multiplicador uno.', [p])

im = base('03 / ALCANCE', 3)
put(im, 'Define qué\nincluye.', (88, 415), size=78, bold=True)
p = screen(im, 'form', (712, 594, 1178, 739), (88, 733))
put(im, 'Hasta 5 secciones.\n2 rondas de revisión.', (88, 1180), size=43, fill=LIME, bold=True)
put(im, 'También deja claro qué aporta el cliente.', (88, 1460), size=31)
save(im, 'scene_04.png', 5, '3. Define alcance y revisiones. El ejemplo incluye una landing page de hasta cinco secciones y dos rondas de revisión. Textos e imágenes aportados por el cliente.', [p])

im = base('04 / ANTICIPO Y SALDO', 4)
put(im, 'Define cómo\nte van a pagar.', (88, 415), size=76, bold=True)
p = screen(im, 'result', (121, 372, 1213, 705), (88, 725))
put(im, 'ANTICIPO · 50%', (88, 1100), size=27, fill=MUTED)
put(im, 'SALDO', (567, 1100), size=27, fill=MUTED)
put(im, '$348.750', (88, 1155), size=58, fill=LIME, bold=True, max_width=429)
put(im, '$348.750', (567, 1155), size=58, fill=LIME, bold=True, max_width=413)
put(im, 'Recomendado: CLP 697.500', (88, 1310), size=40, bold=True)
put(im, 'Mínimo protegido: CLP 558.000', (88, 1412), size=32)
put(im, 'El ejemplo no calcula impuestos.', (88, 1530), size=29, fill=MUTED)
save(im, 'scene_05.png', 5, '4. Define anticipo y saldo. El cotizador muestra precio recomendado CLP 697.500, mínimo protegido CLP 558.000, anticipo 50% CLP 348.750 y saldo CLP 348.750. El ejemplo no calcula impuestos.', [p])

im = base('TU PROPUESTA, CLARA', 4)
put(im, 'Del cálculo\nal resumen.', (88, 415), size=78, bold=True)
p = screen(im, 'summary', (156, 187, 660, 357), (88, 733))
p2 = screen(im, 'summary', (155, 437, 286, 486), (88, 1160), width=404)
put(im, 'Revísalo y adáptalo\nantes de enviarlo.', (88, 1440), size=36)
save(im, 'scene_06.png', 4, 'El sitio prepara un resumen que puedes copiar. Revísalo y adáptalo antes de enviarlo.', [p, p2])

im = base('PRUÉBALO CON TUS DATOS', 4)
put(im, 'Tu próximo\nproyecto\nempieza aquí.', (88, 415), size=78, bold=True)
put(im, 'Cotizador gratuito en español.\nSin registro.', (88, 855), size=36)
put(im, 'ENLACE DEL PERFIL →', (88, 1170), size=42, fill=LIME, bold=True)
put(im, '@herramientas_rentables_chile', (88, 1395), size=32)
save(im, 'scene_07.png', 4, 'Prueba el cotizador gratuito en español, sin registro, con los datos de tu próximo proyecto. Enlace en el perfil de herramientas_rentables_chile.', [])

assert sum(s['seconds'] for s in scenes) == 32
concat = WORK / 'concat.txt'
concat.write_text('\n'.join("file '" + str(ROOT / s['frame']) + "'\nduration " + str(s['seconds']) for s in scenes)
                  + "\nfile '" + str(ROOT / scenes[-1]['frame']) + "'\n", encoding='utf-8')

timeline = {'piece': 'P02', 'version': 'R1', 'duration_seconds': 32,
            'format': {'width': W, 'height': H, 'fps': FPS},
            'assembly': 'Real source captures, exact text overlays, no simulated UI changes or clicks.',
            'audio': 'Intentional silence; AAC track, no voice, music or third-party sound.', 'scenes': scenes}
(ROOT / 'P02_TIMELINE.json').write_text(json.dumps(timeline, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(OUT / 'P02_transcripcion.txt').write_text('\n\n'.join(s['text'] for s in scenes) + '\n', encoding='utf-8')

command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
           '-f', 'concat', '-safe', '0', '-i', str(concat),
           '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
           '-map', '0:v:0', '-map', '1:a:0', '-t', '32',
           '-r', '30', '-fps_mode', 'cfr', '-c:v', 'libx264', '-preset', 'medium',
           '-crf', '19', '-maxrate', '10M', '-bufsize', '20M', '-pix_fmt', 'yuv420p',
           '-g', '60', '-keyint_min', '60', '-sc_threshold', '0', '-flags', '+cgop',
           '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2',
           '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
           '-use_editlist', '0', '-movflags', '+faststart', str(OUT / 'P02_demo_cotizador_R1.mp4')]
(ROOT / 'P02_FFMPEG_COMMAND.json').write_text(json.dumps(command, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
subprocess.run(command, check=True)
print(json.dumps({'video': str(OUT / 'P02_demo_cotizador_R1.mp4'), 'seconds': 32,
                  'bytes': (OUT / 'P02_demo_cotizador_R1.mp4').stat().st_size,
                  'scenes': len(scenes)}))
