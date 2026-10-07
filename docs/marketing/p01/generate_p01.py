#!/usr/bin/env python3
"""Create P01 marketing assets with exact, illustrative arithmetic."""
from pathlib import Path
import csv
import hashlib
import json
import subprocess
import sys
import zipfile
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics import renderPDF
from pypdf import PdfReader
from PIL import Image

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd() / "output" / "organic-p01"
OUT = ROOT / "output"
QA = ROOT / "qa"
OUT.mkdir(parents=True, exist_ok=True)
QA.mkdir(parents=True, exist_ok=True)
QUOTE = "https://herramientas-rentables-negocios.miguelcastill85.chatgpt.site/cotizacion-freelance-chile"
W = H = 1080
INK, SOFT, CREAM, PAPER, LIME, MINT = map(HexColor,
    ["#132a24", "#315047", "#f4f1e8", "#fbfaf5", "#dcff68", "#dcebe4"])
for name, file in [("HR", "DejaVuSans.ttf"), ("HRB", "DejaVuSans-Bold.ttf")]:
    pdfmetrics.registerFont(TTFont(name, f"/usr/share/fonts/truetype/dejavu/{file}"))

price, work, meetings, revisions, costs = 300000, 40, 5, 3, 30000
hours = work + meetings + revisions
assert hours == 48
assert price / work == 7500
assert price / hours == 6250
assert (price - costs) / hours == 5625
pdf_path = OUT / "P01_Carrusel_LinkedIn.pdf"
c = canvas.Canvas(str(pdf_path), pagesize=(W, H), pageCompression=1)
c.setTitle("Herramientas Rentables - El tiempo completo del proyecto")
c.setAuthor("Herramientas Rentables")
c.setSubject("Ejemplo ilustrativo en CLP. No son resultados de clientes ni del cotizador.")
bounds = []

def txt(x, top, value, size=36, bold=False, color=INK, align="left"):
    font = "HRB" if bold else "HR"
    width = pdfmetrics.stringWidth(value, font, size)
    left = x if align == "left" else x - width if align == "right" else x - width / 2
    assert 44 <= left and left + width <= 1036, (value, left, width)
    assert 30 <= top and top + size <= 1052, (value, top, size)
    bounds.append({"page": page, "text": value, "box": [left, top, left + width, top + size]})
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(left, H - top - size, value)

def box(x, top, width, height, color, radius=26):
    c.setFillColor(color)
    c.roundRect(x, H - top - height, width, height, radius, fill=1, stroke=0)

def base(number, dark=False):
    global page
    page = number
    bg = INK if dark else PAPER
    fg = PAPER if dark else INK
    c.setFillColor(bg)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    box(72, 64, 56, 56, LIME, 14)
    txt(100, 75, "HR", 26, True, INK, "center")
    txt(146, 75, "Herramientas Rentables", 25, True, fg)
    txt(1008, 77, f"{number}/5", 25, False, LIME if dark else SOFT, "right")
    txt(72, 1020, "Ejemplo ilustrativo | CLP | Antes de impuestos", 23, False, MINT if dark else SOFT)

base(1, True)
txt(72, 177, "PRECIOS FREELANCE", 25, True, LIME)
for y, line in [(246, "¿Cuánto te deja"), (324, "un proyecto de"), (402, "$300.000?")]:
    txt(72, y, line, 72, True, PAPER)
txt(72, 535, "El precio total no cuenta", 37, False, MINT)
txt(72, 584, "toda la historia.", 37, False, MINT)
box(72, 707, 936, 166, SOFT)
txt(102, 737, "40 h presupuestadas", 24, False, PAPER)
txt(102, 779, "CLP 7.500/h", 44, True, PAPER)
txt(588, 737, "48 h + costos directos", 24, False, LIME)
txt(588, 779, "CLP 5.625/h", 44, True, LIME)
txt(72, 922, "Desliza para ver la cuenta  >", 34, True, PAPER)
c.showPage()

