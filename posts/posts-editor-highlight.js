/* =========================================================
   POSTS - RICH EDITOR: HIGHLIGHT / TOOLBAR STATE / CONTENT

   posts-editor.js 분할본 중 마지막. DOM 참조/상태는
   posts/editor/posts-refs.js에 있음, selectWrappedContent/
   closestRichStyle 등은 posts-editor.js에 있음(둘 다
   이 파일보다 먼저 로드돼야 함).

   내용: 하이라이트 적용, 서식 지우기, 툴바 버튼 활성/비활성
   상태 갱신, 에디터 비우기/내용 설정/HTML·순수텍스트 추출.
========================================================== */


/* =========================================================
   HIGHLIGHT
========================================================== */

function applyEditorHighlight(
  color
) {

  const range =
    getEditorRange();


  if (!range) {
    return;
  }


  const safeColor =
    getSafeHighlightColor(
      color
    );


  /*
    선택 전체가 이미 하나의 highlight 안이라면
    span을 겹치지 않고 색만 바꿈.
  */

  const existing =
    closestRichStyle(
      range.startContainer,
      "post-inline-highlight"
    );


  if (
    existing &&
    existing.contains(
      range.endContainer.nodeType ===
        Node.ELEMENT_NODE
        ? range.endContainer
        : range.endContainer.parentElement
    )
  ) {

    existing.dataset.highlight =
      safeColor;


    existing.style.backgroundColor =
      safeColor;


    selectWrappedContent(
      existing
    );


    updateEditorPreview();

    updateEditorToolbarState();

    return;

  }


  const wrapper =
    document.createElement(
      "span"
    );


  wrapper.className =
    "post-inline-highlight";


  wrapper.dataset.highlight =
    safeColor;


  wrapper.style.backgroundColor =
    safeColor;


  const fragment =
    range.extractContents();


  wrapper.appendChild(
    fragment
  );


  range.insertNode(
    wrapper
  );


  selectWrappedContent(
    wrapper
  );


  updateEditorPreview();

  updateEditorToolbarState();

}



/* =========================================================
   CLEAR STYLE
========================================================== */

function stripRichStylesFromFragment(
  fragment
) {

  const wrappers =
    Array.from(
      fragment.querySelectorAll(
        ".post-inline-font, .post-inline-highlight"
      )
    );


  wrappers.reverse();


  wrappers.forEach(
    wrapper => {

      unwrapElement(
        wrapper
      );

    }
  );


  return fragment;

}


function clearEditorStyle() {

  const range =
    getEditorRange();


  if (!range) {
    return;
  }


  /*
    선택영역 안쪽 스타일 제거
  */

  const fragment =
    range.extractContents();


  stripRichStylesFromFragment(
    fragment
  );


  const marker =
    document.createElement(
      "span"
    );


  marker.appendChild(
    fragment
  );


  range.insertNode(
    marker
  );


  /*
    선택영역 바깥을 감싸고 있던
    font/highlight도 선택 전체에 해당하면 제거.
  */

  const parentFont =
    closestRichStyle(
      marker,
      "post-inline-font"
    );


  const parentHighlight =
    closestRichStyle(
      marker,
      "post-inline-highlight"
    );


  if (parentFont) {

    unwrapElement(
      parentFont
    );

  }


  if (parentHighlight) {

    unwrapElement(
      parentHighlight
    );

  }


  /*
    임시 marker 제거
  */

  const markerParent =
    marker.parentNode;


  const selectionRange =
    document.createRange();


  selectionRange.selectNodeContents(
    marker
  );


  while (
    marker.firstChild
  ) {

    markerParent.insertBefore(
      marker.firstChild,
      marker
    );

  }


  marker.remove();


  markerParent.normalize();


  savedEditorRange =
    null;


  postEditorContent.focus();


  updateEditorPreview();

  updateEditorToolbarState();

}



/* =========================================================
   TOOLBAR STATE
========================================================== */

function updateEditorToolbarState() {

  if (!postEditorContent) {
    return;
  }


  let fontActive =
    false;


  let highlightColor =
    null;


  if (savedEditorRange) {

    const start =
      savedEditorRange
        .startContainer;


    const font =
      closestRichStyle(
        start,
        "post-inline-font"
      );


    const highlight =
      closestRichStyle(
        start,
        "post-inline-highlight"
      );


    fontActive =
      Boolean(
        font
      );


    highlightColor =
      highlight
        ?.dataset
        ?.highlight
      ||
      highlight
        ?.style
        ?.backgroundColor
      ||
      null;

  }


  if (
    postEditorFontToggle
  ) {

    postEditorFontToggle
      .classList
      .toggle(
        "active",
        fontActive
      );


    postEditorFontToggle
      .setAttribute(
        "aria-pressed",
        fontActive
          ? "true"
          : "false"
      );

  }


  if (
    postEditorHighlightPreset
  ) {

    const preset =
      getPresetHighlightColor()
        .toLowerCase();


    postEditorHighlightPreset
      .classList
      .toggle(
        "active",
        typeof highlightColor ===
          "string"
        &&
        highlightColor
          .toLowerCase() ===
          preset
      );

  }

}



/* =========================================================
   EDITOR CONTENT
========================================================== */

function clearRichEditor() {

  if (!postEditorContent) {
    return;
  }


  postEditorContent.replaceChildren();


  savedEditorRange =
    null;

}


function setRichEditorContent(
  content
) {

  if (!postEditorContent) {
    return;
  }


  const safeHTML =
    getPostContentAsSafeHTML(
      content
    );


  const temp =
    document.createElement(
      "div"
    );


  temp.innerHTML =
    safeHTML;


  postEditorContent.replaceChildren();


  while (
    temp.firstChild
  ) {

    postEditorContent.appendChild(
      temp.firstChild
    );

  }


  savedEditorRange =
    null;

}


function getRichEditorHTML() {

  if (!postEditorContent) {
    return "";
  }


  return sanitizeRichHTML(
    postEditorContent.innerHTML
  );

}


function getRichEditorPlainText() {

  if (!postEditorContent) {
    return "";
  }


  /*
    PAGE BREAK는 편집용 구조물이라
    실제 본문 텍스트로 세지 않음.
  */

  const clone =
    postEditorContent.cloneNode(
      true
    );


  clone
    .querySelectorAll(
      ".post-editor-page-break"
    )
    .forEach(
      marker => {

        marker.remove();

      }
    );


  return (
    clone.innerText ||
    clone.textContent ||
    ""
  );

}


