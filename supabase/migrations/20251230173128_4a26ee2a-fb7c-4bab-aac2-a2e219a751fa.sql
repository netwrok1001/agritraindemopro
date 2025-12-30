-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('manager', 'trainer');

-- Create managers table (only editable directly in database)
CREATE TABLE public.managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainers table (managed by managers)
CREATE TABLE public.trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.managers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create training_type enum
CREATE TYPE public.training_type AS ENUM ('farmer_farmwoman', 'rural_youth', 'inservice');

-- Create training_mode enum
CREATE TYPE public.training_mode AS ENUM ('on_campus', 'off_campus');

-- Create trainings table
CREATE TABLE public.trainings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  training_type training_type NOT NULL,
  training_mode training_mode NOT NULL,
  total_farmers_male INTEGER NOT NULL DEFAULT 0,
  total_farmers_female INTEGER NOT NULL DEFAULT 0,
  demographics_sc INTEGER NOT NULL DEFAULT 0,
  demographics_st INTEGER NOT NULL DEFAULT 0,
  demographics_gen INTEGER NOT NULL DEFAULT 0,
  demographics_obc INTEGER NOT NULL DEFAULT 0,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  gps_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_media table
CREATE TABLE public.training_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expense_categories table with predefined categories
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert predefined expense categories
INSERT INTO public.expense_categories (name) VALUES 
  ('Inputs'),
  ('Refreshments'),
  ('Literature/Publications'),
  ('Stationary'),
  ('Flex/Banner'),
  ('Miscellaneous');

-- Create training_expenses table
CREATE TABLE public.training_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id),
  expense_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_expenses ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get trainer_id for current user
CREATE OR REPLACE FUNCTION public.get_trainer_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.trainers WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for managers (read-only, manual management)
CREATE POLICY "Managers table is read-only for authenticated users"
  ON public.managers FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for trainers
CREATE POLICY "Managers can view all trainers"
  ON public.trainers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Trainers can view themselves"
  ON public.trainers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can insert trainers"
  ON public.trainers FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update trainers"
  ON public.trainers FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can delete trainers"
  ON public.trainers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

-- RLS Policies for trainings
CREATE POLICY "Trainers can view their own trainings"
  ON public.trainings FOR SELECT
  TO authenticated
  USING (trainer_id = public.get_trainer_id(auth.uid()));

CREATE POLICY "Managers can view all trainings"
  ON public.trainings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Trainers can create their own trainings"
  ON public.trainings FOR INSERT
  TO authenticated
  WITH CHECK (trainer_id = public.get_trainer_id(auth.uid()));

CREATE POLICY "Managers can update trainings"
  ON public.trainings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can delete trainings"
  ON public.trainings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

-- RLS Policies for training_media
CREATE POLICY "Trainers can view their training media"
  ON public.training_media FOR SELECT
  TO authenticated
  USING (
    training_id IN (
      SELECT id FROM public.trainings WHERE trainer_id = public.get_trainer_id(auth.uid())
    )
  );

CREATE POLICY "Managers can view all training media"
  ON public.training_media FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Trainers can insert media for their trainings"
  ON public.training_media FOR INSERT
  TO authenticated
  WITH CHECK (
    training_id IN (
      SELECT id FROM public.trainings WHERE trainer_id = public.get_trainer_id(auth.uid())
    )
  );

CREATE POLICY "Managers can delete training media"
  ON public.training_media FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

-- RLS Policies for expense_categories (readable by all authenticated)
CREATE POLICY "Anyone can view expense categories"
  ON public.expense_categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for training_expenses
CREATE POLICY "Trainers can view their training expenses"
  ON public.training_expenses FOR SELECT
  TO authenticated
  USING (
    training_id IN (
      SELECT id FROM public.trainings WHERE trainer_id = public.get_trainer_id(auth.uid())
    )
  );

CREATE POLICY "Managers can view all training expenses"
  ON public.training_expenses FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Trainers can insert expenses for their trainings"
  ON public.training_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    training_id IN (
      SELECT id FROM public.trainings WHERE trainer_id = public.get_trainer_id(auth.uid())
    )
  );

CREATE POLICY "Managers can update training expenses"
  ON public.training_expenses FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can delete training expenses"
  ON public.training_expenses FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

-- Create storage bucket for training media
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-media', 'training-media', true);

-- Storage policies for training media bucket
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'training-media');

CREATE POLICY "Anyone can view training media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'training-media');

CREATE POLICY "Managers can delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'training-media' AND public.has_role(auth.uid(), 'manager'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_trainers_updated_at
  BEFORE UPDATE ON public.trainers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON public.trainings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();