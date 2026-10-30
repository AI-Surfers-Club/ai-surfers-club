-- AI Surfers Club 초기 스키마
-- 쓰기 권한(RLS)은 "본인 행만". 관리자 동작(필터 관리, 다른 사람 글 수정·삭제)은
-- 서버에서 ADMIN_EMAILS를 확인한 뒤 service role 키로 처리하므로 관리자 정책은 두지 않는다.

create extension if not exists pgcrypto;

-- 회원 (가입을 마친 사람). auth.users 1명당 최대 1행
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  team_name text not null check (length(btrim(team_name)) > 0),
  display_name text not null check (length(btrim(display_name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  tagline text not null check (char_length(btrim(tagline)) between 1 and 100),
  description text not null default '',
  url text not null check (url ~* '^https?://[^[:space:]]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_created_at_idx on public.services (created_at desc);
create index services_author_idx on public.services (author_id);

-- 서비스 이미지: position 0번이 대표. 서비스당 최대 10장
create table public.service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  path text not null,
  position int not null check (position between 0 and 9),
  created_at timestamptz not null default now(),
  unique (service_id, position) deferrable initially deferred
);

create table public.filters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) > 0),
  created_at timestamptz not null default now()
);

create table public.service_filters (
  service_id uuid not null references public.services (id) on delete cascade,
  filter_id uuid not null references public.filters (id) on delete cascade,
  primary key (service_id, filter_id)
);

-- 서비스당 이미지 10장 제한
create or replace function public.enforce_service_image_limit() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.service_images where service_id = new.service_id) >= 10 then
    raise exception 'service % already has 10 images', new.service_id using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
create trigger service_images_limit
  before insert on public.service_images
  for each row execute function public.enforce_service_image_limit();

-- updated_at 자동 갱신
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger services_touch before update on public.services for each row execute function public.touch_updated_at();

-- 이메일을 빼고 팀·이름만 보여주는 공개 뷰
create view public.public_profiles as
  select id, team_name, display_name from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_images enable row level security;
alter table public.filters enable row level security;
alter table public.service_filters enable row level security;

-- profiles: 본인 행만 읽고 쓴다 (다른 사람 팀·이름은 public_profiles 뷰로)
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- services: 누구나 읽고, 작성자 본인만 쓴다
create policy services_select_all on public.services for select using (true);
create policy services_insert_own on public.services for insert to authenticated with check (author_id = auth.uid());
create policy services_update_own on public.services for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy services_delete_own on public.services for delete to authenticated using (author_id = auth.uid());

-- service_images, service_filters: 누구나 읽고, 서비스 작성자만 쓴다
create policy service_images_select_all on public.service_images for select using (true);
create policy service_images_write_own on public.service_images for all to authenticated
  using (exists (select 1 from public.services s where s.id = service_id and s.author_id = auth.uid()))
  with check (exists (select 1 from public.services s where s.id = service_id and s.author_id = auth.uid()));

create policy service_filters_select_all on public.service_filters for select using (true);
create policy service_filters_write_own on public.service_filters for all to authenticated
  using (exists (select 1 from public.services s where s.id = service_id and s.author_id = auth.uid()))
  with check (exists (select 1 from public.services s where s.id = service_id and s.author_id = auth.uid()));

-- filters: 누구나 읽기만 (관리는 서버의 service role)
create policy filters_select_all on public.filters for select using (true);

-- ---------- Storage: thumbnails 버킷 ----------
insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true)
  on conflict (id) do nothing;

create policy thumbnails_read_all on storage.objects for select
  using (bucket_id = 'thumbnails');
create policy thumbnails_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);
create policy thumbnails_update_own on storage.objects for update to authenticated
  using (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);
create policy thumbnails_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

-- 시작 필터
insert into public.filters (name) values
  ('ChatGPT'), ('Claude'), ('Gemini'), ('업무자동화'), ('데이터분석'), ('콘텐츠제작'), ('사내툴')
  on conflict (name) do nothing;
