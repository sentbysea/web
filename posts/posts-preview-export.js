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


async function exportEditorPreviewAsImages() {

  if (
    !window.html2canvas
  ) {

    alert(
      "이미지 변환 기능을 불러오지 못했습니다."
    );

    return;

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

  if (
    sectionForExport &&
    !wasSectionOpenBeforeExport &&
    isMobilePostEditor()
  ) {

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


  updateEditorPreview();


  await waitForExport(
    100
  );


  const previewPages =
    Array.from(
      document.querySelectorAll(
        ".post-editor-preview-page"
      )
    );


  if (
    previewPages.length === 0
  ) {

    alert(
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


  /*
    모바일은 현재 보고 있는 페이지 하나만
    클립보드로 복사하면 되므로, 그 한 페이지만 렌더링한다
    (화면에 없는 페이지까지 전부 캡처할 필요가 없음).

    데스크톱은 기존처럼 전체 페이지를 PNG로 저장한다.
  */

  const isMobileExport =
    isMobilePostEditor();

  const pagesToExport =
    isMobileExport
      ? [
          {
            page:
              previewPages[
                editorPreviewPageIndex
              ],
            pageNumber:
              editorPreviewPageIndex +
              1
          }
        ]
      : previewPages.map(
          (
            page,
            index
          ) => (
            {
              page,
              pageNumber:
                index + 1
            }
          )
        );


  const exportFiles =
    [];


  try {

    const baseFileName =
      getExportBaseFileName();


    for (
      let i = 0;
      i < pagesToExport.length;
      i += 1
    ) {

      const {
        page,
        pageNumber
      } =
        pagesToExport[i];


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


      /*
        ★ 화면에 실제로 보이는 그 페이지 요소를 그대로 캡처한다.
        (복제본을 만들어 document.body로 옮기지 않음 —
        그러면 padding 등 CSS 변수 상속 체인이 끊겨서
        프리뷰와 결과물이 달라질 수 있기 때문)

        html2canvas가 aspect-ratio를 잘못 계산하는 문제만
        피하기 위해, 캡처 직전에 실제 계산된 높이를
        숫자로 잠깐 고정했다가 캡처 후 원상복구한다.
      */

      const previousInlineHeight =
        page.style.height;

      const previousInlineAspectRatio =
        page.style.aspectRatio;


      page.style.height =
        `${pageHeight}px`;

      page.style.aspectRatio =
        "auto";


      await waitForExport(
        30
      );


      /*
        QUOTE의 exportWidth가 있으면
        그 폭에 맞춰 PNG 해상도 결정.

        없으면 화면 프리뷰의 2배.
      */

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


      let canvas;

      try {

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

        /*
          캡처 성공/실패와 무관하게 페이지를
          항상 원래 상태로 되돌린다.
        */

        page.style.height =
          previousInlineHeight;

        page.style.aspectRatio =
          previousInlineAspectRatio;


        page.hidden =
          wasHidden;

      }


      /*
        canvas → PNG Blob
      */

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


      const fileName =
        `${
          baseFileName
        }-${
          pageNumber
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


    /*
      모바일: 현재 페이지 이미지를 클립보드로 바로 복사.
      다른 앱(메시지, 갤러리 등)에 바로 붙여넣기 할 수 있어서
      기존 공유 시트보다 훨씬 안정적으로 동작한다.
    */

    if (
      isMobileExport &&
      navigator.clipboard?.write &&
      window.ClipboardItem
    ) {

      try {

        await navigator.clipboard.write(
          [
            new ClipboardItem(
              {
                "image/png":
                  exportFiles[0]
              }
            )
          ]
        );


        showPostEditorMessage(
          "copied ♡"
        );


        return;

      } catch (clipboardError) {

        console.warn(
          "clipboard copy failed:",
          clipboardError
        );

      }

    }


    /*
      클립보드 복사를 못 쓰는 모바일 환경:
      공유 시트로 대체(iPhone / iPad 등).
    */

    if (
      isMobileExport &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files:
          exportFiles
      })
    ) {

      try {

        await navigator.share({
          files:
            exportFiles,

          title:
            getExportBaseFileName()
        });


        showPostEditorMessage(
          `ready ${exportFiles.length} page`
          +
          `${
            exportFiles.length > 1
              ? "s"
              : ""
          } ♡`
        );


        return;

      } catch (shareError) {

        /*
          사용자가 공유창을 그냥 닫은 경우에는
          오류 팝업 띄우지 않음.
        */

        if (
          shareError?.name ===
          "AbortError"
        ) {

          showPostEditorMessage(
            ""
          );


          return;

        }


        console.warn(
          "share failed:",
          shareError
        );

      }

    }


    /*
      PC, 또는 위 방법이 전부 실패한 모바일 환경:
      일반 PNG 다운로드.
    */

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
      "이미지 저장 실패"
    );


    alert(
      "이미지 저장 중 오류가 발생했습니다."
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
