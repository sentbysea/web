/* =========================================================
   POSTS - PREVIEW: CSS VARS / VISIBILITY / RATIO CONTROLS

   posts-preview-settings.js 분할본 중 마지막. DOM 참조/
   상태는 posts/editor/posts-refs.js에 있음(반드시 먼저
   로드돼야 함).

   내용: 프리셋 값을 CSS 변수(padding 등)로 페이지에 적용,
   제목/출처 표시 토글 초기화 및 버튼 상태 동기화, 비율
   버튼 활성 상태 동기화.
========================================================== */


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
