#!/usr/bin/env python3
"""Fix i18n label expressions that got double-braced or quoted-string wrapped."""
import re, glob

ADMIN_DIR = "/home/midory/rpl-ai-curriculum/lms/src/routes/(backoffice)/admin"
files = sorted(glob.glob(f"{ADMIN_DIR}/**/+page.svelte", recursive=True))

for fp in files:
    with open(fp) as f:
        content = f.read()
    orig = content

    # Fix label={{t(...)}} -> label={t(...)}
    content = re.sub(r'label=\{\{(t\([^)]+\))\}\}', r'label={\1}', content)
    
    # Fix label="{t(...)}" -> label={t(...)}
    content = re.sub(r'label="\{(t\([^)]+\))\}"', r'label={\1}', content)
    
    # Fix options labels: "{t(...)}" -> {t(...)} inside options arrays
    # This is harder - labels inside options arrays that are strings containing {t(...)}
    # We need to find: label: "{t('foo')}" and change to label: {t('foo')}
    # But we need to be careful about already-correct options
    
    # Fix label inside Select options: "{t(...)}" -> {t(...)}
    content = re.sub(r'label:\s*"\{(\s*t\([^)]+\)\s*)\}"', r'label: {\1}', content)
    
    # Fix label inside options: "{m.name}" -> m.name (for #each patterns)
    content = re.sub(r'label:\s*"\{(\s*m[a-zA-Z]*(?:\.\w+)+)\}"', r'label: \1', content)
    
    if content != orig:
        with open(fp, 'w') as f:
            f.write(content)
        print(f"  ✓ {fp.replace(ADMIN_DIR, '...')}")

print("Done")
