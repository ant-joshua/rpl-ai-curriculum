-- 0055_notification_system.sql
-- Notification System: push, email, in-app, SMS

-- 1. notification_channels: configured delivery channels
CREATE TABLE IF NOT EXISTS notification_channels (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  channel_type TEXT NOT NULL, -- email, push, sms, in_app
  provider TEXT, -- firebase, resend, twilio, etc.
  is_active INTEGER DEFAULT 1,
  config_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_channels_tenant ON notification_channels(tenant_id);

-- 2. notification_templates: reusable message templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- academic, payment, attendance, system, announcement
  channel_type TEXT NOT NULL, -- email, push, sms, in_app
  subject TEXT, -- for email
  body_template TEXT NOT NULL, -- supports {{variable}} placeholders
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_templates_tenant ON notification_templates(tenant_id);

-- 3. notification_queue: outbound messages
CREATE TABLE IF NOT EXISTS notification_queue (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT,
  channel_type TEXT NOT NULL,
  recipient_id TEXT, -- user ID
  recipient_address TEXT, -- email/phone/token
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, failed
  sent_at TEXT,
  delivered_at TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata TEXT, -- JSON context data
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_queue_tenant ON notification_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notif_queue_status ON notification_queue(status);

-- 4. notification_read: in-app notification read tracking
CREATE TABLE IF NOT EXISTS notification_read (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  notification_id TEXT NOT NULL,
  read_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, notification_id)
);
CREATE INDEX IF NOT EXISTS idx_notif_read_user ON notification_read(user_id);

-- 5. notification_preferences: per-user channel preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL, -- academic, payment, attendance, system, announcement
  email_enabled INTEGER DEFAULT 1,
  push_enabled INTEGER DEFAULT 1,
  sms_enabled INTEGER DEFAULT 0,
  in_app_enabled INTEGER DEFAULT 1,
  UNIQUE(user_id, category)
);
CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON notification_preferences(user_id);

-- 6. push_tokens: FCM/device tokens per user
CREATE TABLE IF NOT EXISTS push_tokens (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT, -- android, ios, web
  is_active INTEGER DEFAULT 1,
  last_used_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_tenant ON push_tokens(tenant_id);
