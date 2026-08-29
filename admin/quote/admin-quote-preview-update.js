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
   PREVIEW SCALE / ZOOM

   화면 표시 전용 축소·확대. 실제 export width/height
   계산(exportWidth 등, 위 updateQuotePreview 참고)과는
   완전히 분리되어 있고 서로 참조하지 않는다 — 여기서 하는
   일은 캔버스에 transform: scale()을 거는 것뿐, export
   시점의 실제 픽셀 크기에는 전혀 영향을 주지 않는다.

   캔버스는 항상 520px 고정폭으로 레이아웃한다(실제 글쓰기
   에디터 프리뷰인 posts-preview-settings.js의
   applyEditorPreviewScale과 동일한 방식 — 좁을 때 줄바꿈만
   바뀌는 게 아니라 글자 자체가 같이 작아져야 실제 에디터
   프리뷰와 결과가 일치해 보인다).

   FIT 모드: stage(프리뷰가 담기는 상자)의 width/height를
   모두 고려해서 캔버스 전체가 항상 안에 들어오도록
   자동으로 배율을 계산한다(=object-fit: contain과 동일한
   개념). 예전에는 width만 기준으로 삼고 stage 높이는 JS가
   캔버스 크기에 맞춰 매번 늘려줬는데, 9:16처럼 세로로 긴
   비율이나 본문이 긴 AUTO에서는 stage가 뷰포트보다 훨씬
   커져서 "캔버스 전체가 안 보이고 잘린 것처럼" 느껴지는
   문제가 있었다. 이제 stage 크기는 CSS(clamp/dvh)가 정하고,
   JS는 그 안에 맞춰 축소만 한다.

   MANUAL 모드: 사용자가 [-]/[+]로 직접 배율을 바꾼 상태.
   FIT 배율과 무관하게 10%~200% 범위에서 유지되고, FIT 버튼을
   눌러야 다시 자동 계산으로 돌아간다.
========================================================== */

const QUOTE_PREVIEW_NATURAL_WIDTH =
  520;

const QUOTE_PREVIEW_MIN_ZOOM =
  0.1;

const QUOTE_PREVIEW_MAX_ZOOM =
  2;

const QUOTE_PREVIEW_ZOOM_STEP =
  0.1;


let quotePreviewZoomMode =
  "fit";

let quotePreviewFitScale =
  1;

let quotePreviewManualScale =
  1;


function calculateQuotePreviewFitScale() {

  if (
    !quotePreviewCanvas ||
    !quotePreviewStage
  ) {
    return 1;
  }


  const availableWidth =
    quotePreviewStage.clientWidth;

  const availableHeight =
    quotePreviewStage.clientHeight;


  /*
    ★ 캔버스에 aspect-ratio가 걸린 고정 비율(1:1/4:5/9:16/custom)일
    때는 offsetHeight를 재는 대신 비율값으로 직접 계산한다.
    .quote-preview-canvas에는 aspect-ratio 0.15s ease 트랜지션이
    걸려 있어서, 비율 버튼을 누른 "바로 그 틱"에 offsetHeight를
    재면 아직 전환 전(직전 비율)의 높이가 잡힐 때가 있다 —
    ratio.width/height는 트랜지션과 무관한 값이라 항상 정확하다.
    콘텐츠 높이로 정해지는 AUTO만 실제 렌더 높이를 그대로 잰다.
  */

  const ratio =
    typeof getQuoteRatio ===
      "function"
      ? getQuoteRatio()
      : null;


  const naturalHeight =
    ratio &&
    !ratio.auto &&
    ratio.width > 0
      ? QUOTE_PREVIEW_NATURAL_WIDTH *
        ratio.height /
        ratio.width
      : quotePreviewCanvas.offsetHeight;


  const widthScale =
    availableWidth /
    QUOTE_PREVIEW_NATURAL_WIDTH;

  const heightScale =
    availableHeight > 0 &&
    naturalHeight > 0
      ? availableHeight / naturalHeight
      : widthScale;


  /*
    실제 에디터 프리뷰와 마찬가지로 자동 fit은 100%를
    넘지 않는다(= 화면 표시가 실제 픽셀보다 커 보이지
    않게). 100% 초과로 보고 싶으면 수동 +버튼을 쓴다.
  */

  return Math.min(
    widthScale,
    heightScale,
    1
  );

}


function getCurrentQuotePreviewScale() {

  return quotePreviewZoomMode ===
    "manual"
    ? quotePreviewManualScale
    : quotePreviewFitScale;

}


function updateQuotePreviewZoomUI() {

  if (quotePreviewZoomValue) {

    quotePreviewZoomValue.textContent =
      `${
        Math.round(
          getCurrentQuotePreviewScale() *
          100
        )
      }%`;

  }


  if (quotePreviewZoomFit) {

    quotePreviewZoomFit.classList.toggle(
      "active",
      quotePreviewZoomMode ===
        "fit"
    );

  }

}


function applyQuotePreviewScale() {

  if (
    !quotePreviewCanvas ||
    !quotePreviewStage
  ) {
    return;
  }


  /*
    transform은 레이아웃 크기(offsetHeight 등)에 영향을 주지
    않지만, 만에 하나 이전 프레임 값이 측정에 섞이는 걸
    막기 위해 매번 초기화하고 다시 잰다.
  */

  quotePreviewCanvas.style.transform =
    "none";


  quotePreviewCanvas.style.transformOrigin =
    "center center";


  quotePreviewFitScale =
    calculateQuotePreviewFitScale();


  const scale =
    getCurrentQuotePreviewScale();


  quotePreviewCanvas.style.transform =
    `scale(${scale})`;


  updateQuotePreviewZoomUI();

}


function setQuotePreviewZoom(
  scale
) {

  quotePreviewZoomMode =
    "manual";

  quotePreviewManualScale =
    Math.min(
      QUOTE_PREVIEW_MAX_ZOOM,
      Math.max(
        QUOTE_PREVIEW_MIN_ZOOM,
        scale
      )
    );


  applyQuotePreviewScale();

}


function fitQuotePreview() {

  quotePreviewZoomMode =
    "fit";


  applyQuotePreviewScale();

}


quotePreviewZoomOut
  ?.addEventListener(
    "click",
    () => {

      setQuotePreviewZoom(
        getCurrentQuotePreviewScale() -
        QUOTE_PREVIEW_ZOOM_STEP
      );

    }
  );


quotePreviewZoomIn
  ?.addEventListener(
    "click",
    () => {

      setQuotePreviewZoom(
        getCurrentQuotePreviewScale() +
        QUOTE_PREVIEW_ZOOM_STEP
      );

    }
  );


quotePreviewZoomFit
  ?.addEventListener(
    "click",
    fitQuotePreview
  );


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


