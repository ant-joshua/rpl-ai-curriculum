-- 0102_academic_calendar.sql
-- Academic calendar: school events, holidays, exam periods per tenant

CREATE TABLE IF NOT EXISTS academic_calendar (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'event'
    CHECK(event_type IN ('semester','holiday','exam','event','deadline')),
  start_date TEXT NOT NULL,
  end_date TEXT,
  description TEXT,
  color TEXT DEFAULT '#4F46E5',
  all_day INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_acal_tenant_date ON academic_calendar(tenant_id, start_date);
CREATE INDEX IF NOT EXISTS idx_acal_type ON academic_calendar(event_type);
