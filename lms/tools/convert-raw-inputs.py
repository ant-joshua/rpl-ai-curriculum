#!/usr/bin/env python3
"""Replace raw HTML <input>/<select>/<textarea>/<button> with Svelte components in admin pages.

Conservative approach: only targets clearly safe replacement patterns.
Leaves complex cases (JS strings, DataTable cell renderers, template literals) alone.
"""

import re
import glob

ADMIN_DIR = "/home/midory/rpl-ai-curriculum/lms/src/routes/(backoffice)/admin"
SKIP_TYPES = {'checkbox', 'radio', 'date', 'time', 'file', 'number', 'password'}


def find_files():
    return sorted(glob.glob(f"{ADMIN_DIR}/**/+page.svelte", recursive=True)) + \
           sorted(glob.glob(f"{ADMIN_DIR}/**/+layout.svelte", recursive=True)) + \
           sorted(glob.glob(f"{ADMIN_DIR}/**/+error.svelte", recursive=True))


def get_import_info(content):
    """Find $lib/components/ui import line."""
    m = re.search(
        r"import\s*\{([^}]+)\}\s*from\s*['\"]\$lib/components/ui(?:/index\.js)?['\"]\s*;",
        content
    )
    if m:
        comps = set(c.strip() for c in m.group(1).split(',') if c.strip())
        return m.group(0), m.start(), m.end(), comps
    return None, None, None, None


def add_missing_imports(content, needed):
    """Add needed component names to existing import."""
    orig, start, end, existing = get_import_info(content)
    if orig is None:
        return content
    missing = needed - existing
    if not missing:
        return content
    all_comps = sorted(existing | missing)
    # Preserve original style
    suffix = '/index.js' if '/index.js' in orig else ''
    new_line = f"import {{ {', '.join(all_comps)} }} from '$lib/components/ui{suffix}';"
    return content[:start] + new_line + content[end:]


def is_js_string(line):
    """Quick check: True if line looks like it's inside a JS template/string literal."""
    return bool(re.search(r'\breturn\s*[`"\']', line)) or \
           bool(re.search(r'html\s*\+?=\s*[`"\']', line)) or \
           bool(re.search(r'`<button', line)) or \
           bool(re.search(r"'<button", line)) or \
           bool(re.search(r"`<input", line)) or \
           bool(re.search(r"'<select", line))


def count_backticks_before(lines, idx):
    """Count backticks in lines up to idx (exclusive)."""
    text = '\n'.join(lines[:idx])
    return text.count('`') % 2 == 1


def html_entity_decode(s):
    s = s.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    s = s.replace('&quot;', '"').replace('&#39;', "'").replace('&#10;', ' ')
    s = s.replace('&nbsp;', ' ')
    # Remove remaining entity refs
    s = re.sub(r'&[a-z]+\d*;', '', s)
    return s.strip()


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)


def get_label_text(new_lines):
    """Check if last line is a <label> and return its text, or None."""
    if not new_lines:
        return None
    last = new_lines[-1]
    m = re.search(r'<label\s+for\s*=\s*["\'][^"\']+["\']\s*>\s*(.+?)\s*</label>', last)
    if m:
        text = html_entity_decode(strip_tags(m.group(1)))
        if text:
            return text
    return None


