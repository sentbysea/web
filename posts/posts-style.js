/* =========================================================
   POSTS - STYLE / RENDER

   posts.js에서 분리됨.

   postStyleSettings, postDetailContent는 posts.js에 있음
   (같은 페이지에서 함께 로드되어야 함).
   getPostContentAsSafeHTML은 posts-sanitize.js에 있음.
========================================================== */

/* =========================================================
   VIBE PRESET
========================================================== */

async function loadPostStylePreset() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .select(
        "settings"
      )
      .eq(
        "name",
        "Vibe"
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Vibe 프리셋 불러오기 실패:",
      error
    );

    return null;

  }


  postStyleSettings =
    data?.settings ||
    {};


  updatePresetHighlightSwatch();


  return postStyleSettings;

}



/* =========================================================
   PRESET 드롭다운 (세션 한정 서식 바꿔끼우기)

   내가 admin에서 저장해둔 QUOTE 프리셋 중 아무거나 골라서
   프리뷰/export 서식만 바꾸고, 본문 내용은 건드리지 않음.
   DB에 선택을 저장하진 않음(글마다 다시 열면 기본 Vibe로 시작).
========================================================== */

let postPresetOptions =
  [];


async function loadPostPresetOptions() {

  const user =
    await getSignedInUser();


  if (!user) {
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
        "id, name, settings"
      )
      .eq(
        "user_id",
        user.id
      )
      .order(
        "name",
        {
          ascending:
            true
        }
      );


  if (error) {

    console.error(
      "preset 목록 불러오기 실패:",
      error
    );

    return;

  }


  postPresetOptions =
    data ||
    [];


  renderPostPresetSelect();

}


function renderPostPresetSelect() {

  if (
    !postEditorPresetSelect
  ) {
    return;
  }


  postEditorPresetSelect.innerHTML =
    "";


  postPresetOptions.forEach(
    preset => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        preset.id;


      option.textContent =
        preset.name;


      postEditorPresetSelect.appendChild(
        option
      );

    }
  );


  /*
    현재 postStyleSettings의 출처(기본 Vibe)와
    이름이 같은 옵션을 기본 선택 상태로 맞춰줌.
  */

  const activePreset =
    postPresetOptions.find(
      preset =>
        preset.name ===
        "Vibe"
    );


  if (activePreset) {

    postEditorPresetSelect.value =
      String(
        activePreset.id
      );

  }

}


function applyPostPresetById(
  presetId
) {

  const preset =
    postPresetOptions.find(
      item =>
        String(item.id) ===
        String(presetId)
    );


  if (!preset) {
    return;
  }


  postStyleSettings =
    preset.settings ||
    {};


  updatePresetHighlightSwatch();


  updateEditorPreview();

}



/* =========================================================
   HIGHLIGHT
========================================================== */

function getPresetHighlightColor() {

  const color =
    postStyleSettings
      ?.highlightColor;


  if (
    /^#[0-9a-fA-F]{6}$/.test(
      color || ""
    )
  ) {

    return color;

  }


  return "#f4dce6";

}


function getSafeHighlightColor(
  color
) {

  if (
    /^#[0-9a-fA-F]{6}$/.test(
      color || ""
    )
  ) {

    return color;

  }


  return getPresetHighlightColor();

}


function updatePresetHighlightSwatch() {

  if (
    postEditorPresetSwatch
  ) {

    postEditorPresetSwatch.style.background =
      getPresetHighlightColor();

  }


  updateCustomHighlightSwatch();

}


function updateCustomHighlightSwatch() {

  if (
    !postEditorCustomSwatch ||
    !postEditorCustomColor
  ) {
    return;
  }


  postEditorCustomSwatch.style.background =
    getSafeHighlightColor(
      postEditorCustomColor.value
    );

}



/* =========================================================
   ACTION / DIALOGUE
========================================================== */

