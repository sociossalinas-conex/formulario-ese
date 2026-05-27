import os
import re
import mammoth
import markdownify

def ignore_image(image):
    return []

def to_snake_case(text):
    # Strip markdown formatting
    text = re.sub(r"\*\*|\*|__|_|#|`|:", "", text)
    # Strip leading/trailing whitespace
    text = text.strip()
    # Normalize characters: replace accents, etc.
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u',
        'ñ': 'n', 'Ñ': 'n',
        'ü': 'u', 'Ü': 'u',
        '?': '', '¿': '', '(': '', ')': '', '/': '_', '-': '_', '.': '', ',': ''
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    # Replace non-word chars with spaces
    text = re.sub(r"[^\w\s]", " ", text)
    # Replace multiple spaces/underscores with a single underscore
    text = re.sub(r"[\s_]+", "_", text)
    # Lowercase
    text = text.lower().strip("_")
    
    # Precise dictionary translation to match exact form field IDs worked on in the form
    mappings = {
        'nombre_completo': 'nombre',
        'nombre_del_candidato': 'nombre',
        'nombre_del_prospecto': 'nombre',
        'fecha_de_visita': 'fecha_visita',
        'fecha_de_visita_domiciliaria': 'fecha_visita',
        'fecha_nacimiento': 'fecha_nacimiento',
        'fecha_de_nacimiento': 'fecha_nacimiento',
        'lugar_nacimiento': 'lugar_nacimiento',
        'lugar_de_nacimiento': 'lugar_nacimiento',
        'estado_de_nacimiento': 'lugar_nacimiento',
        'estado_nacimiento': 'lugar_nacimiento',
        'genero': 'genero',
        'sexo': 'genero',
        'estado_civil': 'estado_civil',
        'curp': 'curp',
        'rfc': 'rfc',
        'edad': 'edad',
        'telefono_de_casa': 'telefono_casa',
        'telefono_casa': 'telefono_casa',
        'telefono_de_recados': 'telefono_recados',
        'telefono_recados': 'telefono_recados',
        'telefono_para_recados': 'telefono_recados',
        'celular': 'celular',
        'telefono_celular': 'celular',
        'correo': 'correo',
        'correo_electronico': 'correo',
        'email': 'correo',
        'tipo_de_sangre': 'tipo_sangre',
        'tipo_sangre': 'tipo_sangre',
        'grupo_sanguineo': 'tipo_sangre',
        'licencia': 'licencia',
        'tiene_licencia': 'licencia',
        'tipo_de_licencia': 'tipo_licencia',
        'tipo_licencia': 'tipo_licencia',
        'vencimiento': 'vencimiento_licencia',
        'vencimiento_de_licencia': 'vencimiento_licencia',
        'vencimiento_licencia': 'vencimiento_licencia',
        'contacto_de_emergencia': 'contacto_emergencia',
        'nombre_emergencia': 'emergencia_nombre',
        'emergencia_nombre': 'emergencia_nombre',
        'telefono_emergencia': 'emergencia_telefono',
        'emergencia_telefono': 'emergencia_telefono',
        'nombre_del_padre': 'nombre_padre',
        'nombre_padre': 'nombre_padre',
        'nombre_de_la_madre': 'nombre_madre',
        'nombre_madre': 'nombre_madre'
    }
    
    if text in mappings:
        return mappings[text]
    return text

