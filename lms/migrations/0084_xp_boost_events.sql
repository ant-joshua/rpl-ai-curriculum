-- XP boost events: admin-defined multiplier windows (e.g. 2x weekend)
CREATE TABLE IF NOT EXISTS xp_boost_events (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	multiplier REAL NOT NULL DEFAULT 1.0,      -- 2.0 = double XP
	reason_filter TEXT DEFAULT 'all',          -- 'all' or specific reason
	tenant_id TEXT,                            -- NULL = all tenants
	start_at TEXT NOT NULL,
	end_at TEXT NOT NULL,
	enabled INTEGER NOT NULL DEFAULT 1,
	created_by TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
