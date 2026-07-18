-- Migration #0078: 2FA Recovery Codes
-- Store hashed recovery codes and track which have been used
ALTER TABLE users ADD COLUMN recovery_codes TEXT;  -- JSON array of SHA-256 hashed codes
ALTER TABLE users ADD COLUMN used_recovery_codes TEXT DEFAULT '[]';  -- JSON array of used code hashes
