-- Add date column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE;

-- Update existing transactions to use created_at as date
UPDATE transactions SET date = created_at WHERE date IS NULL;

-- Set date to be created_at by default
ALTER TABLE transactions ALTER COLUMN date SET DEFAULT NOW();
