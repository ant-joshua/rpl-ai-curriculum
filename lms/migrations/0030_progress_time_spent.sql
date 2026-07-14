-- Add time_spent column to progress table
ALTER TABLE progress ADD COLUMN time_spent INTEGER NOT NULL DEFAULT 0;
