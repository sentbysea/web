/* =========================================================
   POSTS - PREVIEW SETTINGS / SCALE / RATIO

   posts-preview.js에서 분리됨(파일이 너무 커져서 나눔).
   여기는 프리뷰의 "설정/상태"만 다룬다:
   모바일 확대축소(scale/zoom/pan), 비율(ratio) override,
   CSS 변수(padding 등), title/source 표시 토글.

   실제 페이지 나누기(pagination) 알고리즘은 posts-preview.js,
   내보내기는 posts-preview-export.js,
   모바일 시트 열기/닫기/제스처는 posts-preview-mobile.js에 있음.

   editorPreviewPages, editorPreviewPageIndex 등 상태와
   postEditorPreview* DOM 요소는 posts.js에 있음
   (같은 페이지에서 함께 로드되어야 함).
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
