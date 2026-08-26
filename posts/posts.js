/* =========================================================
   POSTS
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



/* =========================================================
   EDITOR MESSAGE / CATEGORY / RICH EDITOR SELECTION /
   RANGE HELPERS / FONT TOGGLE / HIGHLIGHT / CLEAR STYLE /
   TOOLBAR STATE / EDITOR CONTENT

   showPostEditorMessage, loadPostEditorCategories,
   nodeIsInsideEditor, saveEditorSelection, restoreEditorSelection,
   getEditorRange, selectWrappedContent, unwrapElement,
   closestRichStyle, toggleEditorFont, applyEditorHighlight,
   stripRichStylesFromFragment, clearEditorStyle,
   updateEditorToolbarState, clearRichEditor, setRichEditorContent,
   getRichEditorHTML, getRichEditorPlainText

   -> posts-editor.js 로 이동함.
========================================================== */


/* =========================================================
   EDITOR PREVIEW ~ MOBILE PREVIEW

   getPostPreviewRatio, applyPostPreviewPresetVariables,
   applyPreviewTitleStyle, applyPreviewLineBreakMode,
   createPreviewSource, createEditorPreviewPage,
   previewPageIsOverflowing, isEditorPageBreakNode,
   showEditorPreviewPage, renderEditorPreviewPages,
   updateEditorPreview, waitForExport, getExportBaseFileName,
   downloadDataUrl, exportEditorPreviewAsImages,
   isMobilePostEditor, openEditorPreview, closeEditorPreview,
   syncEditorPreviewMode

   -> posts-preview.js 로 이동함.
========================================================== */





/* =========================================================
   PREPARE EDITOR ~ CANCEL EDITOR

   prepareEditorUI, hidePostEditor, updatePostAddButton,
   closePostArea, openCategoryPage, openPostPage,
   updatePostOwnerActions, loadRelatedPosts,
   openNewPostEditor, openPostEditor, cancelPostEditor

   -> posts-view.js 로 이동함.
========================================================== */





/* =========================================================
   CATEGORY MENU
========================================================== */

categoryMenuLinks
  ?.addEventListener(
    "click",
    async event => {

      const link =
        event.target.closest(
          "a[data-category-id]"
        );


      if (!link) {
        return;
      }


      event.preventDefault();


      await openCategoryPage(
        link.dataset.categoryId
      );

    }
  );



/* =========================================================
   POST LIST
========================================================== */

postList
  ?.addEventListener(
    "click",
    async event => {

      const item =
        event.target.closest(
          ".post-list-item"
        );


      if (!item) {
        return;
      }


      event.preventDefault();


      await openPostPage(
        item.dataset.postId
      );

    }
  );



/* =========================================================
   RELATED
========================================================== */

postRelatedList
  ?.addEventListener(
    "click",
    async event => {

      const item =
        event.target.closest(
          "[data-post-id]"
        );


      if (!item) {
        return;
      }


      event.preventDefault();


      postArea.scrollTo({
        top: 0,
        behavior: "smooth"
      });


      await openPostPage(
        item.dataset.postId
      );

    }
  );



/* =========================================================
   SECRET GATE
========================================================== */

postSecretGate
  ?.addEventListener(
    "submit",
    handleSecretGateSubmit
  );



/* =========================================================
   BACK
========================================================== */

postBackButton
  ?.addEventListener(
    "click",
    async () => {

      if (
        currentPostView ===
          "editor"
      ) {

        await cancelPostEditor();

        return;

      }


      if (
        currentPostView ===
          "post" &&
        currentPostCategoryId
      ) {

        await openCategoryPage(
          currentPostCategoryId
        );

        return;

      }


      await closePostArea();

    }
  );



/* =========================================================
   EDIT
========================================================== */

postEditButton
  ?.addEventListener(
    "click",
    async () => {

      if (!currentPostId) {
        return;
      }


      await openPostEditor(
        currentPostId
      );

    }
  );



