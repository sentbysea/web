/* =========================================================
   QUOTE
========================================================== */


/* =========================================================
   ELEMENTS
========================================================== */

/* ACCORDION */

const quoteAccordionSections =
  document.querySelectorAll(
    "[data-quote-section]"
  );

const quoteAccordionToggles =
  document.querySelectorAll(
    ".quote-accordion-toggle"
  );


/* =========================================================
   TEST CONTENT
========================================================== */

const quoteTestTitle =
  document.getElementById(
    "quoteTestTitle"
  );

const quoteTestBody =
  document.getElementById(
    "quoteTestBody"
  );

const quoteTestSource =
  document.getElementById(
    "quoteTestSource"
  );


/* =========================================================
   CANVAS
========================================================== */

const quoteRatioButtons =
  document.querySelectorAll(
    ".quote-ratio-button"
  );

const quoteCustomRatioFields =
  document.getElementById(
    "quoteCustomRatioFields"
  );

const quoteRatioWidth =
  document.getElementById(
    "quoteRatioWidth"
  );

const quoteRatioHeight =
  document.getElementById(
    "quoteRatioHeight"
  );

const quoteWidth =
  document.getElementById(
    "quoteWidth"
  );

const quoteBackground =
  document.getElementById(
    "quoteBackground"
  );

const quotePadding =
  document.getElementById(
    "quotePadding"
  );

const quoteVerticalPadding =
  document.getElementById(
    "quoteVerticalPadding"
  );

const quoteHorizontalPadding =
  document.getElementById(
    "quoteHorizontalPadding"
  );


/* =========================================================
   TITLE
========================================================== */

const quoteTitleEnabled =
  document.getElementById(
    "quoteTitleEnabled"
  );

const quoteTitleColor =
  document.getElementById(
    "quoteTitleColor"
  );

const quoteTitleSize =
  document.getElementById(
    "quoteTitleSize"
  );

const quoteTitleWeight =
  document.getElementById(
    "quoteTitleWeight"
  );

const quoteTitleAlign =
  document.getElementById(
    "quoteTitleAlign"
  );

const quoteTitleLetterSpacing =
  document.getElementById(
    "quoteTitleLetterSpacing"
  );

const quoteTitleSpacing =
  document.getElementById(
    "quoteTitleSpacing"
  );


/* =========================================================
   BODY
========================================================== */

const quoteTextColor =
  document.getElementById(
    "quoteTextColor"
  );


/*
  ★ NEW
  메인 에디터의 PRESET 하이라이트에서 사용할 색
*/

const quoteHighlightColor =
  document.getElementById(
    "quoteHighlightColor"
  );


const quoteFontSize =
  document.getElementById(
    "quoteFontSize"
  );

const quoteBodyWeight =
  document.getElementById(
    "quoteBodyWeight"
  );

const quoteLineHeight =
  document.getElementById(
    "quoteLineHeight"
  );

const quoteLetterSpacing =
  document.getElementById(
    "quoteLetterSpacing"
  );

const quoteParagraphSpacing =
  document.getElementById(
    "quoteParagraphSpacing"
  );

const quoteBodyAlign =
  document.getElementById(
    "quoteBodyAlign"
  );

const quoteVerticalAlign =
  document.getElementById(
    "quoteVerticalAlign"
  );

const quoteLineBreak =
  document.getElementById(
    "quoteLineBreak"
  );

const quoteIndent =
  document.getElementById(
    "quoteIndent"
  );


/* =========================================================
   ACTION / DIALOGUE
========================================================== */

const quoteActionColor =
  document.getElementById(
    "quoteActionColor"
  );

const quoteActionWeight =
  document.getElementById(
    "quoteActionWeight"
  );

const quoteDialogueColor =
  document.getElementById(
    "quoteDialogueColor"
  );

const quoteDialogueWeight =
  document.getElementById(
    "quoteDialogueWeight"
  );


/* =========================================================
   SOURCE
========================================================== */

const quoteSourceEnabled =
  document.getElementById(
    "quoteSourceEnabled"
  );

const quoteSourceColor =
  document.getElementById(
    "quoteSourceColor"
  );

const quoteSourceSize =
  document.getElementById(
    "quoteSourceSize"
  );

