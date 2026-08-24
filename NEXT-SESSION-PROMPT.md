web-main 프로젝트에서 이어서 작업할 두 가지가 있어.

1. 발췌 이미지 부분 선택 기능
   지금은 프리뷰/export가 항상 본문 전체를 발췌해서 캔버스에 렌더링해.
   여기에 "본문 중 원하는 일부분만 골라서 발췌"하는 기능을 추가하고 싶어.
   - 기본 동작(전체 발췌)은 그대로 유지, 부분 선택은 추가 옵션으로.
   - 아직 결정 못한 것: 이 선택을 에디터에서 하게 할지(예: 리치 에디터에서
     텍스트 드래그로 선택) 프리뷰에서 하게 할지(예: 렌더링된 캔버스 위에서
     직접 범위 지정). 프리뷰 쪽이 더 나을 것 같다는 감이 있지만 확정은 아님 —
     장단점 비교해서 방향부터 같이 정하고 시작해줘.
   - 관련 파일: posts/posts-preview.js (renderEditorPreviewPages,
     createEditorPreviewPage), posts/posts-editor.js (getRichEditorHTML),
     posts/posts.html (에디터 툴바), posts/posts.js.
   - 페이지 분할(PAGE BREAK)/페이지네이션 로직과 "부분 선택"이 어떻게
     상호작용해야 할지도 같이 고민 필요.

2. [버그] admin-quote 프리셋이 실제 게시글 화면에는 제대로 안 먹는 것 같음
   목표는 admin-quote에서 설정한 QUOTE 프리셋(postStyleSettings)이
   (a) 실제 발행된 게시글 상세 화면(.post-detail-content, 독자가 보는 화면)과
   (b) 에디터 프리뷰/export 캔버스(.post-editor-preview-content)
   양쪽에 동일하게 반영되는 것이었는데, 실제 게시글 쪽에서 문단 모양이나
   자간 같은 게 제대로 반영이 안 되는 느낌이야. 원인부터 조사해줘.
   - 확인할 것: .post-detail-content가 렌더링되는 코드 경로(posts-view.js)가
     프리뷰 쪽에서 쓰는 스타일 적용 함수(posts-style.js의
     applyPostBodyStyles / renderStyledPostContentInto 등)를 실제로
     똑같이 타는지, 아니면 다르거나 불완전한 경로로 렌더링되는지.
   - 재현: 아무 게시글이나 열어서 문단 간격/자간이 admin-quote 프리셋
     설정값과 다르게 보이는지 직접 비교.

먼저 원인/설계 방향을 파악해서 설명해주고, 내가 동의하면 그 다음에 구현해줘.
