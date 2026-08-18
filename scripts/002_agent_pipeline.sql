-- =========================================================
-- 002_agent_pipeline.sql
-- Agent 流水线：故事圣经、角色状态、伏笔追踪、Agent 运行日志
-- 以及修复 novel_projects / novel_chapters 的 status CHECK 约束漂移问题
--
-- 与 001_create_tables.sql 一样，在 Supabase SQL editor 中手动执行。
-- 所有语句都使用 if not exists / if exists，可安全重复执行。
-- =========================================================

-- ---------------------------------------------------------
-- 修复 novel_projects.status 约束漂移
-- 实际代码写入的状态值为 draft/structuring/outlining/writing/completed，
-- 但 001 中的约束只允许 draft/in_progress/completed —— 导致写入被拒绝。
-- （components/dashboard/dashboard-client.tsx 的 statusConfig 已经按 5 个
-- 值设计 UI，说明这是约束落后于代码，而非代码有误。）
--
-- 用动态查找替代硬编码约束名：001 中该约束是内联定义的，实际部署环境中
-- 的自动生成约束名可能与本地约定不同，直接 DROP CONSTRAINT <猜测名> 在
-- 生产数据上有风险，因此改为按约束体内容查找后再删除。
-- ---------------------------------------------------------
do $$
declare
  con_name text;
begin
  select conname into con_name
  from pg_constraint
  where conrelid = 'public.novel_projects'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if con_name is not null then
    execute format('alter table public.novel_projects drop constraint %I', con_name);
  end if;
end $$;

alter table public.novel_projects add constraint novel_projects_status_check
  check (status in ('draft', 'structuring', 'outlining', 'writing', 'completed'));

-- current_step 列从未被任何代码读取或写入（已通过全仓库搜索确认），清理掉
alter table public.novel_projects drop column if exists current_step;

-- 新增：流水线模式、钩子密度、一句话简介
alter table public.novel_projects add column if not exists pipeline_mode text not null default 'fast'
  check (pipeline_mode in ('fast', 'quality'));
alter table public.novel_projects add column if not exists hook_cadence integer not null default 3;
alter table public.novel_projects add column if not exists blurb text;

-- ---------------------------------------------------------
-- novel_structures 扩展：目标阶梯、反派势力、类型元素
-- ---------------------------------------------------------
alter table public.novel_structures add column if not exists protagonist_goal_ladder jsonb not null default '[]'::jsonb;
alter table public.novel_structures add column if not exists antagonist_forces jsonb not null default '[]'::jsonb;
alter table public.novel_structures add column if not exists genre_tropes jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------
-- 修复 novel_chapters.status 约束漂移（同上，动态查找约束名）
-- 扩展状态机以支持流水线各阶段
-- ---------------------------------------------------------
do $$
declare
  con_name text;
begin
  select conname into con_name
  from pg_constraint
  where conrelid = 'public.novel_chapters'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if con_name is not null then
    execute format('alter table public.novel_chapters drop constraint %I', con_name);
  end if;
end $$;

alter table public.novel_chapters add constraint novel_chapters_status_check
  check (status in ('pending', 'drafting', 'hook_review', 'continuity_check', 'quality_review', 'revising', 'completed', 'failed'));

alter table public.novel_chapters add column if not exists beat_type text
  check (beat_type in ('setup', 'rising', 'satisfaction', 'suspense', 'twist', 'cliffhanger'));
alter table public.novel_chapters add column if not exists is_golden_chapter boolean not null default false;
alter table public.novel_chapters add column if not exists hook_notes text;
alter table public.novel_chapters add column if not exists quality_score integer;
alter table public.novel_chapters add column if not exists needs_review boolean not null default false;

-- ---------------------------------------------------------
-- 故事圣经：随章节推进而更新的世界观事实（每个项目一行）
-- ---------------------------------------------------------
create table if not exists public.novel_story_bible (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.novel_projects(id) on delete cascade,
  world_facts text[] not null default array[]::text[],
  updated_through_chapter integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id)
);

-- ---------------------------------------------------------
-- 角色实时状态：与 novel_characters（静态设定）分离，
-- 避免"重新生成故事架构"时因 delete+insert 角色而级联清空已积累的状态
-- ---------------------------------------------------------
create table if not exists public.novel_character_states (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.novel_projects(id) on delete cascade,
  character_id uuid not null references public.novel_characters(id) on delete cascade,
  current_state text,
  relationships text,
  updated_through_chapter integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(character_id)
);

-- ---------------------------------------------------------
-- 伏笔/情节线追踪
-- 注意：planted_chapter / intended_payoff_chapter / actual_payoff_chapter
-- 使用章节序号（integer）而非外键，因为大纲生成是分批插入 novel_chapters 的，
-- 埋设伏笔时预计回收的章节可能尚未插入数据库
-- ---------------------------------------------------------
create table if not exists public.novel_plot_threads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.novel_projects(id) on delete cascade,
  title text not null,
  description text,
  importance text not null default 'minor' check (importance in ('minor', 'major')),
  status text not null default 'planted' check (status in ('planted', 'reinforced', 'paid_off', 'abandoned')),
  planted_chapter integer not null,
  intended_payoff_chapter integer,
  actual_payoff_chapter integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------
