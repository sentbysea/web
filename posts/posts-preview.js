/* =========================================================
   POSTS - PREVIEW

   posts.js에서 분리됨.

   editorPreviewPages, editorPreviewPageIndex 등 상태와
   postEditorPreview* DOM 요소는 posts.js에 있음
   (같은 페이지에서 함께 로드되어야 함).
   getRichEditorHTML 등은 posts-editor.js에 있음.
========================================================== */

/* =========================================================
   MOBILE PREVIEW SCALE
   PC 캔버스를 모바일에서 통째로 축소

   모바일에서는 여기서 계산하는 scale이
   "핀치 줌의 기준(1배)"이 되고,
   실제 화면에 그리는 배율은
   mobilePreviewFitScale * mobilePreviewZoom.
========================================================== */

let mobilePreviewFitScale = 1;
let mobilePreviewZoom = 1;
let mobilePreviewPanX = 0;
let mobilePreviewPanY = 0;

const MOBILE_PREVIEW_MIN_ZOOM = 0.5;
const MOBILE_PREVIEW_MAX_ZOOM = 3;


function applyEditorPreviewScale() {

  if (
    !postEditorPreviewPages ||
    editorPreviewPages.length === 0
  ) {
    return;
  }


  const stage =
    postEditorPreviewStage;


  if (!stage) {
    return;
  }


  const page =
    editorPreviewPages[0];


  /*
    먼저 원본 크기로 복원
  */

  postEditorPreviewPages.style.transform =
    "none";


  postEditorPreviewPages.style.transformOrigin =
    "center center";


  postEditorPreviewPages.style.width =
    "520px";


  const naturalWidth =
    520;


  const availableWidth =
    stage.clientWidth;


  const fitScale =
    Math.min(
      1,
      availableWidth /
      naturalWidth
    );


  const visiblePage =
    editorPreviewPages[
      editorPreviewPageIndex
    ] ||
    page;


  const naturalHeight =
    visiblePage.offsetHeight;


  /*
    데스크톱: 기존과 완전히 동일
    (핀치 줌/이동 기능 없음, stage 높이도 내용에 맞춤).
  */

  if (
    !isMobilePostEditor()
  ) {

    mobilePreviewFitScale =
      fitScale;


    postEditorPreviewPages.style.transformOrigin =
      "top center";


    postEditorPreviewPages.style.transform =
      `scale(${fitScale})`;


    stage.style.height =
      `${
        naturalHeight *
        fitScale
      }px`;


    return;

  }


  /*
    모바일: stage 높이는 CSS(flex)가 결정함
    (헤더/비율 버튼 줄/페이지네이션이 늘어나면 줄어듦).

    가로 기준으로만 맞추면 세로가 긴 비율(1:1, 4:3 등)에서
    캔버스 아래쪽이 stage 밖으로 넘쳐 페이지네이션에
    가려 보이는 문제가 있었음.
    → 가로/세로 둘 다에 맞춰(=object-fit: contain과 동일한
    개념) 처음부터 전체가 다 보이게 하고,
    사용자가 더 크게 보고 싶으면 핀치로 확대.
  */

  const availableHeight =
    stage.clientHeight;


  const heightFitScale =
    availableHeight > 0
      ? availableHeight / naturalHeight
      : fitScale;


  mobilePreviewFitScale =
    Math.min(
      fitScale,
      heightFitScale
    );


  applyMobilePreviewTransform();

}


/* =========================================================
   MOBILE PREVIEW ZOOM / PAN
========================================================== */

function resetMobilePreviewZoomPan() {

  mobilePreviewZoom =
    1;


  mobilePreviewPanX =
    0;


  mobilePreviewPanY =
    0;


  if (
    isMobilePostEditor()
  ) {

    applyMobilePreviewTransform();

  }

}


function clampMobilePreviewPan() {

  const stage =
    postEditorPreviewStage;


  if (
    !stage ||
    !postEditorPreviewPages
  ) {
    return;
  }


  const scale =
    mobilePreviewFitScale *
    mobilePreviewZoom;


  const contentWidth =
    520 *
    scale;


  const visiblePage =
    editorPreviewPages[
      editorPreviewPageIndex
    ];


  const naturalHeight =
    visiblePage
      ? visiblePage.offsetHeight
      : 0;


  const contentHeight =
    naturalHeight *
    scale;


  const maxPanX =
    Math.max(
      0,
      (
        contentWidth -
        stage.clientWidth
      ) /
      2
    );


  const maxPanY =
    Math.max(
      0,
      (
        contentHeight -
        stage.clientHeight
      ) /
      2
    );


  mobilePreviewPanX =
    Math.min(
      maxPanX,
      Math.max(
        -maxPanX,
        mobilePreviewPanX
      )
    );


  mobilePreviewPanY =
    Math.min(
      maxPanY,
      Math.max(
        -maxPanY,
        mobilePreviewPanY
      )
    );

}


