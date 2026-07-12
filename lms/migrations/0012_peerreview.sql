CREATE TABLE IF NOT EXISTS review_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_slug TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  feedback TEXT NOT NULL,
  score INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (request_id) REFERENCES review_requests(id)
);
