ALTER TABLE destination_items
ADD COLUMN IF NOT EXISTS scheduled_date DATE DEFAULT NULL;

ALTER TABLE destination_items
ADD COLUMN IF NOT EXISTS time_of_day TEXT DEFAULT NULL
CHECK (time_of_day IN ('morning', 'afternoon', 'evening'));
