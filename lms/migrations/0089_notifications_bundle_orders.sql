-- Paid bundle checkout (Midtrans)
-- NOTE: notifications table already exists (migration 0061) — new inserts must include tenant_id
CREATE TABLE IF NOT EXISTS bundle_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bundle_id TEXT NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  coupon_id TEXT REFERENCES coupons(id),
  amount INTEGER NOT NULL DEFAULT 0,         -- final price after discount
  discount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',    -- pending/paid/cancelled/expired
  snap_token TEXT,
  order_id TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bundle_orders_user ON bundle_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_orders_order ON bundle_orders(order_id);