-- Agent 运行日志：审计 + 质量分历史 + 可恢复性的辅助记录
-- chapter_id 允许为空：architect/outline 阶段是项目级而非章节级
-- ---------------------------------------------------------
create table if not exists public.novel_agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.novel_projects(id) on delete cascade,
  chapter_id uuid references public.novel_chapters(id) on delete cascade,
  stage text not null check (stage in ('architect', 'outline', 'draft', 'hook_doctor', 'continuity_check', 'quality_critic', 'reviser')),
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  model text,
  output_summary jsonb,
  error_message text,
  duration_ms integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------
-- 索引
-- ---------------------------------------------------------
create index if not exists idx_novel_story_bible_project_id on public.novel_story_bible(project_id);
create index if not exists idx_novel_character_states_project_id on public.novel_character_states(project_id);
create index if not exists idx_novel_character_states_character_id on public.novel_character_states(character_id);
create index if not exists idx_novel_plot_threads_project_id on public.novel_plot_threads(project_id);
create index if not exists idx_novel_plot_threads_status on public.novel_plot_threads(status);
create index if not exists idx_novel_agent_runs_project_id on public.novel_agent_runs(project_id);
create index if not exists idx_novel_agent_runs_chapter_id on public.novel_agent_runs(chapter_id);

-- ---------------------------------------------------------
-- RLS（与 001 中 novel_chapters 的策略模式一致：通过 project_id 一跳关联到 novel_projects.user_id）
-- ---------------------------------------------------------
alter table public.novel_story_bible enable row level security;
alter table public.novel_character_states enable row level security;
alter table public.novel_plot_threads enable row level security;
alter table public.novel_agent_runs enable row level security;

drop policy if exists "story_bible_select_own" on public.novel_story_bible;
drop policy if exists "story_bible_insert_own" on public.novel_story_bible;
drop policy if exists "story_bible_update_own" on public.novel_story_bible;
drop policy if exists "story_bible_delete_own" on public.novel_story_bible;
create policy "story_bible_select_own" on public.novel_story_bible for select
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "story_bible_insert_own" on public.novel_story_bible for insert
  with check (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "story_bible_update_own" on public.novel_story_bible for update
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "story_bible_delete_own" on public.novel_story_bible for delete
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));

drop policy if exists "character_states_select_own" on public.novel_character_states;
drop policy if exists "character_states_insert_own" on public.novel_character_states;
drop policy if exists "character_states_update_own" on public.novel_character_states;
drop policy if exists "character_states_delete_own" on public.novel_character_states;
create policy "character_states_select_own" on public.novel_character_states for select
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "character_states_insert_own" on public.novel_character_states for insert
  with check (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "character_states_update_own" on public.novel_character_states for update
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "character_states_delete_own" on public.novel_character_states for delete
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));

drop policy if exists "plot_threads_select_own" on public.novel_plot_threads;
drop policy if exists "plot_threads_insert_own" on public.novel_plot_threads;
drop policy if exists "plot_threads_update_own" on public.novel_plot_threads;
drop policy if exists "plot_threads_delete_own" on public.novel_plot_threads;
create policy "plot_threads_select_own" on public.novel_plot_threads for select
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "plot_threads_insert_own" on public.novel_plot_threads for insert
  with check (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "plot_threads_update_own" on public.novel_plot_threads for update
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "plot_threads_delete_own" on public.novel_plot_threads for delete
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));

drop policy if exists "agent_runs_select_own" on public.novel_agent_runs;
drop policy if exists "agent_runs_insert_own" on public.novel_agent_runs;
drop policy if exists "agent_runs_update_own" on public.novel_agent_runs;
drop policy if exists "agent_runs_delete_own" on public.novel_agent_runs;
create policy "agent_runs_select_own" on public.novel_agent_runs for select
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "agent_runs_insert_own" on public.novel_agent_runs for insert
  with check (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "agent_runs_update_own" on public.novel_agent_runs for update
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));
create policy "agent_runs_delete_own" on public.novel_agent_runs for delete
  using (exists (select 1 from public.novel_projects where id = project_id and user_id = auth.uid()));

-- ---------------------------------------------------------
-- updated_at 触发器（复用 001 中已定义的 update_updated_at()）
-- ---------------------------------------------------------
drop trigger if exists novel_story_bible_updated_at on public.novel_story_bible;
create trigger novel_story_bible_updated_at before update on public.novel_story_bible
  for each row execute function public.update_updated_at();

drop trigger if exists novel_character_states_updated_at on public.novel_character_states;
create trigger novel_character_states_updated_at before update on public.novel_character_states
  for each row execute function public.update_updated_at();

drop trigger if exists novel_plot_threads_updated_at on public.novel_plot_threads;
create trigger novel_plot_threads_updated_at before update on public.novel_plot_threads
  for each row execute function public.update_updated_at();