const quoteSourceWeight =
  document.getElementById(
    "quoteSourceWeight"
  );

const quoteSourceAlign =
  document.getElementById(
    "quoteSourceAlign"
  );

const quoteSourceSpacing =
  document.getElementById(
    "quoteSourceSpacing"
  );


/* =========================================================
   PREVIEW
========================================================== */

const quotePreviewCanvas =
  document.getElementById(
    "quotePreviewCanvas"
  );

const quotePreviewTitle =
  document.getElementById(
    "quotePreviewTitle"
  );

const quotePreviewText =
  document.getElementById(
    "quotePreviewText"
  );

const quotePreviewSource =
  document.getElementById(
    "quotePreviewSource"
  );

const quotePreviewSize =
  document.getElementById(
    "quotePreviewSize"
  );


/* =========================================================
   PRESET
========================================================== */

const quotePresetName =
  document.getElementById(
    "quotePresetName"
  );

const quoteSaveButton =
  document.getElementById(
    "quoteSaveButton"
  );

const quoteSaveMessage =
  document.getElementById(
    "quoteSaveMessage"
  );

let quotePresetList =
  document.getElementById(
    "quotePresetList"
  );


/* =========================================================
   STATE
========================================================== */

let currentQuoteRatio =
  "1:1";

let currentQuotePresetId =
  null;


/* =========================================================
   MESSAGE
========================================================== */

function showQuoteMessage(
  message,
  autoHide = false
) {

  if (!quoteSaveMessage) {
    return;
  }


  if (
    quoteSaveMessage._messageTimer
  ) {

    clearTimeout(
      quoteSaveMessage._messageTimer
    );

  }


  if (
    quoteSaveMessage._fadeTimer
  ) {

    clearTimeout(
      quoteSaveMessage._fadeTimer
    );

  }


  quoteSaveMessage.style.transition =
    "none";

  quoteSaveMessage.style.opacity =
    "1";

  quoteSaveMessage.textContent =
    message;


  if (!autoHide) {
    return;
  }


  quoteSaveMessage._messageTimer =
    setTimeout(
      () => {

        quoteSaveMessage.style.transition =
          "opacity 0.6s ease";

        quoteSaveMessage.style.opacity =
          "0";


        quoteSaveMessage._fadeTimer =
          setTimeout(
            () => {

              quoteSaveMessage.textContent =
                "";

              quoteSaveMessage.style.transition =
                "none";

              quoteSaveMessage.style.opacity =
                "1";

            },
            600
          );

      },
      2000
    );

}


/* =========================================================
   PRESET LIST AREA
========================================================== */

function ensureQuotePresetList() {

  if (quotePresetList) {
    return;
  }


  const presetSection =
    quotePresetName
      ?.closest(
        ".quote-accordion"
      );


  const presetContent =
    presetSection
      ?.querySelector(
        ".quote-accordion-content"
      );


  if (!presetContent) {
    return;
  }


  const wrap =
    document.createElement(
      "div"
    );

  wrap.className =
    "quote-preset-list-wrap";


  const label =
    document.createElement(
      "div"
    );

  label.className =
    "quote-setting-label";

  label.textContent =
    "SAVED PRESETS";


  quotePresetList =
    document.createElement(
      "div"
    );

  quotePresetList.id =
    "quotePresetList";

  quotePresetList.className =
    "quote-preset-list";


  wrap.append(
    label,
    quotePresetList
  );


  presetContent.appendChild(
    wrap
  );

}


/* =========================================================
   ACCORDION
========================================================== */

function getQuoteAccordionKey(
  section,
  index
) {

  const title =
    section.querySelector(
      ".quote-accordion-title"
    );


  const name =
    title
      ?.textContent
      ?.trim() ||
    `section-${index}`;


  return (
    `quote-accordion-${name}`
  );

}


function saveQuoteAccordionState() {

  quoteAccordionSections.forEach(
    (
      section,
      index
    ) => {

      const key =
        getQuoteAccordionKey(
          section,
          index
        );


      const isOpen =
        section.classList.contains(
          "is-open"
        );


      localStorage.setItem(
        key,
        isOpen
          ? "open"
          : "closed"
      );

    }
  );

}