def replace_inputs(content):
    """Replace <input> with <Input>, skipping types in SKIP_TYPES."""
    lines = content.split('\n')
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.search(r'(?<!<)<input\b', line) and not re.search(r'<Input\b', line):
            if is_js_string(line) or count_backticks_before(lines, i):
                out.append(line)
                i += 1
                continue

            # Check type
            t = re.search(r'type\s*=\s*["\']([^"\']+)["\']', line)
            input_type = t.group(1) if t else 'text'
            if input_type in SKIP_TYPES:
                out.append(line)
                i += 1
                continue

            # Label
            label = get_label_text(out)
            if label:
                out.pop()

            # Label on same line as <input>?
            if not label:
                lm = re.search(r'<label[^>]*>\s*(.+?)\s*</label>\s*<input', line)
                if lm:
                    label = html_entity_decode(strip_tags(lm.group(1)))
                    if label:
                        line = re.sub(r'<label[^>]*>.*?</label>\s*', '', line)

            attrs = []
            if input_type != 'text':
                attrs.append(f'type="{input_type}"')
            if label:
                # i18n expression like {t('admin.foo')} needs single braces
                if '{' in label and '}' in label and label.strip().startswith('{') and label.strip().endswith('}'):
                    # Already looks like an expression
                    attrs.append(f'label={label.strip()}')
                else:
                    attrs.append(f'label="{label}"')

            bv = re.search(r'bind:value\s*=\s*\{([^}]+)\}', line)
            if bv:
                attrs.append(f'bind:value={{{bv.group(1)}}}')
            if not bv:
                vl = re.search(r'(?<!bind:)\bvalue\s*=\s*(\{[^}]+\}|"[^"]+")', line)
                if vl:
                    attrs.append(f'value={vl.group(1)}')

            ph = re.search(r'placeholder\s*=\s*["\']([^"\']+)["\']', line)
            if ph:
                attrs.append(f'placeholder="{ph.group(1)}"')

            if re.search(r'\bdisabled\b', line):
                attrs.append('disabled')
            if re.search(r'\brequired\b', line):
                attrs.append('required')

            # id only if no label
            idm = re.search(r'\bid\s*=\s*["\']([^"\']+)["\']', line)
            if idm and not label:
                attrs.append(f'id="{idm.group(1)}"')

            # class - keep non-generic
            cm = re.search(r'class\s*=\s*["\']([^"\']+)["\']', line)
            if cm:
                cv = cm.group(1).strip()
                generic = {'input', 'form-input', 'pg-input', 'pp-input',
                           'input-field', 'input-disabled', 'filter-input'}
                if cv and cv not in generic:
                    if '-' in cv or '[' in cv:  # Tailwind-like
                        attrs.append(f'class="{cv}"')

            oi = re.search(r'\boninput\s*=\s*(\{[^}]+\})', line)
            if oi:
                attrs.append(f'oninput={oi.group(1)}')
            oc = re.search(r'\bonchange\s*=\s*(\{[^}]+\})', line)
            if oc:
                attrs.append(f'onchange={oc.group(1)}')

            out.append(f'<Input {" ".join(attrs)} />')
        else:
            out.append(line)
        i += 1
    return '\n'.join(out)


def replace_textareas(content):
    """Replace <textarea> with <Textarea>."""
    lines = content.split('\n')
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.search(r'(?<!<)<textarea\b', line) and not re.search(r'<Textarea\b', line):
            if is_js_string(line) or count_backticks_before(lines, i):
                out.append(line)
                i += 1
                continue

            # Collect multi-line
            full = line
            while not re.search(r'</textarea>', full) and i + 1 < len(lines):
                i += 1
                full += '\n' + lines[i]

            label = get_label_text(out)
            if label:
                out.pop()

            attrs = []
            if label:
                if '{' in label and '}' in label and label.strip().startswith('{') and label.strip().endswith('}'):
                    attrs.append(f'label={label.strip()}')
                else:
                    attrs.append(f'label="{label}"')
            ph = re.search(r'placeholder\s*=\s*["\']([^"\']+)["\']', full.replace('\n', ' '))
            if ph:
                attrs.append(f'placeholder="{ph.group(1)}"')
            bv = re.search(r'bind:value\s*=\s*\{([^}]+)\}', full)
            if bv:
                attrs.append(f'bind:value={{{bv.group(1)}}}')
            rm = re.search(r'rows\s*=\s*["\']?(\d+)["\']?', full)
            if rm:
                attrs.append(f'rows={rm.group(1)}')
            if re.search(r'\bdisabled\b', full):
                attrs.append('disabled')
            if re.search(r'\brequired\b', full):
                attrs.append('required')
            idm = re.search(r'\bid\s*=\s*["\']([^"\']+)["\']', full)
            if idm and not label:
                attrs.append(f'id="{idm.group(1)}"')
            cm = re.search(r'class\s*=\s*["\']([^"\']+)["\']', full)
            if cm:
                cv = cm.group(1).strip()
                if cv not in ('form-textarea', 'textarea-field'):
                    attrs.append(f'class="{cv}"')

            out.append(f'<Textarea {" ".join(attrs)} />')
        else:
            out.append(line)
        i += 1
    return '\n'.join(out)