function applyMobilePreviewTransform() {

  if (
    !postEditorPreviewPages
  ) {
    return;
  }


  clampMobilePreviewPan();


  const scale =
    mobilePreviewFitScale *
    mobilePreviewZoom;


  postEditorPreviewPages.style.transformOrigin =
    "center center";


  postEditorPreviewPages.style.transform =
    `translate(${mobilePreviewPanX}px, ${mobilePreviewPanY}px) scale(${scale})`;

}


/* =========================================================
   EDITOR PREVIEW
   QUOTE PRESET → PAGED CANVAS
========================================================== */


/* =========================================================
   PREVIEW RATIO OVERRIDE (세션 한정)

   프리뷰 헤더의 비율 버튼(4:5 / 4:6 / 1:1 / 4:3 / custom)으로
   QUOTE 프리셋과 무관하게 잠깐 바꿔볼 수 있는 상태.
   null이면 프리셋에 저장된 ratio를 그대로 사용.
========================================================== */

let previewRatioMode =
  null;

let previewCustomRatioWidth =
  4;

let previewCustomRatioHeight =
  5;

/*
  ratio 버튼을 눌러야 5개 옵션 줄이 펼쳐짐
  (기본은 접힌 상태).
*/

let previewRatioRowExpanded =
  false;



/* =========================================================
   PRESET RATIO
========================================================== */

function getPostPreviewRatio(
  settings = {}
) {

  /*
    프리뷰에서 직접 고른 비율이 있으면
    프리셋보다 우선.
  */

  if (
    previewRatioMode ===
    "custom"
  ) {

    return {

      width:
        Math.max(
          1,
          Number(
            previewCustomRatioWidth
          ) || 1
        ),

      height:
        Math.max(
          1,
          Number(
            previewCustomRatioHeight
          ) || 1
        )

    };

  }


  if (
    previewRatioMode
  ) {

    const overrideMatch =
      previewRatioMode.match(
        /^([\d.]+):([\d.]+)$/
      );


    if (
      overrideMatch
    ) {

      return {

        width:
          Math.max(
            1,
            Number(
              overrideMatch[1]
            ) || 1
          ),

        height:
          Math.max(
            1,
            Number(
              overrideMatch[2]
            ) || 1
          )

      };

    }

  }


  /*
    custom이면
    QUOTE의 ratioWidth / ratioHeight 사용
  */

  if (
    settings.ratio ===
    "custom"
  ) {

    return {

      width:
        Math.max(
          1,
          Number(
            settings.ratioWidth
          ) || 1
        ),

      height:
        Math.max(
          1,
          Number(
            settings.ratioHeight
          ) || 1
        )

    };

  }


  /*
    4:5 / 1:1 / 3:4 등
    QUOTE에 저장된 ratio 그대로 파싱
  */

  const match =
    String(
      settings.ratio || ""
    )
      .match(
        /^([\d.]+):([\d.]+)$/
      );


  if (match) {

    return {

      width:
        Math.max(
          1,
          Number(
            match[1]
          ) || 1
        ),

      height:
        Math.max(
          1,
          Number(
            match[2]
          ) || 1
        )

    };

  }


  /*
    오래된 프리셋 등에 ratio가 없을 때만
    안전한 정사각형 fallback.
  */

  return {
    width: 1,
    height: 1
  };

}



/* =========================================================
   PREVIEW CSS VARIABLES
========================================================== */

