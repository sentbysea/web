/* =========================================================
   POSTS - EDITOR CONTENT MODE (OOC / HTML)

   posts.js에서 분리됨.
   editorContentMode 상태와 postEditorOOC* /
   postEditorRichtextMode / postEditorHtmlContent 등
   DOM 요소는 posts.js에 있음(같은 페이지에서 함께 로드).
========================================================== */

/* =========================================================
   OOC (독자에게 안 보이는 메모)
========================================================== */

function toggleEditorOOC() {

  if (
    !postEditorOOCToggle ||
    !postEditorOOC
  ) {
    return;
  }


  const expanded =
    postEditorOOCToggle.getAttribute(
      "aria-expanded"
    ) ===
    "true";


  postEditorOOCToggle.setAttribute(
    "aria-expanded",
    String(
      !expanded
    )
  );


  postEditorOOC.hidden =
    expanded;

}


function resetEditorOOC() {

  if (
    postEditorOOC
  ) {

    postEditorOOC.value =
      "";


    postEditorOOC.hidden =
      true;

  }


  postEditorOOCToggle
    ?.setAttribute(
      "aria-expanded",
      "false"
    );

}



/* =========================================================
   RICHTEXT / HTML 모드 전환
========================================================== */

function setEditorContentMode(
  mode
) {

  editorContentMode =
    mode === "html"
      ? "html"
      : "richtext";


  const isHtml =
    editorContentMode ===
    "html";


  postEditorHtmlModeToggle
    ?.setAttribute(
      "aria-pressed",
      String(
        isHtml
      )
    );


  if (
    postEditorRichtextMode
  ) {

    postEditorRichtextMode.hidden =
      isHtml;

  }


  if (
    postEditorHtmlContent
  ) {

    postEditorHtmlContent.hidden =
      !isHtml;

  }


  /*
    HTML 모드는 "글 자체를 HTML 뷰어처럼 보여주는" 용도라
    발췌 이미지(프리뷰/export) 기능은 의미가 없어서 숨긴다.
  */

  if (
    postEditorPreviewToggle
  ) {

    postEditorPreviewToggle.hidden =
      isHtml;

  }


  if (
    postEditorExportButton
  ) {

    postEditorExportButton.hidden =
      isHtml;

  }


  if (isHtml) {

    closeEditorPreview();

  }

}


function toggleEditorContentMode() {

  setEditorContentMode(
    editorContentMode ===
    "html"
      ? "richtext"
      : "html"
  );

}
