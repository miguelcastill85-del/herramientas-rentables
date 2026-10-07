#!/usr/bin/env python3
"""Assemble the reviewed P01 R2 images and channel-specific copy; never edit pixels."""
from pathlib import Path
import csv, hashlib, json, re, shutil, subprocess, sys, zipfile
from datetime import datetime, timezone
from PIL import Image, ImageOps
from pypdf import PdfReader
from reportlab.pdfgen import canvas

root=Path(sys.argv[1]).resolve()
qa=root/"qa"
out=root/"output"
out.mkdir(parents=True,exist_ok=True)
cfg=json.loads((qa/"config.json").read_text())
link=cfg["link"]
base_link=link.split("#")[0]
assert link.endswith("#cotizador")
assert 300000/40==7500
assert 40+5+3==48
assert 300000/48==6250
assert (300000-30000)/48==5625

numeric=[["300.000","7.500","5.625"],["300.000","40","7.500"],["40","5","3","48","6.250","300.000"],["300.000","30.000","270.000","5.625","48"],[]]
ocr=[]
sizes=[]
for item in cfg["generated"]:
    i=item["index"]
    src=Path(item["path"])
    dst=out/f"P01_0{i}.png"
    shutil.copy2(src,dst)
    with Image.open(dst) as im:
        assert im.width==im.height and im.width>=1080
        sizes.append(list(im.size))
    assert dst.stat().st_size<8_000_000
    text=subprocess.run(["tesseract",str(dst),"stdout","-l","eng","--psm","11"],capture_output=True,text=True,check=True).stdout
    # Analysis-only preview for large light-on-dark figures; the delivered PNG is unchanged.
    if not all(re.search(r"(?<![0-9])"+re.escape(v)+r"(?![0-9])",text) for v in numeric[i-1]):
        digest=hashlib.sha256(dst.read_bytes()).hexdigest()
        with Image.open(dst) as im:
            region=im.crop((int(im.width*.05),int(im.height*.61),int(im.width*.98),int(im.height*.86)))
            region=ImageOps.invert(ImageOps.grayscale(region))
            region.thumbnail((900,280))
            preview=qa/f"P01_0{i}_ocr_region.png"
            region.save(preview)
        text+="\n"+subprocess.run(["tesseract",str(preview),"stdout","-l","eng","--psm","6"],capture_output=True,text=True,check=True).stdout.replace("[CLP","CLP")
        assert digest==hashlib.sha256(dst.read_bytes()).hexdigest()
    (qa/f"P01_0{i}_ocr.txt").write_text(text,encoding="utf-8")
    for value in numeric[i-1]:
        assert re.search(r"(?<![0-9])"+re.escape(value)+r"(?![0-9])",text), (i,value,text)
    assert "Herramientas Rentables" in text
    ocr.append(text)
assert len(sizes)==5 and len(set(tuple(s) for s in sizes))==1

pdf=out/"P01_Carrusel_LinkedIn.pdf"
c=canvas.Canvas(str(pdf),pagesize=(1080,1080),pageCompression=1)
c.setTitle("El tiempo completo de un proyecto - Herramientas Rentables")
c.setAuthor("Herramientas Rentables")
c.setSubject("Ejemplo ilustrativo en CLP. Cotizador gratuito en español.")
for i,text in enumerate(ocr,1):
    c.drawImage(str(out/f"P01_0{i}.png"),0,0,width=1080,height=1080)
    layer=c.beginText(36,1044)
    layer.setFont("Helvetica",10)
    layer.setTextRenderMode(3)
    for line in text.splitlines():
        if line.strip(): layer.textLine(line)
    c.drawText(layer)
    if i==5: c.linkURL(link,(45,28,1010,150),relative=0,thickness=0)
    c.showPage()
c.save()
reader=PdfReader(pdf)
assert len(reader.pages)==5
annots=reader.pages[-1].get("/Annots")
assert len(annots)==1
assert annots[0].get_object()["/A"]["/URI"]==link
for i in range(1,5):
    extracted=reader.pages[i-1].extract_text()
    for value in numeric[i-1]: assert value in extracted

