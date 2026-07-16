-- CLASS MEMBERS
INSERT OR IGNORE INTO class_members (id, tenant_id, class_id, user_id, role, created_at) VALUES
('cm_1', 't_default', 'c_10a', (SELECT id FROM users WHERE username='siswa1'), 'student', '2026-01-15'),
('cm_2', 't_default', 'c_10a', (SELECT id FROM users WHERE username='siswa2'), 'student', '2026-01-15'),
('cm_3', 't_default', 'c_10a', (SELECT id FROM users WHERE username='siswa3'), 'student', '2026-01-15'),
('cm_4', 't_default', 'c_11a', (SELECT id FROM users WHERE username='siswa4'), 'student', '2026-01-15'),
('cm_5', 't_default', 'c_11a', (SELECT id FROM users WHERE username='siswa5'), 'student', '2026-01-15'),
('cm_6', 't_default', 'c_12a', (SELECT id FROM users WHERE username='siswa6'), 'student', '2026-01-15');

-- ATTENDANCE SESSIONS
INSERT OR IGNORE INTO attendance_sessions (id, tenant_id, class_subject_id, title, session_type, created_at, created_by) VALUES
('as_1', 't_default', (SELECT id FROM class_subjects WHERE class_id='c_10a' AND subject_id='s_mtk' LIMIT 1), 'Matematika pagi', 'class', '2026-01-15 07:30:00', (SELECT id FROM users WHERE username='guru1')),
('as_2', 't_default', (SELECT id FROM class_subjects WHERE class_id='c_10a' AND subject_id='s_ipa' LIMIT 1), 'IPA pagi', 'class', '2026-01-15 09:00:00', (SELECT id FROM users WHERE username='guru2'));

-- ENROLLMENTS (univ)
INSERT OR IGNORE INTO enrollments (id, tenant_id, user_id, course_id, status, enrolled_at) VALUES
('enr_1', 't_default', (SELECT id FROM users WHERE username='mhs1'), 'sp_ti', 'active', '2025-07-01'),
('enr_2', 't_default', (SELECT id FROM users WHERE username='mhs2'), 'sp_ti', 'active', '2025-07-01');

-- PARENT ACCOUNT
INSERT OR IGNORE INTO parent_accounts (id, tenant_id, user_id, name, phone, email, relationship, is_primary, created_at) VALUES
('pa_1', 't_default', (SELECT id FROM users WHERE username='ortu1'), 'Ibu Sari', '08123456789', 'ortu1@school.com', 'mother', 1, '2026-01-15');
INSERT OR IGNORE INTO parent_student_links (id, tenant_id, parent_id, student_id, relationship, access_level, created_at) VALUES
('psl_1', 't_default', (SELECT id FROM parent_accounts LIMIT 1), (SELECT id FROM users WHERE username='siswa1'), 'mother', 'full', '2026-01-15');
