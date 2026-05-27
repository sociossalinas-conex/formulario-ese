import os
import re
import mammoth
import markdownify

def ignore_image(image):
    return []

def to_snake_case(text):
    # Strip markdown formatting
    text = re.sub(r"\*\*|\*|__|_|#|`", "", text)
    # Strip leading/trailing whitespace
    text = text.strip()
    # Normalize characters: replace accents, etc.
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u',
        'ñ': 'n', 'Ñ': 'n',
        ':': '', '?': '', '¿': '', '(': '', ')': '', '/': '_', '-': '_'
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    # Replace non-word chars with spaces
    text = re.sub(r"[^\w\s]", " ", text)
    # Replace multiple spaces/underscores with a single underscore
    text = re.sub(r"[\s_]+", "_", text)
    # Lowercase
    text = text.lower().strip("_")
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
        if raw.lower() in ["image", "", " ", "x"]:
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
            # Let's process pairs of cells
            modified = False
            for i in range(1, len(parts) - 1):
                cell_content = parts[i].strip()
                # If cell i contains text (label) and cell i+1 is empty or only whitespace/underscores/brackets
                if cell_content and i + 1 < len(parts) - 1:
                    next_cell_content = parts[i+1].strip()
                    # Clean label to check if it's a realistic short label
                    clean_lbl = re.sub(r"\*\*|\*|__|_|#|`", "", cell_content).strip()
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

template_dir = r"c:\Users\anton\OneDrive\Documentos\Antigravity\Formulario Captura Final\Plantillas"
test_file = os.path.join(template_dir, "Lease.docx")

with open(test_file, "rb") as docx_file:
    result = mammoth.convert_to_html(docx_file, convert_image=ignore_image)
    html = result.value
    md = markdownify.markdownify(html, heading_style="ATX")
    standardized_md = standardize_markdown(md)
    
    print("=== STANDARDIZED LEASE.DOCX ===")
    print(standardized_md[:1500])