base(2)
txt(72, 184, "01 / TIEMPO PRESUPUESTADO", 25, True, SOFT)
txt(72, 252, "El cálculo inicial", 65, True)
box(72, 380, 936, 266, CREAM)
txt(108, 413, "Precio del proyecto", 30, False, SOFT)
txt(108, 462, "CLP 300.000", 68, True)
txt(108, 558, "/ 40 horas de trabajo", 37, False, SOFT)
box(72, 685, 936, 154, INK)
txt(540, 723, "CLP 7.500 / h", 72, True, LIME, "center")
txt(72, 894, "Antes de costos, impuestos", 34, False, SOFT)
txt(72, 939, "y otros gastos.", 34, False, SOFT)
c.showPage()

base(3)
txt(72, 184, "02 / SUMA LAS HORAS ADICIONALES", 25, True, SOFT)
txt(72, 252, "El trabajo completo", 63, True)
for y, label, value in [(370, "Trabajo", "40 h"), (466, "Reuniones", "5 h"), (562, "Correcciones", "3 h")]:
    box(72, y, 936, 82, CREAM)
    txt(106, y + 19, label, 34, False, SOFT)
    txt(970, y + 16, value, 39, True, INK, "right")
box(72, 685, 936, 176, INK)
txt(108, 711, "48 HORAS EN TOTAL", 27, True, MINT)
txt(108, 756, "CLP 6.250 / h", 71, True, LIME)
txt(72, 907, "CLP 300.000 / 48 h", 32, False, SOFT)
txt(72, 950, "Antes de costos directos.", 30, False, SOFT)
c.showPage()

base(4)
txt(72, 184, "03 / RESTA LOS COSTOS DIRECTOS", 25, True, SOFT)
txt(72, 252, "Después de costos", 63, True)
for y, label, value, b in [
    (376, "Precio del proyecto", "CLP 300.000", False),
    (470, "Costos directos", "- CLP 30.000", False),
    (564, "Tras costos directos", "CLP 270.000", True)
]:
    box(72, y, 936, 80, MINT if b else CREAM)
    txt(106, y + 23, label, 29, b, SOFT)
    txt(970, y + 17, value, 38, b, INK, "right")
box(72, 690, 936, 174, INK)
txt(108, 717, "CLP 5.625 / h", 71, True, LIME)
txt(108, 809, "CLP 270.000 / 48 h", 28, False, MINT)
txt(72, 908, "Antes de impuestos", 34, False, SOFT)
txt(72, 951, "y otros gastos.", 34, False, SOFT)
c.showPage()

base(5, True)
txt(72, 181, "COTIZA CON EL TIEMPO COMPLETO", 25, True, LIME)
txt(72, 248, "Evalúa tu", 70, True, PAPER)
txt(72, 330, "próximo proyecto.", 70, True, PAPER)
txt(72, 442, "Cotizador gratuito en español.", 36, False, MINT)
box(72, 548, 352, 352, PAPER, 20)
qr = QrCodeWidget(QUOTE)
x0, y0, x1, y1 = qr.getBounds()
size = 320
drawing = Drawing(size, size, transform=[size / (x1-x0), 0, 0, size / (y1-y0), 0, 0])
drawing.add(qr)
renderPDF.draw(drawing, c, 88, H-564-size)
for y, label in [(568, "Trabajo"), (625, "Reuniones"), (682, "Correcciones")]:
    txt(481, y, label, 37, True, PAPER)
txt(481, 775, "Escanea para abrir", 28, False, MINT)
txt(481, 816, "el cotizador.", 28, False, MINT)
box(72, 925, 936, 68, LIME, 18)
txt(540, 939, "Abrir cotizador gratuito", 31, True, INK, "center")
c.linkURL(QUOTE, (72, H-993, 1008, H-925), relative=0, thickness=0)
c.linkURL(QUOTE, (72, H-900, 424, H-548), relative=0, thickness=0)
c.showPage()
c.save()

subprocess.run(["pdftoppm", "-png", "-r", "72", str(pdf_path), str(QA/"page")], check=True)
for i in range(1, 6):
    source = QA / f"page-{i}.png"
    with Image.open(source) as im:
        assert im.size == (1080, 1080), im.size
        im.convert("RGB").save(OUT / f"P01_0{i}.png", optimize=True)

