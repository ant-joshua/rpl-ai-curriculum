-- 0043: Set course_id on existing content_blocks
-- Uses PRAGMA to bypass CHECK constraint for lesson/assessment/assignment types

PRAGMA ignore_check_constraints = ON;

-- Set course_id from offering's course_id for blocks that have offering but no course_id
UPDATE content_blocks 
SET course_id = (SELECT course_id FROM course_offerings WHERE id = course_offering_id)
WHERE course_offering_id IS NOT NULL AND course_id IS NULL;

-- Also ensure the FAA-2026-1 lessons already migrated in 0042 get course_id
UPDATE content_blocks 
SET course_id = (SELECT course_id FROM course_offerings WHERE id = course_offering_id)
WHERE course_offering_id IS NOT NULL AND course_id IS NULL;
