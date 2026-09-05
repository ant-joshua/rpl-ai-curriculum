-- Migration: Seed student accounts + admin accounts
-- Passwords: all use bcrypt hash of their plaintext password
-- Students: password123
-- Admin: admin123
-- Run: CLOUDFLARE_ACCOUNT_ID=... npx wrangler d1 execute rpl-ai-lms-db --remote --file migrations/0108_seed_accounts.sql

PRAGMA foreign_keys=OFF;

-- ============================================
-- Admin Account
-- ============================================
INSERT OR IGNORE INTO users (id, username, email, display_name, role, password_hash, is_active, tenant_id, created_at)
VALUES (
  'admin-seed-001',
  'admin',
  'admin@rpl-ai.my.id',
  'Administrator',
  'admin',
  '$2b$10$mBSeE45FndUUb8j8G9Dp/.emJz.ytW1E1UM8vaWE9QOpjc59QUGUi',
  1,
  'default',
  datetime('now')
);

-- ============================================
-- Instructor Account (guru)
-- ============================================
INSERT OR IGNORE INTO users (id, username, email, display_name, role, password_hash, is_active, tenant_id, created_at)
VALUES (
  'guru-seed-001',
  'guru',
  'guru@rpl-ai.my.id',
  'Guru AI Course',
  'instructor',
  '$2b$10$mBSeE45FndUUb8j8G9Dp/.emJz.ytW1E1UM8vaWE9QOpjc59QUGUi',
  1,
  'default',
  datetime('now')
);

-- ============================================
-- Student Accounts (10 siswa)
-- Password: password123
-- ============================================
INSERT OR IGNORE INTO users (id, username, email, display_name, role, password_hash, is_active, tenant_id, created_at)
VALUES
('student-seed-001', 'ahmad',    'ahmad@rpl-ai.my.id',    'Ahmad Rizky',      'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-002', 'siti',     'siti@rpl-ai.my.id',     'Siti Nurhaliza',   'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-003', 'budi',     'budi@rpl-ai.my.id',     'Budi Santoso',     'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-004', 'dewi',     'dewi@rpl-ai.my.id',     'Dewi Lestari',     'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-005', 'andi',     'andi@rpl-ai.my.id',     'Andi Pratama',     'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-006', 'mayliza',  'mayliza@rpl-ai.my.id',  'Mayliza Putri',    'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-007', 'riko',     'riko@rpl-ai.my.id',     'Riko Hidayat',     'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-008', 'nina',     'nina@rpl-ai.my.id',     'Nina Sari',        'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-009', 'yusuf',    'yusuf@rpl-ai.my.id',    'Yusuf Mubarok',    'student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now')),
('student-seed-010', 'laila',    'laila@rpl-ai.my.id',    'Lailatul Qodriyah','student', '$2b$10$6P81T8YeQQxMfjA9FLzToeYsZAIBA.d3zSUnUDVgrJnxk1ZjUSrsa', 1, 'default', datetime('now'));

-- Verify
SELECT id, username, email, display_name, role, is_active FROM users WHERE id LIKE '%seed%' ORDER BY role, username;
