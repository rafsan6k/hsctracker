-- ══════════════════════════════════════════════════════════════
-- StudyFlow Idempotent Schema — Safe to run multiple times
-- ══════════════════════════════════════════════════════════════

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name text DEFAULT 'Student',
  exam_label text DEFAULT '',
  streak integer DEFAULT 0,
  last_active_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#8B5CF6',
  icon text NOT NULL DEFAULT 'school',
  exam_date date,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Chapters
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id uuid REFERENCES public.subjects ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  chapter_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'not_started',
  completed_at timestamp with time zone,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Targets
CREATE TABLE IF NOT EXISTS public.targets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  label text NOT NULL,
  target_value integer NOT NULL,
  subject_id uuid REFERENCES public.subjects ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Completion Logs (for heatmaps/stats)
CREATE TABLE IF NOT EXISTS public.completion_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES public.chapters ON DELETE CASCADE NOT NULL,
  completed_at timestamp with time zone DEFAULT now()
);

-- 6. Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  badge_key text NOT NULL,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

-- ══════════════════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════
-- RLS POLICIES (Idempotent using DO blocks)
-- ══════════════════════════════════════════════════════════════

DO $$ 
BEGIN
    -- Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Subjects
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own subjects') THEN
        CREATE POLICY "Users can manage their own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Chapters
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own chapters') THEN
        CREATE POLICY "Users can manage their own chapters" ON public.chapters FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Targets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own targets') THEN
        CREATE POLICY "Users can manage their own targets" ON public.targets FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Completion Logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own logs') THEN
        CREATE POLICY "Users can manage their own logs" ON public.completion_logs FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Badges
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own badges') THEN
        CREATE POLICY "Users can view their own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- AUTH TRIGGERS (Auto-create profile on signup)
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', 'Student'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