/* =========================================================
   DELETE
========================================================== */

postDeleteButton
  ?.addEventListener(
    "click",
    async () => {

      if (!currentPostId) {
        return;
      }


      if (
        !confirm(
          "이 글을 삭제할까요?"
        )
      ) {

        return;

      }


      const user =
        await getSignedInUser();


      if (
        !user ||
        user.id !==
          currentPostOwnerId
      ) {

        return;

      }


      const categoryId =
        currentPostCategoryId;


      const {
        error
      } =
        await supabaseClient
          .from(
            "posts"
          )
          .delete()
          .eq(
            "id",
            currentPostId
          )
          .eq(
            "user_id",
            user.id
          );


      if (error) {

        console.error(
          error
        );


        alert(
          "삭제하지 못했습니다."
        );


        return;

      }


      await openCategoryPage(
        categoryId
      );

    }
  );



/* =========================================================
   ADD
========================================================== */

postAddButton
  ?.addEventListener(
    "click",
    async () => {

      await openNewPostEditor(
        currentPostCategoryId
      );

    }
  );

/* =========================================================
   MANUAL PAGE BREAK
========================================================== */

function insertEditorPageBreak() {

  if (
    !postEditorContent
  ) {
    return;
  }


  /*
    toolbar 클릭 직전 저장된
    caret 위치 복원.
  */

  restoreEditorSelection();


  const selection =
    window.getSelection();


  if (
    !selection ||
    selection.rangeCount === 0
  ) {

    showPostEditorMessage(
      "페이지를 나눌 위치에 커서를 놓아주세요."
    );


    return;

  }


  const range =
    selection.getRangeAt(
      0
    );


  if (
    !nodeIsInsideEditor(
      range.startContainer
    )
  ) {

    showPostEditorMessage(
      "페이지를 나눌 위치에 커서를 놓아주세요."
    );


    return;

  }


  /*
    선택된 글자가 있다면
    선택 시작점을 기준으로 삽입.
  */

  range.collapse(
    true
  );


  const marker =
    document.createElement(
      "div"
    );


  marker.className =
    "post-editor-page-break";


  marker.dataset.pageBreak =
    "true";


  marker.setAttribute(
    "contenteditable",
    "false"
  );


  marker.textContent =
    "PAGE BREAK";


  /*
    editor 자체에 커서가 있는 경우
  */

  if (
    range.startContainer ===
    postEditorContent
  ) {

    const reference =
      postEditorContent.childNodes[
        range.startOffset
      ] || null;


    postEditorContent.insertBefore(
      marker,
      reference
    );

  }


  /*
    일반 텍스트 바로 위에 커서가 있는 경우:
    텍스트를 정확히 그 위치에서 둘로 나눔.
  */

  else if (
    range.startContainer.nodeType ===
      Node.TEXT_NODE
    &&
    range.startContainer.parentNode ===
      postEditorContent
  ) {

    const textNode =
      range.startContainer;


    const offset =
      range.startOffset;


    const after =
      textNode.splitText(
        offset
      );


    postEditorContent.insertBefore(
      marker,
      after
    );

  }


  /*
    highlight 등 내부 span 안에 있는 경우에는
    해당 최상위 덩어리 다음에서 나눔.
  */

  else {

    let topLevel =
      range.startContainer
        .nodeType ===
        Node.ELEMENT_NODE
          ? range.startContainer
          : range.startContainer
              .parentElement;


    while (
      topLevel &&
      topLevel.parentNode !==
        postEditorContent
    ) {

      topLevel =
        topLevel.parentElement;

    }


    if (topLevel) {

      topLevel.after(
        marker
      );

    }


    else {

      postEditorContent.appendChild(
        marker
      );

    }

  }


  /*
    커서를 PAGE BREAK 뒤로 이동.
  */

  const nextRange =
    document.createRange();


  nextRange.setStartAfter(
    marker
  );


  nextRange.collapse(
    true
  );


  selection.removeAllRanges();


  selection.addRange(
    nextRange
  );


  savedEditorRange =
    nextRange.cloneRange();


  postEditorContent.focus();


  showPostEditorMessage(
    ""
  );


  updateEditorPreview();

}