instagram="""¿Tu cotización incluye las reuniones y correcciones?

En este ejemplo, un proyecto de CLP 300.000 pasa de CLP 7.500/h a CLP 5.625/h al sumar 8 horas adicionales y CLP 30.000 de costos directos.

Las cifras son ilustrativas, antes de impuestos y otros gastos.

Antes de enviar tu próxima propuesta, cuenta el trabajo completo.

Con nuestro cotizador gratuito en español puedes estimar el precio mínimo y definir anticipo, saldo y revisiones. Sin registro.

Pruébalo desde el enlace del perfil.

#FreelanceChile #Cotizaciones #TrabajoIndependiente
"""
linkedin=f"""40 horas presupuestadas pueden convertirse en 48 cuando sumas reuniones y correcciones.

En un proyecto ilustrativo de CLP 300.000, la cuenta cambia así:

• 40 h de trabajo: CLP 7.500 por hora.
• Más 5 h de reuniones y 3 h de correcciones: CLP 6.250 por hora.
• Menos CLP 30.000 de costos directos: CLP 5.625 por hora.

Son cifras antes de impuestos y otros gastos. Este ejemplo no representa resultados de clientes.

Al cotizar, conviene estimar el tiempo completo y definir qué incluye el proyecto antes de negociar el precio.

Preparamos un cotizador gratuito en español para evaluar el precio mínimo y recomendado, el anticipo, el saldo y las revisiones incluidas. Funciona sin registro.

Pruébalo con los datos de tu próximo proyecto:
{link}

#FreelanceChile #Cotizaciones
"""
assert instagram!=linkedin and len(instagram)<len(linkedin)
assert len(instagram)<=2200 and len(linkedin)<=3000
assert linkedin.count(link)==1
assert "CLP 5.625" in instagram and "CLP 5.625" in linkedin
(out/"P01_Texto_Instagram.txt").write_text(instagram,encoding="utf-8")
(out/"P01_Texto_LinkedIn.txt").write_text(linkedin,encoding="utf-8")

