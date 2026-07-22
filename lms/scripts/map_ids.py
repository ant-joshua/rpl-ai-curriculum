#!/usr/bin/env python3
"""Extract content_blocks from 0065_modules_to_db.sql with real DB IDs.

The migration file format is:
  INSERT INTO courses (...) VALUES ('<id>', ...)
  INSERT INTO course_offerings (...) VALUES ('<id>', '<course_id>', ...)
  INSERT INTO content_blocks (...) VALUES (...)

Courses and course_offerings already exist in DB — skip them.
Map migration IDs to real DB IDs by slug (courses) and (name, course_id) (course_offerings).
"""
import re, json, subprocess, shlex

def d1(sql):
    """Run SQL against remote D1, return results list."""
    r = subprocess.run(
        f"cd /home/midory/rpl-ai-curriculum/lms && CLOUDFLARE_ACCOUNT_ID=32b2efbe93d68a826eb2f250e9bb7df6 npx wrangler d1 execute rpl-ai-lms-db --remote --json --command {shlex.quote(sql)}",
        shell=True, capture_output=True, text=True, timeout=30
    )
    if r.returncode != 0:
        print(f"WARN: {r.stderr[:200]}")
    try:
        data = json.loads(r.stdout)
        return data[0]["results"] if data else []
    except:
        return []

# ─── 1. Real DB data ───
real_courses = d1("SELECT id, title, slug FROM courses ORDER BY title")
print(f"Real DB: {len(real_courses)} courses")
real_by_slug = {c["slug"]: c for c in real_courses}

real_cos = d1("SELECT id, name, course_id FROM course_offerings ORDER BY name")
print(f"Real DB: {len(real_cos)} course_offerings")

# ─── 2. Parse migration file ───
with open("/home/midory/rpl-ai-curriculum/lms/migrations/0065_modules_to_db.sql") as f:
    text = f.read()

# Strategy: find blocks. Pattern: course INSERT (header -> VALUES spanning lines), 
# then course_offering INSERT, then repeated content_blocks INSERTs.
# Extract all ID pairs from VALUES clauses.

# Find all "INSERT INTO courses" blocks - extract mig_id and slug
course_pattern = re.compile(
    r"INSERT INTO courses \(id, title, slug[^)]+\)\s*"
    r"VALUES\s*\('[^']+'',[^']+'',\s*'([^']+)'",  # slug is 3rd field
    re.DOTALL
)
# Simpler: find each VALUES line after INSERT INTO courses
lines = text.split("\n")

# Parse course inserts: find INSERT INTO courses, collect VALUES until ;
mig_courses = []
i = 0
while i < len(lines):
    line = lines[i]
    if "INSERT INTO courses (id, title, slug" in line:
        # Collect all lines until we hit a line starting with VALUES or containing ;
        i += 1
        vals_lines = []
        while i < len(lines):
            l = lines[i].strip()
            vals_lines.append(l)
            if ");" in l or l.endswith(";"):
                break
            i += 1
        full = " ".join(vals_lines)
        # Extract values from the VALUES clause
        m = re.search(r"VALUES\s*\(\s*'([^']+)'", full)
        if m:
            mig_id = m.group(1)
            # Find slug - it's the 4th value (after description which is long)
            # Fields: id, title, slug, description, short_description, icon, ...
            parts = re.findall(r"'([^']*)'", full)
            if len(parts) >= 5:
                mig_courses.append({
                    "mig_id": parts[0],
                    "title": parts[1],
                    "slug": parts[2]
                })
    i += 1

print(f"\nParsed {len(mig_courses)} course inserts from migration")

# Build mapping: migration course_id -> real course_id (by slug match)
mig_cid_to_real = {}
for mc in mig_courses:
    real = real_by_slug.get(mc["slug"])
    if real:
        mig_cid_to_real[mc["mig_id"]] = real["id"]
    else:
        print(f"  WARN: No real course for slug '{mc['slug']}'")

# Parse course_offering inserts
mig_cos = []
i = 0
while i < len(lines):
    line = lines[i]
    if "INSERT INTO course_offerings (id, course_id, name" in line:
        i += 1
        vals_lines = []
        while i < len(lines):
            l = lines[i].strip()
            vals_lines.append(l)
            if ");" in l or l.endswith(";"):
                break
            i += 1
        full = " ".join(vals_lines)
        parts = re.findall(r"'([^']*)'", full)
        if len(parts) >= 3:
            mig_cos.append({
                "mig_id": parts[0],
                "course_id": parts[1],
                "name": parts[2]
            })
    i += 1