/* =========================================================
   RICH EDITOR EVENTS
========================================================== */

postEditorTitle
  ?.addEventListener(
    "input",
    updateEditorPreview
  );


postEditorContent
  ?.addEventListener(
    "input",
    () => {

      saveEditorSelection();

      updateEditorPreview();

    }
  );


postEditorContent
  ?.addEventListener(
    "keyup",
    saveEditorSelection
  );


postEditorContent
  ?.addEventListener(
    "mouseup",
    saveEditorSelection
  );


postEditorContent
  ?.addEventListener(
    "touchend",
    () => {

      setTimeout(
        saveEditorSelection,
        0
      );

    }
  );


document.addEventListener(
  "selectionchange",
  () => {

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
      nodeIsInsideEditor(
        range.commonAncestorContainer
      )
    ) {

      saveEditorSelection();

    }

  }
);

/* =========================================================
   ENTER = SIMPLE LINE BREAK
========================================================== */

postEditorContent
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Enter"
      ) {
        return;
      }


      event.preventDefault();


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
          range.commonAncestorContainer
        )
      ) {
        return;
      }


      range.deleteContents();


      const br =
        document.createElement(
          "br"
        );


      range.insertNode(
        br
      );


      const nextRange =
        document.createRange();


      nextRange.setStartAfter(
        br
      );


      nextRange.collapse(
        true
      );


      selection.removeAllRanges();


      selection.addRange(
        nextRange
      );


      savedEditorRange =
        nextRange.cloneRange();


      updateEditorPreview();

    }
  );

/* =========================================================
   PASTE
   일반 텍스트 + 줄바꿈 그대로 붙여넣기
========================================================== */

postEditorContent
  ?.addEventListener(
    "paste",
    event => {

      const selection =
        window.getSelection();


      if (
        !selection ||
        selection.rangeCount === 0
      ) {
        return;
      }


      const range =
        selection.getRangeAt(0);


      if (
        !nodeIsInsideEditor(
          range.commonAncestorContainer
        )
      ) {
        return;
      }


      const text =
        event.clipboardData
          ?.getData("text/plain");


      /*
        브라우저에서 텍스트를 못 가져온 경우에는
        기본 붙여넣기를 막지 않음.
      */

      if (
        typeof text !== "string"
      ) {
        return;
      }


      event.preventDefault();


      range.deleteContents();


      const fragment =
        document.createDocumentFragment();


      const lines =
        text.split(/\r?\n/);


      let lastNode =
        null;


      lines.forEach(
        (line, index) => {

          const textNode =
            document.createTextNode(
              line
            );


          fragment.appendChild(
            textNode
          );


          lastNode =
            textNode;


          if (
            index <
            lines.length - 1
          ) {

            const br =
              document.createElement(
                "br"
              );


            fragment.appendChild(
              br
            );


            lastNode =
              br;

          }

        }
      );


      range.insertNode(
        fragment
      );


      if (lastNode) {

        range.setStartAfter(
          lastNode
        );


        range.collapse(true);


        selection.removeAllRanges();


        selection.addRange(
          range
        );


        savedEditorRange =
          range.cloneRange();

      }


      updateEditorPreview();

    }
  );

  /* =========================================================
   TOOLBAR SELECTION KEEP
========================================================== */

function captureEditorSelectionBeforeToolbar() {

  const selection =
    window.getSelection();


  if (
    !selection ||
    selection.rangeCount === 0
  ) {
    return;
  }


  const range =
    selection.getRangeAt(0);


  if (
    range.collapsed ||
    !nodeIsInsideEditor(
      range.commonAncestorContainer
    )
  ) {
    return;
  }


  savedEditorRange =
    range.cloneRange();

}

