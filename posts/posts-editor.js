/* =========================================================
   POSTS - RICH EDITOR

   posts.js에서 분리됨.

   postEditorMessage, postEditorCategory, postEditorContent 등
   DOM 요소와 savedEditorRange 상태는 posts.js에 있음
   (같은 페이지에서 함께 로드되어야 함).
   getSafeHighlightColor는 posts-style.js에 있음.
========================================================== */

/* =========================================================
   EDITOR MESSAGE
========================================================== */

function showPostEditorMessage(
  message
) {

  if (!postEditorMessage) {
    return;
  }


  postEditorMessage.textContent =
    message;

}



/* =========================================================
   EDITOR CATEGORY
========================================================== */

async function loadPostEditorCategories(
  selectedCategoryId = null
) {

  if (!postEditorCategory) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "categories"
      )
      .select(
        "id, name, sort_order"
      )
      .order(
        "sort_order",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      error
    );

    return;

  }


  postEditorCategory.innerHTML =
    "";


  (data || []).forEach(
    category => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        category.id;


      option.textContent =
        category.name;


      postEditorCategory.appendChild(
        option
      );

    }
  );


  if (
    selectedCategoryId !==
    null
  ) {

    postEditorCategory.value =
      String(
        selectedCategoryId
      );

  }

}



/* =========================================================
   RICH EDITOR SELECTION
========================================================== */

function nodeIsInsideEditor(
  node
) {

  if (
    !node ||
    !postEditorContent
  ) {

    return false;

  }


  const element =
    node.nodeType ===
    Node.ELEMENT_NODE
      ? node
      : node.parentElement;


  return (
    element ===
      postEditorContent
    ||
    postEditorContent.contains(
      element
    )
  );

}


function saveEditorSelection() {

  if (!postEditorContent) {
    return;
  }


  const selection =
    window.getSelection();


  if (
    !selection ||
    selection.rangeCount === 0
  ) {

    return;

  }


  const range =
    selection.getRangeAt(
      0
    );


  if (
    !nodeIsInsideEditor(
      range.startContainer
    ) ||
    !nodeIsInsideEditor(
      range.endContainer
    )
  ) {

    return;

  }


  savedEditorRange =
    range.cloneRange();


  updateEditorToolbarState();

}


function restoreEditorSelection() {

  if (
    !savedEditorRange ||
    !postEditorContent
  ) {

    return false;

  }


  const selection =
    window.getSelection();


  selection.removeAllRanges();


  selection.addRange(
    savedEditorRange
  );


  return true;

}


function getEditorRange() {

  if (
    !postEditorContent
  ) {

    return null;

  }


  restoreEditorSelection();


  const selection =
    window.getSelection();


  if (
    !selection ||
    selection.rangeCount === 0
  ) {

    showPostEditorMessage(
      "스타일을 적용할 텍스트를 선택해주세요."
    );

    return null;

  }


  const range =
    selection.getRangeAt(
      0
    );


  if (
    range.collapsed ||
    !nodeIsInsideEditor(
      range.commonAncestorContainer
    )
  ) {

    showPostEditorMessage(
      "스타일을 적용할 텍스트를 선택해주세요."
    );

    return null;

  }


  return range;

}



/* =========================================================
   RANGE HELPERS
========================================================== */

function selectWrappedContent(
  wrapper
) {

  if (!wrapper) {
    return;
  }


  const range =
    document.createRange();


  range.selectNodeContents(
    wrapper
  );


  const selection =
    window.getSelection();


  selection.removeAllRanges();


  selection.addRange(
    range
  );


  savedEditorRange =
    range.cloneRange();

}


function unwrapElement(
  element
) {

  if (
    !element ||
    !element.parentNode
  ) {

    return;
  }


  const parent =
    element.parentNode;


  while (
    element.firstChild
  ) {

    parent.insertBefore(
      element.firstChild,
      element
    );

  }


  element.remove();


  parent.normalize();

}


function closestRichStyle(
  node,
  className
) {

  let element =
    node?.nodeType ===
      Node.ELEMENT_NODE
      ? node
      : node?.parentElement;


  while (
    element &&
    element !==
      postEditorContent
  ) {

    if (
      element.classList
        ?.contains(
          className
        )
    ) {

      return element;

    }


    element =
      element.parentElement;

  }


  return null;

}



/* =========================================================
   FONT TOGGLE
========================================================== */

function toggleEditorFont() {

  const range =
    getEditorRange();


  if (!range) {
    return;
  }


  const existing =
    closestRichStyle(
      range.startContainer,
      "post-inline-font"
    );


  /*
    선택이 이미 같은 font span 안에 있으면
    다시 누를 때 제거.
  */

  if (
    existing &&
    existing.contains(
      range.endContainer.nodeType ===
        Node.ELEMENT_NODE
        ? range.endContainer
        : range.endContainer.parentElement
    )
  ) {

    const text =
      existing.textContent;


    unwrapElement(
      existing
    );


    /*
      제거 뒤 선택은 굳이 정확히 유지하지 않아도
      편집 흐름에는 문제 없음.
    */

    savedEditorRange =
      null;


    postEditorContent.focus();


    updateEditorPreview();

    updateEditorToolbarState();

    return;

  }


  const wrapper =
    document.createElement(
      "span"
    );


  wrapper.className =
    "post-inline-font";


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


