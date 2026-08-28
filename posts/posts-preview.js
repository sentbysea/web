/* =========================================================
   POSTS - PREVIEW (PAGINATION ENGINE)

   posts.js에서 분리됨. 파일이 너무 커져서
   설정/스케일은 posts-preview-settings.js,
   내보내기는 posts-preview-export.js,
   모바일 시트/제스처는 posts-preview-mobile.js로
   따로 나눔 — 이 파일에는 실제 "본문을 페이지로
   나누는" 알고리즘만 남긴다.

   editorPreviewPages, editorPreviewPageIndex 등 상태와
   postEditorPreview* DOM 요소는 posts/editor/posts-refs.js에
   있음(같은 페이지에서 함께 로드되어야 함).
   getRichEditorHTML 등은 posts-editor.js에 있음.

   이 파일도 다시 커져서, 실제 페이지 분할 알고리즘
   (renderEditorPreviewPages)과 최종 갱신 진입점
   (updateEditorPreview)은 posts-preview-paginate.js로
   옮겼음 — 그 파일은 이 파일보다 나중에 로드되어야 함
   (index.html 순서 참고).
========================================================== */

/* =========================================================
   PREVIEW TITLE
========================================================== */

function applyPreviewTitleStyle(
  title,
  settings = {}
) {

  if (!title) {
    return;
  }


  title.hidden =
    !previewTitleVisible;


  /*
    ★ 제목/출처는 항상 Pretendard로 고정(인라인 지정).
    html2canvas로 캡처(발췌 export)할 때 이 값이 조상
    요소로부터 상속만 되어 있으면 가끔 못 읽어서 시스템
    명조체로 깨져 나오는 문제가 있었음 — 요소 자체에
    직접 박아두면 그 문제가 안 생긴다.
  */

  title.style.fontFamily =
    '"Pretendard", sans-serif';


  title.style.color =
    settings.titleColor ||
    "#222222";


  title.style.fontSize =
    `${
      Number(
        settings.titleSize
      ) || 24
    }px`;


  title.style.fontWeight =
    settings.titleWeight ||
    "400";


  title.style.textAlign =
    settings.titleAlign ||
    "left";


  title.style.letterSpacing =
    `${
      Number(
        settings.titleLetterSpacing
      ) || 0
    }px`;


  title.style.marginBottom =
    `${
      Number(
        settings.titleSpacing
      ) || 0
    }px`;

}



/* =========================================================
   LINE BREAK MODE
========================================================== */

function applyPreviewLineBreakMode(
  content,
  settings = {}
) {

  if (!content) {
    return;
  }


  const mode =
    settings.lineBreak ||
    "keep";


  if (
    mode === "char"
  ) {

    content.style.wordBreak =
      "break-all";


    content.style.overflowWrap =
      "anywhere";

  }


  else if (
    mode === "word"
  ) {

    content.style.wordBreak =
      "normal";


    content.style.overflowWrap =
      "break-word";

  }


  else {

    content.style.wordBreak =
      "keep-all";


    content.style.overflowWrap =
      "break-word";

  }

}



/* =========================================================
   PREVIEW SOURCE
========================================================== */

function createPreviewSource(
  settings = {}
) {

  const source =
    document.createElement(
      "div"
    );


  source.className =
    "post-editor-preview-source";


  source.textContent =
    settings.sourceText ||
    "";


  source.hidden =
    !previewSourceVisible;


  /*
    항상 Pretendard 고정 — 이유는 applyPreviewTitleStyle의
    주석 참고(html2canvas 캡처 시 명조체로 깨지는 문제 방지).
  */

  source.style.fontFamily =
    '"Pretendard", sans-serif';


  source.style.color =
    settings.sourceColor ||
    "#999999";


  source.style.fontSize =
    `${
      Number(
        settings.sourceSize
      ) || 11
    }px`;


  source.style.fontWeight =
    settings.sourceWeight ||
    "300";


  source.style.textAlign =
    settings.sourceAlign ||
    "right";


  /*
    "fixed" 모드(본문이 짧아도 캔버스 맨 아래에 고정)는
    source 자체를 건드리지 않고 createEditorPreviewPage에서
    바로 앞에 flex:1 1 auto 스페이서를 끼워 넣는 방식으로
    구현한다(아래 함수 참고) — source는 그냥 marginTop만
    가진 평범한 flow 요소로 남는다.

    ★ 원래는 두 가지를 다 시도해봤는데 둘 다 html2canvas에서
    깨졌다: (1) flex 마지막 자식에 margin-top:auto — 실제
    브라우저 미리보기는 멀쩡한데 내보낸 PNG에서만 source가
    안 보임. (2) position:absolute + bottom — 여전히 PNG에서
    안 보임(html2canvas가 별도 window 크기로 캡처할 때
    bottom/right 기준 절대 위치를 제대로 못 옮겨 그리는
    걸로 보임, 직접 재현 확인함). 그래서 "빈 공간을 채우는
    스페이서" 자체를 평범한 flex 아이템으로 만들고, source는
    끝까지 순수 flow 요소로 남겨서 두 문제를 모두 피한다.
  */

  source.style.marginTop =
    `${
      Number(
        settings.sourceSpacing
      ) || 0
    }px`;


  return source;

}



