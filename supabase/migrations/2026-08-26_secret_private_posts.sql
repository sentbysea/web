-- ============================================================
-- 비밀글(secret) / 비공개(private) 기능 마이그레이션
--
-- Supabase 대시보드 > SQL Editor 에서 이 파일 내용을 그대로
-- 한 번 실행하면 됩니다. (직접 DB에 접속할 권한이 없어서
-- 이 파일을 실행하는 건 사용자가 직접 해야 합니다.)
--
-- ★ 실행 전에 꼭 확인할 것: posts.id 컬럼 타입.
-- 코드 전체에서 Number(post.id)로 다루는 걸로 봐서 bigint(정수
-- 자동증가 id)라고 가정하고 작성했습니다. 만약 실제로 uuid라면
-- 아래에서 "bigint"라고 쓴 부분을 전부 "uuid"로 바꿔서 실행하세요
-- (posts_id_type 부분: post_contents.post_id, 두 함수의
-- p_post_id 파라미터, 총 4곳).
--
-- 개념:
--   public  : 지금처럼 누구나 목록/본문 다 볼 수 있음 (전체 글 기본값)
--   secret  : 글 목록엔 제목이 그대로 보이지만(자물쇠 아이콘은
--             프론트에서 표시), 본문은 그 글에 설정한 비밀번호를
--             맞혀야만 열림. 비밀번호는 DB에 bcrypt 해시로만
--             저장되고, 대조도 DB 함수 안에서만 일어나서 프론트
--             JS 코드를 아무리 들여다봐도 우회할 방법이 없음.
--   private : 글 목록에도 아예 안 뜨고, 직접 링크로 들어가도
--             안 보임. 글 주인(로그인한 관리자)만 볼 수 있음.
--   주인은 로그인만 되어 있으면 secret/private 둘 다 비밀번호
--   입력 없이 바로 봄 — 아래 RLS가 auth.uid() = user_id일 때는
--   항상 허용하기 때문.
-- ============================================================


-- 0) pgcrypto (비밀번호 해시용, 보통 Supabase 프로젝트엔 이미 있음)

create extension if not exists pgcrypto with schema extensions;


-- 1) posts 테이블에 visibility / 비밀번호 해시 컬럼 추가

alter table public.posts
  add column if not exists visibility text not null default 'public',
  add column if not exists secret_password_hash text;

alter table public.posts
  drop constraint if exists posts_visibility_check;

alter table public.posts
  add constraint posts_visibility_check
  check (visibility in ('public', 'secret', 'private'));


-- 2) 본문(content, ooc_content)을 별도 테이블로 분리.
--
--    이유: RLS(Row Level Security)는 "행" 단위로만 막을 수
--    있어서, 같은 posts 테이블 안에서는 "제목은 목록에 보이되
--    본문만 숨기기"(secret 글)를 구현할 수 없다. 그래서 본문만
--    post_contents로 빼고, 거기에 따로 RLS를 건다.

create table if not exists public.post_contents (
  post_id bigint primary key references public.posts(id) on delete cascade,
  content text not null default '',
  ooc_content text
);

-- 기존 글 내용 이관 (content/ooc_content 컬럼이 아직 posts에
-- 남아있는 상태에서 1회만 실행됨)
insert into public.post_contents (post_id, content, ooc_content)
select id, coalesce(content, ''), ooc_content
from public.posts
on conflict (post_id) do nothing;

-- 이관이 잘 됐는지 확인한 다음 옛 컬럼 제거
-- (되돌릴 수 없는 작업 — 위 INSERT 결과를 select count(*)로 한 번
-- posts 행 수랑 비교해보고 실행하는 걸 권장)
alter table public.posts
  drop column if exists content,
  drop column if exists ooc_content;


-- 3) secret_password_hash는 어떤 경우에도 anon/authenticated가
--    REST API로 직접 읽을 수 없게 "컬럼 단위"로 차단.
--    (RLS는 행 단위라 secret 글의 행 자체는 열어줘야 하는데,
--    그 상태에서 이 컬럼 하나만은 이중으로 확실히 막는 것.
--    이게 없으면 누구든 select=secret_password_hash 로 해시를
--    가져가서 오프라인으로 크랙 시도할 수 있음.)

revoke select (secret_password_hash) on public.posts from anon, authenticated;


-- 4) RLS 켜기

alter table public.posts enable row level security;
alter table public.post_contents enable row level security;


-- 5) SELECT 정책
--
--    ★★★ 중요: Supabase 대시보드 > Authentication > Policies
--    (또는 Table Editor > posts > RLS policies)에서, 기존에
--    있던 "누구나 다 보임" 식의 SELECT 정책을 반드시 지우세요.
--    안 지우면 그 정책이 OR로 겹쳐 적용돼서 private/secret 글도
--    그냥 다 뚫려버립니다. INSERT/UPDATE/DELETE 정책(글 주인만
--    쓰기 가능)은 그대로 둬도 됩니다 — 여긴 안 건드림.

drop policy if exists "posts_select_public_metadata_or_owner" on public.posts;

create policy "posts_select_public_metadata_or_owner"
on public.posts
for select
to anon, authenticated
using (
  visibility <> 'private'
  or auth.uid() = user_id
);


drop policy if exists "post_contents_select_public_or_owner" on public.post_contents;

create policy "post_contents_select_public_or_owner"
on public.post_contents
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_contents.post_id
      and (p.visibility = 'public' or p.user_id = auth.uid())
  )
);


drop policy if exists "post_contents_owner_write" on public.post_contents;

create policy "post_contents_owner_write"
on public.post_contents
for all
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_contents.post_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.posts p
    where p.id = post_contents.post_id
      and p.user_id = auth.uid()
  )
);


-- 6) 비밀번호 설정/변경
--
--    반드시 이 함수를 통해서만 저장됨. 평문 비밀번호는 여기서
--    DB 안에서만 bcrypt 해시로 바뀌고, 클라이언트는 해시를 직접
--    만들거나 저장할 수 없음(secret_password_hash 컬럼은 위 3번
--    에서 이미 직접 쓰기/읽기가 막혀있고, 이 함수는
--    security definer라 글 주인 확인만 통과하면 내부적으로
--    직접 UPDATE함).

create or replace function public.set_post_secret_password(
  p_post_id bigint,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_password is null or length(p_password) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다.';
  end if;

  update public.posts
    set secret_password_hash = crypt(p_password, gen_salt('bf'))
    where id = p_post_id
      and user_id = auth.uid();

  if not found then
    raise exception '권한이 없거나 존재하지 않는 글입니다.';
  end if;
end;
$$;

grant execute on function public.set_post_secret_password(bigint, text)
  to authenticated;


-- 7) 비밀글 열람
--
--    비밀번호가 맞을 때만 본문을 돌려줌. DB 함수 안에서만 대조가
--    이뤄지므로 프론트 JS 코드를 다 봐도 우회할 방법이 없음.

create or replace function public.get_secret_post_content(
  p_post_id bigint,
  p_password text
)
returns table (
  content text,
  ooc_content text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_visibility text;
begin
  select secret_password_hash, visibility
    into v_hash, v_visibility
    from public.posts
    where id = p_post_id;

  if v_visibility is distinct from 'secret' then
    raise exception '비밀글이 아닙니다.';
  end if;

  if v_hash is null or crypt(p_password, v_hash) <> v_hash then
    raise exception '비밀번호가 일치하지 않습니다.';
  end if;

  return query
    select pc.content, pc.ooc_content
    from public.post_contents pc
    where pc.post_id = p_post_id;
end;
$$;

grant execute on function public.get_secret_post_content(bigint, text)
  to anon, authenticated;
