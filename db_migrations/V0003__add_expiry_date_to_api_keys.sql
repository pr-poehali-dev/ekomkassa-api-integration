-- Add expiry_date field to api_keys table
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;