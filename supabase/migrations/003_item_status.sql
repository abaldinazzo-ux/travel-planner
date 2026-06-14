ALTER TABLE destination_items
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'idea'
CHECK (status IN ('idea', 'found', 'booked'));

UPDATE destination_items SET status = 'idea' WHERE status IS NULL;
