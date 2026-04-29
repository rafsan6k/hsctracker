-- ══════════════════════════════════════════════════════════════
-- StudyFlow Database Schema — Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text default 'Student',
  exam_label text default '',
  streak integer default 0,
  last_active_date date,
  created_at timestamp with time zone default now()
);

-- 2. Subjects
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null default '#8B5CF6',
  icon text not null default 'school',
  exam_date date,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- 3. Chapters
create table public.chapters (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  chapter_number integer not null default 1,
  status text not null default 'not_started',
  completed_at timestamp with time zone,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- 4. Targets
create table public.targets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  label text not null,
  target_value integer not null,
  subject_id uuid references public.subjects on delete set null,
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default now()
);

-- 5. Completion Logs
create table public.completion_logs (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid references public.chapters on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  completed_at timestamp with time zone default now()
);

-- 6. Badges
create table public.badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  badge_key text not null,
  earned_at timestamp with time zone default now()
);

-- ══════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — Each user can only access their own data
-- ══════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.targets enable row level security;
alter table public.completion_logs enable row level security;
alter table public.badges enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Subjects
create policy "Users can view own subjects" on public.subjects for select using (auth.uid() = user_id);
create policy "Users can insert own subjects" on public.subjects for insert with check (auth.uid() = user_id);
create policy "Users can update own subjects" on public.subjects for update using (auth.uid() = user_id);
create policy "Users can delete own subjects" on public.subjects for delete using (auth.uid() = user_id);

-- Chapters
create policy "Users can view own chapters" on public.chapters for select using (auth.uid() = user_id);
create policy "Users can insert own chapters" on public.chapters for insert with check (auth.uid() = user_id);
create policy "Users can update own chapters" on public.chapters for update using (auth.uid() = user_id);
create policy "Users can delete own chapters" on public.chapters for delete using (auth.uid() = user_id);

-- Targets
create policy "Users can view own targets" on public.targets for select using (auth.uid() = user_id);
create policy "Users can insert own targets" on public.targets for insert with check (auth.uid() = user_id);
create policy "Users can update own targets" on public.targets for update using (auth.uid() = user_id);
create policy "Users can delete own targets" on public.targets for delete using (auth.uid() = user_id);

-- Completion Logs
create policy "Users can view own logs" on public.completion_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.completion_logs for insert with check (auth.uid() = user_id);
create policy "Users can delete own logs" on public.completion_logs for delete using (auth.uid() = user_id);

-- Badges
create policy "Users can view own badges" on public.badges for select using (auth.uid() = user_id);
create policy "Users can insert own badges" on public.badges for insert with check (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- Auto-create profile on signup
-- ══════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Student'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
