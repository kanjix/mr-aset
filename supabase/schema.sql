-- =====================================================================
-- Схема базы для сайта репетитора.
-- Вставьте весь файл в Supabase -> SQL Editor -> New query -> Run.
-- Скрипт можно запускать один раз на чистом проекте.
-- =====================================================================

-- ---------- Таблицы ----------

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'blocked')),
  group_id uuid references public.groups(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('book', 'presentation', 'video')),
  file_path text,   -- путь к файлу в хранилище (книги, презентации)
  url text,         -- ссылка (видеоуроки)
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  meet_url text,
  created_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  photo_paths text[] not null default '{}',   -- пути к фото в хранилище, сами фото в базе не лежат
  status text not null default 'submitted' check (status in ('submitted', 'graded')),
  grade text,
  comment text,
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,  -- null = всем группам
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------- Вспомогательные функции ----------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Группа текущего ученика (только если аккаунт подтверждён)
create or replace function public.my_group()
returns uuid
language sql stable security definer set search_path = public
as $$
  select group_id from public.profiles where id = auth.uid() and status = 'approved';
$$;

-- ---------- Автосоздание профиля при регистрации ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- Права доступа (Row Level Security) ----------

alter table public.groups enable row level security;
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.lessons enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.announcements enable row level security;

-- profiles: свой профиль видит каждый, менять может только админ
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: admin write" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- groups
create policy "groups: read own group or admin" on public.groups
  for select using (public.is_admin() or id = public.my_group());
create policy "groups: admin write" on public.groups
  for all using (public.is_admin()) with check (public.is_admin());

-- materials
create policy "materials: read own group" on public.materials
  for select using (public.is_admin() or group_id = public.my_group());
create policy "materials: admin write" on public.materials
  for all using (public.is_admin()) with check (public.is_admin());

-- lessons
create policy "lessons: read own group" on public.lessons
  for select using (public.is_admin() or group_id = public.my_group());
create policy "lessons: admin write" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- assignments
create policy "assignments: read own group" on public.assignments
  for select using (public.is_admin() or group_id = public.my_group());
create policy "assignments: admin write" on public.assignments
  for all using (public.is_admin()) with check (public.is_admin());

-- announcements (group_id is null = для всех подтверждённых учеников)
create policy "announcements: read" on public.announcements
  for select using (
    public.is_admin()
    or group_id = public.my_group()
    or (group_id is null and public.my_group() is not null)
  );
create policy "announcements: admin write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- submissions: ученик видит и сдаёт только свои, оценку ставит только админ
create policy "submissions: read own or admin" on public.submissions
  for select using (student_id = auth.uid() or public.is_admin());

create policy "submissions: student insert" on public.submissions
  for insert with check (
    student_id = auth.uid()
    and status = 'submitted'
    and grade is null
    and comment is null
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.group_id = public.my_group()
    )
  );

create policy "submissions: student update until graded" on public.submissions
  for update
  using (student_id = auth.uid() and status = 'submitted')
  with check (student_id = auth.uid() and status = 'submitted' and grade is null and comment is null);

create policy "submissions: admin write" on public.submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Хранилище файлов ----------
-- materials: книги и презентации (папка = id группы)
-- submissions: фото работ (папка = id ученика), не больше 5 МБ и только картинки

insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "materials files: read own group" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'materials'
    and (public.is_admin() or (storage.foldername(name))[1] = public.my_group()::text)
  );

create policy "materials files: admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'materials' and public.is_admin())
  with check (bucket_id = 'materials' and public.is_admin());

create policy "submission files: student own folder" on storage.objects
  for all to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "submission files: admin" on storage.objects
  for all to authenticated
  using (bucket_id = 'submissions' and public.is_admin())
  with check (bucket_id = 'submissions' and public.is_admin());

-- =====================================================================
-- ПОСЛЕ запуска: зарегистрируйтесь на сайте, затем выполните отдельным
-- запросом (подставьте свою почту), чтобы стать администратором:
--
--   update public.profiles
--   set role = 'admin', status = 'approved'
--   where email = 'ваша@почта.com';
-- =====================================================================
