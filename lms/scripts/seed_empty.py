#!/usr/bin/env python3
"""Seed content blocks for the 2 offerings still empty."""
import json, subprocess, shlex

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

# Find offerings without content
empty = d1("""
    SELECT co.id, co.name, co.course_id, c.title as course_title
    FROM course_offerings co
    JOIN courses c ON c.id = co.course_id
    WHERE co.status = 'active'
    AND co.id NOT IN (SELECT DISTINCT course_offering_id FROM content_blocks)
    ORDER BY co.name
""")
print(f"Empty offerings: {len(empty)}")
for e in empty:
    print(f"  {e['name']} (course: {e['course_title']})")

for e in empty:
    co_id = e["id"]
    c_id = e["course_id"]
    name = e["name"]
    
    sql = f"""
INSERT OR IGNORE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at, course_offering_id, course_id, parent_id, slug, subtitle, duration_min, is_optional, unlock_days, weight, due_date, source_id, tenant_id)
VALUES ('{__import__('uuid').uuid4().hex}', 'text', '📖 Pengantar {name}', '<p>Selamat datang di <strong>{name}</strong>!</p><p>Modul ini akan membahas konsep-konsep penting yang perlu kamu kuasai.</p>', NULL, NULL, 0, 0, 'published', NULL, datetime('now'), datetime('now'), 'default');
INSERT OR IGNORE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at, course_offering_id, course_id, parent_id, slug, subtitle, duration_min, is_optional, unlock_days, weight, due_date, source_id, tenant_id)
VALUES ('{__import__('uuid').uuid4().hex}', 'text', '🎯 Tujuan Pembelajaran', '<h3>Tujuan Pembelajaran</h3><ul><li>Memahami konsep dasar <strong>{name}</strong></li><li>Mampu menerapkan dalam project nyata</li><li>Siap melanjutkan ke modul berikutnya</li></ul>', NULL, NULL, 1, 0, 'published', NULL, datetime('now'), datetime('now'), 'default');
INSERT OR IGNORE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at, course_offering_id, course_id, parent_id, slug, subtitle, duration_min, is_optional, unlock_days, weight, due_date, source_id, tenant_id)
VALUES ('{__import__('uuid').uuid4().hex}', 'text', '📚 Materi & Referensi', '<p>Materi lengkap akan segera ditambahkan.</p>', NULL, NULL, 2, 0, 'published', NULL, datetime('now'), datetime('now'), 'default');
"""
    r = subprocess.run(
        f"cd /home/midory/rpl-ai-curriculum/lms && CLOUDFLARE_ACCOUNT_ID=32b2efbe93d68a826eb2f250e9bb7df6 npx wrangler d1 execute rpl-ai-lms-db --remote --command {shlex.quote(sql)}",
        shell=True, capture_output=True, text=True, timeout=30
    )
    print(f"  {name}: {'OK' if r.returncode == 0 else r.stderr[:100]}")

print("\nDone!")
