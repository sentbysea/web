/* =========================================================
   QUOTE - UPDATE PREVIEW / SCALE / RATIO BUTTONS

   admin-quote.js 분할본. DOM 참조/상태는
   admin-quote-refs.js에 있음(반드시 먼저 로드돼야 함).

   내용: 프리뷰 캔버스에 설정값 반영(updateQuotePreview),
   실제 글쓰기 에디터 프리뷰와 크기가 같아 보이도록 맞추는
   applyQuotePreviewScale, 비율 버튼.
========================================================== */


/* =========================================================
   UPDATE PREVIEW
========================================================== */

function updateQuotePreview() {

  if (!quotePreviewCanvas) {
    return;
  }


  const ratio =
    getQuoteRatio();


  const exportWidth =
    Number(
      quoteWidth?.value
    ) || 1080;


  const exportHeight =
    Math.round(
      exportWidth *
      ratio.height /
      ratio.width
    );


  if (quotePreviewSize) {

    quotePreviewSize.textContent =
      `${exportWidth} × ${exportHeight}`;

  }


  quotePreviewCanvas.style.aspectRatio =
    `${ratio.width} / ${ratio.height}`;


  quotePreviewCanvas.style.backgroundColor =
    quoteBackground?.value ||
    "#ffffff";


  applyCanvasPadding();


  /* TEST CONTENT */

  if (
    quotePreviewTitle &&
    quoteTestTitle
  ) {

    quotePreviewTitle.textContent =
      quoteTestTitle.value;

  }


  renderQuoteBody();


  if (
    quotePreviewSource &&
    quoteTestSource
  ) {

    quotePreviewSource.textContent =
      quoteTestSource.value;

  }


  /* TITLE */

  if (quotePreviewTitle) {

    quotePreviewTitle.hidden =
      !quoteTitleEnabled?.checked;


    quotePreviewTitle.style.color =
      quoteTitleColor?.value ||
      "#222222";


    quotePreviewTitle.style.fontSize =
      `${
        quoteTitleSize?.value ||
        24
      }px`;


    quotePreviewTitle.style.fontWeight =
      quoteTitleWeight?.value ||
      "400";


    quotePreviewTitle.style.textAlign =
      quoteTitleAlign?.value ||
      "left";


    quotePreviewTitle.style.letterSpacing =
      `${
        quoteTitleLetterSpacing?.value ||
        0
      }px`;


    quotePreviewTitle.style.marginBottom =
      `${
        quoteTitleSpacing?.value ||
        0
      }px`;

  }


  /* BODY */

  if (quotePreviewText) {

    quotePreviewText.style.color =
      quoteTextColor?.value ||
      "#333333";


    quotePreviewText.style.fontSize =
      `${
        quoteFontSize?.value ||
        16
      }px`;


    quotePreviewText.style.fontWeight =
      quoteBodyWeight?.value ||
      "500";


    quotePreviewText.style.lineHeight =
      quoteLineHeight?.value ||
      "1.8";


    quotePreviewText.style.letterSpacing =
      `${
        quoteLetterSpacing?.value ||
        0
      }px`;


    quotePreviewText.style.textAlign =
      quoteBodyAlign?.value ||
      "left";


    applyLineBreakMode();


    const paragraphs =
      quotePreviewText.querySelectorAll(
        "p"
      );


    paragraphs.forEach(
      (
        paragraph,
        index
      ) => {

        paragraph.style.marginTop =
          "0";


        paragraph.style.marginBottom =
          index ===
          paragraphs.length - 1
            ? "0"
            : `${
                quoteParagraphSpacing?.value ||
                0
              }px`;


        paragraph.style.textIndent =
          `${
            quoteIndent?.value ||
            0
          }px`;

      }
    );


    applySpecialQuoteStyles();

  }


  /* SOURCE */

  if (quotePreviewSource) {

    quotePreviewSource.hidden =
      !quoteSourceEnabled?.checked;


    quotePreviewSource.style.color =
      quoteSourceColor?.value ||
      "#999999";


    quotePreviewSource.style.fontSize =
      `${
        quoteSourceSize?.value ||
        11
      }px`;


    quotePreviewSource.style.fontWeight =
      quoteSourceWeight?.value ||
      "300";


    quotePreviewSource.style.textAlign =
      quoteSourceAlign?.value ||
      "right";


    quotePreviewSource.style.marginTop =
      `${
        quoteSourceSpacing?.value ||
        0
      }px`;

  }


  applyVerticalAlignment();


  applyQuotePreviewScale();

}


/* =========================================================
   PREVIEW SCALE

   실제 글쓰기 에디터 프리뷰(posts-preview-settings.js의
   applyEditorPreviewScale)와 완전히 같은 방식: 캔버스는
   항상 520px로 레이아웃한 다음, stage가 그보다 좁으면
   JS가 transform: scale()로 통째로 축소한다.

   예전에는 여기 CSS가 width: 100%로 알아서 줄어드는
   방식이라, 좁을 때 글자는 그대로고 줄바꿈만 바뀌었음
   — 그래서 실제 에디터 프리뷰(글자까지 같이 작아짐)랑
   다르게 보였다. 이제 두 프리뷰가 같은 계산을 쓰므로
   같은 stage 너비에서는 항상 같은 결과가 나온다.
========================================================== */

function applyQuotePreviewScale() {

  if (
    !quotePreviewCanvas ||
    !quotePreviewStage
  ) {
    return;
  }


  quotePreviewCanvas.style.transform =
    "none";


  quotePreviewCanvas.style.transformOrigin =
    "top center";


  const naturalWidth =
    520;


  const availableWidth =
    quotePreviewStage.clientWidth;


  const fitScale =
    Math.min(
      1,
      availableWidth /
      naturalWidth
    );


  const naturalHeight =
    quotePreviewCanvas.offsetHeight;


  quotePreviewCanvas.style.transform =
    `scale(${fitScale})`;


  quotePreviewStage.style.height =
    `${
      naturalHeight *
      fitScale
    }px`;

}


window.addEventListener(
  "resize",
  applyQuotePreviewScale
);


/* =========================================================
   RATIO BUTTONS
========================================================== */

quoteRatioButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        currentQuoteRatio =
          button.dataset.ratio;


        quoteRatioButtons.forEach(
          item => {

            item.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );


        if (
          quoteCustomRatioFields
        ) {

          quoteCustomRatioFields.hidden =
            currentQuoteRatio !==
            "custom";

        }


        updateQuotePreview();

      }
    );

  }
);


