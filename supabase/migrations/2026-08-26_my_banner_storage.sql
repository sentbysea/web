-- ============================================================
-- MY BANNER (Supabase Storage) — 실행 전 검토용
--
-- ★ 아직 프론트엔드 코드는 안 만들었습니다. 아래 SQL을
-- 검토하시고 SQL Editor에서 실행해주시면, 그다음에
-- admin의 MY BANNER 화면 + 관련 JS를 만들겠습니다.
--
-- 개념:
--   - 배너 이미지 파일 자체는 Supabase Storage
--     "user-banners" 버킷의 {user_id}/banner 경로에
--     "덮어쓰기(upsert)"로만 저장 — 확장자를 안 붙여서
--     나중에 jpg→png 등으로 바꿔도 파일 경로/URL이
--     절대 안 바뀜(실제 파일 형식은 Storage가
--     content-type 메타데이터로 따로 기억해서 서빙함).
--   - 배너 클릭 시 이동할 URL(외부 링크)은 이미지가 아니라
--     "값"이라서 기존에 쓰던 site_content 테이블(소개글/
--     BGM 저장할 때 쓰는 그 테이블)에 section='banner_url'로
--     같이 저장 — 새 테이블 안 만들어도 됨.
-- ============================================================


-- 1) Storage 버킷 생성
--    ★ 이 부분은 SQL이 아니라 Supabase 대시보드에서
--    직접 만들어야 합니다(버킷 생성은 Dashboard 전용 —
--    아래 "대시보드에서 할 일" 참고). 버킷 생성 후에는
--    아래 2)~3) SQL만 실행하면 됩니다.


-- 2) storage.objects에 RLS 정책 추가
--    (버킷 자체는 "Public bucket"으로 만들어도, 실제
--    읽기/쓰기 허용 여부는 이 정책들이 최종 결정함)

drop policy if exists "user_banners_public_read" on storage.objects;

create policy "user_banners_public_read"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'user-banners'
);


-- 본인 폴더({user_id}/...)에만 업로드/수정/삭제 가능.
-- storage.foldername(name)은 경로를 "/"로 쪼갠 배열을
-- 돌려주므로, [1]이 맨 앞 폴더 = user_id가 된다.

drop policy if exists "user_banners_owner_write" on storage.objects;

create policy "user_banners_owner_write"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'user-banners'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'user-banners'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- 3) site_content에 배너 클릭 URL 저장 자리 마련
--    (section='banner_url'). 기존 about/notice/ng/bgm_url과
--    같은 방식 — 유저당 한 행만 있어야 하므로 유니크 제약을
--    보장해두고, 없으면 채워넣는다.

alter table public.site_content
  drop constraint if exists site_content_user_section_key;

alter table public.site_content
  add constraint site_content_user_section_key
  unique (user_id, section);


insert into public.site_content (user_id, section, content)
select id, 'banner_url', ''
from auth.users
on conflict (user_id, section) do nothing;
