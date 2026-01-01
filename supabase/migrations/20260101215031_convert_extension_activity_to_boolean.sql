-- Convert trainings.extension_activity from JSONB to BOOLEAN
-- 1) Add a temp boolean column with default false
ALTER TABLE trainings
ADD COLUMN IF NOT EXISTS extension_activity_tmp BOOLEAN DEFAULT FALSE;

-- 2) Migrate existing data: set TRUE if JSONB column is non-null and not an empty object/array
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'trainings' AND column_name = 'extension_activity' AND udt_name IN ('jsonb','json')
  ) THEN
    UPDATE trainings
    SET extension_activity_tmp = CASE
      WHEN extension_activity IS NULL THEN FALSE
      WHEN extension_activity::text IN ('null', '""', '{}', '[]') THEN FALSE
      ELSE TRUE
    END;
  END IF;
END $$;

-- 3) Drop old column if it exists and rename tmp to final name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainings' AND column_name = 'extension_activity' AND udt_name IN ('jsonb','json')
  ) THEN
    ALTER TABLE trainings DROP COLUMN extension_activity;
  END IF;
END $$;

ALTER TABLE trainings RENAME COLUMN extension_activity_tmp TO extension_activity;

-- 4) Ensure NOT NULL with default false
ALTER TABLE trainings ALTER COLUMN extension_activity SET DEFAULT FALSE;
UPDATE trainings SET extension_activity = COALESCE(extension_activity, FALSE);
ALTER TABLE trainings ALTER COLUMN extension_activity SET NOT NULL;