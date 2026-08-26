/* =========================================================
   POSTS - REFS / STATE / SMALL HELPERS

   posts.js가 너무 커져서(3200줄+) 기능별로 쪼갠 것 중
   첫 번째 파일. posts/editor/ 폴더의 다른 파일들은
   전부 여기 있는 DOM 참조와 상태 변수를 공유해서 쓰므로
   반드시 이 파일이 제일 먼저 로드돼야 함(index.html의
   postsDependencyScripts 순서 참고).

   내용: 라우팅(buildPostRoute 등), 에디터/툴바/프리뷰
   DOM 요소 참조, 프리뷰 페이지 상태, 날짜 포맷, 메뉴
   열고닫기, 로그인 사용자 조회(getSignedInUser).

   실제 기능 로직(저장, 목록/상세, 리치에디터 이벤트,
   하이라이트/툴바, 페이지 이동 등)은 같은 폴더의 다른
   파일들에 나눠져 있음 — 각 파일 맨 위 주석 참고.
========================================================== */


/* =========================================================
   ROUTING
========================================================== */

const SITE_BASE_PATH =
  window.location.hostname.endsWith(".github.io")
    ? (
        "/" +
        (
          window.location.pathname
            .split("/")
            .filter(Boolean)[0] || ""
        )
      ).replace(/\/$/, "")
    : "";


function buildPostRoute(path = "/") {

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return (
    `${SITE_BASE_PATH}${normalizedPath}` ||
    "/"
  );

}


function getPostRoutePath() {

  let pathname =
    window.location.pathname;


  if (
    SITE_BASE_PATH &&
    pathname.startsWith(
      SITE_BASE_PATH
    )
  ) {

    pathname =
      pathname.slice(
        SITE_BASE_PATH.length
      ) || "/";

  }


  return pathname;

}



/* =========================================================
   ELEMENTS
========================================================== */

const postArea =
  document.getElementById(
    "postArea"
  );


/*
  글 읽기 화면은 window가 아니라 #postArea 안에서
  자체적으로 스크롤되므로, 메뉴/음악 버튼 숨김 함수
  (script.js, 전역)를 여기서도 그대로 호출해준다.
*/

postArea?.addEventListener(
  "scroll",
  () => {

    updateFixedButtonsOnScroll?.(
      postArea.scrollTop
    );

  },
  {
    passive: true
  }
);

const postPageTitle =
  document.getElementById(
    "postPageTitle"
  );

const postList =
  document.getElementById(
    "postList"
  );

const postDetail =
  document.getElementById(
    "postDetail"
  );

const postDetailTitle =
  document.getElementById(
    "postDetailTitle"
  );

const postDetailDate =
  document.getElementById(
    "postDetailDate"
  );

const postDetailContentWrap =
  document.getElementById(
    "postDetailContentWrap"
  );

const postDetailContent =
  document.getElementById(
    "postDetailContent"
  );

const postSecretGate =
  document.getElementById(
    "postSecretGate"
  );

const postSecretGateInput =
  document.getElementById(
    "postSecretGateInput"
  );

const postSecretGateSubmit =
  document.getElementById(
    "postSecretGateSubmit"
  );

const postSecretGateMessage =
  document.getElementById(
    "postSecretGateMessage"
  );

const postBackButton =
  document.getElementById(
    "postBackButton"
  );

const postAddButton =
  document.getElementById(
    "postAddButton"
  );

const postDetailFontScale =
  document.getElementById(
    "postDetailFontScale"
  );

const postDetailFontScaleDown =
  document.getElementById(
    "postDetailFontScaleDown"
  );

const postDetailFontScaleUp =
  document.getElementById(
    "postDetailFontScaleUp"
  );

const postDetailActions =
  document.getElementById(
    "postDetailActions"
  );

const postEditButton =
  document.getElementById(
    "postEditButton"
  );

const postDeleteButton =
  document.getElementById(
    "postDeleteButton"
  );

const postRelated =
  document.getElementById(
    "postRelated"
  );

const postRelatedTitle =
  document.getElementById(
    "postRelatedTitle"
  );

const postRelatedList =
  document.getElementById(
    "postRelatedList"
  );



/* =========================================================
   EDITOR
========================================================== */

const postEditor =
  document.getElementById(
    "postEditor"
  );

const postEditorCategory =
  document.getElementById(
    "postEditorCategory"
  );

const postEditorTitle =
  document.getElementById(
    "postEditorTitle"
  );

const postEditorContent =
  document.getElementById(
    "postEditorContent"
  );

