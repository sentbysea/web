/* =========================================================
   QUOTE - 대지/설정창 리사이즈 바 (모바일 전용)

   admin-quote.js 분할본. DOM 참조는 admin-quote-refs.js에
   있음(반드시 먼저 로드돼야 함).

   #quoteResizeHandle을 위아래로 드래그하면 .quote-preview-panel의
   --quote-preview-height 커스텀 프로퍼티가 바뀐다(admin.css
   QUOTE 모바일 섹션 참고). .quote-controls는 flex:1이라 대지가
   줄어든 만큼 설정창이 자동으로 늘어나고, 반대도 마찬가지.

   대지가 아니라 설정창 쪽을 flex:1로 둔 이유: 대지 안 캔버스는
   비율이 고정이라 남는 공간만큼 그대로 레터박싱(빈 여백)이
   생기지만, 설정창은 overflow-y:auto라 남는 공간을 실제
   콘텐츠(입력 필드 등)로 채운다 — 같은 여유 공간이라도 버려지지
   않고 쓸모 있게 쓰임.

   데스크톱에서는 핸들이 display:none이라 pointerdown 자체가
   발생하지 않는다.
========================================================== */

(function () {

  if (!quoteResizeHandle || !quotePreviewPanel) {
    return;
  }


  let dragging = false;
  let startY = 0;
  let startHeight = 0;
  let pendingFrame = null;


  function requestPreviewRescale() {

    if (pendingFrame) {
      return;
    }


    pendingFrame =
      requestAnimationFrame(
        () => {

          pendingFrame = null;


          if (
            typeof applyQuotePreviewScale ===
            "function"
          ) {

            applyQuotePreviewScale();

          }

        }
      );

  }


  function onPointerMove(event) {

    if (!dragging) {
      return;
    }


    event.preventDefault();


    /*
      핸들은 대지 아래쪽 경계선이라, 위로 끌면(deltaY 음수)
      경계가 위로 올라가며 대지가 작아져야 한다 — 그래서
      startHeight에 deltaY를 그대로 더한다(빼는 게 아님).
    */

    const deltaY =
      event.clientY -
      startY;

    const nextHeight =
      startHeight +
      deltaY;


    quotePreviewPanel.style.setProperty(
      "--quote-preview-height",
      `${nextHeight}px`
    );


    requestPreviewRescale();

  }


  function endDrag(event) {

    if (!dragging) {
      return;
    }


    dragging = false;


    quoteResizeHandle.classList.remove(
      "is-dragging"
    );


    document.body.style.userSelect =
      "";


    if (
      event &&
      quoteResizeHandle.hasPointerCapture?.(
        event.pointerId
      )
    ) {

      quoteResizeHandle.releasePointerCapture(
        event.pointerId
      );

    }


    window.removeEventListener(
      "pointermove",
      onPointerMove
    );

    window.removeEventListener(
      "pointerup",
      endDrag
    );

    window.removeEventListener(
      "pointercancel",
      endDrag
    );

  }


  quoteResizeHandle.addEventListener(
    "pointerdown",
    event => {

      dragging = true;

      startY =
        event.clientY;

      startHeight =
        quotePreviewPanel.getBoundingClientRect()
          .height;


      quoteResizeHandle.classList.add(
        "is-dragging"
      );


      document.body.style.userSelect =
        "none";


      quoteResizeHandle.setPointerCapture?.(
        event.pointerId
      );


      window.addEventListener(
        "pointermove",
        onPointerMove
      );

      window.addEventListener(
        "pointerup",
        endDrag
      );

      window.addEventListener(
        "pointercancel",
        endDrag
      );

    }
  );

})();
