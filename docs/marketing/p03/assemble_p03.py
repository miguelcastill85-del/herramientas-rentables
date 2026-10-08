"""Build PDF/ZIP from the existing frozen P03 images. Never generate new images."""
from pathlib import Path
import json
import zipfile
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
QUOTE_URL = "https://herramientas-rentables-negocios.miguelcastill85.chatgpt.site/cotizacion-freelance-chile#cotizador"
IMAGES = [ROOT / "images" / f"P03_{i:02d}.png" for i in range(1, 6)]
PDF = ROOT / "P03_Carrusel_R1.pdf"
ZIP = ROOT / "P03_Paquete_R1.zip"
SIDE = 720

def build_pdf():
    assert len(IMAGES) == 5 and all(p.is_file() for p in IMAGES)
    c = canvas.Canvas(str(PDF), pagesize=(SIDE, SIDE), pageCompression=1, invariant=1)
    c.setTitle("Cambios de alcance - Herramientas Rentables")
    c.setAuthor("Herramientas Rentables")
    c.setSubject("P03 R1. Ejemplo ilustrativo; pieza preparada, sin publicación social.")
    for i, path in enumerate(IMAGES, start=1):
        with Image.open(path) as image:
            assert image.size == (1254, 1254), image.size
        c.drawImage(ImageReader(str(path)), 0, 0, width=SIDE, height=SIDE, mask="auto")
        if i == 5:
            # The existing visible CTA region links to the actual free quote form.
            c.linkURL(QUOTE_URL, (44, 48, 478, 173), relative=0, thickness=0)
        c.showPage()
    c.save()
    reader = PdfReader(PDF)
    assert len(reader.pages) == 5
    links = [annotation.get_object() for annotation in reader.pages[-1].get("/Annots", [])]
    assert len(links) == 1 and str(links[0]["/A"]["/URI"]) == QUOTE_URL

def build_zip():
    members = IMAGES + [ROOT / name for name in (
        "P03_Texto_Instagram.txt", "P03_Texto_LinkedIn.txt", "P03_Textos_Alternativos.json",
        "P03_TRANSCRIPCION.txt", "README.md", "P03_PUBLICATION_DESCRIPTOR.json")]
    with zipfile.ZipFile(ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for path in members:
            archive.write(path, str(path.relative_to(ROOT)))
    with zipfile.ZipFile(ZIP) as archive:
        assert archive.testzip() is None
        assert len(archive.namelist()) == 11
        for path in members:
            assert archive.read(str(path.relative_to(ROOT))) == path.read_bytes()

if __name__ == "__main__":
    build_pdf()
    build_zip()
    print(json.dumps({"pdf": str(PDF), "pdf_pages": 5, "zip": str(ZIP), "zip_files": 11,
                      "images_changed": False, "social_scheduled": False, "social_published": False}))
