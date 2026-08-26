/* =========================================================
   ADMIN - QUICK WRITE PANEL: SAVE

   admin-posts.js 분할본 중 마지막. DOM 참조/
   normalizePostText 등은 admin-posts.js에 있음(반드시
   먼저 로드돼야 함).

   본문(content)은 posts가 아니라 post_contents 테이블에
   저장됨 — 자세한 이유는 supabase/migrations/
   *_secret_private_posts.sql 참고. 이 패널엔 비밀글
   옵션이 없어서 항상 public으로 저장됨.
========================================================== */


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
    data: insertedPost,
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

        updated_at:
          new Date()
            .toISOString()

      })
      .select(
        "id"
      )
      .single();


  /*
    본문(content)은 posts가 아니라 post_contents 테이블에
    따로 저장됨 — 비밀글의 "제목은 목록에 보이되 본문만
    숨기기"를 DB RLS로 구현하려고 분리함(posts/editor/posts-save.js의
    savePostContentAndSecret, supabase/migrations/*_secret_
    private_posts.sql 참고). 이 패널엔 비밀글 옵션이 없어서
    항상 public으로 저장됨.
  */

  const contentError =
    error ||
    !insertedPost ?
      null :
      (
        await supabaseClient
          .from(
            "post_contents"
          )
          .insert({

            post_id:
              insertedPost.id,

            content:
              content

          })
      ).error;


  if (
    error ||
    contentError
  ) {

    console.error(
      "post save error:",
      error ||
      contentError
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