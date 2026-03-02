-- 在 Supabase SQL 编辑器中执行此脚本
-- 1. 打开 Supabase 项目 → SQL Editor → New query，粘贴并运行

-- 评估码表
create table if not exists public.eval_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- 允许匿名用户：查询（校验码）、更新 used 为 true（核销）
alter table public.eval_codes enable row level security;

drop policy if exists "anon_select" on public.eval_codes;
create policy "anon_select" on public.eval_codes for select to anon using (true);

drop policy if exists "anon_update_used" on public.eval_codes;
create policy "anon_update_used" on public.eval_codes for update to anon
  using (true) with check (used = true);

-- 存放生成码所需密码（先建表，函数会用到）
create table if not exists public.admin_config (key text primary key, value text);
insert into public.admin_config (key, value) values ('gen_password', 'Xiangtai2024')
  on conflict (key) do update set value = excluded.value;

-- 系统自动生成评估码：客服在 admin-eval.html 输入密码后调用，返回新码
create or replace function public.generate_eval_code(admin_pwd text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  stored_pwd text;
begin
  select value into stored_pwd from public.admin_config where key = 'gen_password';
  if stored_pwd is null or admin_pwd is null or stored_pwd != admin_pwd then
    raise exception 'invalid';
  end if;
  new_code := 'XT' || to_char(now(), 'YYYYMMDD') || upper(substr(md5(random()::text), 1, 6));
  insert into public.eval_codes (code) values (new_code);
  return new_code;
end;
$$;

grant execute on function public.generate_eval_code(text) to anon;

-- 批量生成评估码（一次请求返回多个，更快）
create or replace function public.generate_eval_codes(admin_pwd text, n int)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_pwd text;
  new_codes text[] := '{}';
  i int;
  new_code text;
begin
  select value into stored_pwd from public.admin_config where key = 'gen_password';
  if stored_pwd is null or admin_pwd is null or stored_pwd != admin_pwd then
    raise exception 'invalid';
  end if;
  n := least(greatest(coalesce(n, 1), 1), 20);
  for i in 1..n loop
    new_code := 'XT' || to_char(now(), 'YYYYMMDD') || upper(substr(md5(random()::text || i::text), 1, 6));
    insert into public.eval_codes (code) values (new_code);
    new_codes := array_append(new_codes, new_code);
  end loop;
  return new_codes;
end;
$$;

grant execute on function public.generate_eval_codes(text, int) to anon;
