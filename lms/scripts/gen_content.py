#!/usr/bin/env python3
"""Generate content_blocks seed SQL for existing course_offerings.

Strategy: for each course_offering that has NO content_blocks yet,
insert a few intro blocks to make courses functional.
Uses real DB IDs — no mapping needed.
"""
import re, json, subprocess, shlex, sys

def d1(sql):
    r = subprocess.run(
        f"cd /home/midory/rpl-ai-curriculum/lms && CLOUDFLARE_ACCOUNT_ID=32b2efbe93d68a826eb2f250e9bb7df6 npx wrangler d1 execute rpl-ai-lms-db --remote --json --command {shlex.quote(sql)}",
        shell=True, capture_output=True, text=True, timeout=30
    )
    if r.returncode != 0:
        print(f"SQL WARN: {r.stderr[:200]}")
    try:
        data = json.loads(r.stdout)
        return data[0]["results"] if data else []
    except:
        return []

# 1. Get course_offerings that have NO content_blocks
cos_without_content = d1("""
    SELECT co.id, co.name, co.course_id, c.title as course_title
    FROM course_offerings co
    JOIN courses c ON c.id = co.course_id
    WHERE co.status = 'active'
    AND co.id NOT IN (SELECT DISTINCT course_offering_id FROM content_blocks)
    ORDER BY co.name
""")
print(f"Course offerings without content: {len(cos_without_content)}")
for co in cos_without_content[:5]:
    print(f"  {co['name'][:50]:<50} (course: {co['course_title'][:30]})")

if not cos_without_content:
    # Check how many have content
    count = d1("SELECT COUNT(*) as cnt FROM content_blocks")
    print(f"Total content_blocks: {count[0]['cnt'] if count else '?'}")
    sys.exit(0)

# 2. For each offering without content, insert intro blocks
# Use simple INSERT OR IGNORE
import uuid

lines = []
for co in cos_without_content:
    co_id = co["id"]
    c_id = co["course_id"]
    name = co["name"]
    
    # Block 1: Intro/Overview
    block_id = str(uuid.uuid4())
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')[:40] + '-intro'
    
    lines.append(f"""
INSERT OR IGNORE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at, course_offering_id, course_id, parent_id, slug, subtitle, duration_min, is_optional, unlock_days, weight, due_date, source_id, tenant_id)
VALUES (
  '{block_id}',
  'text',
  '📖 Pengantar {name.replace(chr(39), chr(39)*2)}',
  '<p>Selamat datang di <strong>{name.replace(chr(39), chr(39)*2)}</strong>!</p>
<p>Modul ini akan membahas konsep-konsep penting yang perlu kamu kuasai.</p>
<p>Silakan mulai belajar dan jangan ragu untuk bertanya jika ada yang kurang jelas.</p>',
  NULL,
  NULL,
  0,
  0,
  'published',
  NULL,
  datetime('now'),
  datetime('now'),
  'default'
);""")

    # Block 2: Tujuan Pembelajaran  
    block_id2 = str(uuid.uuid4())
    slug2 = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')[:40] + '-tujuan'
    
    lines.append(f"""
INSERT OR IGNORE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at, course_offering_id, course_id, parent_id, slug, subtitle, duration_min, is_optional, unlock_days, weight, due_date, source_id, tenant_id)
VALUES (
  '{block_id2}',
  'text',
  '🎯 Tujuan Pembelajaran',
  '<h3>Tujuan Pembelajaran</h3>
<ul>
  <li>Memahami konsep dasar <strong>{name.replace(chr(39), chr(39)*2)}</strong></li>
  <li>Mampu menerapkan dalam project nyata</li>
  <li>Siap melanjutkan ke modul berikutnya</li>
</ul>',
  NULL,
  NULL,
  1,
  0,
  'published',
  NULL,
  datetime('now'),
  datetime('now'),
  'default'
);""")

    # Block 3: Link referensi
    block_id3 = str(uuid.uuid4())
    slug3 = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')[:40] + '-materi'
    
    lines.append(f"""
INSERT OR IGNORE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at, course_offering_id, course_id, parent_id, slug, subtitle, duration_min, is_optional, unlock_days, weight, due_date, source_id, tenant_id)
VALUES (
  '{block_id3}',
  'text',
  '📚 Materi & Referensi',
  '<p>Materi lengkap akan segera ditambahkan. Untuk sementara, silakan pelajari melalui sumber berikut:</p>
<ul>
  <li>Dokumentasi resmi</li>
  <li>Video tutorial di platform pembelajaran</li>
  <li>Latihan praktik mandiri</li>
</ul>',
  NULL,
  NULL,
  2,
  0,
  'published',
  NULL,
  datetime('now'),
  datetime('now'),
  'default'
);""")

output = "\n".join(lines)
with open("/home/midory/rpl-ai-curriculum/lms/migrations/content_blocks_quick.sql", "w") as f:
    f.write("-- Quick content blocks for offerings without content\n")
    f.write(output)
    f.write("\n-- END\n")

print(f"\nGenerated {len(lines)} INSERTs")
print("Done!")