/* =========================================================
   CREATE PREVIEW PAGE
========================================================== */

function createEditorPreviewPage(
  settings = {},
  options = {}
) {

  const page =
    document.createElement(
      "article"
    );


  page.className =
    "post-editor-preview post-editor-preview-page";


  page.style.backgroundColor =
    settings.background ||
    "#ffffff";


  /*
    ★ 높이를 CSS aspect-ratio에만 맡기지 않고 픽셀로 직접 고정.

    aspect-ratio는 "콘텐츠가 넘쳐도 박스 자체는 커지면 안 된다"는
    규칙에 의존하는데, 이게 일부 모바일 브라우저에서 완전히
    지켜지지 않으면(박스가 콘텐츠 따라 같이 늘어나면) overflow
    감지(scrollHeight > clientHeight)가 아예 걸리지 않아서
    본문이 하단 padding/출처 자리를 침범하게 된다.
    너비/높이를 둘 다 숫자로 고정하면 aspect-ratio는 자동으로
    무시되므로(CSS 스펙상 두 값이 다 definite하면 적용 안 됨),
    페이지 높이가 항상 확실하게 고정된다.
  */

  const pageRatio =
    getPostPreviewRatio(
      settings
    );


  /*
    ★ AUTO: export width는 고정, 높이는 콘텐츠 양에 따라
    유동적으로. 이때는 aspect-ratio도, 위의 픽셀 고정 높이도
    쓰지 않고 그냥 height:auto로 둬서 padding+본문 높이만큼만
    차지하게 한다(그래서 이 경우엔 넘칠 수가 없어 overflow
    감지/페이지네이션도 자연히 발생하지 않는다).
  */

  const pageHeight =
    pageRatio.auto
      ? null
      : Math.round(
          520 *
          (
            pageRatio.height /
            pageRatio.width
          )
        );


  page.style.height =
    pageRatio.auto
      ? "auto"
      : `${pageHeight}px`;


  /*
    QUOTE의 세로 정렬.
  */

  page.style.display =
    "flex";


  page.style.flexDirection =
    "column";


  /*
    세션 오버라이드(previewVerticalAlign, top/center 둘 중
    하나 — posts-preview-css-vars.js)가 있으면 최우선,
    없으면 QUOTE 프리셋의 verticalAlign. ratio가 AUTO면
    박스 높이가 콘텐츠 높이와 항상 같아서 center 지정 자체는
    시각적으로 의미 없지만, 요구사항대로 명시적으로 center로
    둔다.
  */

  const verticalAlign =
    pageRatio.auto
      ? "center"
      : previewVerticalAlign ||
        settings.verticalAlign ||
        "top";


  if (
    verticalAlign ===
    "center"
  ) {

    page.style.justifyContent =
      "center";

  }


  else if (
    verticalAlign ===
    "bottom"
  ) {

    page.style.justifyContent =
      "flex-end";

  }


  else {

    page.style.justifyContent =
      "flex-start";

  }


  const title =
    document.createElement(
      "div"
    );


  title.className =
    "post-editor-preview-title";


  title.textContent =
    postEditorTitle
      ?.value
      .trim()
    ||
    "untitled";


  applyPreviewTitleStyle(
    title,
    settings
  );


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "post-editor-preview-content";


  applyPostBodyStyles(
    content,
    settings
  );


  /*
    세션 오버라이드(previewBodyAlign — posts-preview-css-vars.js)가
    있으면 QUOTE 프리셋의 bodyAlign 위에 잠깐 덮어쓴다.
    applyPostBodyStyles는 발행된 글/페이지네이션용 임시
    컨테이너에도 함께 쓰이는 공용 함수라 거기는 건드리지
    않고, 실제로 보이는 이 프리뷰 페이지의 content에만 적용.
  */

  if (
    previewBodyAlign
  ) {

    content.style.textAlign =
      previewBodyAlign;

  }


  applyPreviewLineBreakMode(
    content,
    settings
  );


  const source =
    createPreviewSource(
      settings
    );


  const showTitle =
  options.showTitle !== false;


if (showTitle) {

  page.appendChild(
    title
  );

}


page.appendChild(
  content
);


/*
  "fixed" source 위치: 본문 뒤에 flex:1 1 auto 스페이서를
  끼워 넣어 남는 세로 공간을 스페이서가 흡수하게 한다 —
  결과적으로 source가 캔버스 맨 아래로 밀린다. AUTO 비율은
  캔버스 높이 자체가 본문 높이라 밀어낼 여유 공간이 없으므로
  (= "고정"이 의미 없음) 스페이서를 넣지 않는다.
*/

if (
  previewSourcePosition ===
    "fixed" &&
  !pageRatio.auto &&
  previewSourceVisible
) {

  const sourceSpacer =
    document.createElement(
      "div"
    );


  sourceSpacer.style.flex =
    "1 1 auto";


  page.appendChild(
    sourceSpacer
  );

}


page.appendChild(
  source
);


  return {
    page,
    title,
    content,
    source
  };

}



