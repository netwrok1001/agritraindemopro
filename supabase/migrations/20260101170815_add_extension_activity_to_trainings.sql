-- Add JSONB column to store extension activity details
ALTER TABLE trainings
ADD COLUMN IF NOT EXISTS extension_activity JSONB;