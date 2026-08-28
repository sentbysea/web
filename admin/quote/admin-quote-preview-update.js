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


  /*
    ★ AUTO는 exportWidth 아래 크기 표시를 나중에(내용을 다
    그린 뒤 실제 높이를 재서) 채운다 — updateQuotePreview()
    맨 끝 참고.
  */

  if (
    quotePreviewSize &&
    !ratio.auto
  ) {

    const exportHeight =
      Math.round(
        exportWidth *
        ratio.height /
        ratio.width
      );


    quotePreviewSize.textContent =
      `${exportWidth} × ${exportHeight}`;

  }


  quotePreviewCanvas.style.aspectRatio =
    ratio.auto
      ? "auto"
      : `${ratio.width} / ${ratio.height}`;


  quotePreviewCanvas.style.backgroundColor =
    quoteBackground?.value ||
    "#ffffff";


  applyCanvasPadding();


  /*
    ★ GENERAL
    title/body/source가 항상 같은 폰트를 쓰도록 여기서
    한 번만 계산해서 세 곳(아래)에 그대로 재사용한다.
    예전엔 body만 이 값을 따르고 title/source는
    Pretendard로 고정돼 있었음.
  */

  const quoteFontFamily =
    quoteBodyFont?.value ===
    "nanummyeongjo"
      ? '"Nanum Myeongjo", serif'
      : '"Pretendard", sans-serif';


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


    /*
      제목도 GENERAL의 폰트를 그대로 따름. 인라인으로
      직접 박아두는 이유: html2canvas로 캡처(발췌 export)할
      때 상속만 되어 있으면 가끔 못 읽어서 시스템 명조체로
      깨져 나오는 문제가 있었음.
    */

    quotePreviewTitle.style.fontFamily =
      quoteFontFamily;


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

    quotePreviewText.style.fontFamily =
      quoteFontFamily;


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


    quotePreviewSource.style.fontFamily =
      quoteFontFamily;


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


    /*
      "fixed": 본문이 짧아도 캔버스 맨 아래에 고정 — flex-column인
      캔버스에서 마지막 자식에 marginTop:auto를 주면 남는
      공간을 전부 흡수해서 바닥에 붙고, 캔버스 padding은
      그대로 지켜진다. (실제 글쓰기 에디터의 export는
      html2canvas가 이 방식을 제대로 못 그려서 스페이서
      elemenet 방식으로 따로 구현했지만 — posts-preview.js
      참고 — 관리자 패널은 export를 직접 하지 않는 순수
      미리보기라 원래 방식 그대로 둬도 문제없음.)
    */

    quotePreviewSource.style.marginTop =
      quoteSourcePosition?.value ===
      "fixed" &&
      !ratio.auto
        ? "auto"
        : `${
            quoteSourceSpacing?.value ||
            0
          }px`;

  }


  /*
    AUTO는 박스 높이가 콘텐츠 높이와 항상 같아서 center
    지정 자체는 시각적으로 의미 없지만, 요구사항대로
    명시적으로 center로 둔다(quoteVerticalAlign 드롭다운
    값 자체는 건드리지 않음).
  */

  if (ratio.auto) {

    quotePreviewCanvas.style.justifyContent =
      "center";

  } else {

    applyVerticalAlignment();

  }


  /*
    AUTO의 크기 표시는 여기서 — 캔버스는 항상 520px 폭으로
    레이아웃되므로, 실제 렌더링된 높이(offsetHeight)를
    exportWidth 비율만큼 환산하면 실제 내보내기 픽셀 높이가
    된다.
  */

  if (
    quotePreviewSize &&
    ratio.auto
  ) {

    const naturalHeight =
      quotePreviewCanvas.offsetHeight;


    const exportHeight =
      Math.round(
        naturalHeight *
        (exportWidth / 520)
      );


    quotePreviewSize.textContent =
      `${exportWidth} × ${exportHeight}`;

  }


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