function replaceActionDialogueTextNode(
  textNode,
  settings = {}
) {

  const text =
    textNode.nodeValue ||
    "";


  const pattern =
    /(\*[^*\n]+\*|"[^"\n]+"|“[^”\n]+”)/g;


  if (
    !pattern.test(
      text
    )
  ) {

    return;

  }


  pattern.lastIndex =
    0;


  const fragment =
    document.createDocumentFragment();


  let lastIndex =
    0;

  let match;


  while (
    (
      match =
        pattern.exec(
          text
        )
    )
  ) {

    if (
      match.index >
      lastIndex
    ) {

      fragment.appendChild(
        document.createTextNode(
          text.slice(
            lastIndex,
            match.index
          )
        )
      );

    }


    const value =
      match[0];


    const span =
      document.createElement(
        "span"
      );


    if (
      value.startsWith("*") &&
      value.endsWith("*")
    ) {

      span.className =
        "post-action";


      span.textContent =
        value.slice(
          1,
          -1
        );


      span.style.color =
        settings.actionColor ||
        "#888888";


      span.style.fontWeight =
        settings.actionWeight ||
        "400";

    }


    else {

      span.className =
        "post-dialogue";


      span.textContent =
        value;


      span.style.color =
        settings.dialogueColor ||
        settings.bodyColor ||
        "#555555";


      span.style.fontWeight =
        settings.dialogueWeight ||
        settings.bodyWeight ||
        "400";

    }


    fragment.appendChild(
      span
    );


    lastIndex =
      pattern.lastIndex;

  }


  if (
    lastIndex <
    text.length
  ) {

    fragment.appendChild(
      document.createTextNode(
        text.slice(
          lastIndex
        )
      )
    );

  }


  textNode.replaceWith(
    fragment
  );

}


function applyActionDialogueStyles(
  container,
  settings = {}
) {

  if (!container) {
    return;
  }


  /*
    =========================================
    1. 여러 inline 요소에 걸친 ACTION 처리
       예:
       *텍스트 <span>하이라이트</span> 텍스트*
    =========================================
  */

  function getFirstTextNode(
    node
  ) {

    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {

      return node;

    }


    for (
      const child of
      node.childNodes
    ) {

      const found =
        getFirstTextNode(
          child
        );


      if (found) {
        return found;
      }

    }


    return null;

  }


  function getLastTextNode(
    node
  ) {

    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {

      return node;

    }


    for (
      let index =
        node.childNodes.length - 1;

      index >= 0;

      index -= 1
    ) {

      const found =
        getLastTextNode(
          node.childNodes[index]
        );


      if (found) {
        return found;
      }

    }


    return null;

  }


  function wrapActionNodes(
    nodes
  ) {

    if (
      !nodes ||
      nodes.length === 0
    ) {
      return;
    }


    const text =
      nodes
        .map(
          node =>
            node.textContent || ""
        )
        .join("");


    const trimmed =
      text.trim();


    /*
      줄 전체가 * ... *인 경우만 ACTION.
    */

    if (
      !trimmed.startsWith("*") ||
      !trimmed.endsWith("*") ||
      trimmed.length < 2
    ) {

      return;

    }


    const firstText =
      getFirstTextNode(
        nodes[0]
      );


    const lastText =
      getLastTextNode(
        nodes[
          nodes.length - 1
        ]
      );


    if (
      !firstText ||
      !lastText
    ) {
      return;
    }


    /*
      앞쪽 * 제거
    */

    firstText.nodeValue =
      firstText.nodeValue
        .replace(
          "*",
          ""
        );


    /*
      뒤쪽 * 제거
    */

    const lastValue =
      lastText.nodeValue ||
      "";


    const lastStarIndex =
      lastValue
        .lastIndexOf(
          "*"
        );


    if (
      lastStarIndex !== -1
    ) {

      lastText.nodeValue =
        lastValue.slice(
          0,
          lastStarIndex
        )
        +
        lastValue.slice(
          lastStarIndex + 1
        );

    }


    /*
      ACTION wrapper 생성.
      기존 highlight span은 안쪽에 그대로 유지됨.
    */

    const action =
      document.createElement(
        "span"
      );


    action.className =
      "post-action";


    action.style.color =
      settings.actionColor ||
      "#888888";


    action.style.fontWeight =
      settings.actionWeight ||
      "400";


    const first =
      nodes[0];


    first.parentNode.insertBefore(
      action,
      first
    );


    nodes.forEach(
      node => {

        action.appendChild(
          node
        );

      }
    );

  }


  /*
    root 안의 한 줄을 <br> 기준으로 모음.
  */

  let lineNodes =
    [];


  Array.from(
    container.childNodes
  ).forEach(
    node => {

      if (
        node.nodeType ===
          Node.ELEMENT_NODE
        &&
        node.tagName ===
          "BR"
      ) {

        wrapActionNodes(
          lineNodes
        );


        lineNodes =
          [];


        return;

      }


      /*
        div / p는 그 자체를 한 문단으로 검사.
      */

      if (
        node.nodeType ===
          Node.ELEMENT_NODE
        &&
        (
          node.tagName === "DIV" ||
          node.tagName === "P"
        )
      ) {

        wrapActionNodes(
          [node]
        );


        return;

      }


      lineNodes.push(
        node
      );

    }
  );


  /*
    마지막 줄
  */

  wrapActionNodes(
    lineNodes
  );



  /*
    =========================================
    2. 기존 ACTION / DIALOGUE 처리

    이미 .post-action 안에 들어간 텍스트는
    다시 정규식 처리하지 않음.
    =========================================
  */

  const walker =
    document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT
    );


  const textNodes =
    [];


  while (
    walker.nextNode()
  ) {

    const node =
      walker.currentNode;


    const parent =
      node.parentElement;


    /*
      중요:
      immediate parent만 보지 않고
      위쪽 조상까지 확인.
      highlight span 안에 있어도
      post-action 내부라면 건너뜀.
    */

    if (
      parent?.closest(
        ".post-action, .post-dialogue"
      )
    ) {

      continue;

    }


    textNodes.push(
      node
    );

  }


  textNodes.forEach(
    node => {

      replaceActionDialogueTextNode(
        node,
        settings
      );

    }
  );

}