function restoreQuoteAccordionState() {

  quoteAccordionSections.forEach(
    (
      section,
      index
    ) => {

      const key =
        getQuoteAccordionKey(
          section,
          index
        );


      const saved =
        localStorage.getItem(
          key
        );


      if (saved === null) {
        return;
      }


      const shouldOpen =
        saved === "open";


      const content =
        section.querySelector(
          ".quote-accordion-content"
        );


      const icon =
        section.querySelector(
          ".quote-accordion-icon"
        );


      section.classList.toggle(
        "is-open",
        shouldOpen
      );


      if (content) {

        content.hidden =
          !shouldOpen;

      }


      if (icon) {

        icon.textContent =
          shouldOpen
            ? "−"
            : "+";

      }

    }
  );

}


quoteAccordionToggles.forEach(
  toggle => {

    toggle.addEventListener(
      "click",
      () => {

        const section =
          toggle.closest(
            ".quote-accordion"
          );


        if (!section) {
          return;
        }


        const content =
          section.querySelector(
            ".quote-accordion-content"
          );


        const icon =
          toggle.querySelector(
            ".quote-accordion-icon"
          );


        const isOpen =
          section.classList.contains(
            "is-open"
          );


        const nextOpen =
          !isOpen;


        section.classList.toggle(
          "is-open",
          nextOpen
        );


        if (content) {

          content.hidden =
            !nextOpen;

        }


        if (icon) {

          icon.textContent =
            nextOpen
              ? "−"
              : "+";

        }


        saveQuoteAccordionState();

      }
    );

  }
);


/* =========================================================
   RATIO
========================================================== */

function getQuoteRatio() {

  if (
    currentQuoteRatio ===
    "custom"
  ) {

    return {

      width:
        Number(
          quoteRatioWidth?.value
        ) || 1,

      height:
        Number(
          quoteRatioHeight?.value
        ) || 1

    };

  }


  const [
    width,
    height
  ] =
    currentQuoteRatio
      .split(":")
      .map(Number);


  return {
    width,
    height
  };

}


/* =========================================================
   ACTION / DIALOGUE PARSER
========================================================== */

function renderStyledQuoteText(
  container,
  text
) {

  const pattern =
    /(\*[^*\n]+\*|"[^"\n]+"|“[^”\n]+”)/g;


  let lastIndex =
    0;


  let match;


  while (
    (
      match =
        pattern.exec(
          text
        )
    ) !== null
  ) {

    if (
      match.index >
      lastIndex
    ) {

      container.appendChild(
        document.createTextNode(
          text.slice(
            lastIndex,
            match.index
          )
        )
      );

    }


    const rawText =
      match[0];


    const span =
      document.createElement(
        "span"
      );


    if (
      rawText.startsWith("*")
    ) {

      span.className =
        "quote-action-text";


      span.textContent =
        rawText.slice(
          1,
          -1
        );

    } else {

      span.className =
        "quote-dialogue-text";


      span.textContent =
        rawText;

    }


    container.appendChild(
      span
    );


    lastIndex =
      pattern.lastIndex;

  }


  if (
    lastIndex <
    text.length
  ) {

    container.appendChild(
      document.createTextNode(
        text.slice(
          lastIndex
        )
      )
    );

  }

}


/* =========================================================
   ACTION / DIALOGUE STYLE
========================================================== */

function applySpecialQuoteStyles() {

  if (!quotePreviewText) {
    return;
  }


  quotePreviewText
    .querySelectorAll(
      ".quote-action-text"
    )
    .forEach(
      element => {

        element.style.color =
          quoteActionColor?.value ||
          "#888888";


        element.style.fontWeight =
          quoteActionWeight?.value ||
          "400";

      }
    );


  quotePreviewText
    .querySelectorAll(
      ".quote-dialogue-text"
    )
    .forEach(
      element => {

        element.style.color =
          quoteDialogueColor?.value ||
          "#333333";


        element.style.fontWeight =
          quoteDialogueWeight?.value ||
          "500";

      }
    );

}


/* =========================================================
   BODY RENDER
========================================================== */

