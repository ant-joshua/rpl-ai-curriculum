-- Migration 0059: Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  username TEXT,
  action TEXT NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, ERROR
  entity_type TEXT, -- user, subject, class, payment, attendance, etc
  entity_id TEXT,
  details TEXT, -- JSON payload with request data
  ip_address TEXT,
  user_agent TEXT,
  path TEXT,
  method TEXT,
  status_code INTEGER,
  duration_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
