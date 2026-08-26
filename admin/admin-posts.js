/* =========================================================
   ADMIN - QUICK WRITE PANEL (요소 / 미리보기)

   admin 대시보드의 간단 글쓰기 패널(txt/html 붙여넣기용,
   posts.js의 리치 에디터와는 별개). 저장 로직은
   admin-posts-save.js에 있음(이 파일보다 나중에
   로드되어야 함 — admin/index.html 순서 참고).
========================================================== */


/* =========================================================
   POSTS
   WRITE 기능
========================================================== */



/* =========================================================
   요소
========================================================== */

const postCategory =
  document.getElementById(
    "postCategory"
  );


const postTitle =
  document.getElementById(
    "postTitle"
  );


const postContent =
  document.getElementById(
    "postContent"
  );


const postPreviewButton =
  document.getElementById(
    "postPreviewButton"
  );


const postSaveButton =
  document.getElementById(
    "postSaveButton"
  );


const postSaveMessage =
  document.getElementById(
    "postSaveMessage"
  );


const postPreview =
  document.getElementById(
    "postPreview"
  );


const postPreviewTitle =
  document.getElementById(
    "postPreviewTitle"
  );


const postPreviewContent =
  document.getElementById(
    "postPreviewContent"
  );



/* =========================================================
   상태 메시지

   성공:
   2초 유지 → fade

   에러:
   그대로 유지
========================================================== */

function showPostMessage(
  message,
  autoHide = false
) {

  if (
    !postSaveMessage
  ) {
    return;
  }


  if (
    postSaveMessage._messageTimer
  ) {

    clearTimeout(
      postSaveMessage._messageTimer
    );

  }


  if (
    postSaveMessage._fadeTimer
  ) {

    clearTimeout(
      postSaveMessage._fadeTimer
    );

  }


  postSaveMessage.style.transition =
    "none";


  postSaveMessage.style.opacity =
    "1";


  postSaveMessage.textContent =
    message;


  if (
    !autoHide
  ) {
    return;
  }


  postSaveMessage._messageTimer =
    setTimeout(
      () => {

        postSaveMessage.style.transition =
          "opacity 0.6s ease";


        postSaveMessage.style.opacity =
          "0";


        postSaveMessage._fadeTimer =
          setTimeout(
            () => {

              postSaveMessage.textContent =
                "";


              postSaveMessage.style.transition =
                "none";


              postSaveMessage.style.opacity =
                "1";

            },
            600
          );

      },
      2000
    );

}



/* =========================================================
   HTML처럼 보이는 입력을
   일반 텍스트로 정리

   지금 단계에서는
   스크립트 실행/HTML 렌더링 없이
   안전하게 텍스트로만 사용한다.
========================================================== */

function normalizePostText(
  text
) {

  if (
    !text
  ) {
    return "";
  }


  /*
    <br> 계열은 줄바꿈으로
  */

  let normalized =
    text.replace(
      /<br\s*\/?>/gi,
      "\n"
    );


  /*
    p / div 닫는 태그는
    문단 줄바꿈으로
  */

  normalized =
    normalized.replace(
      /<\/p>/gi,
      "\n\n"
    );


  normalized =
    normalized.replace(
      /<\/div>/gi,
      "\n"
    );


  /*
    나머지 HTML 태그 제거
  */

  const temp =
    document.createElement(
      "div"
    );


  temp.innerHTML =
    normalized;


  normalized =
    temp.textContent ||
    temp.innerText ||
    "";


  /*
    줄바꿈 정리
  */

  normalized =
    normalized
      .replace(
        /\r\n/g,
        "\n"
      )
      .replace(
        /\n{3,}/g,
        "\n\n"
      )
      .trim();


  return normalized;

}



/* =========================================================
   카테고리 불러오기
========================================================== */

async function loadPostCategories() {

  if (
    !postCategory
  ) {
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

    console.error(
      "post category user error:",
      userError
    );


    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "categories"
      )
      .select(
        "id, name, sort_order"
      )
      .eq(
        "user_id",
        userData.user.id
      )
      .order(
        "sort_order",
        {
          ascending: true
        }
      );


  if (
    error
  ) {

    console.error(
      "post category load error:",
      error
    );


    return;

  }


  postCategory.innerHTML =
    '<option value="">select</option>';


  data.forEach(
    category => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        category.id;


      option.textContent =
        category.name;


      postCategory.appendChild(
        option
      );

    }
  );

}



/* =========================================================
   WRITE 미리보기
========================================================== */

function updatePostPreview() {

  if (
    !postPreview ||
    !postPreviewTitle ||
    !postPreviewContent
  ) {
    return;
  }


  const title =
    postTitle
      ?.value
      .trim() ||
    "";


  const content =
    normalizePostText(
      postContent?.value || ""
    );


  postPreviewTitle.textContent =
    title || "untitled";


  postPreviewContent.innerHTML =
    "";


  /*
    빈 줄 기준 문단 분리
  */

  const paragraphs =
    content
      ? content.split(
          /\n\s*\n/
        )
      : [];


  paragraphs.forEach(
    paragraphText => {

      const paragraph =
        document.createElement(
          "p"
        );


      paragraph.textContent =
        paragraphText;


      paragraph.style.whiteSpace =
        "pre-wrap";


      postPreviewContent.appendChild(
        paragraph
      );

    }
  );


  postPreview.hidden =
    false;

}



