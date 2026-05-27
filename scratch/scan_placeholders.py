import mammoth
import markdownify
import os
import re

template_dir = r"c:\Users\anton\OneDrive\Documentos\Antigravity\Formulario Captura Final\Plantillas"
files = [f for f in os.listdir(template_dir) if f.endswith(".docx")]

def ignore_image(image):
    return []

# Scan files and look for any placeholders in brackets [ ... ], braces {{ ... }} or others
for fname in files:
    test_file = os.path.join(template_dir, fname)
    try:
        with open(test_file, "rb") as docx_file:
            result = mammoth.convert_to_html(docx_file, convert_image=ignore_image)
            html = result.value
            md = markdownify.markdownify(html, heading_style="ATX")
            
            # Look for [] or {{}}
            braced = re.findall(r"\{\{.*?\}\}", md)
            # Find bracketed items but filter out common markdown table/link patterns
            bracketed = re.findall(r"\[[^\]\n]+?\]", md)
            bracketed = [b for b in bracketed if b not in ["[ ]", "[x]", "[IMAGE]"]]
            
            if braced or bracketed:
                print(f"File: {fname}")
                if braced:
                    print(f"  Braced: {braced[:10]}")
                if bracketed:
                    print(f"  Bracketed: {bracketed[:10]}")
    except Exception as e:
        print(f"Error reading {fname}: {e}")
