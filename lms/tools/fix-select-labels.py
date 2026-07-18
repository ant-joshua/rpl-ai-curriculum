#!/usr/bin/env python3
"""Fix remaining Select options labels wrapped in quotes: label: "{expr}" -> label: expr"""
import re, glob

ADMIN_DIR = "src/routes/(backoffice)/admin"
files = sorted(glob.glob(f"{ADMIN_DIR}/**/+page.svelte", recursive=True))

for fp in files:
    with open(fp) as f:
        content = f.read()
    orig = content

    # Fix label: "{expression}" -> label: expression
    # Match: label: "{" then some text ending with "}"
    # We need to handle:
    #   label: "{v}" -> label: v
    #   label: "{v.name}" -> label: v.name  
    #   label: "{v.name} ({v.code || '-'})" -> label: `${v.name} (${v.code || '-'})`
    
    def fix_label(m):
        inner = m.group(1)
        # Replace {var} with ${var} for template literal
        # Find all {...} inside the label
        parts = re.split(r'(\{[^}]+\})', inner)
        new_parts = []
        for p in parts:
            if p.startswith('{') and p.endswith('}'):
                # JS expression
                new_parts.append('${' + p[1:-1] + '}')
            else:
                new_parts.append(p)
        result = ''.join(new_parts)
        # If there were substitutions, use backtick template literal
        if '${' in result:
            return f'label: `{result}`'
        else:
            # Simple expression, no string interpolation needed
            return f'label: {result}'
    
    content = re.sub(r'label:\s*"\{([^}]+)\}"', fix_label, content)
    
    if content != orig:
        with open(fp, 'w') as f:
            f.write(content)
        print(f'  Fixed {fp.replace(ADMIN_DIR, "...")}')

print('Done')
