#!/usr/bin/env python3
"""
Replace hardcoded Indonesian text with t('key') calls in Svelte pages.
Safe, targeted replacement using known i18n keys.
Handles duplicate values by preferring context-appropriate keys.
"""

import re
import os
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

I18N_FILE = os.path.join(BASE, 'src', 'lib', 'stores', 'i18n.svelte.ts')

# Build ID->key mapping
val_to_keys = {}
with open(I18N_FILE) as f:
    content = f.read()

idx_id = content.find('id: {')
idx_en = content.find('en: {')
id_section = content[idx_id+5:idx_en]
for m in re.finditer(r"'([\w.]+)':\s*'([^']*)'", id_section):
    key, val = m.group(1), m.group(2)
    if val not in val_to_keys:
        val_to_keys[val] = []
    val_to_keys[val].append(key)

# For duplicate values, choose the best key based on context
def pick_best_key(val, filepath):
    """Pick the most context-appropriate key for a value."""
    keys = val_to_keys[val]
    if len(keys) == 1:
        return keys[0]
    
    rel = filepath.replace(BASE, '').replace('\\', '/')
    
    # Priority by directory context
    if '(backoffice)/admin/' in rel:
        # Prefer admin.*, then common.*
        preferred = [k for k in keys if k.startswith('admin.')]
        if preferred: return preferred[0]
    elif '(backoffice)/guru/' in rel:
        preferred = [k for k in keys if k.startswith('nilai.') or k.startswith('rapor.') or k.startswith('absensi.') or k.startswith('ekstrakurikuler.') or k.startswith('sikap.') or k.startswith('tutor.')]
        if preferred: return preferred[0]
    elif '(backoffice)/bimbel/' in rel:
        preferred = [k for k in keys if k.startswith('finance.') or k.startswith('batch.') or k.startswith('tryout.')]
        if preferred: return preferred[0]
    elif '(backoffice)/siswa/' in rel:
        preferred = [k for k in keys if k.startswith('siswa.')]
        if preferred: return preferred[0]
    
    # Generic preferences
    preferred = [k for k in keys if k.startswith('common.')]
    if preferred: return preferred[0]
    
    return keys[0]


# Build final map: val -> best key for common cases, and use function for context aware
def get_key(val, filepath):
    if val not in val_to_keys:
        return None
    return pick_best_key(val, filepath)


def replace_text_node(m, filepath):
    before = m.group(1)
    text = m.group(2).strip()
    after = m.group(3)
    
    if not text:
        return m.group(0)
    
    # Skip if already wrapped or contains expressions
    if '{' in text or '}' in text:
        return m.group(0)
    
    key = get_key(text, filepath)
    if key:
        return before + "{t('" + key + "')}" + after
    
    return m.group(0)


def replace_attr_value(m, attr, filepath):
    val = m.group(2)
    key = get_key(val, filepath)
    if key:
        return attr + '={' + "t('" + key + "')" + '}'
    return m.group(0)


def replace_prop_value(m, prop, filepath):
    prefix = m.group(1)
    val = m.group(2)
    suffix = m.group(3)
    key = get_key(val, filepath)
    if key:
        # For component props like message="x" -> message={t('key')}
        # Remove the quotes around the value, use Svelte expression syntax
        return prefix.rstrip('"') + '{t(\'' + key + '\')}' + suffix.lstrip('"')
    return m.group(0)


def process_file(filepath, debug=False):
    with open(filepath) as f:
        lines = f.readlines()
    
    in_script = False
    in_style = False
    changes = 0
    file_changes = []
    new_lines = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        orig = line
        
        # Track sections
        if '<script' in stripped and '>' in stripped and not stripped.startswith('</'):
            in_script = True
        if '</script>' in stripped:
            in_script = False
        if '<style' in stripped and '>' in stripped and not stripped.startswith('</'):
            in_style = True
        if '</style>' in stripped:
            in_style = False
        
        if in_script or in_style:
            new_lines.append(line)
            continue
        
        # Only process template section (after </script>, before <style>)
        
        # Replace text nodes between HTML tags
        line = re.sub(
            r'(>)([^<>{]*?)(<)',
            lambda m: replace_text_node(m, filepath),
            line
        )
        
        # Replace attribute values
        for attr in ['placeholder', 'title', 'aria-label']:
            pattern = re.compile(r'(' + re.escape(attr) + r'=)"([^"]*?)"')
            line = pattern.sub(lambda m, a=attr: replace_attr_value(m, a, filepath), line)
        
        # Replace component props (message=, description=, title=, label=)
        line = re.sub(
            r'(message=")([^"]*?)(")',
            lambda m: replace_prop_value(m, 'message', filepath),
            line
        )
        line = re.sub(
            r'(description=")([^"]*?)(")',
            lambda m: replace_prop_value(m, 'description', filepath),
            line
        )
        line = re.sub(
            r'(title=")([^"]*?)(")',
            lambda m: replace_prop_value(m, 'title', filepath),
            line
        )
        
        if line != orig:
            changes += 1
            if debug:
                file_changes.append((i+1, orig.rstrip(), line.rstrip()))
        
        new_lines.append(line)
    
    return ''.join(new_lines), changes, file_changes


def main():
    routes_dir = os.path.join(BASE, 'src', 'routes')
    
    backoffice_files = []
    for root, dirs, files in os.walk(routes_dir):
        if '(backoffice)' not in root:
            continue
        for f in files:
            if f == '+page.svelte':
                fp = os.path.join(root, f)
                with open(fp) as fh:
                    content = fh.read()
                if "from" in content and "i18n" in content:
                    backoffice_files.append(fp)
    
    backoffice_files.sort()
    print("Found %d backoffice files with t() import" % len(backoffice_files), file=sys.stderr)
    
    dry_run = '--dry-run' in sys.argv
    target_subpath = None
    for arg in sys.argv:
        if arg.endswith('.svelte') and not arg.startswith('-'):
            target_subpath = arg
        if arg.startswith('--file='):
            target_subpath = arg.split('=', 1)[1]
    
    total_changes = 0
    total_files = 0
    
    for fp in backoffice_files:
        if target_subpath and target_subpath not in fp:
            continue
        
        new_content, changes, file_changes = process_file(fp, debug=True)
        
        if changes > 0:
            total_changes += changes
            total_files += 1
            rel = os.path.relpath(fp, BASE)
            print("\n%s: %d change(s)" % (rel, changes))
            for ln, old, new in file_changes[:8]:
                print("  L%d: %s" % (ln, old[:90]))
                print("    -> %s" % new[:90])
            if len(file_changes) > 8:
                print("  ... and %d more" % (len(file_changes) - 8))
            
            if not dry_run:
                with open(fp, 'w') as f:
                    f.write(new_content)
    
    print("\n%s: %d files, %d replacements" % 
          ("DRY RUN" if dry_run else "DONE", total_files, total_changes))


if __name__ == '__main__':
    main()