function applyPostPreviewPresetVariables(
  settings = {}
) {

  if (
    !postEditorPreviewPages
  ) {
    return;
  }


  const ratio =
    getPostPreviewRatio(
      settings
    );


  postEditorPreviewPages
    .style
    .setProperty(
      "--post-preview-aspect",
      `${ratio.width} / ${ratio.height}`
    );


  const basePadding =
    Math.max(
      0,
      Number(
        settings.padding
      ) || 0
    );


  const verticalPadding =
    Math.max(
      0,
      Number(
        settings.verticalPadding
      ) || 0
    );


  const horizontalPadding =
    Math.max(
      0,
      Number(
        settings.horizontalPadding
      ) || 0
    );


  postEditorPreviewPages
    .style
    .setProperty(
      "--post-preview-padding-y",
      `${
        basePadding +
        verticalPadding
      }px`
    );


  postEditorPreviewPages
    .style
    .setProperty(
      "--post-preview-padding-x",
      `${
        basePadding +
        horizontalPadding
      }px`
    );


  postEditorPreviewPages
    .style
    .setProperty(
      "--post-preview-title-gap",
      `${
        Number(
          settings.titleSpacing
        ) || 0
      }px`
    );

}



/* =========================================================
   PREVIEW TITLE / SOURCE VISIBILITY (세션 한정 토글)

   프리뷰 헤더의 title/source 버튼으로 잠깐 껐다 켜볼 수 있는
   상태. QUOTE 프리셋의 titleEnabled/sourceEnabled 값은
   건드리지 않고, 프리뷰가 열릴 때마다 그 값에서 다시 시작함.

   title.hidden = true (= [hidden] → display:none)이면
   레이아웃에서 완전히 빠지므로, 마진/자리는 남지 않고
   본문이 그 자리에서 바로 시작됨.
========================================================== */

let previewTitleVisible = true;
let previewSourceVisible = true;


/*
  source 위치: "flow"(본문 끝나는 곳에 자연스럽게) 또는
  "fixed"(본문 길이와 무관하게 캔버스 맨 아래 고정).
*/

let previewSourcePosition =
  "flow";


function resetPreviewVisibilityOverrides() {

  const settings =
    postStyleSettings ||
    {};


  previewTitleVisible =
    settings.titleEnabled !==
    false;


  previewSourceVisible =
    settings.sourceEnabled !==
    false;


  previewSourcePosition =
    "flow";


  previewRatioRowExpanded =
    false;


  previewRatioMode =
    null;


  if (
    settings.ratio ===
    "custom"
  ) {

    previewCustomRatioWidth =
      Number(
        settings.ratioWidth
      ) ||
      4;


    previewCustomRatioHeight =
      Number(
        settings.ratioHeight
      ) ||
      5;

  }


  syncPreviewVisibilityToggleButtons();


  syncPreviewRatioControls();

}


function syncPreviewVisibilityToggleButtons() {

  postEditorPreviewTitleToggle
    ?.setAttribute(
      "aria-pressed",
      String(
        previewTitleVisible
      )
    );


  postEditorPreviewSourceToggle
    ?.setAttribute(
      "aria-pressed",
      String(
        previewSourceVisible
      )
    );


  /*
    source가 켜져 있을 때만
    position(flow/fixed) 선택 줄이 펼쳐짐.
  */

  if (
    postEditorPreviewSourcePositionRow
  ) {

    postEditorPreviewSourcePositionRow.hidden =
      !previewSourceVisible;

  }


  postEditorPreviewSourcePositionFlow
    ?.setAttribute(
      "aria-pressed",
      String(
        previewSourcePosition ===
        "flow"
      )
    );


  postEditorPreviewSourcePositionFixed
    ?.setAttribute(
      "aria-pressed",
      String(
        previewSourcePosition ===
        "fixed"
      )
    );

}



/* =========================================================
   PREVIEW RATIO CONTROLS
========================================================== */

function syncPreviewRatioControls() {

  postEditorPreviewRatioTrigger
    ?.setAttribute(
      "aria-pressed",
      String(
        previewRatioRowExpanded
      )
    );


  postEditorPreviewRatioTrigger
    ?.setAttribute(
      "aria-expanded",
      String(
        previewRatioRowExpanded
      )
    );


  if (
    postEditorPreviewRatioControls
  ) {

    postEditorPreviewRatioControls.hidden =
      !previewRatioRowExpanded;

  }


  postEditorPreviewRatioButtons
    ?.forEach(
      button => {

        button.setAttribute(
          "aria-pressed",
          String(
            button.dataset.ratio ===
            previewRatioMode
          )
        );

      }
    );


  const isCustom =
    previewRatioMode ===
    "custom";


  if (
    postEditorPreviewRatioCustomInputs
  ) {

    postEditorPreviewRatioCustomInputs.hidden =
      !isCustom;

  }


  if (
    postEditorPreviewRatioCustomWidth
  ) {

    postEditorPreviewRatioCustomWidth.value =
      previewCustomRatioWidth;

  }


  if (
    postEditorPreviewRatioCustomHeight
  ) {

    postEditorPreviewRatioCustomHeight.value =
      previewCustomRatioHeight;

  }

}



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
  index
) {

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
    페이지가 바뀌면 이전 페이지에서 확대/이동했던
    상태가 그대로 남아있으면 어색하므로 초기화.
  */

  resetMobilePreviewZoomPan();


  requestAnimationFrame(
  applyEditorPreviewScale
);

}