def replace_selects(content):
    """Replace <select> with <Select> where feasible (has bind:value)."""
    lines = content.split('\n')
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.search(r'(?<!<)<select\b', line) and not re.search(r'<Select\b', line):
            if is_js_string(line) or count_backticks_before(lines, i):
                out.append(line)
                i += 1
                continue

            # Collect
            sel = [line]
            while not re.search(r'</select>', sel[-1]) and i + 1 < len(lines):
                i += 1
                sel.append(lines[i])
            full = '\n'.join(sel)

            # Must have bind:value
            bv = re.search(r'bind:value\s*=\s*\{([^}]+)\}', sel[0])
            if not bv:
                out.extend(sel)
                i += 1
                continue

            label = get_label_text(out)
            if label:
                out.pop()

            attrs = []
            if label:
                if '{' in label and '}' in label and label.strip().startswith('{') and label.strip().endswith('}'):
                    attrs.append(f'label={label.strip()}')
                else:
                    attrs.append(f'label="{label}"')
            attrs.append(f'bind:value={{{bv.group(1)}}}')

            oc = re.search(r'\bonchange\s*=\s*(\{[^}]+\})', sel[0])
            if oc:
                attrs.append(f'onchange={oc.group(1)}')

            cm = re.search(r'class\s*=\s*["\']([^"\']+)["\']', sel[0])
            if cm:
                cv = cm.group(1).strip()
                generic = {'filter-select', 'select-input', 'pg-input',
                           'pg-select', 'pp-input', 'input', 'form-input'}
                if cv not in generic:
                    attrs.append(f'class="{cv}"')

            idm = re.search(r'\bid\s*=\s*["\']([^"\']+)["\']', sel[0])
            if idm and not label:
                attrs.append(f'id="{idm.group(1)}"')
            if re.search(r'\brequired\b', sel[0]):
                attrs.append('required')
            if re.search(r'\bdisabled\b', sel[0]):
                attrs.append('disabled')

            # Placeholder option
            ph = re.search(r'<option\s+value\s*=\s*["\']?["\']?\s*disabled\s*>(.*?)</option>',
                           full, re.DOTALL)
            if ph:
                pt = html_entity_decode(strip_tags(ph.group(1))).strip()
                if pt:
                    attrs.append(f'placeholder="{pt}"')

            # Static options
            opts = re.findall(
                r'<option\s+value\s*=\s*["\']([^"\']*)["\'](?:\s+disabled)?\s*>\s*(.*?)\s*</option>',
                full, re.DOTALL)
            if opts and '{#each' not in full:
                items_str = ', '.join(
                    f'{{ value: "{v}", label: "{html_entity_decode(strip_tags(l))}" }}'
                    for v, l in opts
                )
                opt_expr = f'[{items_str}]'
                attrs.append(f'options={{{opt_expr}}}')

            # {#each} pattern
            em = re.search(r'\{#each\s+(\S+)\s+as\s+(\S+)(?:\s*\((\S+)\))?\}', full)
            if em:
                iterable = em.group(1)
                item = em.group(2)
                ob = re.search(r'\{#each[^}]*\}\s*(.*?)\s*\{/each\}', full, re.DOTALL)
                if ob:
                    body = ob.group(1)
                    ov = re.search(r'value\s*=\s*\{([^}]+)\}', body)
                    ol = re.search(r'>\s*(.*?)\s*</option>', body, re.DOTALL)
                    if ov and ol:
                        lab = html_entity_decode(strip_tags(ol.group(1)))
                        attrs.append(
                            f'options={{{iterable}.map(({item}) => ({{ value: {ov.group(1)}, label: "{lab}" }}))}}'
                        )

            out.append(f'<Select {" ".join(attrs)} />')
        else:
            out.append(line)
        i += 1
    return '\n'.join(out)


