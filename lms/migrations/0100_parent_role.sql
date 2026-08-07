PRAGMA foreign_keys=OFF;

CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('superadmin','admin','instructor','ta','student','parent')),
  avatar_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  tenant_id TEXT NOT NULL DEFAULT 'default',
  password_hash TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  headline TEXT,
  website TEXT,
  social_links TEXT DEFAULT '{}'
);

INSERT INTO users_new (id, username, created_at, email, display_name, role, avatar_url, is_active, tenant_id, password_hash, email_verified, bio, headline, website, social_links)
SELECT id, username, created_at, email, display_name, role, avatar_url, is_active, tenant_id, password_hash, email_verified, bio, headline, website, social_links
FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

PRAGMA foreign_keys=ON;