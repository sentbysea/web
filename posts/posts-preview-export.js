/* =========================================================
   POSTS - PREVIEW EXPORT

   posts-preview.js에서 분리됨(파일이 너무 커져서 나눔).
   프리뷰 페이지를 PNG로 저장/공유/클립보드 복사하는 부분만
   여기 있음. 페이지 나누기 자체는 posts-preview.js 참고.
========================================================== */

/* =========================================================
   EXPORT PREVIEW AS IMAGE
========================================================== */

function waitForExport(ms) {

  return new Promise(
    resolve => {

      setTimeout(
        resolve,
        ms
      );

    }
  );

}


function getExportBaseFileName() {

  const rawTitle =
    (
      postEditorTitle?.value ||
      "excerpt"
    ).trim();


  const safeTitle =
    rawTitle
      .replace(
        /[\\/:*?"<>|]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      );


  return safeTitle || "excerpt";

}


function downloadDataUrl(
  dataUrl,
  fileName
) {

  const link =
    document.createElement(
      "a"
    );


  link.href =
    dataUrl;


  link.download =
    fileName;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();

}


/*
  클립보드 복사도 공유도 안 되는 환경(카카오톡/인스타그램 인앱
  브라우저 등)의 마지막 수단: 새 탭에 이미지를 직접 열어서
  길게 눌러 저장하게 한다. <a download>는 이런 인앱 웹뷰에서
  조용히 씹히는 경우가 많아서, 최소한 "화면에 보이기라도" 하는
  이 방법이 훨씬 안정적이다. 새 탭이 막히면(팝업 차단 등)
  마지막으로 다운로드 링크를 시도한다.
*/

function openExportedImageOrDownload(
  file
) {

  const url =
    URL.createObjectURL(
      file
    );

  const opened =
    window.open(
      url,
      "_blank"
    );


  if (opened) {

    showPostEditorMessage(
      "이미지를 길게 눌러 저장하세요 ♡"
    );

  }

  else {

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      file.name;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();


    showPostEditorMessage(
      "saved ♡"
    );

  }


  setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    60000
  );

}


async function exportEditorPreviewAsImages() {

  if (
    !window.html2canvas
  ) {

    /*
      alert()는 카카오톡/인스타그램 인앱 브라우저 같은 웹뷰에서
      무시되거나 막히는 경우가 있어서, 화면 안 메시지로 대신 표시.
    */

    showPostEditorMessage(
      "이미지 변환 기능을 불러오지 못했습니다."
    );

    return;

  }


  /*
    폰트가 아직 로드 중일 때 캡처하면 대체(fallback) 폰트로
    측정된 줄바꿈/자간이 실제 폰트 적용 후와 달라져서 텍스트가
    겹치는 등 깨진 이미지가 나올 수 있다. 이미 로드됐으면
    즉시 resolve되니 비용은 거의 없다.
  */

  if (
    document.fonts?.ready
  ) {

    await document.fonts.ready;

  }


  /*
    ★ export 버튼은 프리뷰 패널 밖(에디터 하단)에 있어서,
    모바일에서는 프리뷰 시트를 한 번도 열지 않고도
    바로 export를 누를 수 있다.

    그런데 모바일 프리뷰 섹션은 열려있지 않으면
    display:none이라 실제 레이아웃 크기가 0이 되고,
    그 상태에서 updateEditorPreview()(페이지 분할 계산)가
    돌면 previewPageIsOverflowing이 항상 false로 나와
    본문 전체가 한 페이지에 잘못 채워진다.

    → export 직전에 (닫혀 있었다면) 화면 밖에서만
    잠깐 레이아웃을 갖게 만들어 정확히 분할되게 하고,
    끝나면 원래 상태로 되돌린다.
  */

  const sectionForExport =
    postEditorPreviewSection;

  const wasSectionOpenBeforeExport =
    sectionForExport
      ?.classList
      .contains(
        "is-open"
      ) ||
    false;

  let sectionForcedForExport =
    false;

  function forceOpenSectionIfNeeded() {

    if (
      !sectionForExport ||
      wasSectionOpenBeforeExport ||
      !isMobilePostEditor()
    ) {
      return;
    }

    /*
      "is-open"은 모바일 미디어쿼리에서만 display:none을
      풀어주는 클래스라서, 이 강제 오픈은 모바일에서만
      의미/부작용이 있다.

      데스크톱은 애초에 이 섹션이 항상 레이아웃을 갖고
      있으므로(=이 문제가 없으므로) 건드리지 않는다 —
      건드리면 오히려 현재 열려 있는 실제 프리뷰 패널이
      export 도중 화면 밖으로 잠깐 밀려나 보이게 된다.
    */

    sectionForExport
      .classList
      .add(
        "is-open"
      );


    /*
      단순히 화면 밖(left:-100000px)으로 보내면
      position:fixed + width:auto인 상태라
      shrink-to-fit 계산 때문에 안쪽 sheet의
      width:100%가 기준으로 삼을 너비가 불확실해진다.

      대신 실제 뷰포트 크기(100%)는 그대로 갖되
      visibility만 숨겨서, 실제로 열었을 때와
      동일한 레이아웃 폭/높이로 측정되게 한다.
    */

    sectionForExport.style.position =
      "fixed";

    sectionForExport.style.left =
      "0";

    sectionForExport.style.top =
      "0";

    sectionForExport.style.width =
      "100%";

    sectionForExport.style.height =
      "100%";

    sectionForExport.style.visibility =
      "hidden";

    sectionForExport.style.pointerEvents =
      "none";


    sectionForcedForExport =
      true;

  }


  function restoreForcedExportSection() {

    if (
      !sectionForcedForExport
    ) {
      return;
    }


    sectionForExport
      .classList
      .remove(
        "is-open"
      );

    sectionForExport.style.removeProperty(
      "position"
    );

    sectionForExport.style.removeProperty(
      "left"
    );

    sectionForExport.style.removeProperty(
      "top"
    );

    sectionForExport.style.removeProperty(
      "width"
    );

    sectionForExport.style.removeProperty(
      "height"
    );

    sectionForExport.style.removeProperty(
      "visibility"
    );

    sectionForExport.style.removeProperty(
      "pointer-events"
    );

  }


  const isMobileExport =
    isMobilePostEditor();


  /*
    ★ 이미 프리뷰가 열려서 페이지가 그려져 있으면 그걸 그대로
    쓴다. 여기서 매번 updateEditorPreview()로 다시 그리면
    "지금 보고 있던 그 화면"이 아니라 방금 새로 만든 DOM을
    캡처하게 되고, 그 재생성 도중(레이아웃/폰트가 아직 안정
    되기 전) 캡처가 겹쳐서 텍스트가 깨져 보이는 원인이 됐다.

    페이지가 아예 없을 때(모바일에서 프리뷰를 한 번도 안 열고
    export부터 누른 경우)만 새로 그린다.
  */

  async function ensurePreviewPagesRendered() {

    let previewPages =
      Array.from(
        document.querySelectorAll(
          ".post-editor-preview-page"
        )
      );


    if (
      previewPages.length > 0
    ) {

      return previewPages;

    }


    updateEditorPreview();


    await waitForExport(
      80
    );


    return Array.from(
      document.querySelectorAll(
        ".post-editor-preview-page"
      )
    );

  }


  /*
    한 페이지를 html2canvas로 캡처해서 PNG Blob으로 만든다.
    모바일 클립보드 경로와, 그 폴백(공유/새탭) 양쪽에서
    재사용한다.
  */

  /*
    ★ html2canvas는 "여러 줄에 걸쳐 줄바꿈되는, 배경색이 있는
    인라인 span"(우리의 하이라이트)을 렌더링할 때 텍스트가
    사라지거나 다른 줄과 겹쳐 보이는 알려진 버그가 있다
    (직접 재현/확인함). 캡처 직전에만 하이라이트 span의
    글자 하나하나를 개별 span으로 재감싸서 배경색을 주면
    이 버그를 피해갈 수 있다 — 캡처가 끝나면 즉시 원래
    구조로 되돌린다.
  */

  function bakeHighlightSpansForCapture(
    container
  ) {

    const highlightSpans =
      container.querySelectorAll(
        ".post-inline-highlight"
      );


    highlightSpans.forEach(
      span => {

        const bg =
          span.style.backgroundColor;


        if (!bg) {
          return;
        }


        span.setAttribute(
          "data-original-html",
          span.innerHTML
        );


        span.setAttribute(
          "data-original-bg",
          bg
        );


        const chars =
          Array.from(
            span.textContent
          );


        const wrapped =
          chars
            .map(
              char => {

                if (
                  char === "\n"
                ) {
                  return char;
                }


                const safe =
                  char
                    .replace(
                      /&/g,
                      "&amp;"
                    )
                    .replace(
                      /</g,
                      "&lt;"
                    )
                    .replace(
                      />/g,
                      "&gt;"
                    );


                return `<span style="background-color:${bg};display:inline;color:inherit;font:inherit;letter-spacing:inherit;">${safe}</span>`;

              }
            )
            .join(
              ""
            );


        span.innerHTML =
          wrapped;


        span.style.backgroundColor =
          "transparent";

      }
    );

  }


  function restoreHighlightSpansAfterCapture(
    container
  ) {

    container
      .querySelectorAll(
        ".post-inline-highlight[data-original-html]"
      )
      .forEach(
        span => {

          span.innerHTML =
            span.getAttribute(
              "data-original-html"
            );


          span.style.backgroundColor =
            span.getAttribute(
              "data-original-bg"
            ) ||
            "";


          span.removeAttribute(
            "data-original-html"
          );


          span.removeAttribute(
            "data-original-bg"
          );

        }
      );

  }


  /*
    ★ 캔버스 카드용 확대/축소 transform은 항상 페이지의 부모인
    postEditorPreviewPages(데스크톱 scale, 모바일
    translate+scale/핀치줌 둘 다)에 걸려 있다. html2canvas는
    캡처 대상 엘리먼트만 독립적으로 그리는 게 아니라 조상의
    스타일까지 그대로 반영해서 다시 그리기 때문에, 이 transform이
    남아있으면 좌표 계산이 꼬여서 텍스트가 겹치거나 밀려 보인다
    (직접 재현/확인함 — export가 계속 깨졌던 진짜 원인).
    캡처 직전에만 걷어내고 캡처 후 그대로 복원한다.
  */

  function stripAncestorTransformsForCapture(
    element
  ) {

    const affected =
      [];

    let node =
      element.parentElement;


    while (node) {

      const inlineTransform =
        node.style.transform;


      if (
        inlineTransform &&
        inlineTransform !==
          "none"
      ) {

        affected.push(
          {
            node,
            value:
              inlineTransform
          }
        );


        node.style.transform =
          "none";

      }


      node =
        node.parentElement;

    }


    return affected;

  }


  function restoreAncestorTransformsAfterCapture(
    affected
  ) {

    affected.forEach(
      entry => {

        entry.node.style.transform =
          entry.value;

      }
    );

  }


  async function captureVisiblePageAsBlob(
    page,
    pageWidth,
    pageHeight
  ) {

    bakeHighlightSpansForCapture(
      page
    );


    const strippedTransforms =
      stripAncestorTransformsForCapture(
        page
      );


    let canvas;

    try {

      const desiredWidth =
        Math.max(
          pageWidth,
          Number(
            postStyleSettings
              ?.exportWidth
          ) || pageWidth * 2
        );


      const exportScale =
        desiredWidth /
        pageWidth;


      canvas =
        await window.html2canvas(
          page,
          {
            backgroundColor:
              null,

            useCORS:
              true,

            scale:
              exportScale,

            width:
              pageWidth,

            height:
              pageHeight,

            windowWidth:
              pageWidth,

            windowHeight:
              pageHeight,

            logging:
              false
          }
        );

    } finally {

      restoreHighlightSpansAfterCapture(
        page
      );


      restoreAncestorTransformsAfterCapture(
        strippedTransforms
      );

    }


    const blob =
      await new Promise(
        resolve => {

          canvas.toBlob(
            resolve,
            "image/png",
            1
          );

        }
      );


    if (!blob) {

      throw new Error(
        "PNG 생성 실패"
      );

    }


    return blob;

  }


  /*
    ★ 모바일: 클립보드에 "즉시" 쓰기를 등록하고, 실제 이미지를
    만드는 무거운 작업(html2canvas 등)은 그 안에서 나중에
    끝낸다.

    navigator.clipboard.write([new ClipboardItem({...})])는
    ClipboardItem의 값으로 아직 완료되지 않은 Promise를 받아도,
    write() 호출 자체가 사용자 클릭(user activation) 시점에
    이루어졌다면 그 Promise가 나중에 resolve될 때 정상적으로
    써주도록 스펙에 정의되어 있다.

    반대로 먼저 await로 html2canvas를 다 끝내고 나서
    clipboard.write를 호출하면, 그 사이(특히 모바일 브라우저)
    "사용자 제스처가 아직 유효하다"는 상태가 만료돼서
    클립보드 쓰기 자체가 조용히 거부되는 경우가 많다 —
    이게 바로 모바일 export가 "눌러도 반응 없음"이었던
    근본 원인으로 보인다.
  */

  if (
    isMobileExport &&
    navigator.clipboard?.write &&
    window.ClipboardItem
  ) {

    if (
      postEditorExportButton
    ) {

      postEditorExportButton.disabled =
        true;

      postEditorExportButton.textContent =
        "...";

    }


    showPostEditorMessage(
      "이미지 만드는 중..."
    );


    const capturePromise =
      (
        async () => {

          forceOpenSectionIfNeeded();


          const previewPages =
            await ensurePreviewPagesRendered();


          if (
            previewPages.length === 0
          ) {

            throw new Error(
              "내보낼 미리보기가 없습니다."
            );

          }


          const page =
            previewPages[
              editorPreviewPageIndex
            ] ||
            previewPages[
              previewPages.length - 1
            ];


          const wasHidden =
            page.hidden;


          page.hidden =
            false;


          /*
            hidden 해제 직후 바로 캡처하면 레이아웃/폰트가
            아직 안정되기 전이라 텍스트가 겹쳐 보이는 등
            깨진 이미지가 나올 수 있다(데스크톱 루프와
            동일하게 안정화 시간을 준다).
          */

          await waitForExport(
            30
          );


          try {

            const ratio =
              getPostPreviewRatio(
                postStyleSettings ||
                {}
              );


            const pageWidth =
              520;


            const pageHeight =
              Math.round(
                pageWidth *
                (
                  ratio.height /
                  ratio.width
                )
              );


            return await captureVisiblePageAsBlob(
              page,
              pageWidth,
              pageHeight
            );

          } finally {

            page.hidden =
              wasHidden;

          }

        }
      )();


    try {

      await navigator.clipboard.write(
        [
          new ClipboardItem(
            {
              "image/png":
                capturePromise
            }
          )
        ]
      );


      showPostEditorMessage(
        "copied ♡"
      );

    } catch (clipboardError) {

      console.warn(
        "clipboard copy failed:",
        clipboardError
      );


      try {

        const blob =
          await capturePromise;

        const fileName =
          `${
            getExportBaseFileName()
          }-${
            editorPreviewPageIndex + 1
          }.png`;

        const file =
          new File(
            [blob],
            fileName,
            {
              type:
                "image/png"
            }
          );


        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare(
            {
              files:
                [file]
            }
          )
        ) {

          try {

            await navigator.share(
              {
                files:
                  [file],

                title:
                  getExportBaseFileName()
              }
            );


            showPostEditorMessage(
              "ready 1 page ♡"
            );

          } catch (shareError) {

            if (
              shareError?.name ===
              "AbortError"
            ) {

              showPostEditorMessage(
                ""
              );

            }

            else {

              console.warn(
                "share failed:",
                shareError
              );


              openExportedImageOrDownload(
                file
              );

            }

          }

        }

        else {

          openExportedImageOrDownload(
            file
          );

        }

      } catch (captureError) {

        console.error(
          "preview export error:",
          captureError
        );


        showPostEditorMessage(
          "이미지 저장 실패: " +
          (
            captureError?.message ||
            "알 수 없는 오류"
          )
        );

      }

    } finally {

      if (
        postEditorExportButton
      ) {

        postEditorExportButton.disabled =
          false;

        postEditorExportButton.textContent =
          "export";

      }


      showEditorPreviewPage(
        editorPreviewPageIndex,
        {
          resetZoom: false
        }
      );


      restoreForcedExportSection();

    }


    return;

  }


  /*
    데스크톱(또는 클립보드 API 자체가 없는 환경): 기존처럼
    전체 페이지를 순서대로 PNG로 만들어서 한꺼번에 다운로드한다.
  */

  forceOpenSectionIfNeeded();


  const previewPages =
    await ensurePreviewPagesRendered();


  if (
    previewPages.length === 0
  ) {

    showPostEditorMessage(
      "내보낼 미리보기가 없습니다."
    );

    restoreForcedExportSection();

    return;

  }


  if (
    postEditorExportButton
  ) {

    postEditorExportButton.disabled =
      true;

    postEditorExportButton.textContent =
      "...";

  }


  showPostEditorMessage(
    "이미지 만드는 중..."
  );


  const exportFiles =
    [];


  try {

    const baseFileName =
      getExportBaseFileName();


    for (
      let index = 0;
      index < previewPages.length;
      index += 1
    ) {

      const page =
        previewPages[index];


      /*
        hidden 상태를 잠깐 해제해서
        실제 프리뷰 크기를 측정.
      */

      const wasHidden =
        page.hidden;


      page.hidden =
        false;


      await waitForExport(
        30
      );


      const ratio =
        getPostPreviewRatio(
          postStyleSettings ||
          {}
        );


      const pageWidth =
        520;


      const pageHeight =
        Math.round(
          pageWidth *
          (
            ratio.height /
            ratio.width
          )
        );


      let blob;

      try {

        blob =
          await captureVisiblePageAsBlob(
            page,
            pageWidth,
            pageHeight
          );

      } finally {

        page.hidden =
          wasHidden;

      }


      const fileName =
        `${
          baseFileName
        }-${
          index + 1
        }.png`;


      const file =
        new File(
          [blob],
          fileName,
          {
            type:
              "image/png"
          }
        );


      exportFiles.push(
        file
      );

    }


    /*
      모든 페이지 다시 원래 표시 상태로.
      (export는 사용자 네비게이션이 아니므로
      확대/이동 상태는 건드리지 않는다.)
    */

    showEditorPreviewPage(
      editorPreviewPageIndex,
      {
        resetZoom: false
      }
    );


    exportFiles.forEach(
      file => {

        const url =
          URL.createObjectURL(
            file
          );


        const link =
          document.createElement(
            "a"
          );


        link.href =
          url;


        link.download =
          file.name;


        document.body.appendChild(
          link
        );


        link.click();


        link.remove();


        setTimeout(
          () => {

            URL.revokeObjectURL(
              url
            );

          },
          1000
        );

      }
    );


    showPostEditorMessage(
      `saved ${exportFiles.length} page`
      +
      `${
        exportFiles.length > 1
          ? "s"
          : ""
      } ♡`
    );


  } catch (error) {

    console.error(
      "preview export error:",
      error
    );


    showPostEditorMessage(
      "이미지 저장 실패: " +
      (
        error?.message ||
        "알 수 없는 오류"
      )
    );


    showEditorPreviewPage(
      editorPreviewPageIndex,
      {
        resetZoom: false
      }
    );


  } finally {

    if (
      postEditorExportButton
    ) {

      postEditorExportButton.disabled =
        false;


      postEditorExportButton.textContent =
        "export";

    }


    restoreForcedExportSection();

  }

}
