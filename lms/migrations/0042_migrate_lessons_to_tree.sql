-- Phase 2: Migrate lessons → content_blocks tree (v2)
PRAGMA ignore_check_constraints = ON;

-- 2a: Insert lessons as content_block nodes
-- source_id stores the lessons.id for backlinking children
INSERT OR IGNORE INTO content_blocks (id, course_offering_id, parent_id, type, title, slug, order_index, visibility, duration_min, is_optional, unlock_days, body, body_html, source_id)
SELECT
  lower(hex(randomblob(16))) as id,
  l.course_offering_id,
  NULL as parent_id,
  'lesson' as type,
  l.title,
  l.slug,
  l.order_index,
  l.status as visibility,
  COALESCE(l.duration_minutes, 0) as duration_min,
  l.is_optional,
  l.unlock_days,
  cb.body,
  cb.body_html,
  l.id as source_id  -- ← lessons.id, for linking children
FROM lessons l
LEFT JOIN content_blocks cb ON cb.id = l.content_block_id
WHERE NOT EXISTS (
  SELECT 1 FROM content_blocks cbt
  WHERE cbt.slug = l.slug AND cbt.course_offering_id = l.course_offering_id AND cbt.type = 'lesson'
);

-- 2b: Set course_offering_id on existing child blocks (from junction)
UPDATE content_blocks
SET course_offering_id = (
  SELECT l.course_offering_id
  FROM lesson_content_blocks lcb
  JOIN lessons l ON l.id = lcb.lesson_id
  WHERE lcb.content_block_id = content_blocks.id
  LIMIT 1
)
WHERE course_offering_id IS NULL
AND id IN (SELECT content_block_id FROM lesson_content_blocks);

-- 2c: Set parent_id for leaf blocks (children of lessons)
-- Match via source_id = lcb.lesson_id
UPDATE content_blocks
SET parent_id = (
  SELECT cb_lesson.id
  FROM lesson_content_blocks lcb
  JOIN content_blocks cb_lesson ON cb_lesson.source_id = lcb.lesson_id
  WHERE lcb.content_block_id = content_blocks.id
    AND cb_lesson.type = 'lesson'
    AND (cb_lesson.course_offering_id = content_blocks.course_offering_id OR cb_lesson.course_offering_id IS NULL)
  LIMIT 1
)
WHERE parent_id IS NULL
AND id IN (SELECT content_block_id FROM lesson_content_blocks);