function captureEditorCaretBeforeToolbar() {

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
    )
  ) {
    return;
  }


  savedEditorRange =
    range.cloneRange();

}

/*
  데스크톱 + 모바일 둘 다 pointerdown 사용
*/

[
  postEditorFontToggle,
  postEditorHighlightPreset,
  postEditorClearStyle
].forEach(
  button => {

    button
      ?.addEventListener(
        "pointerdown",
        event => {

          captureEditorSelectionBeforeToolbar();

          /*
            버튼이 focus를 훔치지 못하게 함.
          */
          event.preventDefault();

        }
      );

  }
);

/* =========================================================
   FONT BUTTON
========================================================== */

postEditorFontToggle
  ?.addEventListener(
    "click",
    () => {

      toggleEditorFont();

    }
  );

/* =========================================================
   PAGE BREAK
========================================================== */

postEditorPageBreak
  ?.addEventListener(
    "pointerdown",
    event => {

      captureEditorCaretBeforeToolbar();

      event.preventDefault();

    }
  );


postEditorPageBreak
  ?.addEventListener(
    "click",
    insertEditorPageBreak
  );

  /* =========================================================
   PREVIEW PAGE NAV
========================================================== */

postEditorPreviewPrev
  ?.addEventListener(
    "click",
    () => {

      showEditorPreviewPage(
        editorPreviewPageIndex - 1
      );

    }
  );


postEditorPreviewNext
  ?.addEventListener(
    "click",
    () => {

      showEditorPreviewPage(
        editorPreviewPageIndex + 1
      );

    }
  );

/* =========================================================
   PRESET HIGHLIGHT
========================================================== */


postEditorHighlightPreset
  ?.addEventListener(
    "click",
    () => {

      applyEditorHighlight(
        getPresetHighlightColor()
      );

    }
  );



/* =========================================================
   CUSTOM HIGHLIGHT
========================================================== */

/*
  컬러피커를 여는 순간에도
  현재 선택영역을 먼저 저장해 둠.
*/

postEditorCustomControl
  ?.addEventListener(
    "pointerdown",
    () => {

      captureEditorSelectionBeforeToolbar();

    }
  );

postEditorCustomColor
  ?.addEventListener(
    "focus",
    () => {

      updateCustomHighlightSwatch();

    }
  );


postEditorCustomColor
  ?.addEventListener(
    "input",
    updateCustomHighlightSwatch
  );


postEditorCustomColor
  ?.addEventListener(
    "change",
    () => {

      updateCustomHighlightSwatch();


      applyEditorHighlight(
        postEditorCustomColor.value
      );

    }
  );



/* =========================================================
   MOBILE FLOATING HIGHLIGHT MENU

   본문에서 텍스트를 선택하면(주로 모바일 롱프레스),
   위에 있는 고정 툴바까지 갈 필요 없이 선택 영역
   바로 옆에 하이라이트 버튼이 뜨게 한다.
   고정 툴바는 그대로 유지(둘 다 사용 가능).
========================================================== */

function hideEditorFloatingMenu() {

  if (postEditorFloatingMenu) {

    postEditorFloatingMenu.hidden =
      true;

  }

}


function positionEditorFloatingMenu(
  rect
) {

  if (!postEditorFloatingMenu) {
    return;
  }


  postEditorFloatingMenu.hidden =
    false;


  const menuRect =
    postEditorFloatingMenu.getBoundingClientRect();


  const gap =
    8;


  let top =
    rect.top -
    menuRect.height -
    gap;


  if (top < gap) {

    top =
      rect.bottom +
      gap;

  }


  let left =
    rect.left +
    rect.width / 2 -
    menuRect.width / 2;


  left =
    Math.max(
      gap,
      Math.min(
        left,
        window.innerWidth -
          menuRect.width -
          gap
      )
    );


  postEditorFloatingMenu.style.top =
    `${top}px`;


  postEditorFloatingMenu.style.left =
    `${left}px`;

}


