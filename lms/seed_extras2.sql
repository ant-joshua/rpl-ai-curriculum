-- Get user UUIDs and use them directly
-- class_members
INSERT OR IGNORE INTO class_members (id, tenant_id, class_id, user_id, role, status, joined_at) 
SELECT 'cm_1', 't_default', 'c_10a', id, 'student', 'active', '2026-01-15' FROM users WHERE username='siswa1';

INSERT OR IGNORE INTO class_members (id, tenant_id, class_id, user_id, role, status, joined_at) 
SELECT 'cm_2', 't_default', 'c_10a', id, 'student', 'active', '2026-01-15' FROM users WHERE username='siswa2';

INSERT OR IGNORE INTO class_members (id, tenant_id, class_id, user_id, role, status, joined_at) 
SELECT 'cm_3', 't_default', 'c_10a', id, 'student', 'active', '2026-01-15' FROM users WHERE username='siswa3';

INSERT OR IGNORE INTO class_members (id, tenant_id, class_id, user_id, role, status, joined_at) 
SELECT 'cm_4', 't_default', 'c_11a', id, 'student', 'active', '2026-01-15' FROM users WHERE username='siswa4';

INSERT OR IGNORE INTO class_members (id, tenant_id, class_id, user_id, role, status, joined_at) 
SELECT 'cm_5', 't_default', 'c_11a', id, 'student', 'active', '2026-01-15' FROM users WHERE username='siswa5';

INSERT OR IGNORE INTO class_members (id, tenant_id, class_id, user_id, role, status, joined_at) 
SELECT 'cm_6', 't_default', 'c_12a', id, 'student', 'active', '2026-01-15' FROM users WHERE username='siswa6';

-- attendance_sessions (need class_subject_ids)
INSERT OR IGNORE INTO attendance_sessions (id, tenant_id, class_subject_id, title, session_type, created_at, created_by) 
SELECT 'as_1', 't_default', cs.id, 'Matematika pagi', 'class', '2026-01-15 07:30:00', u.id 
FROM class_subjects cs CROSS JOIN users u WHERE cs.class_id='c_10a' AND cs.subject_id='s_mtk' AND u.username='guru1' LIMIT 1;

INSERT OR IGNORE INTO attendance_sessions (id, tenant_id, class_subject_id, title, session_type, created_at, created_by) 
SELECT 'as_2', 't_default', cs.id, 'IPA pagi', 'class', '2026-01-15 09:00:00', u.id 
FROM class_subjects cs CROSS JOIN users u WHERE cs.class_id='c_10a' AND cs.subject_id='s_ipa' AND u.username='guru2' LIMIT 1;

-- parent_account
INSERT OR IGNORE INTO parent_accounts (id, tenant_id, user_id, name, phone, email, relationship, is_primary, created_at) 
SELECT 'pa_1', 't_default', id, 'Ibu Sari', '08123456789', 'ortu1@school.com', 'mother', 1, '2026-01-15' FROM users WHERE username='ortu1';
