-- Manager/Admin SELECT policies so managers can see all trainings and related data
-- Assumes user_role(user_id uuid, role text) marks managers/admins
-- Applies SELECT policies for trainings, trainers, training_media, training_expenses, expense_categories

-- Trainings: allow managers/admins to SELECT all
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='trainings' AND polname='select_manager_trainings'
  ) THEN
    EXECUTE $$
      CREATE POLICY select_manager_trainings ON public.trainings
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

-- Trainers: allow managers/admins to SELECT all (for names/emails in UI)
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='trainers' AND polname='select_manager_trainers'
  ) THEN
    EXECUTE $$
      CREATE POLICY select_manager_trainers ON public.trainers
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

-- training_media: allow managers/admins to SELECT rows if related training exists (any)
ALTER TABLE public.training_media ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='training_media' AND polname='select_manager_training_media'
  ) THEN
    EXECUTE $$
      CREATE POLICY select_manager_training_media ON public.training_media
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_role ur
          WHERE ur.user_id = auth.uid() AND ur.role IN ('manager','admin')
        )
      )
    $$;
  END IF;
END $$;

-- training_expenses: allow managers/admins to SELECT
ALTER TABLE public.training_expenses ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='training_expenses' AND polname='select_manager_training_expenses'
  ) THEN
    EXECUTE $$
      CREATE POLICY select_manager_training_expenses ON public.training_expenses
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_role ur
          WHERE ur.user_id = auth.uid() AND ur.role IN ('manager','admin')
        )
      )
    $$;
  END IF;
END $$;

-- expense_categories: allow managers/admins to SELECT all (static lookup)
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='expense_categories' AND polname='select_manager_expense_categories'
  ) THEN
    EXECUTE $$
      CREATE POLICY select_manager_expense_categories ON public.expense_categories
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_role ur
          WHERE ur.user_id = auth.uid() AND ur.role IN ('manager','admin')
        )
      )
    $$;
  END IF;
END $$;