function renderQuoteBody() {

  if (
    !quoteTestBody ||
    !quotePreviewText
  ) {
    return;
  }


  const text =
    quoteTestBody.value;


  quotePreviewText.innerHTML =
    "";


  const paragraphs =
    text.split(
      /\n\s*\n/
    );


  paragraphs.forEach(
    paragraphText => {

      const paragraph =
        document.createElement(
          "p"
        );


      paragraph.style.whiteSpace =
        "pre-wrap";


      renderStyledQuoteText(
        paragraph,
        paragraphText
      );


      quotePreviewText.appendChild(
        paragraph
      );

    }
  );


  applySpecialQuoteStyles();

}


/* =========================================================
   LINE BREAK
========================================================== */

function applyLineBreakMode() {

  if (!quotePreviewText) {
    return;
  }


  const mode =
    quoteLineBreak?.value ||
    "keep";


  if (mode === "char") {

    quotePreviewText.style.wordBreak =
      "break-all";


    quotePreviewText.style.overflowWrap =
      "anywhere";

  }


  else if (
    mode === "word"
  ) {

    quotePreviewText.style.wordBreak =
      "normal";


    quotePreviewText.style.overflowWrap =
      "break-word";

  }


  else {

    quotePreviewText.style.wordBreak =
      "keep-all";


    quotePreviewText.style.overflowWrap =
      "break-word";

  }

}


/* =========================================================
   VERTICAL ALIGN
========================================================== */

function applyVerticalAlignment() {

  if (!quotePreviewCanvas) {
    return;
  }


  const align =
    quoteVerticalAlign?.value ||
    "top";


  if (align === "center") {

    quotePreviewCanvas.style.justifyContent =
      "center";

  }


  else if (
    align === "bottom"
  ) {

    quotePreviewCanvas.style.justifyContent =
      "flex-end";

  }


  else {

    quotePreviewCanvas.style.justifyContent =
      "flex-start";

  }

}


/* =========================================================
   CANVAS PADDING
========================================================== */

function applyCanvasPadding() {

  if (!quotePreviewCanvas) {
    return;
  }


  const base =
    Math.max(
      0,
      Number(
        quotePadding?.value
      ) || 0
    );


  const vertical =
    Math.max(
      0,
      Number(
        quoteVerticalPadding?.value
      ) || 0
    );


  const horizontal =
    Math.max(
      0,
      Number(
        quoteHorizontalPadding?.value
      ) || 0
    );


  quotePreviewCanvas.style.padding =
    `${base + vertical}px ${base + horizontal}px`;

}


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

}


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


/* =========================================================
   LIVE INPUTS
========================================================== */

const quoteLiveInputs = [

  quoteTestTitle,
  quoteTestBody,
  quoteTestSource,

  quoteRatioWidth,
  quoteRatioHeight,
  quoteWidth,
  quoteBackground,
  quotePadding,
  quoteVerticalPadding,
  quoteHorizontalPadding,

  quoteTitleEnabled,
  quoteTitleColor,
  quoteTitleSize,
  quoteTitleWeight,
  quoteTitleAlign,
  quoteTitleLetterSpacing,
  quoteTitleSpacing,

  quoteTextColor,

  /*
    ★ NEW
  */
  quoteHighlightColor,

  quoteFontSize,
  quoteBodyWeight,
  quoteLineHeight,
  quoteLetterSpacing,
  quoteParagraphSpacing,
  quoteBodyAlign,
  quoteVerticalAlign,
  quoteLineBreak,
  quoteIndent,

  quoteActionColor,
  quoteActionWeight,

  quoteDialogueColor,
  quoteDialogueWeight,

  quoteSourceEnabled,
  quoteSourceColor,
  quoteSourceSize,
  quoteSourceWeight,
  quoteSourceAlign,
  quoteSourceSpacing

];


quoteLiveInputs.forEach(
  input => {

    if (!input) {
      return;
    }


    input.addEventListener(
      "input",
      updateQuotePreview
    );


    input.addEventListener(
      "change",
      updateQuotePreview
    );

  }
);


/* =========================================================
   COLLECT PRESET SETTINGS
========================================================== */

