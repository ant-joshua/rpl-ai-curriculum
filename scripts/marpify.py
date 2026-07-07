#!/usr/bin/env python3
"""Convert RPL session markdown to Marp slide deck.
Usage: python3 scripts/marpify.py <module-dir> [output-file]
If no output, writes to slides/<module-dir>/ sesi-XX.md
"""

import os, sys, re

def convert_session(in_path, out_path, module_name, session_num, session_title):
    with open(in_path, 'r') as f:
        content = f.read()
    
    # Frontmatter
    frontmatter = f"""---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — {module_name}"
footer: "Sesi {session_num}: {session_title}"
---

"""
    
    lines = content.split('\n')
    out_lines = []
    
    # Remove banner image line (first line usually)
    content_cleaned = content
    if content_cleaned.startswith('<img'):
        # Remove the banner line
        first_nl = content_cleaned.index('\n')
        content_cleaned = content_cleaned[first_nl+1:]
    
    # Replace headers
    # # Title becomes slide start
    # ## Subtitle becomes bullet section
    # ### Sub-sub becomes normal
    
    blocks = []
    current_block = []
    
    for line in content_cleaned.split('\n'):
        if line.startswith('# ') and any(current_block):
            blocks.append('\n'.join(current_block))
            current_block = [line]
        elif line.strip() == '---' and any(current_block):
            blocks.append('\n'.join(current_block))
            current_block = ['---']
        else:
            current_block.append(line)
    
    if any(current_block):
        blocks.append('\n'.join(current_block))
    
    # Process: each # header becomes a new slide (unless it's the first)
    result_parts = []
    first_slide = True
    
    for block in blocks:
        if block.startswith('# '):
            if first_slide:
                # Title slide
                result_parts.append(f"<!-- _class: title -->\n{block}")
                first_slide = False
            else:
                result_parts.append(f"\n---\n\n{block}")
        elif block.strip() == '---':
            result_parts.append('\n---')
        else:
            result_parts.append(block)
    
    marp_content = frontmatter + '\n'.join(result_parts)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w') as f:
        f.write(marp_content)
    
    return True

if __name__ == '__main__':
    base = '/home/midory/rpl-ai-curriculum'
    mods = sorted([d for d in os.listdir(base) if re.match(r'^\d{2}', d) and os.path.isdir(os.path.join(base, d))])
    
    for m in mods:
        mdir = os.path.join(base, m)
        # Read module name from README
        readme = os.path.join(mdir, 'README.md')
        module_name = m
        if os.path.exists(readme):
            with open(readme) as f:
                first_line = f.readline().strip()
                # Extract module name after #
                mname = re.sub(r'^#+\s*', '', first_line)
                if mname:
                    module_name = mname[:60]
        
        # Find session files
        sessions = sorted([f for f in os.listdir(mdir) if re.match(r'^\d{2}', f) and f.endswith('.md')])
        
        for sf in sessions:
            sname = re.sub(r'\.md$', '', sf)
            # Extract session number and title
            smatch = re.match(r'(\d{2})[- ](.+)', sname)
            if smatch:
                snum = smatch.group(1)
                stitle = smatch.group(2).replace('-', ' ').title()
            else:
                snum = '00'
                stitle = sname
            
            in_path = os.path.join(mdir, sf)
            out_dir = os.path.join(base, 'slides', m)
            out_path = os.path.join(out_dir, f'{snum}-{stitle.lower().replace(" ", "-")}.md')
            
            try:
                convert_session(in_path, out_path, module_name, snum, stitle)
                print(f"✅ {m}/{sf} → {out_path}")
            except Exception as e:
                print(f"❌ {m}/{sf}: {e}")
    
    print("\n=== DONE ===")