const postEditorOOCToggle =
  document.getElementById(
    "postEditorOOCToggle"
  );

const postEditorOOC =
  document.getElementById(
    "postEditorOOC"
  );

const postEditorHtmlModeToggle =
  document.getElementById(
    "postEditorHtmlModeToggle"
  );

const postEditorSecretToggle =
  document.getElementById(
    "postEditorSecretToggle"
  );

const postEditorPrivateToggle =
  document.getElementById(
    "postEditorPrivateToggle"
  );

const postEditorSecretPassword =
  document.getElementById(
    "postEditorSecretPassword"
  );

const postEditorRichtextMode =
  document.getElementById(
    "postEditorRichtextMode"
  );

const postEditorHtmlContent =
  document.getElementById(
    "postEditorHtmlContent"
  );

const postEditorCancelButton =
  document.getElementById(
    "postEditorCancelButton"
  );

const postEditorSaveButton =
  document.getElementById(
    "postEditorSaveButton"
  );

const postEditorExportButton =
  document.getElementById(
    "postEditorExportButton"
  );

const postEditorMessage =
  document.getElementById(
    "postEditorMessage"
  );



/* =========================================================
   TOOLBAR
========================================================== */

const postEditorFontToggle =
  document.getElementById(
    "postEditorFontToggle"
  );

const postEditorHighlightPreset =
  document.getElementById(
    "postEditorHighlightPreset"
  );

const postEditorPresetSwatch =
  document.getElementById(
    "postEditorPresetSwatch"
  );

const postEditorCustomColor =
  document.getElementById(
    "postEditorCustomColor"
  );

const postEditorCustomSwatch =
  document.getElementById(
    "postEditorCustomSwatch"
  );

const postEditorClearStyle =
  document.getElementById(
    "postEditorClearStyle"
  );

const postEditorPresetSelect =
  document.getElementById(
    "postEditorPresetSelect"
  );

const postEditorFloatingMenu =
  document.getElementById(
    "postEditorFloatingMenu"
  );

const postEditorFloatingHighlightPreset =
  document.getElementById(
    "postEditorFloatingHighlightPreset"
  );

const postEditorFloatingPresetSwatch =
  document.getElementById(
    "postEditorFloatingPresetSwatch"
  );

const postEditorFloatingCustomColor =
  document.getElementById(
    "postEditorFloatingCustomColor"
  );

const postEditorFloatingCustomSwatch =
  document.getElementById(
    "postEditorFloatingCustomSwatch"
  );

  const postEditorCustomControl =
  document.querySelector(
    ".post-highlight-custom-control"
  );


/* =========================================================
   PREVIEW
========================================================== */

const postEditorPreviewToggle =
  document.getElementById(
    "postEditorPreviewToggle"
  );

const postEditorPreviewToggleIcon =
  document.getElementById(
    "postEditorPreviewToggleIcon"
  );

const postEditorPreviewSection =
  document.getElementById(
    "postEditorPreviewSection"
  );

const postEditorPreviewBackdrop =
  document.getElementById(
    "postEditorPreviewBackdrop"
  );

const postEditorPreviewSheet =
  document.getElementById(
    "postEditorPreviewSheet"
  );

const postEditorPreviewDragHandle =
  document.getElementById(
    "postEditorPreviewDragHandle"
  );

const postEditorPreviewStage =
  document.getElementById(
    "postEditorPreviewStage"
  );

const postEditorPreviewClose =
  document.getElementById(
    "postEditorPreviewClose"
  );

const postEditorPreviewTitleToggle =
  document.getElementById(
    "postEditorPreviewTitleToggle"
  );

const postEditorPreviewSourceToggle =
  document.getElementById(
    "postEditorPreviewSourceToggle"
  );

const postEditorPreviewSourcePositionRow =
  document.getElementById(
    "postEditorPreviewSourcePositionRow"
  );

const postEditorPreviewSourcePositionFlow =
  document.getElementById(
    "postEditorPreviewSourcePositionFlow"
  );

const postEditorPreviewSourcePositionFixed =
  document.getElementById(
    "postEditorPreviewSourcePositionFixed"
  );

const postEditorPreviewRatioTrigger =
  document.getElementById(
    "postEditorPreviewRatioTrigger"
  );

const postEditorPreviewRatioControls =
  document.getElementById(
    "postEditorPreviewRatioControls"
  );

const postEditorPreviewRatioButtons =
  document.querySelectorAll(
    "#postEditorPreviewRatioControls .post-editor-preview-ratio-button"
  );