/* =========================================================
   BUILD PAGED PREVIEW
========================================================== */

function renderEditorPreviewPages() {

  if (
    !postEditorPreviewPages
  ) {
    return;
  }


  const settings =
    postStyleSettings ||
    {};


  applyPostPreviewPresetVariables(
    settings
  );


  /*
    먼저 전체 본문을
    QUOTE 스타일대로 가상 렌더링.
  */

  const source =
    document.createElement(
      "div"
    );


  renderStyledPostContentInto(
    source,
    getRichEditorHTML(),
    settings,
    {
      keepPageBreaks:
        true
    }
  );


  postEditorPreviewPages
    .replaceChildren();


  editorPreviewPages =
    [];


 let current =
  createEditorPreviewPage(
    settings,
    {
      showTitle: true
    }
  );

  postEditorPreviewPages
    .appendChild(
      current.page
    );


  editorPreviewPages.push(
    current.page
  );


  /*
    새로운 페이지 생성
  */

  function startNewPage() {

    current =
  createEditorPreviewPage(
    settings,
    {
      showTitle: false
    }
  );


    postEditorPreviewPages
      .appendChild(
        current.page
      );


    editorPreviewPages.push(
      current.page
    );

  }


  /*
    텍스트 노드는 단어 단위로 넣어서
    캔버스를 넘는 순간 다음 페이지로 넘김.
  */

  function appendTextNode(
    node
  ) {

    const value =
      node.nodeValue ||
      "";


    const parts =
      value.match(
        /\S+\s*|\s+/g
      ) || [];


    parts.forEach(
      part => {

        const textNode =
          document.createTextNode(
            part
          );


        current.content.appendChild(
          textNode
        );


        if (
          previewPageIsOverflowing(
            current.page
          )
        ) {

          textNode.remove();


          startNewPage();


          current.content.appendChild(
            textNode
          );

        }

      }
    );

  }


  /*
    원본의 최상위 노드를 순서대로 삽입.
  */

  Array.from(
    source.childNodes
  ).forEach(
    node => {

      /*
        ★ 수동 PAGE BREAK

        남은 공간이 있어도
        강제로 새 페이지 시작.
      */

      if (
        isEditorPageBreakNode(
          node
        )
      ) {

        /*
          첫 페이지가 완전히 비어 있을 때는
          빈 페이지 하나를 만들지 않음.
        */

        if (
          current.content.childNodes.length >
          0
        ) {

          startNewPage();

        }


        return;

      }


      /*
        루트 텍스트는
        단어 단위 자동 분할.
      */

      if (
        node.nodeType ===
        Node.TEXT_NODE
      ) {

        appendTextNode(
          node
        );


        return;

      }


      /*
        나머지 span / div / p / br 등.
      */

      const clone =
        node.cloneNode(
          true
        );


      current.content.appendChild(
        clone
      );


      /*
        이 노드를 넣어서 넘쳤다면
        직전 페이지에서 빼서 다음 페이지로.
      */

      if (
        previewPageIsOverflowing(
          current.page
        )
      ) {

        clone.remove();


        startNewPage();


        current.content.appendChild(
          clone
        );

      }

    }
  );


  /*
    완전히 빈 마지막 페이지 방지.
  */

  if (
    editorPreviewPages.length > 1
    &&
    current.content.childNodes.length ===
      0
  ) {

    current.page.remove();


    editorPreviewPages.pop();

  }


  /*
    data-page-index
  */

  editorPreviewPages.forEach(
    (
      page,
      index
    ) => {

      page.dataset.pageIndex =
        String(
          index
        );

    }
  );


  showEditorPreviewPage(
    Math.min(
      editorPreviewPageIndex,
      editorPreviewPages.length - 1
    )
  );

  applyEditorPreviewScale();

}



/* =========================================================
   UPDATE PREVIEW
========================================================== */

function updateEditorPreview() {

  if (
    !postEditorPreviewPages
  ) {
    return;
  }


  renderEditorPreviewPages();

}

