-- RLS policies for extension_activities so authenticated users can insert/select their own rows
-- Assumptions:
-- - extension_activities has column training_id referencing trainings(id)
-- - trainings has column trainer_id referencing auth.users(id)

-- Enable RLS (no-op if already enabled)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'extension_activities' AND table_schema = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE public.extension_activities ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Create SELECT policy allowing a user to read extension activities for trainings they own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'extension_activities' AND polname = 'select_own_extension_activities'
  ) THEN
    EXECUTE $$
      CREATE POLICY select_own_extension_activities ON public.extension_activities
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.trainings t
          WHERE t.id = extension_activities.training_id
            AND t.trainer_id = auth.uid()
        )
      )
    $$;
  END IF;
END $$;

-- Create INSERT policy allowing a user to insert extension activities for trainings they own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'extension_activities' AND polname = 'insert_own_extension_activities'
  ) THEN
    EXECUTE $$
      CREATE POLICY insert_own_extension_activities ON public.extension_activities
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.trainings t
          WHERE t.id = extension_activities.training_id
            AND t.trainer_id = auth.uid()
        )
      )
    $$;
  END IF;
END $$;

-- Create UPDATE policy allowing a user to update extension activities for trainings they own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'extension_activities' AND polname = 'update_own_extension_activities'
  ) THEN
    EXECUTE $$
      CREATE POLICY update_own_extension_activities ON public.extension_activities
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.trainings t
          WHERE t.id = extension_activities.training_id
            AND t.trainer_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.trainings t
          WHERE t.id = extension_activities.training_id
            AND t.trainer_id = auth.uid()
        )
      )
    $$;
  END IF;
END $$;

-- (Optional) DELETE policy; uncomment if deletes are needed
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies
--     WHERE schemaname = 'public' AND tablename = 'extension_activities' AND polname = 'delete_own_extension_activities'
--   ) THEN
--     EXECUTE $$
--       CREATE POLICY delete_own_extension_activities ON public.extension_activities
--       FOR DELETE
--       TO authenticated
--       USING (
--         EXISTS (
--           SELECT 1 FROM public.trainings t
--           WHERE t.id = extension_activities.training_id
--             AND t.trainer_id = auth.uid()
--         )
--       )
--     $$;
--   END IF;
-- END $$;