CLS_MAP = {
    'btn-primary': ('variant', 'primary'),
    'btn-secondary': ('variant', 'secondary'),
    'btn-cancel': ('variant', 'secondary'),
    'btn-danger': ('variant', 'danger'),
    'btn-ghost': ('variant', 'ghost'),
    'btn-sm': ('size', 'sm'),
    'btn-lg': ('size', 'lg'),
    'btn-md': ('size', 'md'),
    'btn': None,  # bare 'btn' means just the base — no variant needed
}


def replace_buttons(content):
    """Replace <button> with <Button> component.
    Skips buttons inside JS template strings.
    Maps btn-primary -> variant="primary", btn-sm -> size="sm", etc.
    """
    lines = content.split('\n')
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        has_open = re.search(r'(?<!<)<button\b', line)
        has_close = re.search(r'</button>', line) and not re.search(r'</Button>', line)

        if has_open or has_close:
            if is_js_string(line) or count_backticks_before(lines, i):
                out.append(line)
                i += 1
                continue

            # Replace tag names
            line = re.sub(r'(?<!<)<button\b', '<Button', line)
            line = re.sub(r'</button>', '</Button>', line)

            # Handle class -> variant/size mapping
            cm = re.search(r'class\s*=\s*["\']([^"\']*)["\']', line)
            if cm:
                cls_val = cm.group(1)
                remaining = cls_val
                new_attrs = []

                # Order matters: variant first, then size
                for cls_name, prop_val in CLS_MAP.items():
                    if cls_name == 'btn':
                        continue  # skip bare 'btn'
                    pattern = r'\b' + re.escape(cls_name) + r'\b\s*'
                    if re.search(pattern, cls_val):
                        remaining = re.sub(pattern, '', remaining)
                        if prop_val is not None:
                            new_attrs.append(f'{prop_val[0]}="{prop_val[1]}"')

                remaining = remaining.strip()
                if remaining:
                    new_attrs.append(f'class="{remaining}"')

                if new_attrs:
                    # Remove old class attribute
                    line = re.sub(r'\s+class\s*=\s*["\'][^"\']*["\']', '', line)
                    # Insert after <Button
                    line = re.sub(
                        r'<Button(?!\s+disabled|\s+loading)',
                        f'<Button {" ".join(new_attrs)}',
                        line
                    )
                    # Also handle case where <Button already has attributes
                    if 'variant=' not in line:
                        pass  # may have been inserted already

            # Handle loading
            if re.search(r'\bloading\b', line) and 'loading' not in line.split('<Button', 1)[1].split('>', 1)[0] if '<Button' in line else False:
                line = re.sub(r'<Button', '<Button loading', line)

            # disabled
            if re.search(r'\bdisabled\b', line):
                if 'disabled' not in line.split('<Button', 1)[1].split('>', 1)[0] if '<Button' in line else False:
                    line = re.sub(r'<Button', '<Button disabled', line)

            out.append(line)
        else:
            out.append(line)
        i += 1
    return '\n'.join(out)


def process_file(fp):
    with open(fp) as f:
        content = f.read()
    orig = content

    # Decide needed components
    raw_input = bool(re.search(r'(?<!<)<input\b', content))
    raw_textarea = bool(re.search(r'(?<!<)<textarea\b', content))
    raw_select = bool(re.search(r'(?<!<)<select\b', content))
    raw_button = bool(re.search(r'(?<!<)<button\b', content))

    needed = set()
    if raw_input:
        needed.add('Input')
    if raw_textarea:
        needed.add('Textarea')
    if raw_select:
        needed.add('Select')
    if raw_button:
        needed.add('Button')

    if needed:
        content = add_missing_imports(content, needed)

    content = replace_inputs(content)
    content = replace_textareas(content)
    content = replace_selects(content)
    content = replace_buttons(content)

    if content != orig:
        with open(fp, 'w') as f:
            f.write(content)
        return True
    return False


def main():
    files = find_files()
    modified = []
    for fp in files:
        try:
            if process_file(fp):
                modified.append(fp)
                print(f"  ✓ {fp.replace(ADMIN_DIR, '...')}")
        except Exception as e:
            import traceback
            print(f"  ✗ {fp.replace(ADMIN_DIR, '...')}: {e}")
            traceback.print_exc()

    print(f"\nTotal admin files: {len(files)}")
    print(f"Modified: {len(modified)}")


if __name__ == '__main__':
    main()