alt=[
"Proyecto ilustrativo de CLP 300.000. Con 40 horas de trabajo equivale a CLP 7.500 por hora; con 48 horas y costos directos equivale a CLP 5.625 por hora, antes de impuestos y otros gastos. Invitación a deslizar para revisar la cuenta.",
"Precio del proyecto de CLP 300.000 dividido por 40 horas de trabajo. Resultado: CLP 7.500 por hora antes de costos e impuestos. Ejemplo ilustrativo en CLP.",
"Lista del trabajo completo: 40 horas de trabajo, 5 de reuniones y 3 de correcciones. Total 48 horas. CLP 300.000 dividido por 48 da CLP 6.250 por hora antes de costos e impuestos. Ejemplo ilustrativo en CLP.",
"Al precio de CLP 300.000 se restan CLP 30.000 de costos directos. Quedan CLP 270.000, que divididos por 48 horas dan CLP 5.625 por hora antes de impuestos y otros gastos. Ejemplo ilustrativo en CLP.",
"Cotizador gratuito de Herramientas Rentables, en español y sin registro. Permite evaluar precio mínimo, anticipo y saldo, alcance y revisiones. Invitación a probarlo con los datos del próximo proyecto."
]
guide=f"""HERRAMIENTAS RENTABLES - P01 R2 PROFESIONAL
Revisión: 2026-10-07.
Estado: material mejorado y verificado; publicación social pendiente.

Instagram: cinco PNG P01_01.png a P01_05.png, en ese orden, con P01_Texto_Instagram.txt.
Destino: @herramientasrentables, confirmado por el usuario y enlazado desde el sitio.
ANTES DE PUBLICAR: verificar que el enlace del perfil permita abrir este cotizador:
{link}
La frase del texto “enlace del perfil” sólo se publica cuando se confirme ese acceso.
El enlace de la biografía no se ha verificado. No depender de copiar una URL desde el pie de foto.

LinkedIn: PDF de cinco páginas con P01_Texto_LinkedIn.txt.
El texto contiene el enlace directo; el cierre del PDF tiene un enlace clicable.
Perfil o página de LinkedIn aún no identificado.

FORMATO Y EDICIÓN
Cinco imágenes cuadradas {sizes[0][0]} x {sizes[0][1]} px.
Edición de imágenes con la herramienta integrada, sin API externa de pago.
PDF compuesto con las imágenes finales sin modificar sus píxeles.
Los PNG no contienen botones ficticios ni códigos QR.
Un borrador con barras de horas inexactas fue descartado; la imagen final muestra una lista.
Prompt de edición conservado en el checkpoint de GitHub.

EVIDENCIA
Cálculos: 300000/40=7500; 40+5+3=48; 300000/48=6250; (300000-30000)/48=5625.
Ejemplo manual ilustrativo, no resultado de un cliente ni captura del cotizador.
Cifras verificadas visualmente y con Tesseract OCR.
Destino del enlace recuperado públicamente el 2026-10-07.
El ancla #cotizador corresponde al formulario en el código del sitio.
No se volvió a probar el pago, ni se reconstruyó el producto.

ACCESO
Metricool ya está conectado a ChatGPT.
Su primera consulta informó que la marca no tenía ninguna red social conectada.
Falta vincular el Instagram existente; no volver a solicitar instalar la integración.
Plan permitido: Free, sin promociones pagadas.
Sin publicación ni ventas atribuidas. Gasto monetario: CLP 0.

PUBLICACIÓN
Confirmar el perfil vinculado, comprobar duplicados, verificar el enlace del perfil,
usar los archivos R2 existentes, publicar y guardar la URL real y hora de Chile.
No publicar la versión anterior del paquete. Dejar métricas sin observar en blanco.

TEXTOS ALTERNATIVOS
"""
guide+="\n\n".join(f"Imagen {i}: {t}" for i,t in enumerate(alt,1))+"\n"
(out/"P01_Instrucciones_y_Alt.txt").write_text(guide,encoding="utf-8")
with (out/"P01_Registro.csv").open("w",encoding="utf-8-sig",newline="") as f:
    w=csv.writer(f)
    w.writerow(["pieza","revision","canal","cuenta","estado","fecha_publicacion_chile","url_publicacion","impresiones","clics_observados","consultas","pedidos_pagados_observados","ingresos_brutos_clp","evidencia"])
    w.writerow(["P01","R2","Instagram","@herramientasrentables","MEJORADO_NO_PUBLICADO","","","","","","","","Red social y enlace del perfil pendientes de verificar"])
    w.writerow(["P01","R2","LinkedIn","","MEJORADO_NO_PUBLICADO","","","","","","","","Destino pendiente"])

