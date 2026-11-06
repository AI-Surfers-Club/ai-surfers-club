-- About Us: 서퍼스 크루 캐릭터 번호(0~19)와, 관리자가 정하는 About Us 그룹
-- character 가 null 이면 계정마다 다른 기본 캐릭터, about_group 이 null 이면 About Us 에 나오지 않는다
alter table public.profiles
  add column character smallint check (character is null or character between 0 and 19),
  add column about_group text check (about_group is null or about_group in ('surfer', 'crew'));

-- 공개 뷰에도 내보낸다 (이메일은 여전히 빼고)
create or replace view public.public_profiles as
  select id, team_name, display_name, character, about_group from public.profiles;

-- About Us 그룹은 관리자만 바꾼다. 회원은 profiles 본인 행을 직접 고칠 수 있으므로(profiles_update_own),
-- 브라우저 키(anon·authenticated)로 들어온 요청이 about_group 을 바꾸려 하면 막는다.
-- 관리자 동작은 서버에서 service role 로 하므로 통과한다.
create or replace function public.guard_about_group() returns trigger
language plpgsql as $$
begin
  if current_user in ('anon', 'authenticated') and (
    (tg_op = 'INSERT' and new.about_group is not null) or
    (tg_op = 'UPDATE' and new.about_group is distinct from old.about_group)
  ) then
    raise exception 'about_group 은 관리자만 바꿀 수 있어요' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger profiles_guard_about_group
  before insert or update on public.profiles
  for each row execute function public.guard_about_group();
