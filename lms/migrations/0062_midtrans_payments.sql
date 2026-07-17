-- Migration 0062: Midtrans payment gateway support
-- Add snap_token and provider_transaction_id to payments table

ALTER TABLE payments ADD COLUMN snap_token TEXT;
ALTER TABLE payments ADD COLUMN provider_transaction_id TEXT;
