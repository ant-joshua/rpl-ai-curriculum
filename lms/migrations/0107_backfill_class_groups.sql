-- 0107_backfill_class_groups.sql
-- Backfill: create linked study groups for existing classes that don't have one.
-- Reuses the deterministic id pattern grp-class-{class_id} so re-runs are idempotent.

INSERT OR IGNORE INTO study_groups (id, name, path_slug, description, created_by, class_id)
SELECT
	'grp-class-' || c.id,
	c.name,
	'kelas-' || lower(replace(replace(coalesce(c.code, c.name), ' ', '-'), '.', '-')),
	'Grup diskusi resmi kelas ' || c.name,
	coalesce(c.homeroom_teacher_id, 'system'),
	c.id
FROM classes c
WHERE c.id NOT IN (SELECT class_id FROM study_groups WHERE class_id IS NOT NULL);

-- Sync active class members (students + teachers) into linked groups
INSERT OR IGNORE INTO group_members (id, group_id, user_id, role)
SELECT
	'gm-' || sg.id || '-' || cm.user_id,
	sg.id,
	cm.user_id,
	CASE WHEN cm.role = 'student' THEN 'member' ELSE 'admin' END
FROM class_members cm
JOIN study_groups sg ON sg.class_id = cm.class_id
WHERE cm.status = 'active'
  AND cm.user_id NOT IN (
	SELECT user_id FROM group_members gm2 WHERE gm2.group_id = sg.id
  );
