-- Populate lesson_content_blocks junction from existing lessons.content_block_id FK
-- Enables multiple content blocks per lesson (text+video+quiz etc in one lesson)

INSERT OR IGNORE INTO lesson_content_blocks (id, lesson_id, content_block_id, order_index, type_override)
SELECT
	lower(hex(randomblob(16))) as id,
	l.id as lesson_id,
	l.content_block_id,
	l.order_index * 10 as order_index,  -- slot room between lessons
	NULL as type_override
FROM lessons l
WHERE l.content_block_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM lesson_content_blocks lcb
    WHERE lcb.lesson_id = l.id AND lcb.content_block_id = l.content_block_id
  );