intro = """Un proyecto de CLP 300.000 puede dejar CLP 7.500 por hora... o CLP 5.625, según el tiempo y los costos que incluyas.

Esta es la cuenta:
40 horas de trabajo: CLP 7.500/h.
Más 5 horas de reuniones y 3 de correcciones: 48 horas, CLP 6.250/h.
Restando CLP 30.000 de costos directos: CLP 5.625/h antes de impuestos y otros gastos.

Es un ejemplo ilustrativo. No corresponde a resultados de clientes ni a una captura del cotizador.

El tiempo fuera de la tarea principal también cuenta al cotizar.
"""
linkedin = intro + f"""
Evalúa tu próximo proyecto con nuestro cotizador gratuito en español:
{QUOTE}

#FreelanceChile #Cotizaciones #TrabajoIndependiente
"""
instagram = intro + f"""
El código de la última imagen abre el cotizador gratuito en español. También puedes usar este enlace:
{QUOTE}

#FreelanceChile #Cotizaciones #TrabajoIndependiente
"""
(OUT/"P01_Texto_LinkedIn.txt").write_text(linkedin, encoding="utf-8")
(OUT/"P01_Texto_Instagram.txt").write_text(instagram, encoding="utf-8")
alt = [
    "Herramientas Rentables pregunta cuánto deja por hora un proyecto de CLP 300.000. Presenta dos escenarios ilustrativos: 40 horas presupuestadas y 48 horas con costos directos.",
    "Ejemplo inicial: precio de CLP 300.000 dividido por 40 horas de trabajo equivale a CLP 7.500 por hora, antes de costos, impuestos y otros gastos.",
    "El trabajo completo incluye 40 horas de trabajo, 5 de reuniones y 3 de correcciones. Suma 48 horas. CLP 300.000 dividido por 48 equivale a CLP 6.250 por hora antes de costos directos.",
    "Al restar CLP 30.000 de costos directos a CLP 300.000 quedan CLP 270.000. Divididos por 48 horas equivalen a CLP 5.625 por hora, antes de impuestos y otros gastos.",
    "Invitación a evaluar el próximo proyecto con el cotizador gratuito en español. Un código QR dirige a la página cotizacion-freelance-chile del sitio Herramientas Rentables."
]
guide = f"""HERRAMIENTAS RENTABLES - P01
Preparado: 2026-10-07
Estado: material listo; publicación social pendiente de acceso.

Instagram: usar P01_01.png a P01_05.png, en ese orden, con P01_Texto_Instagram.txt.
Destino identificado por el enlace del sitio: @herramientasrentables.
El nombre enlazado no demuestra que una sesión esté autenticada ni que la cuenta sea profesional.

LinkedIn: usar P01_Carrusel_LinkedIn.pdf con P01_Texto_LinkedIn.txt.
Perfil o página de destino aún no identificado.

Formato: cinco imágenes de 1080 x 1080 px y un PDF vectorial de cinco páginas.
La última página del PDF contiene un enlace clicable al cotizador.
El QR incluye esta dirección exacta:
{QUOTE}

La cuenta es manual e ilustrativa. No usarla como testimonio ni como resultado del archivo de pago.
Precios de los productos y archivos del sitio no se modificaron.
Gasto monetario: CLP 0.

PUBLICACIÓN CON ACCESO AUTORIZADO
1. Confirmar la cuenta correcta.
2. Comprobar que el post no exista ya.
3. Adjuntar los cinco PNG en orden o el PDF, según el canal.
4. Pegar el texto correspondiente.
5. Publicar y conservar el enlace real y la hora local de Chile.
6. Registrar métricas a partir de evidencia del post. Dejar vacías las cifras aún no observadas.
No activar promociones pagadas ni pruebas de cobro.

VÍA DE ACCESO
Metricool no estaba instalado/conectado durante la preparación.
Se ofreció la conexión; no se afirma que esté completada.
Su plan Free documenta MCP y hasta 20 posts al mes, con 1 marca.
Instagram requiere cuenta profesional, Business o Creator.
LinkedIn no está incluido en Metricool Free.
Usar una vía directa gratuita para LinkedIn cuando exista acceso autorizado.
Si la conexión exige pago, detener esa vía y conservar el material listo.

Fuentes consultadas el 2026-10-07:
https://help.metricool.com/mcp-limits-and-plan-requirements-h72jg
https://help.metricool.com/plans-add-ons-and-api-access-explained-xux1u
https://help.metricool.com/how-to-connect-instagram-to-metricool-sermi

TEXTOS ALTERNATIVOS
"""
guide += "\n\n".join(f"Imagen {i}: {text}" for i, text in enumerate(alt, 1)) + "\n"
(OUT/"P01_Instrucciones_y_Alt.txt").write_text(guide, encoding="utf-8")
with (OUT/"P01_Registro.csv").open("w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerow(["pieza", "canal", "cuenta", "estado", "fecha_publicacion_chile", "url_publicacion", "impresiones", "clics_observados", "consultas", "pedidos_pagados_observados", "ingresos_brutos_clp", "evidencia"])
    writer.writerow(["P01", "Instagram", "@herramientasrentables", "PREPARADO_NO_PUBLICADO", "", "", "", "", "", "", "", "Cuenta enlazada desde el sitio; acceso no verificado"])
    writer.writerow(["P01", "LinkedIn", "", "PREPARADO_NO_PUBLICADO", "", "", "", "", "", "", "", "Destino y acceso pendientes"])

reader = PdfReader(pdf_path)
assert len(reader.pages) == 5
for i, needle in enumerate(["$300.000?", "CLP 7.500 / h", "CLP 6.250 / h", "CLP 5.625 / h", "Cotizador gratuito en español."]):
    assert needle in reader.pages[i].extract_text(), (i, needle)
annots = reader.pages[-1]["/Annots"]
assert len(annots) == 2
assert all(a.get_object()["/A"]["/URI"] == QUOTE for a in annots)
assert len(instagram) <= 2200
assert len(linkedin) <= 3000
for p in OUT.glob("*.png"):
    assert p.stat().st_size < 8000000
proof = {
    "campaign": "HR_ORGANIC_14D",
    "piece": "P01",
    "created_at": "2026-10-07",
    "status": "ASSETS_PREPARED_NOT_PUBLISHED",
    "cash_spent_clp": 0,
    "example_type": "MANUAL_ILLUSTRATIVE_NOT_CUSTOMER_OR_APP_OUTPUT",
    "arithmetic": {"project_clp": price, "work_hours": work, "meeting_hours": meetings, "revision_hours": revisions, "full_hours": hours, "direct_costs_clp": costs, "before_additional_hours_clp_h": price/work, "after_additional_hours_clp_h": price/hours, "after_direct_costs_clp_h": (price-costs)/hours},
    "pdf_pages": len(reader.pages),
    "image_count": 5,
    "image_size": [1080, 1080],
    "pdf_link_and_qr_target": QUOTE,
    "bounds_check": "PASS",
    "visual_check": "PENDING",
    "publication_url": None,
    "observed_metrics": None,
    "artifacts": [{"name": p.name, "bytes": p.stat().st_size, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(OUT.iterdir()) if p.is_file()]
}
(QA/"receipt.json").write_text(json.dumps(proof, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
(QA/"text-bounds.json").write_text(json.dumps(bounds, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
thumbs = []
for p in sorted(OUT.glob("P01_0*.png")):
    im = Image.open(p).convert("RGB")
    im.thumbnail((400, 400))
    thumbs.append(im)
contact = Image.new("RGB", (3*420, 2*420), "#e6e9e4")
for i, im in enumerate(thumbs):
    contact.paste(im, ((i%3)*420+10, (i//3)*420+10))
contact.save(QA/"contact.png")
bundle = OUT/"Herramientas_Rentables_P01.zip"
with zipfile.ZipFile(bundle, "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(OUT.iterdir()):
        if p.is_file() and p != bundle:
            z.write(p, p.name)
with zipfile.ZipFile(bundle) as z:
    assert z.testzip() is None
print(json.dumps({"pdf": str(pdf_path), "contact": str(QA/"contact.png"), "bundle": str(bundle), "files": len(list(OUT.iterdir())), "arithmetic": "PASS", "bounds": "PASS", "pages": 5, "links": "PASS", "visual": "PENDING"}, ensure_ascii=False))