print(f"Parsed {len(mig_cos)} course_offering inserts")

# Map migration co_id -> real co_id by (name, real_course_id)
mig_coid_to_real = {}
for mco in mig_cos:
    real_cid = mig_cid_to_real.get(mco["course_id"])
    if not real_cid:
        continue
    found = [rc for rc in real_cos if rc["name"] == mco["name"] and rc["course_id"] == real_cid]
    if found:
        mig_coid_to_real[mco["mig_id"]] = found[0]["id"]
    else:
        # Try matching just by name
        found2 = [rc for rc in real_cos if rc["name"] == mco["name"]]
        if found2:
            mig_coid_to_real[mco["mig_id"]] = found2[0]["id"]
            print(f"  NOTE: CO '{mco['name']}' matched by name only (course_id mismatch)")

print(f"Matched: {len(mig_coid_to_real)}/{len(mig_cos)} course_offerings")
unmapped_cos = [mco for mco in mig_cos if mco["mig_id"] not in mig_coid_to_real]
if unmapped_cos:
    print(f"  Unmapped examples:")
    for uco in unmapped_cos[:5]:
        print(f"    {uco['name']} (course={uco['course_id'][:12]}...)")

# ─── 3. Extract content_blocks with ID rewriting ───
cb_lines = []
i = 0
output_lines = []
in_cb_header = False
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    if "INSERT INTO content_blocks (id, type, title" in line:
        # Skip header — will prepend custom header at end
        in_cb_header = True
        i += 1
        continue
    
    if in_cb_header and stripped.startswith("VALUES"):
        # Collect all value lines until ;
        vals_sections = []
        while i < len(lines):
            l = lines[i]
            vals_sections.append(l)
            if ");" in l or l.rstrip().endswith(";"):
                i += 1
                break
            i += 1
        full = " ".join(vals_sections)
        parts = re.findall(r"'([^']*)'", full)
        if len(parts) >= 12:
            mig_co_id = parts[5]  # course_offering_id
            mig_c_id = parts[6]   # course_id
            real_co_id = mig_coid_to_real.get(mig_co_id, mig_co_id)
            real_c_id = mig_cid_to_real.get(mig_c_id, mig_c_id)
            
            # Rewrite IDs in the full value string
            new_full = full
            if real_co_id != mig_co_id:
                new_full = new_full.replace(f"'{mig_co_id}'", f"'{real_co_id}'")
            if real_c_id != mig_c_id:
                new_full = new_full.replace(f"'{mig_c_id}'", f"'{real_c_id}'")
            
            # Reconstruct line
            if ";" not in new_full.rstrip().rstrip(";"):
                new_full += ";"
            output_lines.append("  " + new_full.strip())
        else:
            output_lines.extend(vals_sections)
        in_cb_header = False
        continue
    
    # Skip course/course_offering INSERTs
    if "INSERT INTO courses (id, title, slug" in line:
        # Skip until ;
        while i < len(lines):
            if ");" in lines[i] or lines[i].rstrip().endswith(";"):
                i += 1
                break
            i += 1
        continue
    
    if "INSERT INTO course_offerings (id, course_id, name" in line:
        while i < len(lines):
            if ");" in lines[i] or lines[i].rstrip().endswith(";"):
                i += 1
                break
            i += 1
        continue
    
    i += 1

print(f"\nOutput: {len(output_lines)} content_blocks lines")

# Add header
header = "INSERT OR IGNORE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at, course_offering_id, course_id, parent_id, slug, subtitle, duration_min, is_optional, unlock_days, weight, due_date, source_id, tenant_id)\n"
final_sql = header + "\n".join(output_lines) + "\n"

with open("/home/midory/rpl-ai-curriculum/lms/migrations/content_blocks_seed.sql", "w") as f:
    f.write("-- Auto-generated content_blocks seed with real DB IDs\n")
    f.write(final_sql)

print(f"Written {len(output_lines)} INSERTs")
print("Done!")