report=f"""REVISIÓN DE CALIDAD - HERRAMIENTAS RENTABLES P01 R2
Fecha: 2026-10-07

MEJORAS
1. Portada: proyecto e ingreso por hora más destacados; lectura más rápida.
2. Secuencia: precio/horas, trabajo completo y costos directos separados con claridad.
3. Diseño: identidad del sitio conservada; mayor jerarquía visual y cifras legibles.
4. Precisión: tercera imagen sin barras de escala inexacta; sólo lista y total verificados.
5. Cierre: beneficios reales del cotizador, sin botón ficticio ni QR.
6. Instagram: texto más breve y una llamada a usar el enlace del perfil, sujeta a verificación.
7. LinkedIn: caso explicado y enlace directo al formulario.
8. PDF: cinco páginas con las mismas imágenes finales, texto OCR seleccionable y enlace real.
9. Accesibilidad práctica: textos alternativos; no se afirma PDF etiquetado o certificación WCAG.

COMPROBACIONES
Aritmética: PASS.
Cifras de las cuatro imágenes con cálculos, mediante OCR: PASS.
Marca visible en las cinco imágenes, mediante OCR: PASS.
Revisión visual de las cinco piezas finales: PASS.
Formato 1:1 y resolución superior a la anterior: PASS ({sizes[0][0]} px).
PDF, orden de páginas y destino exacto de la anotación: PASS.
Enlace público al cotizador y ancla #cotizador: PASS (página recuperada y ancla en código).
Paquete ZIP y consistencia con los archivos finales: pendiente de cierre de ensamblado.

LÍMITES DEL RESULTADO
Las cifras son ilustrativas, antes de impuestos y otros gastos.
No son resultados de clientes ni medidas de rendimiento comercial.
La claridad visual se valoró por inspección; no se afirma un incremento medido de conversión.
Metricool conectado a ChatGPT; Instagram aún no confirmado como red conectada.
Enlace de la biografía de Instagram pendiente de confirmar antes de usar ese texto.
Publicación social: no realizada. Gasto monetario: CLP 0.

FUENTE DEL COTIZADOR
{base_link}
"""
(out/"P01_Revision_Profesional.txt").write_text(report,encoding="utf-8")
(qa/"prompts.json").write_text(json.dumps({"prompts":cfg["prompts"],"correction":cfg["correction"]},ensure_ascii=False,indent=2)+"\n")
proof={
 "piece":"P01","revision":"R2","created_at_utc":datetime.now(timezone.utc).isoformat(),
 "status":"PROFESSIONAL_ASSETS_VERIFIED_NOT_PUBLISHED","cash_spent_clp":0,
 "image_count":5,"image_sizes":sizes,"image_editing_mode":"BUILT_IN_IMAGE_GEN",
 "pixel_postprocessing":"NONE_SOURCE_BYTES_COPIED",
 "draft_rejection":"INACCURATE_TIME_BARS_REMOVED_WITH_TARGETED_IMAGE_EDIT",
 "visual_review":"PASS_FIVE_FINAL_IMAGES","numeric_ocr":"PASS",
 "arithmetic":{"price_clp":300000,"work_h":40,"meetings_h":5,"corrections_h":3,"total_h":48,"costs_clp":30000,"initial_clp_h":7500,"full_time_clp_h":6250,"after_costs_clp_h":5625},
 "example_type":"MANUAL_ILLUSTRATIVE_BEFORE_TAX_AND_OTHER_EXPENSES",
 "link":link,"public_page_read":"PASS_2026-10-07","anchor_source":"section id=cotizador",
 "pdf_pages":5,"pdf_link_annotations":1,"pdf_text_layer":"SELECTABLE_OCR_NOT_TAGGED_ACCESSIBILITY_CLAIM",
 "channel_texts_distinct":True,"instagram_bio_link":"PENDING_VERIFICATION_REQUIRED_BEFORE_POST",
 "metricool_plugin":"CONNECTED","metricool_network_state":"NO_SOCIAL_NETWORK_CONNECTED_AT_FIRST_READ",
 "instagram_handle":"@herramientasrentables","publication_url":None,"observed_metrics":None,
 "existing_site_and_product_rebuild":False
}
review_path=out/"P01_Revision_Profesional.txt"
review_path.write_text(report.replace("pendiente de cierre de ensamblado.","PASS."),encoding="utf-8")
bundle=out/"Herramientas_Rentables_P01.zip"
with zipfile.ZipFile(bundle,"w",zipfile.ZIP_DEFLATED) as z:
    for p in sorted(out.iterdir()):
        if p.is_file() and p!=bundle:z.write(p,p.name)
with zipfile.ZipFile(bundle) as z:
    assert z.testzip() is None
    for name in z.namelist():assert z.read(name)==(out/name).read_bytes()
proof["zip_crc_and_entries_match"]="PASS"
proof["artifacts"]=[{"name":p.name,"bytes":p.stat().st_size,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(out.iterdir()) if p.is_file()]
(qa/"receipt.json").write_text(json.dumps(proof,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
subprocess.run(["/usr/bin/pdftoppm","-jpeg","-r","30",str(pdf),str(qa/"review-final")],check=True)
for i in range(1,6):
    with Image.open(qa/f"review-final-{i}.jpg") as im:
        im.load()
        assert im.size==(450,450)
print(json.dumps({"images":5,"size":sizes[0],"ocr":"PASS","arithmetic":"PASS","pdf_pages":5,"pdf_link":link,"zip":"PASS","out":str(out),"pdf_render_review":"PENDING"},ensure_ascii=False))
