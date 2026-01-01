-- Create extension_activities table to store extension activity details as strings
-- Table stores one row per training (unique training_id)

CREATE TABLE IF NOT EXISTS public.extension_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  title text,
  description text,
  partner text,
  -- Comma-separated list of public URLs for uploaded media
  media_urls text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT extension_activities_training_id_fkey
    FOREIGN KEY (training_id)
    REFERENCES public.trainings(id)
    ON DELETE CASCADE
);

-- One extension activity per training
CREATE UNIQUE INDEX IF NOT EXISTS extension_activities_training_id_key
  ON public.extension_activities (training_id);

-- Optional: trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_extension_activities_updated_at ON public.extension_activities;
CREATE TRIGGER set_extension_activities_updated_at
BEFORE UPDATE ON public.extension_activities
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Enable RLS (policies created in separate migration 20260101220000_extension_activities_rls_policies.sql)
ALTER TABLE public.extension_activities ENABLE ROW LEVEL SECURITY;