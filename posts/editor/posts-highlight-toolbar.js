/* =========================================================
   POSTS - HIGHLIGHT / TOOLBAR / MOBILE FLOATING MENU

   posts.js 분할본. DOM 참조/상태는 posts-refs.js에 있음
   (반드시 먼저 로드돼야 함).

   내용: 글꼴 토글 버튼, 페이지 나누기 버튼, 프리뷰 페이지
   이동, 프리셋/커스텀 하이라이트, 모바일에서 텍스트
   선택 시 뜨는 플로팅 하이라이트 메뉴(위치 계산 포함).
========================================================== */


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


  /*
    모바일(iPhone Safari 등)에서는 텍스트를 선택하면 브라우저
    자체 복사/붙여넣기 팝업이 선택 영역 "위"에 뜬다. 우리
    하이라이트 메뉴도 위에 띄우면 그 팝업이랑 겹쳐서 손가락이
    닿기도 힘들고 두 메뉴가 서로 가려버림 — 그래서 모바일은
    커서(선택 영역) 아래쪽을 우선으로 하고, 화면 아래로
    넘칠 때만 위로 뒤집는다. 데스크톱은 기존처럼 위가 기본.
  */

  const preferBelow =
    isMobilePostEditor();


  let top =
    preferBelow
      ? rect.bottom +
        gap
      : rect.top -
        menuRect.height -
        gap;


  const overflowsBottom =
    top +
      menuRect.height >
    window.innerHeight -
      gap;


  const overflowsTop =
    top < gap;


  if (
    preferBelow &&
    overflowsBottom
  ) {

    top =
      rect.top -
      menuRect.height -
      gap;

  }

  else if (
    !preferBelow &&
    overflowsTop
  ) {

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



