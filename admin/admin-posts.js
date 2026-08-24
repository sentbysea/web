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



/* =========================================================
   글 저장
========================================================== */

async function savePost() {

  const categoryId =
    postCategory?.value ||
    "";


  const title =
    postTitle
      ?.value
      .trim() ||
    "";


  const content =
    normalizePostText(
      postContent?.value ||
      ""
    );


  /* 필수값 확인 */

  if (
    !categoryId
  ) {

    showPostMessage(
      "카테고리를 선택해주세요."
    );


    return;

  }


  if (
    !title
  ) {

    showPostMessage(
      "제목을 입력해주세요."
    );


    return;

  }


  if (
    !content
  ) {

    showPostMessage(
      "본문을 입력해주세요."
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

    showPostMessage(
      "로그인이 필요합니다."
    );


    return;

  }


  const user =
    userData.user;


  if (
    postSaveButton
  ) {

    postSaveButton.disabled =
      true;

  }


  showPostMessage(
    "저장 중..."
  );


  const {
    error
  } =
    await supabaseClient
      .from(
        "posts"
      )
      .insert({

        user_id:
          user.id,

        category_id:
          Number(
            categoryId
          ),

        title:
          title,

        content:
          content,

        updated_at:
          new Date()
            .toISOString()

      });


  if (
    error
  ) {

    console.error(
      "post save error:",
      error
    );


    showPostMessage(
      "저장에 실패했습니다."
    );


    if (
      postSaveButton
    ) {

      postSaveButton.disabled =
        false;

    }


    return;

  }



  /* 저장 성공 */

  showPostMessage(
    "saved ♡",
    true
  );


  if (
    postSaveButton
  ) {

    postSaveButton.disabled =
      false;

  }


  /*
    입력 초기화
  */

  if (
    postTitle
  ) {

    postTitle.value =
      "";

  }


  if (
    postContent
  ) {

    postContent.value =
      "";

  }


  if (
    postCategory
  ) {

    postCategory.value =
      "";

  }


  if (
    postPreview
  ) {

    postPreview.hidden =
      true;

  }

}



/* =========================================================
   PREVIEW
========================================================== */

postPreviewButton
  ?.addEventListener(
    "click",
    updatePostPreview
  );



/* =========================================================
   SAVE
========================================================== */

postSaveButton
  ?.addEventListener(
    "click",
    savePost
  );



/* =========================================================
   WRITE 들어올 때 카테고리 갱신
========================================================== */

const openWriteButtonForPosts =
  document.getElementById(
    "openWriteButton"
  );


openWriteButtonForPosts
  ?.addEventListener(
    "click",
    () => {

      setTimeout(
        loadPostCategories,
        0
      );

    }
  );



/* =========================================================
   로그인 후 카테고리 불러오기
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

        loadPostCategories();

      }

    }
  );



/* =========================================================
   최초 실행
========================================================== */

window.addEventListener(
  "load",
  loadPostCategories
);