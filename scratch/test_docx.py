import mammoth
import markdownify
import os

template_dir = r"c:\Users\anton\OneDrive\Documentos\Antigravity\Formulario Captura Final\Plantillas"
test_file = os.path.join(template_dir, "Lease.docx")

def ignore_image(image):
    return []

with open(test_file, "rb") as docx_file:
    result = mammoth.convert_to_html(docx_file, convert_image=ignore_image)
    html = result.value
    md = markdownify.markdownify(html, heading_style="ATX")
    
    print("=== LEASE.DOCX TEXT PREVIEW ===")
    print(md[:1500])
