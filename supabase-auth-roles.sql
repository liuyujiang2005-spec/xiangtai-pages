-- 用户角色表（配合 Supabase Auth 使用）
-- 在 Supabase SQL Editor 中执行

-- 用户档案与角色：id 对应 auth.users.id
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('admin', 'employee', 'customer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- 用户只能读自己的 profile
create policy "users_read_own" on public.profiles for select using (auth.uid() = id);
-- 仅允许插入自己的 profile（注册时触发）
create policy "users_insert_own" on public.profiles for insert with check (auth.uid() = id);
-- 用户只能更新自己的 profile（不含 role）；管理员改 role 需在后台或 service_role 做
create policy "users_update_own" on public.profiles for update using (auth.uid() = id);

-- 注册时自动创建 profile（角色默认 customer）
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'customer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 首次创建后，在 Table Editor 中把某个用户的 role 改为 'admin' 或 'employee'
-- 例如：update profiles set role = 'admin' where email = 'your@email.com';