ALTER TABLE destination_items 
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS time_of_day TEXT 
  CHECK (time_of_day IN ('mattina','pomeriggio','sera')) DEFAULT 'mattina',
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS lat NUMERIC(10,7),
ADD COLUMN IF NOT EXISTS lng NUMERIC(10,7);