function collectQuoteSettings() {

  return {

    /* CANVAS */

    ratio:
      currentQuoteRatio,

    ratioWidth:
      Number(
        quoteRatioWidth?.value
      ) || 4,

    ratioHeight:
      Number(
        quoteRatioHeight?.value
      ) || 5,

    exportWidth:
      Number(
        quoteWidth?.value
      ) || 1080,

    background:
      quoteBackground?.value ||
      "#ffffff",

    padding:
      Number(
        quotePadding?.value
      ) || 0,

    verticalPadding:
      Number(
        quoteVerticalPadding?.value
      ) || 0,

    horizontalPadding:
      Number(
        quoteHorizontalPadding?.value
      ) || 0,


    /* TITLE */

    titleEnabled:
      quoteTitleEnabled?.checked ??
      true,

    titleColor:
      quoteTitleColor?.value ||
      "#222222",

    titleSize:
      Number(
        quoteTitleSize?.value
      ) || 24,

    titleWeight:
      quoteTitleWeight?.value ||
      "400",

    titleAlign:
      quoteTitleAlign?.value ||
      "left",

    titleLetterSpacing:
      Number(
        quoteTitleLetterSpacing?.value
      ) || 0,

    titleSpacing:
      Number(
        quoteTitleSpacing?.value
      ) || 0,


    /* BODY */

    bodyColor:
      quoteTextColor?.value ||
      "#333333",


    /*
      ★ NEW
      메인 글 에디터의 PRESET HIGHLIGHT가
      이 값을 사용하게 된다.
    */

    highlightColor:
      quoteHighlightColor?.value ||
      "#f4dce6",


    bodySize:
      Number(
        quoteFontSize?.value
      ) || 16,

    bodyWeight:
      quoteBodyWeight?.value ||
      "500",

    lineHeight:
      Number(
        quoteLineHeight?.value
      ) || 1.8,

    letterSpacing:
      Number(
        quoteLetterSpacing?.value
      ) || 0,

    paragraphSpacing:
      Number(
        quoteParagraphSpacing?.value
      ) || 0,

    bodyAlign:
      quoteBodyAlign?.value ||
      "left",

    verticalAlign:
      quoteVerticalAlign?.value ||
      "top",

    lineBreak:
      quoteLineBreak?.value ||
      "keep",

    indent:
      Number(
        quoteIndent?.value
      ) || 0,


    /* ACTION */

    actionColor:
      quoteActionColor?.value ||
      "#888888",

    actionWeight:
      quoteActionWeight?.value ||
      "400",


    /* DIALOGUE */

    dialogueColor:
      quoteDialogueColor?.value ||
      "#333333",

    dialogueWeight:
      quoteDialogueWeight?.value ||
      "500",


    /* SOURCE */

    sourceText:
      quoteTestSource?.value ||
      "",

    sourceEnabled:
      quoteSourceEnabled?.checked ??
      true,

    sourceColor:
      quoteSourceColor?.value ||
      "#999999",

    sourceSize:
      Number(
        quoteSourceSize?.value
      ) || 11,

    sourceWeight:
      quoteSourceWeight?.value ||
      "300",

    sourceAlign:
      quoteSourceAlign?.value ||
      "right",

    sourceSpacing:
      Number(
        quoteSourceSpacing?.value
      ) || 0

  };

}


/* =========================================================
   APPLY PRESET SETTINGS
========================================================== */

