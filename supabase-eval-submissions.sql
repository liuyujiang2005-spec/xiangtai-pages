-- 评估方案提交表：客户提交的评估表数据会写入此表，客服可在 Supabase Table Editor 查看
-- 在 Supabase → SQL Editor 中执行此脚本

create table if not exists public.eval_submissions (
  id uuid default gen_random_uuid() primary key,
  eval_code text not null,
  name text,
  phone text,
  company text,
  mall text,
  product_type text,
  logistics text,
  qualification text,
  qual_method text,
  work_visa text,
  work_visa_addr text,
  invoicing text,
  rep_account_visit text,
  remark text,
  created_at timestamptz default now()
);

-- 若表已存在且为旧结构，可执行以下语句新增列（按需执行一次）：
-- alter table public.eval_submissions add column if not exists product_type text;
-- alter table public.eval_submissions add column if not exists logistics text;
-- alter table public.eval_submissions add column if not exists qualification text;
-- alter table public.eval_submissions add column if not exists qual_method text;
-- alter table public.eval_submissions add column if not exists work_visa text;
-- alter table public.eval_submissions add column if not exists work_visa_addr text;
-- alter table public.eval_submissions add column if not exists invoicing text;
-- alter table public.eval_submissions add column if not exists rep_account_visit text;

alter table public.eval_submissions enable row level security;

-- 允许匿名用户插入（客户提交）；不允许匿名查询/修改
drop policy if exists "anon_insert" on public.eval_submissions;
create policy "anon_insert" on public.eval_submissions for insert to anon with check (true);

-- 如需客服在 Supabase 后台查看，需用 service_role 或已登录用户查询；此处不开放 anon 的 select
