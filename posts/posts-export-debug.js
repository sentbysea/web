/* =========================================================
   TEMP DEBUG — EXPORT PIPELINE INSTRUMENTATION
   (아이폰에서 직접 확인용, 삭제 예정)

   제거 방법: 이 파일을 지우고, index.html의 postsDependencyScripts
   배열에서 "./posts/posts-export-debug.js" 한 줄만 지우면 끝.
   다른 파일은 전혀 건드리지 않음 — exportEditorPreviewAsImages /
   captureVisiblePageAsBlob / html2canvas를 원본은 그대로 둔 채
   감싸기(wrap)만 해서 계측한다.

   측정 시점 3곳:
   - PREVIEW: export 버튼을 누르는 그 순간, 화면에 있던
     editorPreviewPages 각각의 실제 DOM 상태.
   - CAPTURE SOURCE: captureVisiblePageAsBlob(page, ...)에
     실제로 넘어온 page 인자 그 자체.
   - HTML2CANVAS CLONE: html2canvas가 내부적으로 만드는
     별도 document(iframe clone) 안에서, 실제 WebKit이 다시
     레이아웃한 뒤의 상태(onclone 콜백 안에서 측정).
========================================================== */

(function () {

  const DEBUG_STATE = {
    runs: []
  };


  function shortText(
    str,
    n
  ) {

    return (
      str ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim()
      .slice(
        0,
        n
      );

  }


  function edgesOf(
    str,
    n
  ) {

    const clean =
      (
        str ||
        ""
      )
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    return {
      start:
        clean.slice(
          0,
          n
        ),
      end:
        clean.length >
        n
          ? clean.slice(
              -n
            )
          : clean.slice(
              0,
              n
            )
    };

  }


  function measureLiveNode(
    label,
    page
  ) {

    if (!page) {

      return {
        label,
        missing: true
      };

    }


    const contentEl =
      page.querySelector(
        ".post-editor-preview-content"
      );

    const text =
      contentEl
        ? contentEl.textContent
        : "";

    const edges =
      edgesOf(
        text,
        80
      );

    return {
      label,
      pageIndex:
        page.dataset
          .pageIndex,
      hidden:
        page.hidden,
      textLength:
        text.length,
      start:
        edges.start,
      end:
        edges.end,
      page: {
        clientWidth:
          page.clientWidth,
        clientHeight:
          page.clientHeight,
        scrollWidth:
          page.scrollWidth,
        scrollHeight:
          page.scrollHeight,
        offsetHeight:
          page.offsetHeight
      },
      content:
        contentEl
          ? {
              clientWidth:
                contentEl.clientWidth,
              clientHeight:
                contentEl.clientHeight,
              scrollWidth:
                contentEl.scrollWidth,
              scrollHeight:
                contentEl.scrollHeight
            }
          : null
    };

  }


  function measureClonedNode(
    label,
    clonedDocument,
    originalPage
  ) {

    if (
      !clonedDocument ||
      !originalPage
    ) {

      return {
        label,
        missing: true
      };

    }


    const candidates =
      Array.from(
        clonedDocument.querySelectorAll(
          ".post-editor-preview-page"
        )
      );

    const clonedPage =
      candidates.find(
        n =>
          n.dataset
            .pageIndex ===
          originalPage.dataset
            .pageIndex
      ) ||
      null;


    if (!clonedPage) {

      return {
        label,
        missing: true,
        clonedPageCountInDoc:
          candidates.length
      };

    }


    const contentEl =
      clonedPage.querySelector(
        ".post-editor-preview-content"
      );

    const text =
      contentEl
        ? contentEl.textContent
        : "";

    const edges =
      edgesOf(
        text,
        80
      );

    let lineCount =
      null;

    if (
      contentEl &&
      contentEl.firstChild
    ) {

      try {

        const walker =
          clonedDocument.createTreeWalker(
            contentEl,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode:
                n =>
                  n.nodeValue.trim()
                    .length >
                  0
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP
            }
          );

        const firstNode =
          walker.nextNode();

        if (firstNode) {

          const range =
            clonedDocument.createRange();

          range.selectNodeContents(
            firstNode
          );

          lineCount =
            range.getClientRects()
              .length;

        }

      } catch (e) {

        lineCount =
          "err:" +
          e.message;

      }

    }


    const cs =
      contentEl &&
      clonedDocument.defaultView
        ? clonedDocument.defaultView.getComputedStyle(
            contentEl
          )
        : null;


    return {
      label,
      pageIndex:
        clonedPage.dataset
          .pageIndex,
      textLength:
        text.length,
      start:
        edges.start,
      end:
        edges.end,
      page: {
        clientWidth:
          clonedPage.clientWidth,
        clientHeight:
          clonedPage.clientHeight,
        scrollWidth:
          clonedPage.scrollWidth,
        scrollHeight:
          clonedPage.scrollHeight
      },
      content:
        contentEl
          ? {
              clientWidth:
                contentEl.clientWidth,
              clientHeight:
                contentEl.clientHeight,
              scrollWidth:
                contentEl.scrollWidth,
              scrollHeight:
                contentEl.scrollHeight
            }
          : null,
      firstParagraphLineCount:
        lineCount,
      computedStyle:
        cs
          ? {
              fontFamily:
                cs.fontFamily,
              fontSize:
                cs.fontSize,
              lineHeight:
                cs.lineHeight,
              letterSpacing:
                cs.letterSpacing,
              wordBreak:
                cs.wordBreak,
              overflowWrap:
                cs.overflowWrap,
              webkitTextSizeAdjust:
                cs.webkitTextSizeAdjust
            }
          : null
    };

  }


  /*
    ★ export 시작 순간 화면에 있던 모든 preview page +
    "혹시 stale/중복 DOM이 남아있나" 체크.
    editorPreviewPages 배열은 posts/editor/posts-state.js에서
    옴, captureVisiblePageAsBlob/exportEditorPreviewAsImages는
    posts-preview-export*.js에서 옴 — 전부 이 파일보다 먼저
    로드되므로(index.html 순서) 여기서 그냥 참조 가능.
  */

  function snapshotPreviewAndStaleCheck() {

    const previewSnapshot =
      editorPreviewPages.map(
        (
          page,
          index
        ) =>
          measureLiveNode(
            "PREVIEW page" +
              index +
              (
                index ===
                editorPreviewPageIndex
                  ? " (현재 화면에 보이는 페이지)"
                  : ""
              ),
            page
          )
      );


    const allInDocument =
      Array.from(
        document.querySelectorAll(
          ".post-editor-preview-page"
        )
      );

    const orphaned =
      allInDocument.filter(
        n =>
          !editorPreviewPages.includes(
            n
          )
      );

    return {
      previewSnapshot,
      staleCheck: {
        editorPreviewPagesLength:
          editorPreviewPages.length,
        domQueryAllLength:
          allInDocument.length,
        orphanedNodeCount:
          orphaned.length,
        orphanedNodesText:
          orphaned.map(
            n =>
              shortText(
                n.querySelector(
                  ".post-editor-preview-content"
                )
                  ?.textContent,
                60
              )
          )
      }
    };

  }


  /*
    ★ 원본 함수들을 감싸기만 함(로직 변경 없음).
  */

  const realExportEditorPreviewAsImages =
    exportEditorPreviewAsImages;

  window.exportEditorPreviewAsImages =
    async function (
      ...args
    ) {

      const run =
        {
          startedAt:
            new Date().toISOString(),
          captureSourceSnapshots:
            [],
          cloneSnapshots:
            [],
          identity:
            [],
          bakeSteps:
            []
        };


      const {
        previewSnapshot,
        staleCheck
      } =
        snapshotPreviewAndStaleCheck();

      run.previewSnapshot =
        previewSnapshot;

      run.staleCheck =
        staleCheck;


      DEBUG_STATE.currentRun =
        run;

      DEBUG_STATE.runs.push(
        run
      );


      let error =
        null;

      try {

        await realExportEditorPreviewAsImages.apply(
          this,
          args
        );

      } catch (e) {

        error =
          String(
            e?.stack ||
            e
          );

      }


      run.error =
        error;

      run.finishedAt =
        new Date().toISOString();


      renderDebugPanel();

      return;

    };


  const realCaptureVisiblePageAsBlob =
    captureVisiblePageAsBlob;

  window.captureVisiblePageAsBlob =
    async function (
      page,
      pageWidth,
      ratio
    ) {

      const run =
        DEBUG_STATE.currentRun ||
        (
          DEBUG_STATE.currentRun =
            {
              previewSnapshot:
                [],
              captureSourceSnapshots:
                [],
              cloneSnapshots:
                [],
              identity:
                [],
              bakeSteps:
                []
            }
        );


      run.captureSourceSnapshots.push(
        measureLiveNode(
          "CAPTURE SOURCE page" +
            page.dataset
              .pageIndex,
          page
        )
      );


      run.identity.push(
        {
          pageIndex:
            page.dataset
              .pageIndex,
          isSameObjectAsEditorPreviewPagesEntry:
            editorPreviewPages.includes(
              page
            )
        }
      );


      return realCaptureVisiblePageAsBlob(
        page,
        pageWidth,
        ratio
      );

    };


  /*
    ★ 캡처 직전 라이브 page 자체를 수정하는 두 단계
    (하이라이트 글자 단위 재감싸기 / padding·aspect-ratio·
    box-sizing 인라인 굽기)를 각각 감싸서, 그 단계 전후로
    page.offsetHeight / content.clientHeight가 바뀌는지 잰다.
    "CAPTURE SOURCE"(위 wrap)는 이 단계들이 실행되기 전 상태라
    베이킹 자체가 높이를 부풀리는지는 이 계측 없이는 알 수 없다.
  */

  function measureBakeStep(
    page
  ) {

    const contentEl =
      page.querySelector(
        ".post-editor-preview-content"
      );

    return {
      pageOffsetHeight:
        page.offsetHeight,
      contentClientHeight:
        contentEl
          ? contentEl.clientHeight
          : null
    };

  }


  function wrapBakeStep(
    fnName
  ) {

    const real =
      window[fnName];

    if (
      typeof real !==
      "function"
    ) {
      return;
    }


    window[fnName] =
      function (
        page
      ) {

        const before =
          measureBakeStep(
            page
          );

        const result =
          real(
            page
          );

        const after =
          measureBakeStep(
            page
          );

        const run =
          DEBUG_STATE.currentRun;

        if (run) {

          run.bakeSteps.push(
            {
              step: fnName,
              pageIndex:
                page.dataset
                  ?.pageIndex,
              before,
              after
            }
          );

        }

        return result;

      };

  }


  wrapBakeStep(
    "bakeHighlightSpansForCapture"
  );

  wrapBakeStep(
    "bakeCssVarStylesForCapture"
  );


  /*
    ★ html2canvas는 CDN에서 로드되고(index.html 상단), 보통
    posts/* 스크립트들보다 먼저 붙어있지만 혹시 몰라 재시도.
    onclone은 원래 것(waitForClonedDocumentFontsBeforeCapture)을
    그대로 실행하고, 그 앞뒤로 우리 측정만 끼워 넣는다 — 동작은
    바뀌지 않음.
  */

  function wrapHtml2Canvas() {

    if (
      !window.html2canvas ||
      window.html2canvas
        .__debugWrapped
    ) {
      return;
    }


    const real =
      window.html2canvas;

    const wrapped =
      async function (
        element,
        opts
      ) {

        const userOnClone =
          opts &&
          opts.onclone;

        const newOpts =
          Object.assign(
            {},
            opts,
            {
              onclone:
                async function (
                  clonedDocument
                ) {

                  const run =
                    DEBUG_STATE.currentRun;

                  let preSnapshot =
                    null;

                  try {

                    preSnapshot =
                      measureClonedNode(
                        "HTML2CANVAS CLONE (PRE-FONT-WAIT) page" +
                          element.dataset
                            .pageIndex,
                        clonedDocument,
                        element
                      );

                  } catch (e) {

                    if (run) {

                      run.cloneError =
                        String(
                          e?.stack ||
                          e
                        );

                    }

                  }


                  if (
                    typeof userOnClone ===
                    "function"
                  ) {

                    await userOnClone(
                      clonedDocument
                    );

                  }


                  let fontsCheck =
                    null;

                  try {

                    fontsCheck =
                      {
                        checkPretendard14:
                          clonedDocument.fonts
                            ?.check(
                              "14px Pretendard"
                            ) ??
                          null,
                        entries:
                          Array.from(
                            clonedDocument.fonts ||
                            []
                          ).map(
                            f => ({
                              family:
                                f.family,
                              status:
                                f.status,
                              weight:
                                f.weight
                            })
                          )
                      };

                  } catch (e) {

                    fontsCheck =
                      {
                        error:
                          String(
                            e?.stack ||
                            e
                          )
                      };

                  }


                  try {

                    const postSnapshot =
                      measureClonedNode(
                        "HTML2CANVAS CLONE (POST-FONT-WAIT) page" +
                          element.dataset
                            .pageIndex,
                        clonedDocument,
                        element
                      );

                    if (run) {

                      run.cloneSnapshots.push(
                        {
                          pageIndex:
                            element.dataset
                              .pageIndex,
                          pre:
                            preSnapshot,
                          post:
                            postSnapshot,
                          fontsCheck:
                            fontsCheck
                        }
                      );

                    }

                  } catch (e) {

                    if (run) {

                      run.cloneError =
                        String(
                          e?.stack ||
                          e
                        );

                    }

                  }

                }
            }
          );


        return real(
          element,
          newOpts
        );

      };


    wrapped.__debugWrapped =
      true;

    window.html2canvas =
      wrapped;

  }


  wrapHtml2Canvas();

  const html2canvasWaitTimer =
    setInterval(
      () => {

        if (window.html2canvas) {

          wrapHtml2Canvas();

          clearInterval(
            html2canvasWaitTimer
          );

        }

      },
      200
    );


  /* =========================================================
     화면 표시용 DEBUG PANEL
     (console.log이 아니라 화면에서 바로 보고 복사할 수 있게)
  ========================================================== */

  function formatEntry(
    e
  ) {

    if (!e) {
      return "(none)";
    }

    if (e.missing) {
      return (
        e.label +
        ": (없음)" +
        (
          e.clonedPageCountInDoc !=
          null
            ? " clone 안 page 개수=" +
              e.clonedPageCountInDoc
            : ""
        )
      );
    }

    const lines =
      [
        e.label +
          (
            e.hidden !=
            null
              ? " [hidden=" +
                e.hidden +
                "]"
              : ""
          ),
        "  start: " +
          e.start,
        "  end:   " +
          e.end,
        "  page " +
          JSON.stringify(
            e.page
          ),
        "  content " +
          JSON.stringify(
            e.content
          )
      ];

    if (
      e.firstParagraphLineCount !=
      undefined
    ) {

      lines.push(
        "  firstParagraphLineCount: " +
          e.firstParagraphLineCount
      );

    }

    if (e.computedStyle) {

      lines.push(
        "  style " +
          JSON.stringify(
            e.computedStyle
          )
      );

    }

    return lines.join(
      "\n"
    );

  }


  function formatRun(
    run,
    index
  ) {

    const parts =
      [
        "========== RUN " +
          index +
          " (" +
          run.startedAt +
          " ~ " +
          run.finishedAt +
          ") ==========",
        run.error
          ? "!! ERROR: " +
            run.error
          : "",
        "-- STALE DOM CHECK --",
        JSON.stringify(
          run.staleCheck
        ),
        "",
        "-- IDENTITY (CAPTURE SOURCE page === editorPreviewPages 배열의 같은 객체?) --",
        JSON.stringify(
          run.identity
        ),
        "",
        "-- BAKE STEPS (라이브 page를 캡처 직전에 수정하는 단계별 전/후 높이) --",
        ...(
          run.bakeSteps ||
          []
        ).map(
          b =>
            "  [" +
              b.step +
              " page" +
              b.pageIndex +
              "] before=" +
              JSON.stringify(
                b.before
              ) +
              " -> after=" +
              JSON.stringify(
                b.after
              ) +
              (
                b.before
                  .pageOffsetHeight ===
                b.after
                  .pageOffsetHeight
                  ? ""
                  : "  ★ 이 단계에서 높이가 바뀜"
              )
        ),
        ""
      ];


    (
      run.previewSnapshot ||
      []
    ).forEach(
      (
        e,
        i
      ) => {

        parts.push(
          "[PREVIEW]"
        );

        parts.push(
          formatEntry(
            e
          )
        );

        const cap =
          run.captureSourceSnapshots?.[
            i
          ];

        if (cap) {

          parts.push(
            "[CAPTURE SOURCE]"
          );

          parts.push(
            formatEntry(
              cap
            )
          );

        }


        const clone =
          run.cloneSnapshots?.[
            i
          ];

        if (clone) {

          parts.push(
            "[HTML2CANVAS CLONE - PRE FONT WAIT]"
          );

          parts.push(
            formatEntry(
              clone.pre
            )
          );

          parts.push(
            "[HTML2CANVAS CLONE - POST FONT WAIT]"
          );

          parts.push(
            formatEntry(
              clone.post
            )
          );

          if (
            clone.pre &&
            clone.post &&
            !clone.pre.missing &&
            !clone.post.missing
          ) {

            const preH =
              clone.pre.content
                ?.clientHeight;

            const postH =
              clone.post.content
                ?.clientHeight;

            parts.push(
              "[FONT WAIT EFFECT] pre-wait content height=" +
                preH +
                " -> post-wait content height=" +
                postH +
                (
                  preH ===
                  postH
                    ? "  (변화 없음 — 폰트 대기가 레이아웃을 안 바꿈)"
                    : "  (변화 있음 — 폰트 대기 후 재계산됨)"
                )
            );

          }


          if (
            clone.fontsCheck
          ) {

            parts.push(
              "[CLONE FONTS CHECK] " +
                JSON.stringify(
                  clone.fontsCheck
                )
            );

          }

        }


        if (
          cap &&
          e.start !==
            "(없음)"
        ) {

          parts.push(
            "[MATCH] preview.start===capture.start: " +
              (
                e.start ===
                cap.start
              ) +
              " / preview.end===capture.end: " +
              (
                e.end ===
                cap.end
              )
          );

        }

        if (
          clone &&
          cap &&
          clone.post &&
          !clone.post.missing
        ) {

          parts.push(
            "[MATCH] capture.start===clone(post).start: " +
              (
                cap.start ===
                clone.post.start
              ) +
              " / capture.end===clone(post).end: " +
              (
                cap.end ===
                clone.post.end
              )
          );

        }


        parts.push(
          "----------------------------------------"
        );

      }
    );


    if (run.cloneError) {

      parts.push(
        "!! CLONE MEASURE ERROR: " +
          run.cloneError
      );

    }


    return parts.join(
      "\n"
    );

  }


  let panel =
    null;

  let panelBody =
    null;


  function ensurePanel() {

    if (panel) {
      return;
    }


    panel =
      document.createElement(
        "div"
      );

    panel.id =
      "__exportDebugPanel";

    panel.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;" +
      "max-height:60vh;overflow:auto;" +
      "background:#111;color:#0f0;" +
      "font:10px/1.4 monospace;" +
      "padding:8px;z-index:999999;" +
      "white-space:pre-wrap;word-break:break-all;" +
      "border-top:3px solid #0f0;" +
      "display:none;";


    const header =
      document.createElement(
        "div"
      );

    header.style.cssText =
      "display:flex;gap:8px;margin-bottom:6px;position:sticky;top:0;background:#111;padding-bottom:6px;";


    const copyBtn =
      document.createElement(
        "button"
      );

    copyBtn.textContent =
      "[COPY DEBUG]";

    copyBtn.style.cssText =
      "background:#0f0;color:#000;border:none;padding:6px 10px;font-weight:bold;";

    copyBtn.addEventListener(
      "click",
      async () => {

        const text =
          panelBody.textContent;

        try {

          await navigator.clipboard.writeText(
            text
          );

          copyBtn.textContent =
            "copied ✓";

        } catch (e) {

          const ta =
            document.createElement(
              "textarea"
            );

          ta.value =
            text;

          ta.style.cssText =
            "width:100%;height:150px;";

          panelBody.prepend(
            ta
          );

          ta.focus();

          ta.select();

          copyBtn.textContent =
            "복사 실패 — 아래 textarea에서 직접 선택/복사";

        }


        setTimeout(
          () => {

            copyBtn.textContent =
              "[COPY DEBUG]";

          },
          2000
        );

      }
    );


    const closeBtn =
      document.createElement(
        "button"
      );

    closeBtn.textContent =
      "[CLOSE]";

    closeBtn.style.cssText =
      "background:#333;color:#fff;border:none;padding:6px 10px;";

    closeBtn.addEventListener(
      "click",
      () => {

        panel.style.display =
          "none";

      }
    );


    header.appendChild(
      copyBtn
    );

    header.appendChild(
      closeBtn
    );

    panel.appendChild(
      header
    );


    panelBody =
      document.createElement(
        "div"
      );

    panel.appendChild(
      panelBody
    );


    document.body.appendChild(
      panel
    );


    const toggle =
      document.createElement(
        "button"
      );

    toggle.textContent =
      "DEBUG";

    toggle.style.cssText =
      "position:fixed;" +
      "right:calc(8px + env(safe-area-inset-right));" +
      "top:calc(8px + env(safe-area-inset-top));" +
      "z-index:999998;" +
      "background:#e91e8c;color:#fff;border:none;" +
      "padding:8px 10px;font:11px monospace;font-weight:bold;" +
      "border-radius:6px;opacity:0.85;";

    toggle.addEventListener(
      "click",
      () => {

        panel.style.display =
          panel.style.display ===
          "none"
            ? "block"
            : "none";

      }
    );

    document.body.appendChild(
      toggle
    );

  }


  function renderDebugPanel() {

    ensurePanel();


    const text =
      DEBUG_STATE.runs
        .map(
          (
            run,
            i
          ) =>
            formatRun(
              run,
              i
            )
        )
        .join(
          "\n\n"
        );


    panelBody.textContent =
      text;

    panel.style.display =
      "block";

  }


  ensurePanel();

})();