function applyQuoteSettings(
  settings
) {

  /* CANVAS */

  currentQuoteRatio =
    settings.ratio ||
    "1:1";


  quoteRatioButtons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.ratio ===
        currentQuoteRatio
      );

    }
  );


  if (
    quoteCustomRatioFields
  ) {

    quoteCustomRatioFields.hidden =
      currentQuoteRatio !==
      "custom";

  }


  if (quoteRatioWidth) {

    quoteRatioWidth.value =
      settings.ratioWidth ??
      4;

  }


  if (quoteRatioHeight) {

    quoteRatioHeight.value =
      settings.ratioHeight ??
      5;

  }


  if (quoteWidth) {

    quoteWidth.value =
      settings.exportWidth ??
      1080;

  }


  if (quoteBackground) {

    quoteBackground.value =
      settings.background ||
      "#ffffff";

  }


  if (quotePadding) {

    quotePadding.value =
      settings.padding ??
      48;

  }


  if (quoteVerticalPadding) {

    quoteVerticalPadding.value =
      settings.verticalPadding ??
      0;

  }


  if (quoteHorizontalPadding) {

    quoteHorizontalPadding.value =
      settings.horizontalPadding ??
      0;

  }


  /* TITLE */

  if (quoteTitleEnabled) {

    quoteTitleEnabled.checked =
      settings.titleEnabled ??
      true;

  }


  if (quoteTitleColor) {

    quoteTitleColor.value =
      settings.titleColor ||
      "#222222";

  }


  if (quoteTitleSize) {

    quoteTitleSize.value =
      settings.titleSize ??
      24;

  }


  if (quoteTitleWeight) {

    quoteTitleWeight.value =
      settings.titleWeight ||
      "400";

  }


  if (quoteTitleAlign) {

    quoteTitleAlign.value =
      settings.titleAlign ||
      "left";

  }


  if (quoteTitleLetterSpacing) {

    quoteTitleLetterSpacing.value =
      settings.titleLetterSpacing ??
      0;

  }


  if (quoteTitleSpacing) {

    quoteTitleSpacing.value =
      settings.titleSpacing ??
      28;

  }


  /* BODY */

  if (quoteTextColor) {

    quoteTextColor.value =
      settings.bodyColor ||
      "#333333";

  }


  /*
    ★ NEW

    예전에 저장한 Vibe 프리셋에는
    highlightColor가 없을 수 있으므로
    기본값 #f4dce6 사용.
  */

  if (quoteHighlightColor) {

    quoteHighlightColor.value =
      settings.highlightColor ||
      "#f4dce6";

  }


  if (quoteFontSize) {

    quoteFontSize.value =
      settings.bodySize ??
      16;

  }


  if (quoteBodyWeight) {

    quoteBodyWeight.value =
      settings.bodyWeight ||
      "500";

  }


  if (quoteLineHeight) {

    quoteLineHeight.value =
      settings.lineHeight ??
      1.8;

  }


  if (quoteLetterSpacing) {

    quoteLetterSpacing.value =
      settings.letterSpacing ??
      0;

  }


  if (quoteParagraphSpacing) {

    quoteParagraphSpacing.value =
      settings.paragraphSpacing ??
      14;

  }


  if (quoteBodyAlign) {

    quoteBodyAlign.value =
      settings.bodyAlign ||
      "left";

  }


  if (quoteVerticalAlign) {

    quoteVerticalAlign.value =
      settings.verticalAlign ||
      "top";

  }


  if (quoteLineBreak) {

    quoteLineBreak.value =
      settings.lineBreak ||
      "keep";

  }


  if (quoteIndent) {

    quoteIndent.value =
      settings.indent ??
      0;

  }


  /* ACTION */

  if (quoteActionColor) {

    quoteActionColor.value =
      settings.actionColor ||
      "#888888";

  }


  if (quoteActionWeight) {

    quoteActionWeight.value =
      settings.actionWeight ||
      "400";

  }


  /* DIALOGUE */

  if (quoteDialogueColor) {

    quoteDialogueColor.value =
      settings.dialogueColor ||
      "#333333";

  }


  if (quoteDialogueWeight) {

    quoteDialogueWeight.value =
      settings.dialogueWeight ||
      "500";

  }


  /* SOURCE */

  if (quoteTestSource) {

    quoteTestSource.value =
      settings.sourceText ??
      "@hongcha";

  }


  if (quoteSourceEnabled) {

    quoteSourceEnabled.checked =
      settings.sourceEnabled ??
      true;

  }


  if (quoteSourceColor) {

    quoteSourceColor.value =
      settings.sourceColor ||
      "#999999";

  }


  if (quoteSourceSize) {

    quoteSourceSize.value =
      settings.sourceSize ??
      11;

  }


  if (quoteSourceWeight) {

    quoteSourceWeight.value =
      settings.sourceWeight ||
      "300";

  }


  if (quoteSourceAlign) {

    quoteSourceAlign.value =
      settings.sourceAlign ||
      "right";

  }


  if (quoteSourceSpacing) {

    quoteSourceSpacing.value =
      settings.sourceSpacing ??
      28;

  }


  updateQuotePreview();

}


