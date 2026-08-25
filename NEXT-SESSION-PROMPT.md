이 프로젝트(바이브.me, Supabase 백엔드 정적 사이트) 이어서 작업할게.

## 오늘(지난 세션) 마무리된 것 — 재확인 불필요
- 에디터 프리뷰/발췌(export) 여러 버그 근본 원인 찾아서 고침: html2canvas가 여러 줄 하이라이트 배경을 못 그리는 버그, 부모 확대/축소 transform이 캡처에 그대로 반영되던 버그, html2canvas가 CSS 변수(var())를 아예 못 읽어서 padding/제목 여백이 캡처 시에만 사라지던 버그.
- 모바일 클립보드 복사 export(user gesture 만료 문제) 수정, 데스크톱 다운로드는 그대로 유지.
- OOC(독자에게 안 보이는 메모) 필드 추가, HTML 모드(글 전체를 raw HTML로 작성/출력) 추가 — 둘 다 OOC 버튼 옆에 나란히, HTML 모드 토글 시 hidden 처리 안 되던 CSS 우선순위 버그도 고침.
- HTML 모드 글이 화면보다 넓을 때 자동 축소 + 가운데 정렬.
- admin-quote 프리셋 활성화(is_active) 기능, 실제 글/발췌 연동 확인 완료.
- 본문 폰트 최소 13px 강제하던 코드 제거, `<br>` 기반 에디터 콘텐츠에 문단 간격(paragraphSpacing)이 전혀 안 먹던 버그 수정 — admin-quote 미리보기와 실제 에디터 프리뷰가 다르게 보이던 핵심 원인이었음.
- 캐시 문제 방지용 cache-busting 쿼리 파라미터 추가.

## 오늘 못 끝낸 것 — 이어서 할 것
1. **출처(source) 텍스트가 export 이미지에서 가끔 명조체로 나오는 문제.** Chromium/WebKit 데스크톱 환경에서는 재현을 못 했음(실제 모바일 사파리나 카카오톡 인앱 브라우저 특유의 폰트 fallback 문제로 추정). 방어책으로 title/body/source에 `font-family: "Pretendard", sans-serif`를 명시적으로 인라인 지정하기로 했는데 아직 적용 안 함 — `posts/posts-preview.js`의 `applyPreviewTitleStyle`, `posts/posts-style.js`의 `applyPostBodyStyles`, `posts/posts-preview.js`의 `createPreviewSource`에 추가하면 됨.

2. **발췌 이미지 부분 선택 기능** (아직 설계도 안 한 상태). 지금은 프리뷰/export가 항상 본문 전체를 발췌함 — 본문 중 원하는 부분만 골라서 발췌하는 기능 추가 희망. 기본 동작(전체 발췌)은 유지, 부분 선택은 추가 옵션으로. 에디터에서 드래그 선택할지, 프리뷰 캔버스 위에서 직접 범위 지정할지 아직 미정 — 장단점 비교해서 방향부터 같이 정하고 시작. 관련 파일: `posts/posts-preview.js` (renderEditorPreviewPages, createEditorPreviewPage), `posts/posts-editor.js` (getRichEditorHTML), `posts/posts.html` (에디터 툴바), `posts/posts.js`. 페이지 분할(PAGE BREAK) 로직과 "부분 선택"이 어떻게 상호작용해야 할지도 같이 고민 필요.

먼저 1번부터 마저 처리하고, 그 다음 2번은 설계 방향부터 논의해서 정하자.
