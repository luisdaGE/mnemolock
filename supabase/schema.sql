create table if not exists public.study_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null,
  default_minutes int not null default 25 check (default_minutes > 0),
  source_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'guardian', 'teacher', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_unlock_score_required int not null default 2,
  default_cooldown_minutes int not null default 3,
  strict_mode_default boolean not null default true,
  notification_preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets(id) on delete cascade,
  source_chunk_id uuid,
  prompt text not null,
  options text[] not null check (array_length(options, 1) >= 2),
  answer_index int not null check (answer_index >= 0),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  explanation text,
  origin text not null default 'manual' check (origin in ('manual', 'source_generated')),
  constraint questions_source_generated_requires_chunk check (
    origin = 'manual' or source_chunk_id is not null
  )
);

create table if not exists public.study_sources (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text,
  mime_type text not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'ready', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.study_sources(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  page_number int,
  metadata jsonb not null default '{}'::jsonb
);

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'questions'
      and column_name = 'source_chunk_id'
  ) then
    alter table public.questions add column source_chunk_id uuid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'questions_source_chunk_id_fkey'
  ) then
    alter table public.questions
    add constraint questions_source_chunk_id_fkey
    foreign key (source_chunk_id) references public.source_chunks(id) on delete set null;
  end if;
end $$;

create index if not exists questions_study_set_id_idx on public.questions(study_set_id);
create index if not exists questions_source_chunk_id_idx on public.questions(source_chunk_id);
create index if not exists study_sets_user_created_at_idx on public.study_sets(user_id, created_at desc);
create index if not exists study_sources_user_id_idx on public.study_sources(user_id);
create index if not exists study_sources_study_set_id_idx on public.study_sources(study_set_id);
create index if not exists study_sources_user_created_at_idx on public.study_sources(user_id, created_at desc);
create index if not exists source_chunks_source_id_idx on public.source_chunks(source_id);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_set_id uuid not null references public.study_sets(id) on delete cascade,
  duration_minutes int not null check (duration_minutes > 0),
  unlock_score_required int not null default 2,
  status text not null default 'scheduled' check (status in ('scheduled', 'locked', 'unlocked', 'failed')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  focus_session_id uuid references public.focus_sessions(id) on delete set null,
  study_set_id uuid not null references public.study_sets(id) on delete cascade,
  required_correct int not null,
  correct_count int not null default 0,
  status text not null check (status in ('passed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_answer_index int not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

create index if not exists focus_sessions_user_id_idx on public.focus_sessions(user_id);
create index if not exists focus_sessions_study_set_id_idx on public.focus_sessions(study_set_id);
create index if not exists focus_sessions_user_started_at_idx on public.focus_sessions(user_id, started_at desc);
create index if not exists quiz_attempts_user_id_idx on public.quiz_attempts(user_id);
create index if not exists quiz_attempts_study_set_id_idx on public.quiz_attempts(study_set_id);
create index if not exists quiz_attempts_user_created_at_idx on public.quiz_attempts(user_id, created_at desc);
create index if not exists question_attempts_quiz_attempt_id_idx on public.question_attempts(quiz_attempt_id);

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'study_sets'
      and column_name = 'default_minutes'
  ) then
    alter table public.study_sets
    add column default_minutes int not null default 25 check (default_minutes > 0);
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'study_sources'
      and column_name = 'error_message'
  ) then
    alter table public.study_sources add column error_message text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'questions'
      and column_name = 'origin'
  ) then
    alter table public.questions
    add column origin text not null default 'manual' check (origin in ('manual', 'source_generated'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'questions_source_generated_requires_chunk'
  ) then
    alter table public.questions
    add constraint questions_source_generated_requires_chunk
    check (origin = 'manual' or source_chunk_id is not null);
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'study-sources',
  'study-sources',
  false,
  6291456,
  array['application/pdf', 'text/plain', 'text/markdown']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.study_sets enable row level security;
alter table public.questions enable row level security;
alter table public.study_sources enable row level security;
alter table public.source_chunks enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.question_attempts enable row level security;

drop policy if exists "Users manage their profile" on public.profiles;
create policy "Users manage their profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users manage their settings" on public.user_settings;
create policy "Users manage their settings"
on public.user_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage their study sets" on public.study_sets;
create policy "Users manage their study sets"
on public.study_sets
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read questions through owned sets" on public.questions;
create policy "Users read questions through owned sets"
on public.questions
for select
using (
  exists (
    select 1
    from public.study_sets
    where study_sets.id = questions.study_set_id
      and study_sets.user_id = auth.uid()
  )
);

drop policy if exists "Users insert questions through owned sets" on public.questions;
create policy "Users insert questions through owned sets"
on public.questions
for insert
with check (
  exists (
    select 1
    from public.study_sets
    where study_sets.id = questions.study_set_id
      and study_sets.user_id = auth.uid()
  )
);

drop policy if exists "Users manage their study sources" on public.study_sources;
create policy "Users manage their study sources"
on public.study_sources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read source chunks through owned sources" on public.source_chunks;
create policy "Users read source chunks through owned sources"
on public.source_chunks
for select
using (
  exists (
    select 1
    from public.study_sources
    where study_sources.id = source_chunks.source_id
      and study_sources.user_id = auth.uid()
  )
);

drop policy if exists "Users insert source chunks through owned sources" on public.source_chunks;
create policy "Users insert source chunks through owned sources"
on public.source_chunks
for insert
with check (
  exists (
    select 1
    from public.study_sources
    where study_sources.id = source_chunks.source_id
      and study_sources.user_id = auth.uid()
  )
);

drop policy if exists "Users manage their focus sessions" on public.focus_sessions;
create policy "Users manage their focus sessions"
on public.focus_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage their quiz attempts" on public.quiz_attempts;
create policy "Users manage their quiz attempts"
on public.quiz_attempts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage question attempts through owned quizzes" on public.question_attempts;
create policy "Users manage question attempts through owned quizzes"
on public.question_attempts
for all
using (
  exists (
    select 1
    from public.quiz_attempts
    where quiz_attempts.id = question_attempts.quiz_attempt_id
      and quiz_attempts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.quiz_attempts
    where quiz_attempts.id = question_attempts.quiz_attempt_id
      and quiz_attempts.user_id = auth.uid()
  )
);

drop policy if exists "Users read own source files" on storage.objects;
create policy "Users read own source files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'study-sources'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "Users upload own source files" on storage.objects;
create policy "Users upload own source files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'study-sources'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "Users update own source files" on storage.objects;
create policy "Users update own source files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'study-sources'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
)
with check (
  bucket_id = 'study-sources'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "Users delete own source files" on storage.objects;
create policy "Users delete own source files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'study-sources'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);