function syncEditorFloatingMenu() {

  if (
    !postEditorFloatingMenu ||
    !isMobilePostEditor()
  ) {

    hideEditorFloatingMenu();

    return;

  }


  const selection =
    window.getSelection();


  if (
    !selection ||
    selection.isCollapsed ||
    selection.rangeCount === 0
  ) {

    hideEditorFloatingMenu();

    return;

  }


  const range =
    selection.getRangeAt(0);


  if (
    !nodeIsInsideEditor(
      range.commonAncestorContainer
    )
  ) {

    hideEditorFloatingMenu();

    return;

  }


  const rect =
    range.getBoundingClientRect();


  if (
    rect.width === 0 &&
    rect.height === 0
  ) {

    hideEditorFloatingMenu();

    return;

  }


  positionEditorFloatingMenu(
    rect
  );

}


document.addEventListener(
  "selectionchange",
  syncEditorFloatingMenu
);


postEditorContent
  ?.addEventListener(
    "scroll",
    hideEditorFloatingMenu
  );


postArea
  ?.addEventListener(
    "scroll",
    hideEditorFloatingMenu
  );


[
  postEditorFloatingHighlightPreset
].forEach(
  button => {

    button
      ?.addEventListener(
        "pointerdown",
        event => {

          captureEditorSelectionBeforeToolbar();

          event.preventDefault();

        }
      );

  }
);


postEditorFloatingHighlightPreset
  ?.addEventListener(
    "click",
    () => {

      applyEditorHighlight(
        getPresetHighlightColor()
      );

    }
  );


document
  .querySelector(
    'label[for="postEditorFloatingCustomColor"]'
  )
  ?.addEventListener(
    "pointerdown",
    () => {

      captureEditorSelectionBeforeToolbar();

    }
  );


postEditorFloatingCustomColor
  ?.addEventListener(
    "input",
    updateCustomHighlightSwatch
  );


postEditorFloatingCustomColor
  ?.addEventListener(
    "change",
    () => {

      applyEditorHighlight(
        postEditorFloatingCustomColor.value
      );


      updateCustomHighlightSwatch();

    }
  );



/* =========================================================
   CLEAR
========================================================== */


postEditorClearStyle
  ?.addEventListener(
    "click",
    clearEditorStyle
  );



/* =========================================================
   PRESET SELECT
========================================================== */

postEditorPresetSelect
  ?.addEventListener(
    "change",
    () => {

      applyPostPresetById(
        postEditorPresetSelect.value
      );

    }
  );



/* =========================================================
   OOC
========================================================== */

postEditorOOCToggle
  ?.addEventListener(
    "click",
    toggleEditorOOC
  );



/* =========================================================
   HTML MODE
========================================================== */

postEditorHtmlModeToggle
  ?.addEventListener(
    "click",
    toggleEditorContentMode
  );



/* =========================================================
   VISIBILITY (비밀글 / 비공개)
========================================================== */

postEditorSecretToggle
  ?.addEventListener(
    "click",
    toggleEditorSecret
  );


postEditorPrivateToggle
  ?.addEventListener(
    "click",
    toggleEditorPrivate
  );



/* =========================================================
   PREVIEW OPEN / CLOSE
========================================================== */

postEditorPreviewToggle
  ?.addEventListener(
    "click",
    () => {

      const isOpen =
        postEditorPreviewSection
          ?.classList
          .contains(
            "is-open"
          );


      if (isOpen) {

        closeEditorPreview();

      }


      else {

        openEditorPreview();

      }

    }
  );


postEditorPreviewClose
  ?.addEventListener(
    "click",
    closeEditorPreview
  );


postEditorPreviewBackdrop
  ?.addEventListener(
    "click",
    closeEditorPreview
  );



/* =========================================================
   PREVIEW TITLE / SOURCE VISIBILITY TOGGLE
========================================================== */

