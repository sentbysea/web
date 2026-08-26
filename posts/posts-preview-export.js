/* =========================================================
   POSTS - PREVIEW EXPORT

   posts-preview.js에서 분리됨(파일이 너무 커져서 나눔).
   프리뷰 페이지를 PNG로 저장/공유/클립보드 복사하는 부분만
   여기 있음. 페이지 나누기 자체는 posts-preview.js 참고.

   이 파일도 다시 너무 커져서(1400줄) 순수 헬퍼 함수들을
   더 쪼갰음:
   - posts-preview-export-capture.js: html2canvas 캡처
     전/후 임시 스타일 보정, 실제 캡처(captureVisiblePageAsBlob)
   - posts-preview-export-section.js: 모바일에서 프리뷰
     섹션을 강제로 열어야 할 때 쓰는 상태/함수, 프리뷰 페이지
     준비 확인(ensurePreviewPagesRendered)
   두 파일 다 이 파일보다 먼저 로드되어야 함
   (index.html 순서 참고).
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


  beginExportSectionState();



  const isMobileExport =
    isMobilePostEditor();




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
