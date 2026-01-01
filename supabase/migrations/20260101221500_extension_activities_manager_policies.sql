-- Manager/Admin policies for extension_activities using user_role table
-- Assumptions:
-- - user_role(user_id uuid, role text)
-- - Managers are rows where role IN ('manager','admin') for the current auth.uid()

ALTER TABLE public.extension_activities ENABLE ROW LEVEL SECURITY;

-- Allow managers/admins to SELECT all extension_activities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'extension_activities' AND polname = 'select_manager_extension_activities'
  ) THEN
    EXECUTE $$
      CREATE POLICY select_manager_extension_activities ON public.extension_activities
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_role ur
          WHERE ur.user_id = auth.uid()
            AND ur.role IN ('manager','admin')
        )
      )
    $$;
  END IF;
END $$;

-- Allow managers/admins to UPDATE all extension_activities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'extension_activities' AND polname = 'update_manager_extension_activities'
  ) THEN
    EXECUTE $$
      CREATE POLICY update_manager_extension_activities ON public.extension_activities
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_role ur
          WHERE ur.user_id = auth.uid()
            AND ur.role IN ('manager','admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_role ur
          WHERE ur.user_id = auth.uid()
            AND ur.role IN ('manager','admin')
        )
      )
    $$;
  END IF;
END $$;