postEditorPreviewTitleToggle
  ?.addEventListener(
    "click",
    () => {

      previewTitleVisible =
        !previewTitleVisible;


      syncPreviewVisibilityToggleButtons();


      updateEditorPreview(
        {
          preserveView: true
        }
      );

    }
  );


postEditorPreviewSourceToggle
  ?.addEventListener(
    "click",
    () => {

      previewSourceVisible =
        !previewSourceVisible;


      syncPreviewVisibilityToggleButtons();


      updateEditorPreview(
        {
          preserveView: true
        }
      );

    }
  );


postEditorPreviewSourcePositionFlow
  ?.addEventListener(
    "click",
    () => {

      previewSourcePosition =
        "flow";


      syncPreviewVisibilityToggleButtons();


      updateEditorPreview(
        {
          preserveView: true
        }
      );

    }
  );


postEditorPreviewSourcePositionFixed
  ?.addEventListener(
    "click",
    () => {

      previewSourcePosition =
        "fixed";


      syncPreviewVisibilityToggleButtons();


      updateEditorPreview(
        {
          preserveView: true
        }
      );

    }
  );


postEditorPreviewRatioTrigger
  ?.addEventListener(
    "click",
    () => {

      previewRatioRowExpanded =
        !previewRatioRowExpanded;


      syncPreviewRatioControls();

    }
  );



/* =========================================================
   PREVIEW RATIO CONTROLS
========================================================== */

postEditorPreviewRatioButtons
  ?.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          previewRatioMode =
            button.dataset.ratio;


          syncPreviewRatioControls();


          updateEditorPreview(
            {
              preserveView: true
            }
          );

        }
      );

    }
  );


postEditorPreviewRatioCustomWidth
  ?.addEventListener(
    "input",
    () => {

      previewCustomRatioWidth =
        Number(
          postEditorPreviewRatioCustomWidth.value
        ) ||
        1;


      if (
        previewRatioMode ===
        "custom"
      ) {

        updateEditorPreview(
          {
            preserveView: true
          }
        );

      }

    }
  );


postEditorPreviewRatioCustomHeight
  ?.addEventListener(
    "input",
    () => {

      previewCustomRatioHeight =
        Number(
          postEditorPreviewRatioCustomHeight.value
        ) ||
        1;


      if (
        previewRatioMode ===
        "custom"
      ) {

        updateEditorPreview(
          {
            preserveView: true
          }
        );

      }

    }
  );



/* =========================================================
   MOBILE PREVIEW PINCH ZOOM / PAN
========================================================== */

postEditorPreviewStage
  ?.addEventListener(
    "pointerdown",
    handlePreviewStagePointerDown
  );


postEditorPreviewStage
  ?.addEventListener(
    "pointermove",
    handlePreviewStagePointerMove
  );


postEditorPreviewStage
  ?.addEventListener(
    "pointerup",
    handlePreviewStagePointerUp
  );


postEditorPreviewStage
  ?.addEventListener(
    "pointercancel",
    handlePreviewStagePointerUp
  );



/* =========================================================
   MOBILE PREVIEW SHEET RESIZE
========================================================== */

postEditorPreviewDragHandle
  ?.addEventListener(
    "pointerdown",
    handlePreviewDragPointerDown
  );


postEditorPreviewDragHandle
  ?.addEventListener(
    "pointermove",
    handlePreviewDragPointerMove
  );


postEditorPreviewDragHandle
  ?.addEventListener(
    "pointerup",
    handlePreviewDragPointerUp
  );


postEditorPreviewDragHandle
  ?.addEventListener(
    "pointercancel",
    handlePreviewDragPointerUp
  );



/* =========================================================
   ESC
========================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
        "Escape" &&
      postEditorPreviewSection
        ?.classList
        .contains(
          "is-open"
        )
    ) {

      closeEditorPreview();

    }

  }
);



/* =========================================================
   RESPONSIVE PREVIEW
========================================================== */

