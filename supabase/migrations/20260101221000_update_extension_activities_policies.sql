-- Update RLS policies for extension_activities to use trainers.id as the ownership key
-- Assumptions:
-- - trainings.trainer_id references trainers.id
-- - The authenticated user's id (auth.uid()) equals trainers.id for the trainer's own account

-- Enable RLS (no-op if already enabled)
ALTER TABLE public.extension_activities ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='extension_activities' AND polname='select_own_extension_activities') THEN
    EXECUTE 'DROP POLICY select_own_extension_activities ON public.extension_activities';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='extension_activities' AND polname='insert_own_extension_activities') THEN
    EXECUTE 'DROP POLICY insert_own_extension_activities ON public.extension_activities';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='extension_activities' AND polname='update_own_extension_activities') THEN
    EXECUTE 'DROP POLICY update_own_extension_activities ON public.extension_activities';
  END IF;
END $$;

-- SELECT policy via trainers join (trainers.id = auth.uid())
CREATE POLICY select_own_extension_activities
ON public.extension_activities
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.trainings t
    JOIN public.trainers tr ON tr.id = t.trainer_id
    WHERE t.id = extension_activities.training_id
      AND tr.id = auth.uid()
  )
);

-- INSERT policy via trainers join (trainers.id = auth.uid())
CREATE POLICY insert_own_extension_activities
ON public.extension_activities
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.trainings t
    JOIN public.trainers tr ON tr.id = t.trainer_id
    WHERE t.id = extension_activities.training_id
      AND tr.id = auth.uid()
  )
);

-- UPDATE policy via trainers join (trainers.id = auth.uid())
CREATE POLICY update_own_extension_activities
ON public.extension_activities
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.trainings t
    JOIN public.trainers tr ON tr.id = t.trainer_id
    WHERE t.id = extension_activities.training_id
      AND tr.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.trainings t
    JOIN public.trainers tr ON tr.id = t.trainer_id
    WHERE t.id = extension_activities.training_id
      AND tr.id = auth.uid()
  )
);