/* =========================================================
   EXPORT PREVIEW AS IMAGE
========================================================== */

function waitForExport(ms) {

  return new Promise(
    resolve => {

      setTimeout(
        resolve,
        ms
      );

    }
  );

}


function getExportBaseFileName() {

  const rawTitle =
    (
      postEditorTitle?.value ||
      "excerpt"
    ).trim();


  const safeTitle =
    rawTitle
      .replace(
        /[\\/:*?"<>|]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      );


  return safeTitle || "excerpt";

}


function downloadDataUrl(
  dataUrl,
  fileName
) {

  const link =
    document.createElement(
      "a"
    );


  link.href =
    dataUrl;


  link.download =
    fileName;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();

}


async function exportEditorPreviewAsImages() {

  if (
    !window.html2canvas
  ) {

    alert(
      "이미지 변환 기능을 불러오지 못했습니다."
    );

    return;

  }


  updateEditorPreview();


  await waitForExport(
    100
  );


  const previewPages =
    Array.from(
      document.querySelectorAll(
        ".post-editor-preview-page"
      )
    );


  if (
    previewPages.length === 0
  ) {

    alert(
      "내보낼 미리보기가 없습니다."
    );

    return;

  }


  if (
    postEditorExportButton
  ) {

    postEditorExportButton.disabled =
      true;

    postEditorExportButton.textContent =
      "...";

  }


  showPostEditorMessage(
    "이미지 만드는 중..."
  );


  /*
    결과 파일을 먼저 전부 만든 뒤
    PC / iPhone에 맞는 방식으로 처리.
  */

  const exportFiles =
    [];


  try {

    const baseFileName =
      getExportBaseFileName();


    for (
      let index = 0;
      index < previewPages.length;
      index += 1
    ) {

      const page =
        previewPages[index];


      /*
        hidden 상태를 잠깐 해제해서
        실제 프리뷰 크기를 측정.
      */

      const wasHidden =
        page.hidden;


      page.hidden =
        false;


      await waitForExport(
        30
      );


      const ratio =
  getPostPreviewRatio(
    postStyleSettings ||
    {}
  );


const pageWidth =
  520;


const pageHeight =
  Math.round(
    pageWidth *
    (
      ratio.height /
      ratio.width
    )
  );


      /*
        화면에 있는 페이지를 직접 찍지 않고,
        동일한 복제본을 화면 밖에 만들어 캡처.

        html2canvas가 aspect-ratio를
        잘못 계산하는 문제를 방지하기 위해
        width / height를 숫자로 고정함.
      */

      const exportPage =
        page.cloneNode(
          true
        );

        exportPage.style.webkitTextSizeAdjust =
  "100%";

exportPage.style.textSizeAdjust =
  "100%";


      exportPage.hidden =
        false;


      exportPage.removeAttribute(
        "id"
      );


      exportPage.style.position =
        "fixed";


      exportPage.style.left =
        "-100000px";


      exportPage.style.top =
        "0";


      exportPage.style.margin =
        "0";


      exportPage.style.width =
        `${pageWidth}px`;


      exportPage.style.height =
        `${pageHeight}px`;


      exportPage.style.minWidth =
        `${pageWidth}px`;


      exportPage.style.maxWidth =
        `${pageWidth}px`;


      exportPage.style.minHeight =
        `${pageHeight}px`;


      exportPage.style.maxHeight =
        `${pageHeight}px`;


      exportPage.style.aspectRatio =
        "auto";


      exportPage.style.flex =
        "none";


      exportPage.style.transform =
        "none";


      exportPage.style.opacity =
        "1";


      exportPage.style.visibility =
        "visible";


      document.body.appendChild(
        exportPage
      );


      await waitForExport(
        30
      );


      /*
        QUOTE의 exportWidth가 있으면
        그 폭에 맞춰 PNG 해상도 결정.

        없으면 화면 프리뷰의 2배.
      */

      const desiredWidth =
        Math.max(
          pageWidth,
          Number(
            postStyleSettings
              ?.exportWidth
          ) || pageWidth * 2
        );


      const exportScale =
        desiredWidth /
        pageWidth;


      const canvas =
        await window.html2canvas(
          exportPage,
          {
            backgroundColor:
              null,

            useCORS:
              true,

            scale:
              exportScale,

            width:
              pageWidth,

            height:
              pageHeight,

            windowWidth:
              pageWidth,

            windowHeight:
              pageHeight,

            logging:
              false
          }
        );


      exportPage.remove();


      page.hidden =
        wasHidden;


      /*
        canvas → PNG Blob
      */

      const blob =
        await new Promise(
          resolve => {

            canvas.toBlob(
              resolve,
              "image/png",
              1
            );

          }
        );


      if (!blob) {

        throw new Error(
          "PNG 생성 실패"
        );

      }


      const fileName =
        `${
          baseFileName
        }-${
          index + 1
        }.png`;


      const file =
        new File(
          [blob],
          fileName,
          {
            type:
              "image/png"
          }
        );


      exportFiles.push(
        file
      );

    }


    /*
      모든 페이지 다시 원래 표시 상태로.
    */

    showEditorPreviewPage(
      editorPreviewPageIndex
    );


    /*
      iPhone / iPad / 공유 지원 모바일

      여러 PNG를 한꺼번에 공유 시트로 넘김.
      공유 시트에서 '이미지 저장' 가능.
    */

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files:
          exportFiles
      })
    ) {

      try {

        await navigator.share({
          files:
            exportFiles,

          title:
            getExportBaseFileName()
        });


        showPostEditorMessage(
          `ready ${exportFiles.length} page`
          +
          `${
            exportFiles.length > 1
              ? "s"
              : ""
          } ♡`
        );


        return;

      } catch (shareError) {

        /*
          사용자가 공유창을 그냥 닫은 경우에는
          오류 팝업 띄우지 않음.
        */

        if (
          shareError?.name ===
          "AbortError"
        ) {

          showPostEditorMessage(
            ""
          );


          return;

        }


        console.warn(
          "share failed:",
          shareError
        );

      }

    }


    /*
      PC 등 Web Share가 없는 환경:
      일반 PNG 다운로드.
    */

    exportFiles.forEach(
      file => {

        const url =
          URL.createObjectURL(
            file
          );


        const link =
          document.createElement(
            "a"
          );


        link.href =
          url;


        link.download =
          file.name;


        document.body.appendChild(
          link
        );


        link.click();


        link.remove();


        setTimeout(
          () => {

            URL.revokeObjectURL(
              url
            );

          },
          1000
        );

      }
    );


    showPostEditorMessage(
      `saved ${exportFiles.length} page`
      +
      `${
        exportFiles.length > 1
          ? "s"
          : ""
      } ♡`
    );


  } catch (error) {

    console.error(
      "preview export error:",
      error
    );


    showPostEditorMessage(
      "이미지 저장 실패"
    );


    alert(
      "이미지 저장 중 오류가 발생했습니다."
    );


    /*
      혹시 에러 도중 화면 밖 복제본이 남으면 제거.
    */

    document
      .querySelectorAll(
        ".post-editor-preview-page"
      )
      .forEach(
        page => {

          if (
            page.style.left ===
            "-100000px"
          ) {

            page.remove();

          }

        }
      );


    showEditorPreviewPage(
      editorPreviewPageIndex
    );


  } finally {

    if (
      postEditorExportButton
    ) {

      postEditorExportButton.disabled =
        false;


      postEditorExportButton.textContent =
        "export";

    }

  }

}

