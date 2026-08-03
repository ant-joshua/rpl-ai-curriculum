-- AIEdu: allow generated docs saved to bank, track ownership
ALTER TABLE aiedu_documents ADD COLUMN owner_id TEXT REFERENCES users(id);
ALTER TABLE aiedu_documents ADD COLUMN updated_at TEXT;