const postEditorPreviewRatioCustomInputs =
  document.getElementById(
    "postEditorPreviewRatioCustomInputs"
  );

const postEditorPreviewRatioCustomWidth =
  document.getElementById(
    "postEditorPreviewRatioCustomWidth"
  );

const postEditorPreviewRatioCustomHeight =
  document.getElementById(
    "postEditorPreviewRatioCustomHeight"
  );

const postEditorPreviewTitle =
  document.getElementById(
    "postEditorPreviewTitle"
  );

const postEditorPreviewContent =
  document.getElementById(
    "postEditorPreviewContent"
  );

  /* =========================================================
   PAGED PREVIEW
========================================================== */

const postEditorPageBreak =
  document.getElementById(
    "postEditorPageBreak"
  );


const postEditorPreviewPages =
  document.getElementById(
    "postEditorPreviewPages"
  );


const postEditorPreviewPagination =
  document.getElementById(
    "postEditorPreviewPagination"
  );


const postEditorPreviewPrev =
  document.getElementById(
    "postEditorPreviewPrev"
  );


const postEditorPreviewNext =
  document.getElementById(
    "postEditorPreviewNext"
  );


const postEditorPreviewPageIndicator =
  document.getElementById(
    "postEditorPreviewPageIndicator"
  );


const categoryMenuLinks =
  document.getElementById(
    "categoryMenuLinks"
  );



/* =========================================================
   STATE
========================================================== */

let currentPostCategoryId =
  null;

let currentPostId =
  null;

let currentPostOwnerId =
  null;

let currentPostView =
  "home";


let currentEditorMode =
  null;


/*
  "richtext"(기본) 또는 "html".
  html이면 리치텍스트 에디터/툴바/프리뷰(발췌) 대신
  raw HTML textarea 하나만 쓴다.
*/

let editorContentMode =
  "richtext";

let editorSourcePostId =
  null;


/*
  "public"(기본) / "secret"(비밀글) / "private"(비공개).
  postEditorSecretToggle / postEditorPrivateToggle 두 버튼이
  이 값 하나를 서로 배타적으로 바꾼다.
*/

let editorPostVisibility =
  "public";


/*
  글을 열었을 때 이미 secret이었는지(=이미 저장된
  비밀번호 해시가 있는지). 저장 시 "secret인데 비밀번호
  칸이 비어있음"을 에러로 볼지(신규) 아니면 기존 비밀번호
  유지로 볼지(이미 있던 비밀글) 구분하는 데 씀.
*/

let editorPostHadSecretPassword =
  false;


let postStyleSettings =
  null;


/*
  contenteditable에서 마지막으로 잡은 선택영역.

  툴바나 컬러피커를 눌렀을 때
  선택이 풀리는 문제를 막기 위해 저장함.
*/

let savedEditorRange =
  null;


let postCurtainAnimation =
  null;

/* =========================================================
   PREVIEW PAGE STATE
========================================================== */

let editorPreviewPages =
  [];


let editorPreviewPageIndex =
  0;

/* =========================================================
   MOBILE PREVIEW SCALE

   applyEditorPreviewScale

   -> posts-preview.js 로 이동함.
========================================================== */



/* =========================================================
   POST TRANSITION / POST TRANSITION OUT

   showPostArea, hidePostAreaCurtain

   -> posts-view.js 로 이동함.
========================================================== */





/* =========================================================
   VIBE PRESET / HIGHLIGHT / ACTION-DIALOGUE / BODY STYLE / RENDER POST

   loadPostStylePreset, getPresetHighlightColor,
   getSafeHighlightColor, updatePresetHighlightSwatch,
   updateCustomHighlightSwatch, replaceActionDialogueTextNode,
   applyActionDialogueStyles, applyPostBodyStyles,
   renderStyledPostContentInto, renderStyledPostContent

   -> posts-style.js 로 이동함.

   SAFE HTML (sanitizeRichNode 등) -> posts-sanitize.js 로 이동함.
========================================================== */



/* =========================================================
   DATE

   formatPostListDate / formatPostDetailDate

   -> posts-format.js 로 이동함.
========================================================== */



/* =========================================================
   MENU
========================================================== */

function closePostMenu() {

  menuPanel?.classList.remove(
    "open"
  );


  menuButton?.classList.remove(
    "open"
  );


  menuButton?.setAttribute(
    "aria-expanded",
    "false"
  );

}



/* =========================================================
   AUTH
========================================================== */

async function getSignedInUser() {

  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .getUser();


  if (
    error ||
    !data?.user
  ) {

    return null;

  }


  return data.user;

}



