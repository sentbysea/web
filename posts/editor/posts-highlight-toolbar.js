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
   CUSTOM HIGHLIGHT
========================================================== */

/*
  ★ 스와치를 누르는 즉시(pointerdown) 지금 색을 먼저
  적용한다 — 컬러피커(change 이벤트)까지 안 가고 그냥
  눌러서 끝내는 경우가 대부분이라, "눌렀는데 왜 안
  먹지" 하는 문제를 없애준다. 컬러피커를 열어서 실제로
  다른 색을 고르면 change 핸들러가 그 색으로 다시 한 번
  덮어씌운다. pointerdown 시점에 선택영역을 먼저
  저장해두는 이유도 동일(포커스가 옮겨가기 전에 붙잡아야
  함).
*/

postEditorCustomControl
  ?.addEventListener(
    "pointerdown",
    () => {

      captureEditorSelectionBeforeToolbar();


      if (postEditorCustomColor) {

        applyEditorHighlight(
          postEditorCustomColor.value
        );

      }

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
   CUSTOM POINT COLOR
========================================================== */

postEditorCustomPointControl
  ?.addEventListener(
    "pointerdown",
    () => {

      captureEditorSelectionBeforeToolbar();


      if (postEditorCustomPointColor) {

        applyEditorPointColor(
          postEditorCustomPointColor.value
        );

      }

    }
  );

postEditorCustomPointColor
  ?.addEventListener(
    "focus",
    () => {

      updateCustomPointColorSwatch();

    }
  );


postEditorCustomPointColor
  ?.addEventListener(
    "input",
    updateCustomPointColorSwatch
  );


postEditorCustomPointColor
  ?.addEventListener(
    "change",
    () => {

      updateCustomPointColorSwatch();


      applyEditorPointColor(
        postEditorCustomPointColor.value
      );

    }
  );



/* =========================================================
   FLOATING HIGHLIGHT / POINT COLOR 메뉴

   본문에서 텍스트를 선택하면(데스크톱 드래그, 모바일
   롱프레스 둘 다) 위에 있는 고정 툴바까지 갈 필요 없이
   선택 영역 바로 옆에 하이라이트/포인트 컬러 버튼이 뜨게
   한다. 고정 툴바는 그대로 유지(둘 다 사용 가능) — 트위터
   등에서 텍스트 선택 시 뜨는 볼드/이탤릭 팝업과 같은 패턴.
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


  /*
    ★ iOS Safari에서 키보드가 떠 있는 동안 position:fixed
    요소는 레이아웃 뷰포트(주소창/키보드까지 포함한, 실제로는
    안 보이는 영역까지 포함한 전체 기준) 좌표로 그려지는데,
    getBoundingClientRect()/window.innerWidth/Height는 시각
    뷰포트(실제로 화면에 보이는 영역) 기준이라 서로 어긋난다.
    평소엔 둘이 거의 같아서 안 보이던 오차가, 스크롤/키보드
    상태가 바뀔 때마다 visualViewport의 offset이 달라지면서
    메뉴가 화면 위에서 위치를 못 잡고 흔들리듯 움직이는
    것처럼 보였다. offsetLeft/offsetTop만큼 보정해주면
    시각 뷰포트 기준으로 맞아떨어진다.
  */

  const viewport =
    window.visualViewport;


  const viewportOffsetLeft =
    viewport?.offsetLeft ||
    0;


  const viewportOffsetTop =
    viewport?.offsetTop ||
    0;


  postEditorFloatingMenu.style.top =
    `${top + viewportOffsetTop}px`;


  postEditorFloatingMenu.style.left =
    `${left + viewportOffsetLeft}px`;

}


function syncEditorFloatingMenu() {

  if (
    !postEditorFloatingMenu
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


  /*
    ★ postEditorContent는 자기 안에서 스크롤되는 상자
    (overflow-y:auto)라, 선택 영역이 그 상자의 스크롤로
    안 보이게 밀려 올라가도(overflow로 잘렸을 뿐) getBoundingClientRect
    는 여전히 "원래 있어야 할" 화면 좌표를 그대로 돌려준다
    — 그대로 두면 메뉴가 상자 바깥(예: 위쪽 CATEGORY 영역)에
    뜬금없이 떠서 지금 화면에 보이는 글자와 상관없어 보인다.
    선택 영역이 상자의 실제로 보이는 세로 범위를 벗어났으면
    숨긴다.
  */

  if (postEditorContent) {

    const editorRect =
      postEditorContent.getBoundingClientRect();


    const rectMiddle =
      (
        rect.top +
        rect.bottom
      ) / 2;


    if (
      rectMiddle <
        editorRect.top ||
      rectMiddle >
        editorRect.bottom
    ) {

      hideEditorFloatingMenu();

      return;

    }

  }


  positionEditorFloatingMenu(
    rect
  );

}


document.addEventListener(
  "selectionchange",
  syncEditorFloatingMenu
);


/*
  ★ 스크롤해도 그냥 숨기지 않고 다시 위치를 계산한다.
  전에는 스크롤하면 메뉴를 숨기기만 했는데, 선택 자체는
  그대로 유지되니(selectionchange가 다시 안 뜸) 메뉴가
  스크롤 전 화면 좌표에 그대로 남아 있다가 — 아래로
  스크롤할수록 실제 선택 영역과는 점점 멀어져 보였다.

  scroll 이벤트는 버블링은 안 해도 캡처링은 하기 때문에,
  window에 capture:true로 하나만 걸어두면 postEditorContent
  내부 스크롤이든 postArea든 페이지 자체 스크롤이든 전부
  여기서 다 잡혀서 선택 영역을 계속 따라다니게 된다.
*/

window.addEventListener(
  "scroll",
  syncEditorFloatingMenu,
  true
);


/*
  ★ 온스크린 키보드가 열리고 닫힐 때(모바일 iOS Safari)는
  일반 scroll 이벤트가 안 뜨고 visualViewport의 크기/오프셋만
  바뀐다 — 이것도 같이 들어야 메뉴가 키보드가 뜨는 순간에도
  바로 올바른 위치로 다시 계산된다.
*/

window.visualViewport
  ?.addEventListener(
    "resize",
    syncEditorFloatingMenu
  );


window.visualViewport
  ?.addEventListener(
    "scroll",
    syncEditorFloatingMenu
  );


document
  .querySelector(
    'label[for="postEditorFloatingCustomColor"]'
  )
  ?.addEventListener(
    "pointerdown",
    () => {

      captureEditorSelectionBeforeToolbar();


      if (postEditorFloatingCustomColor) {

        applyEditorHighlight(
          postEditorFloatingCustomColor.value
        );

      }

    }
  );


document
  .querySelector(
    'label[for="postEditorFloatingCustomPointColor"]'
  )
  ?.addEventListener(
    "pointerdown",
    () => {

      captureEditorSelectionBeforeToolbar();


      if (postEditorFloatingCustomPointColor) {

        applyEditorPointColor(
          postEditorFloatingCustomPointColor.value
        );

      }

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


postEditorFloatingCustomPointColor
  ?.addEventListener(
    "input",
    updateCustomPointColorSwatch
  );


postEditorFloatingCustomPointColor
  ?.addEventListener(
    "change",
    () => {

      applyEditorPointColor(
        postEditorFloatingCustomPointColor.value
      );


      updateCustomPointColorSwatch();

    }
  );



