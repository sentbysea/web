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
    "fixed" 모드: 본문이 짧아도 캔버스 맨 아래에 고정.
    flex-column인 page에서 마지막 자식에 margin-top:auto를
    주면 남는 공간을 전부 흡수해서 바닥에 붙음.
  */

  source.style.marginTop =
    previewSourcePosition ===
    "fixed"
      ? "auto"
      : `${
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


  const pageHeight =
    Math.round(
      520 *
      (
        pageRatio.height /
        pageRatio.width
      )
    );


  page.style.height =
    `${pageHeight}px`;


  /*
    QUOTE의 세로 정렬.
  */

  page.style.display =
    "flex";


  page.style.flexDirection =
    "column";


  const verticalAlign =
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