/* =========================================================
   RENDER PRESETS
========================================================== */

function renderQuotePresets(
  presets
) {

  ensureQuotePresetList();


  if (!quotePresetList) {
    return;
  }


  quotePresetList.innerHTML =
    "";


  if (
    presets.length === 0
  ) {

    const empty =
      document.createElement(
        "p"
      );


    empty.className =
      "quote-preset-empty";


    empty.textContent =
      "saved preset 없음";


    quotePresetList.appendChild(
      empty
    );


    return;

  }


  presets.forEach(
    preset => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "quote-preset-item";


      if (
        preset.id ===
        currentQuotePresetId
      ) {

        item.classList.add(
          "active"
        );

      }


      if (
        preset.is_active
      ) {

        item.classList.add(
          "is-live"
        );

      }


      /* ACTIVATE (실제 프리뷰/게시글에 반영될 프리셋으로 지정) */

      const activateButton =
        document.createElement(
          "button"
        );


      activateButton.type =
        "button";


      activateButton.className =
        "quote-preset-activate";


      activateButton.disabled =
        Boolean(
          preset.is_active
        );


      activateButton.textContent =
        preset.is_active
          ? "사용 중"
          : "사용 중으로 설정";


      activateButton.addEventListener(
        "click",
        async () => {

          await activateQuotePreset(
            preset.id
          );

        }
      );


      /* LOAD */

      const loadButton =
        document.createElement(
          "button"
        );


      loadButton.type =
        "button";


      loadButton.className =
        "quote-preset-load";


      loadButton.textContent =
        preset.name;


      loadButton.addEventListener(
        "click",
        () => {

          currentQuotePresetId =
            preset.id;


          if (quotePresetName) {

            quotePresetName.value =
              preset.name;

          }


          applyQuoteSettings(
            preset.settings ||
            {}
          );


          showQuoteMessage(
            "preset loaded ♡",
            true
          );


          renderQuotePresets(
            presets
          );

        }
      );


      /* DELETE */

      const deleteButton =
        document.createElement(
          "button"
        );


      deleteButton.type =
        "button";


      deleteButton.className =
        "quote-preset-delete";


      deleteButton.textContent =
        "×";


      deleteButton.addEventListener(
        "click",
        async () => {

          await deleteQuotePreset(
            preset.id
          );

        }
      );


      item.append(
        activateButton,
        loadButton,
        deleteButton
      );


      quotePresetList.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   LOAD PRESETS
========================================================== */

async function loadQuotePresets() {

  ensureQuotePresetList();


  if (!quotePresetList) {
    return;
  }


  const {
    data: userData,
    error: userError
  } =
    await supabaseClient
      .auth
      .getUser();


  if (
    userError ||
    !userData.user
  ) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .select(
        "id, name, settings, updated_at, is_active"
      )
      .eq(
        "user_id",
        userData.user.id
      )
      .order(
        "updated_at",
        {
          ascending:
            false
        }
      );


  if (error) {

    console.error(
      "quote preset load error:",
      error
    );


    return;

  }


  renderQuotePresets(
    data || []
  );

}


/* =========================================================
   SAVE PRESET
========================================================== */

async function saveQuotePreset() {

  const presetName =
    quotePresetName
      ?.value
      .trim() ||
    "";


  if (!presetName) {

    showQuoteMessage(
      "프리셋 이름을 입력해주세요."
    );


    return;

  }


  const {
    data: userData,
    error: userError
  } =
    await supabaseClient
      .auth
      .getUser();


  if (
    userError ||
    !userData.user
  ) {

    showQuoteMessage(
      "로그인이 필요합니다."
    );


    return;

  }


  const user =
    userData.user;


  const settings =
    collectQuoteSettings();


  if (quoteSaveButton) {

    quoteSaveButton.disabled =
      true;

  }


  showQuoteMessage(
    "저장 중..."
  );


  /* UPDATE */

  if (
    currentQuotePresetId
  ) {

    const {
      error
    } =
      await supabaseClient
        .from(
          "quote_presets"
        )
        .update({

          name:
            presetName,

          settings:
            settings,

          updated_at:
            new Date()
              .toISOString()

        })
        .eq(
          "id",
          currentQuotePresetId
        )
        .eq(
          "user_id",
          user.id
        );


    if (error) {

      console.error(
        "quote preset update error:",
        error
      );


      showQuoteMessage(
        "저장에 실패했습니다."
      );


      quoteSaveButton.disabled =
        false;


      return;

    }

  }


  /* INSERT */

  else {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "quote_presets"
        )
        .insert({

          user_id:
            user.id,

          name:
            presetName,

          settings:
            settings,

          updated_at:
            new Date()
              .toISOString()

        })
        .select(
          "id"
        )
        .single();


    if (error) {

      console.error(
        "quote preset insert error:",
        error
      );


      showQuoteMessage(
        "저장에 실패했습니다."
      );


      quoteSaveButton.disabled =
        false;


      return;

    }


    currentQuotePresetId =
      data.id;

  }


  quoteSaveButton.disabled =
    false;


  showQuoteMessage(
    "saved ♡",
    true
  );


  await loadQuotePresets();

}


/* =========================================================
   DELETE PRESET
========================================================== */

async function deleteQuotePreset(
  presetId
) {

  const {
    data: userData,
    error: userError
  } =
    await supabaseClient
      .auth
      .getUser();


  if (
    userError ||
    !userData.user
  ) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .delete()
      .eq(
        "id",
        presetId
      )
      .eq(
        "user_id",
        userData.user.id
      );


  if (error) {

    console.error(
      "quote preset delete error:",
      error
    );


    showQuoteMessage(
      "삭제에 실패했습니다."
    );


    return;

  }


  if (
    currentQuotePresetId ===
    presetId
  ) {

    currentQuotePresetId =
      null;


    if (quotePresetName) {

      quotePresetName.value =
        "";

    }

  }


  showQuoteMessage(
    "deleted ♡",
    true
  );


  await loadQuotePresets();

}


/* =========================================================
   ACTIVATE PRESET

   "사용 중"으로 지정한 프리셋이 실제 발행된 글
   (posts-style.js의 loadPostStylePreset)에도 그대로 적용됨.
   한 유저당 하나만 사용 중일 수 있으므로, 지정한 것만 켜고
   나머지는 전부 끈다.
========================================================== */

async function activateQuotePreset(
  presetId
) {

  const {
    data: userData,
    error: userError
  } =
    await supabaseClient
      .auth
      .getUser();


  if (
    userError ||
    !userData.user
  ) {
    return;
  }


  const {
    error: clearError
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .update(
        {
          is_active: false
        }
      )
      .eq(
        "user_id",
        userData.user.id
      );


  if (clearError) {

    console.error(
      "quote preset activate(clear) error:",
      clearError
    );


    showQuoteMessage(
      "적용에 실패했습니다."
    );


    return;

  }


  const {
    error: setError
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .update(
        {
          is_active: true
        }
      )
      .eq(
        "id",
        presetId
      )
      .eq(
        "user_id",
        userData.user.id
      );


  if (setError) {

    console.error(
      "quote preset activate(set) error:",
      setError
    );


    showQuoteMessage(
      "적용에 실패했습니다."
    );


    return;

  }


  showQuoteMessage(
    "이 프리셋이 실제 글에도 적용됩니다 ♡",
    true
  );


  await loadQuotePresets();

}


/* =========================================================
   SAVE EVENT
========================================================== */

quoteSaveButton
  ?.addEventListener(
    "click",
    saveQuotePreset
  );


/* =========================================================
   QUOTE OPEN
========================================================== */

const openQuoteButtonForPresets =
  document.getElementById(
    "openQuoteButton"
  );


openQuoteButtonForPresets
  ?.addEventListener(
    "click",
    () => {

      setTimeout(
        loadQuotePresets,
        0
      );

    }
  );


/* =========================================================
   AUTH
========================================================== */

supabaseClient
  .auth
  .onAuthStateChange(
    (
      event,
      session
    ) => {

      if (
        session &&
        session.user
      ) {

        loadQuotePresets();

      }

    }
  );


/* =========================================================
   START
========================================================== */

ensureQuotePresetList();

restoreQuoteAccordionState();

updateQuotePreview();


window.addEventListener(
  "load",
  loadQuotePresets
);