/* =========================================================
   PAGE OVERFLOW
========================================================== */

function previewPageIsOverflowing(
  page
) {

  if (!page) {
    return false;
  }


  return (
    page.scrollHeight >
    page.clientHeight + 1
  );

}



/* =========================================================
   MANUAL BREAK CHECK
========================================================== */

function isEditorPageBreakNode(
  node
) {

  return (
    node?.nodeType ===
      Node.ELEMENT_NODE
    &&
    node.classList
      ?.contains(
        "post-editor-page-break"
      )
  );

}



/* =========================================================
   PREVIEW PAGE NAVIGATION
========================================================== */

function showEditorPreviewPage(
  index,
  options = {}
) {

  const resetZoom =
    options.resetZoom !== false;

  if (
    editorPreviewPages.length === 0
  ) {
    return;
  }


  editorPreviewPageIndex =
    Math.max(
      0,
      Math.min(
        index,
        editorPreviewPages.length - 1
      )
    );


  editorPreviewPages.forEach(
    (
      page,
      pageIndex
    ) => {

      page.hidden =
        pageIndex !==
        editorPreviewPageIndex;

    }
  );


  if (
    postEditorPreviewPageIndicator
  ) {

    postEditorPreviewPageIndicator.textContent =
      `${
        editorPreviewPageIndex + 1
      } / ${
        editorPreviewPages.length
      }`;

  }


  if (
    postEditorPreviewPrev
  ) {

    postEditorPreviewPrev.disabled =
      editorPreviewPageIndex === 0;

  }


  if (
    postEditorPreviewNext
  ) {

    postEditorPreviewNext.disabled =
      editorPreviewPageIndex ===
      editorPreviewPages.length - 1;

  }


  if (
    postEditorPreviewPagination
  ) {

    postEditorPreviewPagination.hidden =
      editorPreviewPages.length <= 1;

  }


  /*
    실제로 다른 페이지로 이동한 경우에는 이전 페이지에서
    확대/이동했던 상태가 그대로 남아있으면 어색하므로 초기화.

    반면 title/source/ratio 토글처럼 "같은 페이지 내용을
    다시 그리는" 경우(options.resetZoom === false)에는
    사용자가 맞춰둔 확대/이동 상태를 그대로 유지해야 한다.
  */

  if (resetZoom) {

    resetMobilePreviewZoomPan();

  }


  requestAnimationFrame(
  applyEditorPreviewScale
);

}



