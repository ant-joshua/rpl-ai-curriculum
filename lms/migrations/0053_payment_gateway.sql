-- 0053_payment_gateway.sql
-- Payment Gateway: SPP/invoice, payment tracking, midtrans/xendit integration

-- 1. payment_methods: configured payment gateways
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  provider TEXT NOT NULL, -- midtrans, xendit, bank_transfer, manual
  is_active INTEGER DEFAULT 1,
  config_json TEXT, -- gateway-specific config (API keys, merchant id, etc.)
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON payment_methods(tenant_id);

-- 2. fee_structures: SPP / fee definitions
CREATE TABLE IF NOT EXISTS fee_structures (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  amount REAL NOT NULL,
  fee_type TEXT NOT NULL, -- spp, uang_gedung, praktikum, skripsi, lainnya
  academic_year TEXT,
  semester TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_fee_structures_tenant ON fee_structures(tenant_id);

-- 3. invoices: generated bills per student
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  fee_structure_id TEXT,
  amount REAL NOT NULL,
  discount REAL DEFAULT 0,
  fine REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  due_date TEXT,
  status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid, overdue, cancelled
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(tenant_id, status);

-- 4. invoice_items: line items per invoice
CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  fee_structure_id TEXT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_invoice_items_tenant ON invoice_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- 5. payments: actual payment records
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  payment_method_id TEXT,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  payment_type TEXT DEFAULT 'transfer', -- transfer, cash, credit_card, e_wallet, virtual_account
  reference_number TEXT,
  gateway_transaction_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by TEXT,
  verified_at TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(tenant_id, status);

-- 6. payment_callbacks: webhook logs from payment gateways
CREATE TABLE IF NOT EXISTS payment_callbacks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  payment_id TEXT,
  provider TEXT NOT NULL,
  payload TEXT NOT NULL, -- raw webhook body
  processed INTEGER DEFAULT 0,
  processed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_tenant ON payment_callbacks(tenant_id);

-- 7. refunds: refund requests and tracking
CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  amount REAL NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, processed
  requested_by TEXT,
  approved_by TEXT,
  processed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_refunds_tenant ON refunds(tenant_id);
