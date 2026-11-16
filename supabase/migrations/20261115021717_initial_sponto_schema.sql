create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  ai_provider text not null default 'google' check (ai_provider in ('google', 'openai', 'anthropic')),
  ai_model text not null default 'gemini-3.8-flash' check (char_length(ai_model) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.screening_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  goal text not null,
  custom_goal text,
  practice_context text not null,
  custom_context text,
  humour_style text not null,
  custom_style text,
  ease smallint not null check (ease between 1 and 5),
  additional_details text,
  diagnostic text not null,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(goal) between 1 and 60),
  check (char_length(practice_context) between 1 and 60),
  check (char_length(humour_style) between 1 and 60),
  check (char_length(diagnostic) between 1 and 1000),
  check (additional_details is null or char_length(additional_details) <= 2000)
);

create table public.techniques (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  position smallint not null default 0
);

create table public.lessons (
  id bigint generated always as identity primary key,
  technique_id bigint not null references public.techniques (id) on delete restrict,
  slug text not null unique,
  title text not null,
  summary text not null,
  body jsonb not null default '[]'::jsonb check (jsonb_typeof(body) = 'array'),
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  position smallint not null default 0,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create index lessons_technique_position_idx on public.lessons (technique_id, position);

create table public.drills (
  id bigint generated always as identity primary key,
  technique_id bigint not null references public.techniques (id) on delete restrict,
  lesson_id bigint references public.lessons (id) on delete set null,
  slug text not null unique,
  title text not null,
  prompt text not null,
  guidance text not null,
  context_tags text[] not null default '{}',
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  position smallint not null default 0,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create index drills_technique_position_idx on public.drills (technique_id, position);
create index drills_lesson_id_idx on public.drills (lesson_id);

create table public.course_assignments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id bigint not null references public.lessons (id) on delete cascade,
  position smallint not null default 0,
  status text not null default 'available' check (status in ('locked', 'available', 'in_progress', 'completed')),
  recommended_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index course_assignments_user_status_position_idx on public.course_assignments (user_id, status, position);
create index course_assignments_lesson_id_idx on public.course_assignments (lesson_id);

create table public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  drill_id bigint references public.drills (id) on delete set null,
  attempt_text text not null check (char_length(attempt_text) between 1 and 1000),
  provider text not null check (provider in ('google', 'openai', 'anthropic')),
  model text not null check (char_length(model) between 1 and 100),
  what_worked text not null check (char_length(what_worked) between 1 and 2000),
  try_next text not null check (char_length(try_next) between 1 and 2000),
  setup_score smallint not null check (setup_score between 1 and 5),
  surprise_score smallint not null check (surprise_score between 1 and 5),
  brevity_score smallint not null check (brevity_score between 1 and 5),
  safety_status text not null default 'safe' check (safety_status in ('safe', 'review', 'blocked')),
  prompt_version text not null default 'v1',
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now()
);

create index attempts_user_created_at_idx on public.attempts (user_id, created_at desc);
create index attempts_drill_id_idx on public.attempts (drill_id);

create table public.ease_checkins (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  phase text not null check (phase in ('before', 'after')),
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index ease_checkins_user_created_at_idx on public.ease_checkins (user_id, created_at desc);

create table public.feedback_votes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  attempt_id bigint not null references public.attempts (id) on delete cascade,
  helpful boolean,
  report_reason text check (report_reason is null or char_length(report_reason) <= 500),
  created_at timestamptz not null default now(),
  unique (user_id, attempt_id)
);

create index feedback_votes_attempt_id_idx on public.feedback_votes (attempt_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.screening_responses enable row level security;
alter table public.techniques enable row level security;
alter table public.lessons enable row level security;
alter table public.drills enable row level security;
alter table public.course_assignments enable row level security;
alter table public.attempts enable row level security;
alter table public.ease_checkins enable row level security;
alter table public.feedback_votes enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "screening_select_own" on public.screening_responses for select to authenticated using ((select auth.uid()) = user_id);
create policy "screening_insert_own" on public.screening_responses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "screening_update_own" on public.screening_responses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "screening_delete_own" on public.screening_responses for delete to authenticated using ((select auth.uid()) = user_id);

create policy "techniques_read" on public.techniques for select to anon, authenticated using (true);
create policy "lessons_read" on public.lessons for select to anon, authenticated using (true);
create policy "drills_read" on public.drills for select to anon, authenticated using (true);

create policy "assignments_select_own" on public.course_assignments for select to authenticated using ((select auth.uid()) = user_id);
create policy "assignments_insert_own" on public.course_assignments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "assignments_update_own" on public.course_assignments for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "assignments_delete_own" on public.course_assignments for delete to authenticated using ((select auth.uid()) = user_id);

create policy "attempts_select_own" on public.attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "attempts_insert_own" on public.attempts for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "checkins_select_own" on public.ease_checkins for select to authenticated using ((select auth.uid()) = user_id);
create policy "checkins_insert_own" on public.ease_checkins for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "votes_select_own" on public.feedback_votes for select to authenticated using ((select auth.uid()) = user_id);
create policy "votes_insert_own" on public.feedback_votes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "votes_update_own" on public.feedback_votes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "votes_delete_own" on public.feedback_votes for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on public.techniques, public.lessons, public.drills to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.screening_responses, public.course_assignments, public.feedback_votes to authenticated;
grant select, insert on public.attempts, public.ease_checkins to authenticated;
grant usage, select on all sequences in schema public to authenticated;