/* =========================================================
   MOBILE PREVIEW
========================================================== */

function isMobilePostEditor() {

  return window.matchMedia(
    "(max-width: 600px)"
  ).matches;

}


function openEditorPreview() {

  resetPreviewVisibilityOverrides();


  updateEditorPreview();


  if (!postEditorPreviewSection) {
    return;
  }


  if (
    !isMobilePostEditor()
  ) {

    postEditorPreviewSection
      .setAttribute(
        "aria-hidden",
        "false"
      );

    return;

  }


  /*
    모바일 키보드 먼저 닫기
  */

  if (
    document.activeElement ===
    postEditorContent ||
    document.activeElement ===
    postEditorTitle
  ) {

    document.activeElement.blur();

  }


  /*
    매번 열 때마다 기본 높이(70dvh)와
    확대/이동 상태를 초기화.
  */

  postEditorPreviewSheet
    ?.style
    .removeProperty(
      "height"
    );


  resetMobilePreviewZoomPan();


  postEditorPreviewSection
    .classList
    .add(
      "is-open"
    );


  postEditorPreviewSection
    .setAttribute(
      "aria-hidden",
      "false"
    );


  postEditorPreviewToggle
    ?.setAttribute(
      "aria-expanded",
      "true"
    );


  if (
    postEditorPreviewToggleIcon
  ) {

    postEditorPreviewToggleIcon.textContent =
      "↓";

  }

}