window.addEventListener(
  "resize",
  () => {

    syncEditorPreviewMode();


    if (
      currentPostView ===
      "editor"
    ) {

      updateEditorPreview();

    }

  }
);


/* =========================================================
   CANCEL
========================================================== */

postEditorCancelButton
  ?.addEventListener(
    "click",
    async () => {

      await cancelPostEditor();

    }
  );

/* =========================================================
   EXPORT
========================================================== */

postEditorExportButton
  ?.addEventListener(
    "click",
    async () => {

      await exportEditorPreviewAsImages();

    }
  );

/* =========================================================
   SAVE HELPERS

   본문(content/ooc_content)은 posts가 아니라 post_contents
   테이블에 저장됨(비밀글의 "제목은 목록에 보이되 본문만
   숨기기"를 DB RLS로 구현하려고 분리함 — 자세한 설명은
   supabase/migrations/*_secret_private_posts.sql 참고).

   비밀번호는 평문을 절대 posts 테이블에 직접 쓰지 않고,
   set_post_secret_password RPC(DB 안에서 bcrypt 해시로
   변환)를 통해서만 저장한다.
========================================================== */

async function savePostContentAndSecret(
  postId,
  content,
  oocContent,
  visibility,
  secretPassword
) {

  const {
    error: contentError
  } =
    await supabaseClient
      .from(
        "post_contents"
      )
      .upsert(
        {
          post_id:
            postId,

          content,

          ooc_content:
            oocContent
        },
        {
          onConflict:
            "post_id"
        }
      );


  if (contentError) {
    return contentError;
  }


  if (
    visibility ===
      "secret" &&
    secretPassword
  ) {

    const {
      error: passwordError
    } =
      await supabaseClient
        .rpc(
          "set_post_secret_password",
          {
            p_post_id:
              postId,

            p_password:
              secretPassword
          }
        );


    if (passwordError) {
      return passwordError;
    }

  }


  return null;

}



/* =========================================================
   SAVE
========================================================== */

