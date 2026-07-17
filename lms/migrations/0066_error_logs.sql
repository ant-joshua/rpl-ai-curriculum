-- Migration 0066: Error Logs — global error monitoring
CREATE TABLE IF NOT EXISTS error_logs (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'error', -- error, warning, critical
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  method TEXT,
  user_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  tenant_id TEXT,
  metadata TEXT, -- JSON with additional context
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

CREATE INDEX idx_error_logs_level ON error_logs(level);
CREATE INDEX idx_error_logs_created ON error_logs(created_at);
CREATE INDEX idx_error_logs_user ON error_logs(user_id);
CREATE INDEX idx_error_logs_tenant ON error_logs(tenant_id);