function closeEditorPreview() {

  if (!postEditorPreviewSection) {
    return;
  }


  postEditorPreviewSection
    .classList
    .remove(
      "is-open"
    );


  if (
    isMobilePostEditor()
  ) {

    postEditorPreviewSection
      .setAttribute(
        "aria-hidden",
        "true"
      );

  }


  else {

    postEditorPreviewSection
      .setAttribute(
        "aria-hidden",
        "false"
      );

  }


  postEditorPreviewToggle
    ?.setAttribute(
      "aria-expanded",
      "false"
    );


  if (
    postEditorPreviewToggleIcon
  ) {

    postEditorPreviewToggleIcon.textContent =
      "↑";

  }

}


function syncEditorPreviewMode() {

  if (!postEditorPreviewSection) {
    return;
  }


  if (
    isMobilePostEditor()
  ) {

    if (
      !postEditorPreviewSection
        .classList
        .contains(
          "is-open"
        )
    ) {

      postEditorPreviewSection
        .setAttribute(
          "aria-hidden",
          "true"
        );

    }

  }


  else {

    postEditorPreviewSection
      .classList
      .remove(
        "is-open"
      );


    postEditorPreviewSection
      .setAttribute(
        "aria-hidden",
        "false"
      );


    postEditorPreviewToggle
      ?.setAttribute(
        "aria-expanded",
        "false"
      );


    if (
      postEditorPreviewToggleIcon
    ) {

      postEditorPreviewToggleIcon.textContent =
        "↑";

    }

  }

}


/* =========================================================
   MOBILE PREVIEW PINCH ZOOM / DRAG PAN

   postEditorPreviewStage 위에서
   손가락 1개 = 이동, 2개 = 확대/축소(+이동).
========================================================== */

const mobilePreviewStagePointers =
  new Map();

let mobilePreviewPanStart =
  null;

let mobilePreviewPinchStart =
  null;


function distanceBetweenPoints(
  a,
  b
) {

  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );

}


function midpointBetweenPoints(
  a,
  b
) {

  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };

}


function handlePreviewStagePointerDown(
  event
) {

  if (
    !isMobilePostEditor() ||
    !postEditorPreviewSection
      ?.classList
      .contains(
        "is-open"
      )
  ) {
    return;
  }


  postEditorPreviewStage
    ?.setPointerCapture(
      event.pointerId
    );


  mobilePreviewStagePointers.set(
    event.pointerId,
    {
      x: event.clientX,
      y: event.clientY
    }
  );


  if (
    mobilePreviewStagePointers.size ===
    1
  ) {

    mobilePreviewPanStart =
      {
        x: event.clientX,
        y: event.clientY,
        panX: mobilePreviewPanX,
        panY: mobilePreviewPanY
      };


    mobilePreviewPinchStart =
      null;

  }


  else if (
    mobilePreviewStagePointers.size ===
    2
  ) {

    const points =
      Array.from(
        mobilePreviewStagePointers.values()
      );


    mobilePreviewPinchStart =
      {
        distance:
          distanceBetweenPoints(
            points[0],
            points[1]
          ),
        zoom: mobilePreviewZoom,
        mid:
          midpointBetweenPoints(
            points[0],
            points[1]
          ),
        panX: mobilePreviewPanX,
        panY: mobilePreviewPanY
      };


    mobilePreviewPanStart =
      null;

  }

}


