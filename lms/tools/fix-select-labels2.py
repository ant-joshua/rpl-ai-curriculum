#!/usr/bin/env python3
"""Fix complex Select label expressions: label: "text {expr} text {expr}" -> label: `text ${expr} text ${expr}`"""
import re, glob

ADMIN_DIR = "src/routes/(backoffice)/admin"
files = sorted(glob.glob(f"{ADMIN_DIR}/**/+page.svelte", recursive=True))

for fp in files:
    with open(fp) as f:
        content = f.read()
    orig = content
    
    def fix_label(m):
        inner = m.group(1)
        # Replace all {var} with ${var}
        result = re.sub(r'\{([^}]+)\}', r'${\1}', inner)
        return f'label: `{result}`'
    
    content = re.sub(r'label:\s*"([^"]*\{[^}]+}[^"]*)"', fix_label, content)
    
    if content != orig:
        with open(fp, 'w') as f:
            f.write(content)
        print(f'  Fixed {fp.replace(ADMIN_DIR, "...")}')

print('Done')