def standardize_markdown(md_content):
    # Step 1: Normalize existing braced placeholders: {{ Nombre }} -> {{nombre}}
    def replace_braced(match):
        raw = match.group(1)
        return "{{" + to_snake_case(raw) + "}}"
    
    md_content = re.sub(r"\{\{\s*(.*?)\s*\}\}", replace_braced, md_content)
    
    # Step 2: Normalize existing bracketed placeholders: [Nombre] -> {{nombre}}
    # Ignoring links [text](url), images ![alt](url), and checkboxes [ ], [x], [X]
    def replace_bracketed(match):
        raw = match.group(1).strip()
        if raw.lower() in ["image", "", " ", "x", "no", "si", "sí", "buena", "regular", "mala"]:
            return match.group(0)
        return "{{" + to_snake_case(raw) + "}}"
        
    md_content = re.sub(r"(?<!\!)\[\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_\s\-/().]{2,50})\s*\](?!\()", replace_bracketed, md_content)
    
    # Step 3: Handle empty cells in markdown tables
    lines = md_content.split('\n')
    new_lines = []
    
    for line in lines:
        if '|' in line:
            # Check if this is a separator line (e.g., | --- | --- |)
            if re.match(r"^\s*\|(?:\s*:?---*:?\s*\|)+\s*$", line):
                new_lines.append(line)
                continue
                
            parts = line.split('|')
            # Table row format: parts[0] is "", parts[1] is cell 1, parts[2] is cell 2, ..., parts[-1] is ""
            modified = False
            for i in range(1, len(parts) - 1):
                cell_content = parts[i].strip()
                # If cell i contains text (label) and cell i+1 is empty or only whitespace/underscores/brackets
                if cell_content and i + 1 < len(parts) - 1:
                    next_cell_content = parts[i+1].strip()
                    # Clean label to check if it's a realistic short label
                    clean_lbl = re.sub(r"\*\*|\*|__|_|#|`|:", "", cell_content).strip()
                    is_valid_label = (
                        len(clean_lbl) > 1 and 
                        len(clean_lbl) < 60 and 
                        not clean_lbl.startswith("---") and
                        not next_cell_content.startswith("{{") and # not already a placeholder
                        not cell_content.startswith("{{") # label itself shouldn't be a placeholder
                    )
                    
                    # If next cell is empty or has fill indicators (like ____ or [ ] or empty)
                    is_empty_or_fill = (
                        next_cell_content == "" or 
                        re.match(r"^_{2,}$", next_cell_content) or
                        next_cell_content == "[ ]" or
                        next_cell_content == "[]"
                    )
                    
                    if is_valid_label and is_empty_or_fill:
                        snake_id = to_snake_case(cell_content)
                        if snake_id and len(snake_id) > 1:
                            parts[i+1] = f" {{{{{snake_id}}}}} "
                            modified = True
            
            if modified:
                new_lines.append('|'.join(parts))
            else:
                new_lines.append(line)
        else:
            # Outside tables, look for "Label: _____" or "Label: [ ]"
            # We match word labels (2 to 40 chars) ending with colon followed by underscores or empty brackets
            def replace_line_fill(match):
                label_part = match.group(1)
                fill_part = match.group(2)
                snake_id = to_snake_case(label_part)
                return f"{label_part}: {{{{{snake_id}}}}}"
                
            # Pattern: matches **Label**: ______ or Label: ______ or Label: [ ]
            pattern = r"(\*\*?[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-/().]{2,40}\*?)\s*:\s*(_{3,}|\[\s*\])"
            line_sub = re.sub(pattern, replace_line_fill, line)
            new_lines.append(line_sub)
            
    return '\n'.join(new_lines)

def main():
    root_dir = r"c:\Users\anton\OneDrive\Documentos\Antigravity\Formulario Captura Final"
    template_dir = os.path.join(root_dir, "Plantillas")
    output_dir = os.path.join(root_dir, "Plantillas_Markdown")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # List docx files
    files = [f for f in os.listdir(template_dir) if f.endswith(".docx")]
    files.sort()
    
    print(f"Total templates to convert: {len(files)}")
    
    success_count = 0
    error_count = 0
    errors_list = []
    
    for idx, fname in enumerate(files, 1):
        docx_path = os.path.join(template_dir, fname)
        md_name = os.path.splitext(fname)[0] + ".md"
        md_path = os.path.join(output_dir, md_name)
        
        print(f"[{idx}/{len(files)}] Processing: {fname}...")
        
        try:
            with open(docx_path, "rb") as docx_file:
                # Convert docx to HTML ignoring images to prevent corrupt zip/CRC failures
                result = mammoth.convert_to_html(docx_file, convert_image=ignore_image)
                html = result.value
                
                # Convert HTML to Markdown (ATX style)
                md = markdownify.markdownify(html, heading_style="ATX")
                
                # Apply standardization and placeholder normalisation
                standardized_md = standardize_markdown(md)
                
                # Save to disk in UTF-8 to preserve all Spanish accents and nyes
                with open(md_path, "w", encoding="utf-8") as out_file:
                    out_file.write(standardized_md)
                
                success_count += 1
                
        except Exception as e:
            print(f"  [ERROR] Failed to convert {fname}: {e}")
            error_count += 1
            errors_list.append((fname, str(e)))
            
    print("\n=================== CONVERSION SUMMARY ===================")
    print(f"Successfully converted: {success_count}/{len(files)}")
    print(f"Failed: {error_count}/{len(files)}")
    
    # Write a quick log file in scratch or output dir
    log_path = os.path.join(output_dir, "_reporte_conversion.md")
    with open(log_path, "w", encoding="utf-8") as log_file:
        log_file.write("# Reporte de Conversión y Estandarización de Plantillas\n\n")
        log_file.write(f"- **Total de archivos procesados:** {len(files)}\n")
        log_file.write(f"- **Exitosos:** {success_count}\n")
        log_file.write(f"- **Errores:** {error_count}\n\n")
        
        if errors_list:
            log_file.write("## Detalle de Errores\n\n")
            log_file.write("| Archivo | Error |\n")
            log_file.write("| --- | --- |\n")
            for fname, err in errors_list:
                log_file.write(f"| {fname} | {err} |\n")
        else:
            log_file.write("### 🎉 ¡Todos los archivos se convirtieron de forma exitosa y sin errores!\n")
            
    print(f"Report written to: {log_path}")

if __name__ == "__main__":
    main()