/* =========================================================
   BODY STYLE
========================================================== */

function applyPostBodyStyles(
  container,
  settings = {}
) {

  if (!container) {
    return;
  }


  container.style.color =
    settings.bodyColor ||
    "#555555";


  container.style.fontSize =
    `${
      Math.max(
        13,
        Number(
          settings.bodySize
        ) || 13
      )
    }px`;


  container.style.fontWeight =
    settings.bodyWeight ||
    "400";


  container.style.lineHeight =
    settings.lineHeight ||
    1.9;


  container.style.letterSpacing =
    `${
      Number(
        settings.letterSpacing
      ) || 0
    }px`;


  container.style.textAlign =
    settings.bodyAlign ||
    "left";

}



/* =========================================================
   RENDER POST
========================================================== */

function renderStyledPostContentInto(
  container,
  content,
  settings = {},
  options = {}
) {

  if (!container) {
    return;
  }


  container.replaceChildren();


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


  while (
    temp.firstChild
  ) {

    container.appendChild(
      temp.firstChild
    );

  }

  /*
    일반 게시글에서는
    PAGE BREAK 마커를 보여주지 않음.

    PREVIEW 페이지 계산할 때만 유지.
  */

  if (
    !options.keepPageBreaks
  ) {

    container
      .querySelectorAll(
        ".post-editor-page-break"
      )
      .forEach(
        marker => {

          marker.remove();

        }
      );

  }

  applyPostBodyStyles(
    container,
    settings
  );


  /*
    QUOTE의 문단 간격도 적용
  */

  const blocks =
    container.querySelectorAll(
      ":scope > div, :scope > p"
    );


  blocks.forEach(
    (
      block,
      index
    ) => {

      block.style.marginTop =
        "0";


      block.style.marginBottom =
        index ===
        blocks.length - 1
          ? "0"
          : `${
              Number(
                settings.paragraphSpacing
              ) || 0
            }px`;


      block.style.textIndent =
        `${
          Number(
            settings.indent
          ) || 0
        }px`;

    }
  );


  applyActionDialogueStyles(
    container,
    settings
  );

}


function renderStyledPostContent(
  content,
  settings = {}
) {

  renderStyledPostContentInto(
    postDetailContent,
    content,
    settings
  );

}
