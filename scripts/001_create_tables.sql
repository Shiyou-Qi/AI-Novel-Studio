-- 用户资料表
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 小说项目表
create table if not exists public.novel_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  core_idea text not null,
  genre text not null,
  target_chapters integer not null default 10,
  words_per_chapter integer not null default 2000,
  writing_guidance text,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  current_step text not null default 'create' check (current_step in ('create', 'structure', 'outline', 'write', 'export')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 小说架构表
create table if not exists public.novel_structures (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.novel_projects(id) on delete cascade,
  world_setting text,
  story_synopsis text,
  themes text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id)
);

-- 角色表
create table if not exists public.novel_characters (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.novel_structures(id) on delete cascade,
  name text not null,
  role text not null,
  description text,
  motivation text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 章节大纲表
create table if not exists public.novel_chapters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.novel_projects(id) on delete cascade,
  chapter_number integer not null,
  title text not null,
  outline text,
  content text,
  word_count integer default 0,
  status text not null default 'pending' check (status in ('pending', 'writing', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, chapter_number)
);

-- 创建索引
create index if not exists idx_novel_projects_user_id on public.novel_projects(user_id);
create index if not exists idx_novel_projects_status on public.novel_projects(status);
create index if not exists idx_novel_chapters_project_id on public.novel_chapters(project_id);
create index if not exists idx_novel_characters_structure_id on public.novel_characters(structure_id);

-- 启用 RLS
alter table public.profiles enable row level security;
alter table public.novel_projects enable row level security;
alter table public.novel_structures enable row level security;
alter table public.novel_characters enable row level security;
alter table public.novel_chapters enable row level security;

-- Profiles RLS 策略
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Novel Projects RLS 策略
create policy "projects_select_own" on public.novel_projects for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.novel_projects for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.novel_projects for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.novel_projects for delete using (auth.uid() = user_id);

-- Novel Structures RLS 策略 (通过 project 关联)
create policy "structures_select_own" on public.novel_structures for select 
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "structures_insert_own" on public.novel_structures for insert 
  with check (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "structures_update_own" on public.novel_structures for update 
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "structures_delete_own" on public.novel_structures for delete 
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));

-- Novel Characters RLS 策略 (通过 structure -> project 关联)
create policy "characters_select_own" on public.novel_characters for select 
  using (exists (
    select 1 from public.novel_structures s 
    join public.novel_projects p on s.project_id = p.id 
    where s.id = structure_id and p.user_id = auth.uid()
  ));
create policy "characters_insert_own" on public.novel_characters for insert 
  with check (exists (
    select 1 from public.novel_structures s 
    join public.novel_projects p on s.project_id = p.id 
    where s.id = structure_id and p.user_id = auth.uid()
  ));
create policy "characters_update_own" on public.novel_characters for update 
  using (exists (
    select 1 from public.novel_structures s 
    join public.novel_projects p on s.project_id = p.id 
    where s.id = structure_id and p.user_id = auth.uid()
  ));
create policy "characters_delete_own" on public.novel_characters for delete 
  using (exists (
    select 1 from public.novel_structures s 
    join public.novel_projects p on s.project_id = p.id 
    where s.id = structure_id and p.user_id = auth.uid()
  ));

-- Novel Chapters RLS 策略 (通过 project 关联)
create policy "chapters_select_own" on public.novel_chapters for select 
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "chapters_insert_own" on public.novel_chapters for insert 
  with check (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "chapters_update_own" on public.novel_chapters for update 
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "chapters_delete_own" on public.novel_chapters for delete 
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));

-- 用户注册触发器 - 自动创建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 更新时间戳触发器
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles 
  for each row execute function public.update_updated_at();
create trigger novel_projects_updated_at before update on public.novel_projects 
  for each row execute function public.update_updated_at();
create trigger novel_structures_updated_at before update on public.novel_structures 
  for each row execute function public.update_updated_at();
create trigger novel_chapters_updated_at before update on public.novel_chapters 
  for each row execute function public.update_updated_at();
