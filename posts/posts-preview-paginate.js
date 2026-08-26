/* =========================================================
   POSTS - PREVIEW: BUILD PAGED PREVIEW / UPDATE

   posts-preview.js에서 분리됨(파일이 너무 커져서 나눔).
   editorPreviewPages 등 상태와 postEditorPreview* DOM
   요소는 posts/editor/posts-refs.js에 있음, 페이지 한 장
   만들기/타이틀·본문 스타일 적용 등은 posts-preview.js에
   있음(둘 다 이 파일보다 먼저 로드돼야 함).

   내용: 본문을 실제로 여러 페이지로 나눠서 그리는 알고리즘
   (renderEditorPreviewPages)과, 프리셋이 바뀌었을 때
   전체를 다시 그리는 진입점(updateEditorPreview).
========================================================== */


/* =========================================================
   BUILD PAGED PREVIEW
========================================================== */

function renderEditorPreviewPages(
  options = {}
) {

  const preserveView =
    options.preserveView ===
    true;


  if (
    !postEditorPreviewPages
  ) {
    return;
  }


  const settings =
    postStyleSettings ||
    {};


  applyPostPreviewPresetVariables(
    settings
  );


  /*
    먼저 전체 본문을
    QUOTE 스타일대로 가상 렌더링.
  */

  const source =
    document.createElement(
      "div"
    );


  renderStyledPostContentInto(
    source,
    getRichEditorHTML(),
    settings,
    {
      keepPageBreaks:
        true
    }
  );


  postEditorPreviewPages
    .replaceChildren();


  editorPreviewPages =
    [];


 let current =
  createEditorPreviewPage(
    settings,
    {
      showTitle: true
    }
  );

  postEditorPreviewPages
    .appendChild(
      current.page
    );


  editorPreviewPages.push(
    current.page
  );


  /*
    새로운 페이지 생성
  */

  function startNewPage() {

    current =
  createEditorPreviewPage(
    settings,
    {
      showTitle: false
    }
  );


    postEditorPreviewPages
      .appendChild(
        current.page
      );


    editorPreviewPages.push(
      current.page
    );

  }


  /*
    현재 열려 있는 span/div 체인(중첩 가능).
    페이지가 바뀔 때 이 체인을 빈 껍데기로만 새 페이지에
    다시 만들어서 이어붙인다. 예: 긴 인용구 span 중간에서
    페이지가 넘어가도, 같은 span이 다음 페이지에서 다시
    열려서 스타일이 이어진다.
  */

  let openChain = [];


  function currentContainer() {

    if (openChain.length === 0) {
      return current.content;
    }

    return openChain[
      openChain.length - 1
    ].shell;

  }


  function rebuildOpenChain() {

    let parent = current.content;

    openChain.forEach(
      entry => {

        const shell =
          entry.original.cloneNode(
            false
          );

        parent.appendChild(shell);

        entry.shell = shell;

        parent = shell;

      }
    );

  }


  /*
    텍스트 노드는 단어 단위로 넣어서
    캔버스를 넘는 순간 다음 페이지로 넘김.
    (어떤 깊이의 span 안에서든 동일하게 동작)
  */

  function appendTextNode(
    node
  ) {

    const value =
      node.nodeValue ||
      "";


    const parts =
      value.match(
        /\S+\s*|\s+/g
      ) || [];


    parts.forEach(
      part => {

        const textNode =
          document.createTextNode(
            part
          );


        currentContainer().appendChild(
          textNode
        );


        if (
          previewPageIsOverflowing(
            current.page
          )
        ) {

          textNode.remove();


          startNewPage();
          rebuildOpenChain();


          currentContainer().appendChild(
            textNode
          );

        }

      }
    );

  }


  /*
    노드를 재귀적으로 삽입.
    텍스트는 단어 단위 분할, 자식이 있는 요소(인용구/강조
    span 등)는 빈 껍데기만 새로 만들고 그 안에 자식을
    재귀적으로 이어붙인다 — 긴 인용구 span도 이렇게 하면
    통째로 넘치는 대신 단어 단위로 쪼개져서 페이지 경계를
    올바르게 넘어간다. <br>처럼 자식이 없는 요소만 기존처럼
    통째로 한 번 검사한다.
  */

  function appendNode(
    node
  ) {

    /*
      ★ 수동 PAGE BREAK

      남은 공간이 있어도
      강제로 새 페이지 시작.
    */

    if (
      isEditorPageBreakNode(
        node
      )
    ) {

      /*
        첫 페이지가 완전히 비어 있을 때는
        빈 페이지 하나를 만들지 않음.
      */

      if (
        current.content.childNodes.length >
        0
      ) {

        startNewPage();
        openChain = [];

      }


      return;

    }


    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {

      appendTextNode(
        node
      );


      return;

    }


    if (
      node.nodeType !==
      Node.ELEMENT_NODE
    ) {

      return;

    }


    const canRecurse =
      node.nodeName !==
        "BR"
      &&
      node.childNodes.length >
        0;


    if (!canRecurse) {

      /*
        <br>나 빈 요소는 통째로 넣고
        한 번만 넘침 검사(이미 충분히 작음).
      */

      const clone =
        node.cloneNode(
          true
        );


      currentContainer().appendChild(
        clone
      );


      if (
        previewPageIsOverflowing(
          current.page
        )
      ) {

        clone.remove();


        startNewPage();
        rebuildOpenChain();


        currentContainer().appendChild(
          clone
        );

      }


      return;

    }


    /*
      자식이 있는 span/div 등은 빈 껍데기만 새로 만들고
      그 안에 자식을 재귀적으로 이어붙인다.
    */

    const shell =
      node.cloneNode(
        false
      );


    currentContainer().appendChild(
      shell
    );


    openChain.push(
      {
        original: node,
        shell
      }
    );


    Array.from(
      node.childNodes
    ).forEach(
      child => {

        appendNode(
          child
        );

      }
    );


    openChain.pop();

  }


  /*
    원본의 최상위 노드를 순서대로 삽입.
  */

  Array.from(
    source.childNodes
  ).forEach(
    node => {

      appendNode(
        node
      );

    }
  );


  /*
    완전히 빈 마지막 페이지 방지.
  */

  if (
    editorPreviewPages.length > 1
    &&
    current.content.childNodes.length ===
      0
  ) {

    current.page.remove();


    editorPreviewPages.pop();

  }


  /*
    data-page-index
  */

  editorPreviewPages.forEach(
    (
      page,
      index
    ) => {

      page.dataset.pageIndex =
        String(
          index
        );

    }
  );


  showEditorPreviewPage(
    Math.min(
      editorPreviewPageIndex,
      editorPreviewPages.length - 1
    ),
    {
      resetZoom:
        !preserveView
    }
  );

  applyEditorPreviewScale();

}



/* =========================================================
   UPDATE PREVIEW
========================================================== */

function updateEditorPreview(
  options = {}
) {

  if (
    !postEditorPreviewPages
  ) {
    return;
  }


  renderEditorPreviewPages(
    options
  );

}