postEditorSaveButton
  ?.addEventListener(
    "click",
    async () => {

      const user =
        await getSignedInUser();


      if (!user) {
        return;
      }


      const categoryId =
        Number(
          postEditorCategory.value
        );


      const title =
        postEditorTitle
          .value
          .trim();


      const isHtmlMode =
        editorContentMode ===
        "html";


      /*
        HTML 모드면 sanitize를 거치지 않은 raw HTML을
        그대로 저장한다(뷰어에서도 그대로 출력하는 게
        이 모드의 목적이므로). 아니면 기존처럼
        textarea.value가 아니라 sanitized rich HTML 저장.
      */

      const content =
        isHtmlMode
          ? postEditorHtmlContent
              ?.value ||
            ""
          : getRichEditorHTML();


      const plainText =
        isHtmlMode
          ? content.trim()
          : getRichEditorPlainText()
              .trim();


      const oocContent =
        postEditorOOC
          ?.value
          .trim() ||
        null;


      if (!title) {

        showPostEditorMessage(
          "제목을 입력해주세요."
        );

        return;

      }


      if (!plainText) {

        showPostEditorMessage(
          "본문을 입력해주세요."
        );

        return;

      }


      const secretPassword =
        postEditorSecretPassword
          ?.value
          .trim() ||
        "";


      if (
        editorPostVisibility ===
          "secret" &&
        !secretPassword &&
        !editorPostHadSecretPassword
      ) {

        showPostEditorMessage(
          "비밀글 비밀번호를 입력해주세요."
        );

        return;

      }


      if (
        secretPassword &&
        secretPassword.length < 4
      ) {

        showPostEditorMessage(
          "비밀번호는 4자 이상이어야 합니다."
        );

        return;

      }


      postEditorSaveButton.disabled =
        true;


      postEditorSaveButton.textContent =
        "...";


      /* =====================================================
         EDIT
      ====================================================== */

      if (
        currentEditorMode ===
          "edit" &&
        editorSourcePostId
      ) {

        const savedId =
          editorSourcePostId;


        const {
          error
        } =
          await supabaseClient
            .from(
              "posts"
            )
            .update({
              category_id:
                categoryId,

              title,

              content_type:
                isHtmlMode
                  ? "html"
                  : "richtext",

              visibility:
                editorPostVisibility,

              /*
                secret을 벗어나면 예전 해시는 지운다
                (다시 secret으로 바꾸면 새 비밀번호를
                반드시 입력하게 되므로).
              */

              secret_password_hash:
                editorPostVisibility ===
                "secret"
                  ? undefined
                  : null,

              updated_at:
                new Date()
                  .toISOString()
            })
            .eq(
              "id",
              savedId
            )
            .eq(
              "user_id",
              user.id
            );


        const contentSaveError =
          error ||
          (
            await savePostContentAndSecret(
              savedId,
              content,
              oocContent,
              editorPostVisibility,
              secretPassword
            )
          );


        postEditorSaveButton.disabled =
          false;


        postEditorSaveButton.textContent =
          "save";


        if (contentSaveError) {

          console.error(
            contentSaveError
          );


          showPostEditorMessage(
            "저장하지 못했습니다."
          );


          return;

        }


        hidePostEditor();


        await openPostPage(
          savedId,
          {
            updateUrl:
              false
          }
        );


        return;

      }


      /* =====================================================
         CREATE
      ====================================================== */

      const {
        data,
        error
      } =
        await supabaseClient
          .from(
            "posts"
          )
          .insert({
            user_id:
              user.id,

            category_id:
              categoryId,

            title,

            content_type:
              isHtmlMode
                ? "html"
                : "richtext",

            visibility:
              editorPostVisibility,

            updated_at:
              new Date()
                .toISOString()
          })
          .select(
            "id"
          )
          .single();


      const contentSaveError =
        error ||
        !data ?
          error :
          await savePostContentAndSecret(
            data.id,
            content,
            oocContent,
            editorPostVisibility,
            secretPassword
          );


      postEditorSaveButton.disabled =
        false;


      postEditorSaveButton.textContent =
        "save";


      if (
        error ||
        !data ||
        contentSaveError
      ) {

        console.error(
          error ||
          contentSaveError
        );


        showPostEditorMessage(
          "저장하지 못했습니다."
        );


        return;

      }


      hidePostEditor();


      await openPostPage(
        data.id
      );

    }
  );



/* =========================================================
   ROUTER
========================================================== */

async function handlePostRoute() {

  const pathname =
    getPostRoutePath();


  const postMatch =
    pathname.match(
      /^\/post\/(\d+)\/?$/
    );


  if (postMatch) {

    await openPostPage(
      Number(
        postMatch[1]
      ),
      {
        updateUrl:
          false
      }
    );


    return;

  }


  const categoryMatch =
    pathname.match(
      /^\/category\/(\d+)\/?$/
    );


  if (categoryMatch) {

    await openCategoryPage(
      Number(
        categoryMatch[1]
      ),
      {
        updateUrl:
          false
      }
    );


    return;

  }


  await closePostArea({
    updateUrl:
      false,

    animate:
      false
  });

}



/* =========================================================
   404 REDIRECT RESTORE
========================================================== */

async function startPostRouter() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const route =
    params.get(
      "route"
    );


  if (route) {

    const restored =
      route.startsWith("/")
        ? route
        : `/${route}`;


    history.replaceState(
      {},
      "",
      buildPostRoute(
        restored
      )
    );

  }


  await handlePostRoute();

}



/* =========================================================
   BROWSER BACK / FORWARD
========================================================== */

window.addEventListener(
  "popstate",
  async () => {

    await handlePostRoute();

  }
);



/* =========================================================
   START
========================================================== */

syncEditorPreviewMode();

loadPostStylePreset();

loadPostPresetOptions();

startPostRouter();

refreshSiteFooterMarkers?.();