function handlePreviewStagePointerMove(
  event
) {

  if (
    !mobilePreviewStagePointers.has(
      event.pointerId
    )
  ) {
    return;
  }


  mobilePreviewStagePointers.set(
    event.pointerId,
    {
      x: event.clientX,
      y: event.clientY
    }
  );


  if (
    mobilePreviewStagePointers.size ===
      2 &&
    mobilePreviewPinchStart
  ) {

    const points =
      Array.from(
        mobilePreviewStagePointers.values()
      );


    const distance =
      distanceBetweenPoints(
        points[0],
        points[1]
      );


    const mid =
      midpointBetweenPoints(
        points[0],
        points[1]
      );


    const ratio =
      distance /
      (
        mobilePreviewPinchStart.distance ||
        1
      );


    mobilePreviewZoom =
      Math.min(
        MOBILE_PREVIEW_MAX_ZOOM,
        Math.max(
          MOBILE_PREVIEW_MIN_ZOOM,
          mobilePreviewPinchStart.zoom *
          ratio
        )
      );


    mobilePreviewPanX =
      mobilePreviewPinchStart.panX +
      (
        mid.x -
        mobilePreviewPinchStart.mid.x
      );


    mobilePreviewPanY =
      mobilePreviewPinchStart.panY +
      (
        mid.y -
        mobilePreviewPinchStart.mid.y
      );


    applyMobilePreviewTransform();


    return;

  }


  if (
    mobilePreviewStagePointers.size ===
      1 &&
    mobilePreviewPanStart
  ) {

    const current =
      mobilePreviewStagePointers
        .values()
        .next()
        .value;


    mobilePreviewPanX =
      mobilePreviewPanStart.panX +
      (
        current.x -
        mobilePreviewPanStart.x
      );


    mobilePreviewPanY =
      mobilePreviewPanStart.panY +
      (
        current.y -
        mobilePreviewPanStart.y
      );


    applyMobilePreviewTransform();

  }

}


function handlePreviewStagePointerUp(
  event
) {

  mobilePreviewStagePointers.delete(
    event.pointerId
  );


  if (
    mobilePreviewStagePointers.size ===
    1
  ) {

    const remaining =
      mobilePreviewStagePointers
        .values()
        .next()
        .value;


    mobilePreviewPanStart =
      {
        x: remaining.x,
        y: remaining.y,
        panX: mobilePreviewPanX,
        panY: mobilePreviewPanY
      };


    mobilePreviewPinchStart =
      null;

  }


  else if (
    mobilePreviewStagePointers.size ===
    0
  ) {

    mobilePreviewPanStart =
      null;


    mobilePreviewPinchStart =
      null;

  }

}



/* =========================================================
   MOBILE PREVIEW SHEET RESIZE (드래그 핸들)

   30vh ~ 90vh 사이에서 시트 높이를 직접 드래그로 조절.
========================================================== */

const MOBILE_PREVIEW_MIN_HEIGHT_RATIO =
  0.3;

const MOBILE_PREVIEW_MAX_HEIGHT_RATIO =
  0.9;

let mobilePreviewResizeStart =
  null;


function handlePreviewDragPointerDown(
  event
) {

  if (
    !isMobilePostEditor() ||
    !postEditorPreviewSheet
  ) {
    return;
  }


  postEditorPreviewDragHandle
    ?.setPointerCapture(
      event.pointerId
    );


  postEditorPreviewSheet
    .classList
    .add(
      "is-resizing"
    );


  mobilePreviewResizeStart =
    {
      y: event.clientY,
      height:
        postEditorPreviewSheet
          .getBoundingClientRect()
          .height
    };

}


function handlePreviewDragPointerMove(
  event
) {

  if (
    !mobilePreviewResizeStart ||
    !postEditorPreviewSheet
  ) {
    return;
  }


  const viewportHeight =
    window.innerHeight;


  const minHeight =
    viewportHeight *
    MOBILE_PREVIEW_MIN_HEIGHT_RATIO;


  const maxHeight =
    viewportHeight *
    MOBILE_PREVIEW_MAX_HEIGHT_RATIO;


  /*
    핸들을 위로 끌면(화면 y가 작아지면) 커지도록.
  */

  const delta =
    mobilePreviewResizeStart.y -
    event.clientY;


  const nextHeight =
    Math.min(
      maxHeight,
      Math.max(
        minHeight,
        mobilePreviewResizeStart.height +
        delta
      )
    );


  postEditorPreviewSheet.style.height =
    `${nextHeight}px`;

}


function handlePreviewDragPointerUp() {

  if (
    !mobilePreviewResizeStart
  ) {
    return;
  }


  mobilePreviewResizeStart =
    null;


  postEditorPreviewSheet
    ?.classList
    .remove(
      "is-resizing"
    );


  /*
    시트 높이가 바뀌면 stage(뷰포트) 크기도 바뀌므로
    "맞춤 배율" 기준(mobilePreviewFitScale)도 다시 계산해야
    캔버스가 새 크기에 맞게 전체가 다시 보임.
    사용자가 확대해둔 상태였더라도, 창 크기를 바꾼 건
    "다시 전체를 보고 싶다"는 의도로 보고 줌/이동을 초기화.
  */

  resetMobilePreviewZoomPan();


  applyEditorPreviewScale();

}
