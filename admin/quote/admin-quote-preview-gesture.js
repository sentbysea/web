/* =========================================================
   QUOTE - PREVIEW 핀치 줌 / 드래그 이동

   admin-quote.js 분할본. DOM 참조는 admin-quote-refs.js,
   스케일/이동 상태(quotePreviewPanX 등)와 setQuotePreviewPan /
   setQuotePreviewZoomAndPan은 admin-quote-preview-update.js에
   있음(둘 다 먼저 로드돼야 함).

   대지(.quote-preview-panel)와 설정창(.quote-controls) 사이를
   위아래로 드래그해서 나누던 이전 방식(예전 admin-quote-resize.js)은
   손잡이를 끌 때 대지가 화면 대부분을 잃어서 캔버스가 잘려
   보이는 문제가 있었다 — 구획은 이제 CSS로 고정하고, 대신
   #quotePreviewStage 안에서 두 손가락 핀치로 확대/축소하고
   한 손가락 드래그로 이동하게 한다(사진 뷰어와 동일한 방식).
   기존 −/+/FIT 버튼과 상태를 공유하므로 핀치/드래그 후에도
   그대로 이어서 쓸 수 있다.

   PAN 공식: 캔버스 transform은 translate(pan) scale(s) 순서라
   pan은 scale의 영향을 받지 않는 화면 픽셀 그대로다 — 그래서
   드래그 델타(화면 픽셀)를 pan에 그대로 더하면 된다.

   PINCH 공식: 두 손가락 중심(F)이 확대/축소 중에도 화면상 같은
   자리에 머물도록, 제스처 시작 시점의 캔버스 중심(C0,
   getBoundingClientRect 기준)과 그 시점의 pan/scale(pan0, s0)을
   기준으로 매 프레임 절대값으로 계산한다(이전 프레임 값을
   누적하지 않으므로 프레임을 아무리 거쳐도 오차가 안 쌓임):

     pan = pan0 + (F − C0) × (1 − scale / s0)
========================================================== */

(function () {

  if (
    !quotePreviewStage ||
    !quotePreviewCanvas
  ) {
    return;
  }


  const pointers = new Map();

  let mode = null;

  let panStartPoint = { x: 0, y: 0 };
  let panStart = { x: 0, y: 0 };

  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let pinchCenter = { x: 0, y: 0 };
  let pinchStartPan = { x: 0, y: 0 };


  function points() {

    return Array.from(
      pointers.values()
    );

  }


  function distance(a, b) {

    return Math.hypot(
      a.x - b.x,
      a.y - b.y
    );

  }


  function midpoint(a, b) {

    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };

  }


  function beginPan() {

    mode = "pan";

    const [point] = points();

    panStartPoint = {
      x: point.x,
      y: point.y,
    };

    panStart = {
      x: quotePreviewPanX,
      y: quotePreviewPanY,
    };

  }


  function beginPinch() {

    mode = "pinch";

    const [a, b] = points();

    pinchStartDist = distance(a, b);

    pinchStartScale =
      getCurrentQuotePreviewScale();

    pinchStartPan = {
      x: quotePreviewPanX,
      y: quotePreviewPanY,
    };


    const rect =
      quotePreviewCanvas.getBoundingClientRect();

    pinchCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

  }


  function onPointerDown(event) {

    quotePreviewStage.setPointerCapture?.(
      event.pointerId
    );

    pointers.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY,
      }
    );


    if (pointers.size === 1) {
      beginPan();
    } else if (pointers.size === 2) {
      beginPinch();
    }

  }


  function onPointerMove(event) {

    if (!pointers.has(event.pointerId)) {
      return;
    }


    pointers.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY,
      }
    );


    if (
      mode === "pinch" &&
      pointers.size === 2
    ) {

      event.preventDefault();

      const [a, b] = points();

      const dist = distance(a, b);

      const ratio =
        pinchStartDist > 0
          ? dist / pinchStartDist
          : 1;

      const nextScale =
        pinchStartScale * ratio;

      const center = midpoint(a, b);

      const factor =
        1 - nextScale / pinchStartScale;

      setQuotePreviewZoomAndPan(
        nextScale,
        pinchStartPan.x +
          (center.x - pinchCenter.x) * factor,
        pinchStartPan.y +
          (center.y - pinchCenter.y) * factor
      );

    } else if (
      mode === "pan" &&
      pointers.size === 1
    ) {

      event.preventDefault();

      const [point] = points();

      setQuotePreviewPan(
        panStart.x +
          (point.x - panStartPoint.x),
        panStart.y +
          (point.y - panStartPoint.y)
      );

    }

  }


  function endPointer(event) {

    if (!pointers.has(event.pointerId)) {
      return;
    }


    pointers.delete(
      event.pointerId
    );


    if (
      quotePreviewStage.hasPointerCapture?.(
        event.pointerId
      )
    ) {

      quotePreviewStage.releasePointerCapture(
        event.pointerId
      );

    }


    if (pointers.size === 1) {

      /*
        핀치 도중 손가락 하나를 뗀 경우 — 남은 손가락으로
        바로 이어서 드래그할 수 있도록 기준점을 다시 잡는다.
      */

      beginPan();

    } else if (pointers.size === 0) {

      mode = null;

    }

  }


  quotePreviewStage.addEventListener(
    "pointerdown",
    onPointerDown
  );

  quotePreviewStage.addEventListener(
    "pointermove",
    onPointerMove
  );

  quotePreviewStage.addEventListener(
    "pointerup",
    endPointer
  );

  quotePreviewStage.addEventListener(
    "pointercancel",
    endPointer
  );

})();
