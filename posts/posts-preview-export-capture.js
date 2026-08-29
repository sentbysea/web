/* =========================================================
   POSTS - PREVIEW EXPORT: CAPTURE HELPERS

   posts-preview-export.js에서 분리됨(파일이 너무 커져서
   나눔). 전부 인자로만 동작하는 순수 함수라(클로저로 붙잡는
   지역변수 없음) 그대로 최상위로 옮겼다.

   내용: html2canvas가 못 읽는 CSS 변수(padding 등)를 캡처
   직전에 실제 값으로 임시 치환/복원, 여러 줄 하이라이트가
   깨지는 html2canvas 버그를 피하려고 글자 단위로 임시
   재감싸기/복원, 조상 확대축소 transform 임시 제거/복원,
   페이지 한 장을 실제로 캡처해서 PNG Blob으로 만들기
   (captureVisiblePageAsBlob).

   exportEditorPreviewAsImages() 등은
   posts-preview-export.js에 있음(같은 페이지에서 함께
   로드되어야 함).
========================================================== */


/*
  캡처용 페이지 높이 계산. ratio가 AUTO면 고정 비율이 없으니,
  이미 hidden 해제해서 실제 레이아웃된 page의 높이를 그대로
  캡처 높이로 쓴다(transform:scale은 offsetHeight에 영향을
  안 주므로 여기서 재도 정확함). 모바일 클립보드 경로와
  데스크톱 다중 페이지 저장 경로 양쪽에서 재사용한다.
*/

function resolveExportPageHeight(
  page,
  ratio,
  pageWidth
) {

  if (ratio.auto) {

    return page.offsetHeight;

  }


  return Math.round(
    pageWidth *
    (
      ratio.height /
      ratio.width
    )
  );

}


/*
  한 페이지를 html2canvas로 캡처해서 PNG Blob으로 만든다.
  모바일 클립보드 경로와, 그 폴백(공유/새탭) 양쪽에서
  재사용한다.
*/

/*
  ★ html2canvas는 CSS 커스텀 프로퍼티(변수, var(--foo))를
  지원하지 않는다(공식적으로 알려진 제약). 우리 페이지의
  padding(--post-preview-padding-y/x)과 제목 아래 여백
  (--post-preview-title-gap)이 전부 이 방식으로 지정되어
  있어서, 화면(브라우저 렌더링)에서는 정확히 계산되어 잘
  보이지만 html2canvas로 캡처하면 그 값을 못 읽어서
  0으로 그려진다 — export만 하면 여백이 다 사라지고
  텍스트가 가장자리에 딱 붙어 나오던 진짜 원인이다.

  캡처 직전에 실제 계산된(getComputedStyle) 픽셀 값을
  인라인 스타일로 그대로 박아넣으면 html2canvas가
  var() 없이도 정확한 값을 읽을 수 있다. 캡처 후에는
  원래 인라인 스타일 상태로 되돌린다.
*/

function bakeCssVarStylesForCapture(
  page
) {

  const affected =
    [];


  const pageComputed =
    window.getComputedStyle(
      page
    );

  affected.push(
    {
      node: page,
      prop: "padding",
      previousValue:
        page.style.padding
    }
  );

  page.style.padding =
    pageComputed.padding;


  /*
    ★ padding을 인라인으로 박아넣는 순간, html2canvas가
    box-sizing: border-box(CSS 클래스로만 지정돼 있음)를
    같이 못 읽어오는 경우가 있다 — 그러면 padding을
    content-box처럼(즉 지정한 height 위에 padding을 또
    더해서) 계산해버려서, 실제 렌더링 높이가 의도한 것보다
    padding*2만큼 커진다. "flow" source나 본문처럼 위쪽에
    있는 내용은 이 정도 오차로는 안 잘리지만, "fixed" source처럼
    캔버스 맨 아래 끝에 딱 붙는 요소는 이 초과분 밖으로
    밀려나서 export에서만 통째로 안 보이는 버그가 있었다
    (직접 재현/확인함). box-sizing도 같이 인라인으로 박아두면
    해결된다.
  */

  affected.push(
    {
      node: page,
      prop: "boxSizing",
      previousValue:
        page.style.boxSizing
    }
  );

  page.style.boxSizing =
    pageComputed.boxSizing;


  /*
    ★ aspect-ratio도 CSS 변수(--post-preview-aspect)로
    지정돼 있어서 위 padding과 똑같은 문제가 있다. RATIO가
    AUTO일 때는 라이브 브라우저가 var()를 auto로 정확히
    읽어서 페이지가 실제 콘텐츠 높이만큼 커지지만,
    html2canvas는 var()를 못 읽어서 CSS에 적어둔 폴백값
    (4 / 5)을 페이지 자체의 aspect-ratio로 그려버린다 —
    거기에 overflow:hidden까지 걸려 있어서, 폴백 비율보다
    긴 본문이 캡처본에서만 그 높이에서 통째로 잘려 나가는
    원인이었다(화면 프리뷰는 멀쩡한데 export만 잘리는 이유).
    계산된(auto 포함) 값을 그대로 인라인으로 박아넣으면
    html2canvas가 var() 없이도 정확히 읽는다.
  */

  affected.push(
    {
      node: page,
      prop: "aspectRatio",
      previousValue:
        page.style.aspectRatio
    }
  );

  page.style.aspectRatio =
    pageComputed.aspectRatio;


  const title =
    page.querySelector(
      ".post-editor-preview-title"
    );

  if (title) {

    const titleComputed =
      window.getComputedStyle(
        title
      );

    affected.push(
      {
        node: title,
        prop:
          "marginBottom",
        previousValue:
          title.style.marginBottom
      }
    );

    title.style.marginBottom =
      titleComputed.marginBottom;

  }


  return affected;

}


function restoreCssVarStylesAfterCapture(
  affected
) {

  affected.forEach(
    entry => {

      entry.node.style[
        entry.prop
      ] =
        entry.previousValue;

    }
  );

}


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
  ratio
) {

  bakeHighlightSpansForCapture(
    page
  );


  const strippedTransforms =
    stripAncestorTransformsForCapture(
      page
    );


  const bakedCssVarStyles =
    bakeCssVarStylesForCapture(
      page
    );


  /*
    ★ AUTO 비율 버그: pageHeight를 이 함수 호출 전에
    (베이킹 전에) 미리 재두면, 위 bakeHighlightSpansForCapture가
    하이라이트 span을 글자 단위로 재감싸면서 줄바꿈이 미묘하게
    달라져(특히 word-break:keep-all과 상호작용) 실제 레이아웃
    높이가 그 이후에 조금 더 늘어날 수 있다. AUTO는 여백 없이
    딱 맞는 높이라 이 몇 픽셀 차이만으로도 html2canvas가 그
    초과분(하이라이트 뒤에 오는 문장)을 통째로 잘라버렸다
    (직접 재현/확인함). 그래서 pageHeight는 반드시 모든 베이킹이
    끝난 지금 이 시점에 측정해야 한다.
  */

  const pageHeight =
    resolveExportPageHeight(
      page,
      ratio,
      pageWidth
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


    restoreCssVarStylesAfterCapture(
      bakedCssVarStyles
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
