-- Migration 0061: Notification system v2 — in-app + WhatsApp/email gateway + templates + queue
-- Replaces the v1 tables from migration 0055 with a unified schema.

-- Drop v1 tables that are being replaced
DROP TABLE IF EXISTS notification_templates;
DROP TABLE IF EXISTS notification_queue;
DROP TABLE IF EXISTS notification_read;

-- 1. notifications: in-app notifications with read/archive tracking
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('assessment','assignment','attendance','payment','grade','system','announcement')),
  title TEXT NOT NULL,
  body TEXT,
  reference_type TEXT,
  reference_id TEXT,
  is_read INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  channel TEXT DEFAULT 'in_app' CHECK(channel IN ('in_app','email','whatsapp')),
  status TEXT DEFAULT 'sent' CHECK(status IN ('pending','sent','failed','queued')),
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 2. notification_templates: reusable templates with variable placeholders
CREATE TABLE IF NOT EXISTS notification_templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('assessment','assignment','attendance','payment','grade','system','announcement')),
  channels TEXT NOT NULL DEFAULT 'in_app',
  subject TEXT,
  body_template TEXT NOT NULL,
  variables TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_notif_templates_tenant_code ON notification_templates(tenant_id, code);

-- 3. notification_queue: outbound message queue with retry logic
CREATE TABLE IF NOT EXISTS notification_queue (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  channel TEXT NOT NULL CHECK(channel IN ('in_app','email','whatsapp')),
  recipient TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'queued' CHECK(status IN ('queued','processing','sent','failed')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  scheduled_at TEXT,
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notif_queue_tenant ON notification_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notif_queue_priority ON notification_queue(priority, created_at);

-- 4. wa_templates: WhatsApp template messages (Meta Business API format)
CREATE TABLE IF NOT EXISTS wa_templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  template_name TEXT NOT NULL,
  language TEXT DEFAULT 'id',
  body_template TEXT NOT NULL,
  variables TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_wa_templates_tenant ON wa_templates(tenant_id);
