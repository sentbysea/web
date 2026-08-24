/* =========================================================
   POSTS - VIEW (화면 전환)

   posts.js에서 분리됨.

   post*(DOM 요소), current*(상태), postCurtainAnimation 등은
   posts.js에 있음 (같은 페이지에서 함께 로드되어야 함).
========================================================== */

/* =========================================================
   POST TRANSITION
========================================================== */

async function showPostArea() {

  if (!postArea) {
    return;
  }


  if (
    !postArea.hidden &&
    currentPostView !== "home"
  ) {

    document.body.classList.add(
      "post-mode"
    );

    return;

  }


  if (postCurtainAnimation) {

    postCurtainAnimation.cancel();

    postCurtainAnimation =
      null;

  }


  postArea.classList.remove(
    "is-opening",
    "is-closing",
    "is-visible"
  );


  postArea.style.transition =
    "none";

  postArea.style.opacity =
    "0";

  postArea.style.background =
    "rgba(255, 255, 255, 0.30)";

  postArea.style.backdropFilter =
    "blur(0px)";

  postArea.style.webkitBackdropFilter =
    "blur(0px)";

  postArea.style.pointerEvents =
    "none";


  postArea.hidden =
    false;


  document.body.classList.add(
    "post-mode"
  );


  await new Promise(
    resolve => {

      requestAnimationFrame(
        () => {

          requestAnimationFrame(
            resolve
          );

        }
      );

    }
  );


  postCurtainAnimation =
    postArea.animate(
      [
        {
          opacity: 0,
          background:
            "rgba(255, 255, 255, 0.30)",
          backdropFilter:
            "blur(0px)"
        },

        {
          opacity: 0.48,
          background:
            "rgba(255, 255, 255, 0.68)",
          backdropFilter:
            "blur(1.5px)",
          offset: 0.42
        },

        {
          opacity: 1,
          background:
            "rgba(255, 255, 255, 0.98)",
          backdropFilter:
            "blur(5px)"
        }
      ],
      {
        duration: 380,
        easing: "ease",
        fill: "forwards"
      }
    );


  try {

    await postCurtainAnimation.finished;

  } catch {

    return;

  }


  postArea.style.opacity =
    "1";

  postArea.style.background =
    "rgba(255, 255, 255, 0.98)";

  postArea.style.backdropFilter =
    "blur(5px)";

  postArea.style.webkitBackdropFilter =
    "blur(5px)";

  postArea.style.pointerEvents =
    "auto";


  postCurtainAnimation.cancel();

  postCurtainAnimation =
    null;

}



/* =========================================================
   POST TRANSITION OUT
========================================================== */

async function hidePostAreaCurtain() {

  if (
    !postArea ||
    postArea.hidden
  ) {
    return;
  }


  if (postCurtainAnimation) {

    postCurtainAnimation.cancel();

    postCurtainAnimation =
      null;

  }


  postArea.style.transition =
    "none";

  postArea.style.pointerEvents =
    "none";


  postCurtainAnimation =
    postArea.animate(
      [
        {
          opacity: 1,
          background:
            "rgba(255, 255, 255, 0.98)",
          backdropFilter:
            "blur(5px)"
        },

        {
          opacity: 0.48,
          background:
            "rgba(255, 255, 255, 0.68)",
          backdropFilter:
            "blur(1.5px)",
          offset: 0.58
        },

        {
          opacity: 0,
          background:
            "rgba(255, 255, 255, 0.30)",
          backdropFilter:
            "blur(0px)"
        }
      ],
      {
        duration: 380,
        easing: "ease",
        fill: "forwards"
      }
    );


  try {

    await postCurtainAnimation.finished;

  } catch {

    return;

  }


  postCurtainAnimation.cancel();

  postCurtainAnimation =
    null;


  postArea.hidden =
    true;


  postArea.style.opacity =
    "";

  postArea.style.background =
    "";

  postArea.style.backdropFilter =
    "";

  postArea.style.webkitBackdropFilter =
    "";

  postArea.style.pointerEvents =
    "";


  document.body.classList.remove(
    "post-mode"
  );

}


/* =========================================================
   PREPARE EDITOR
========================================================== */

async function prepareEditorUI() {

  /*
    Vibe는 에디터 열 때마다 다시 읽음.

    QUOTE에서 색을 바꾼 뒤
    새로고침 없이 들어와도 최신값 사용.
  */

  await loadPostStylePreset();


  if (
    postEditorCustomColor
  ) {

    postEditorCustomColor.value =
      getPresetHighlightColor();

  }


  updatePresetHighlightSwatch();

  updateCustomHighlightSwatch();

  updateEditorToolbarState();

  updateEditorPreview();

  closeEditorPreview();

  syncEditorPreviewMode();

}



/* =========================================================
   EDITOR HIDE
========================================================== */

function hidePostEditor() {

  document.body.classList.remove(
    "post-editor-mode"
  );


  closeEditorPreview();


  if (
    postEditor
  ) {

    postEditor.hidden =
      true;

  }


  currentEditorMode =
    null;


  editorSourcePostId =
    null;


  savedEditorRange =
    null;


  if (
    postEditorMessage
  ) {

    postEditorMessage.textContent =
      "";

  }

}



/* =========================================================
   ADD BUTTON
========================================================== */

async function updatePostAddButton() {

  if (!postAddButton) {
    return;
  }


  postAddButton.hidden =
    true;


  const user =
    await getSignedInUser();


  if (
    user &&
    currentPostView ===
      "category"
  ) {

    postAddButton.hidden =
      false;

  }

}



/* =========================================================
   CLOSE → HOME
========================================================== */

async function closePostArea(
  options = {}
) {

  const {
    updateUrl = true,
    animate = true
  } = options;


  if (updateUrl) {

    history.pushState(
      {
        page: "home"
      },
      "",
      buildPostRoute("/")
    );

  }


  if (animate) {

    await hidePostAreaCurtain();

  }


  else {

    if (postArea) {

      postArea.hidden =
        true;

    }


    document.body.classList.remove(
      "post-mode"
    );

  }


  currentPostView =
    "home";


  currentPostId =
    null;


  currentPostCategoryId =
    null;


  currentPostOwnerId =
    null;


  hidePostEditor();


  if (postList) {

    postList.innerHTML =
      "";

    postList.hidden =
      false;

  }


  if (postDetail) {

    postDetail.hidden =
      true;

  }


  if (postAddButton) {

    postAddButton.hidden =
      true;

  }


  if (postDetailActions) {

    postDetailActions.hidden =
      true;

  }


  if (postRelated) {

    postRelated.hidden =
      true;

  }


  if (postPageTitle) {

    postPageTitle.textContent =
      "";

  }

}



/* =========================================================
   CATEGORY PAGE
========================================================== */

async function openCategoryPage(
  categoryId,
  options = {}
) {

  const {
    updateUrl = true
  } = options;


  if (
    !postArea ||
    !postList ||
    !postPageTitle
  ) {

    return;

  }


  const comingFromHome =
    currentPostView ===
      "home";


  if (comingFromHome) {

    await showPostArea();

  }


  currentPostCategoryId =
    Number(
      categoryId
    );


  currentPostId =
    null;


  currentPostView =
    "category";


  closePostMenu();


  if (postDetail) {

    postDetail.hidden =
      true;

  }


  hidePostEditor();


  postList.hidden =
    false;


  postPageTitle.textContent =
    "...";


  postList.innerHTML =
    `
      <div class="post-empty">
        loading...
      </div>
    `;


  const {
    data: category,
    error: categoryError
  } =
    await supabaseClient
      .from(
        "categories"
      )
      .select(
        "id, name"
      )
      .eq(
        "id",
        categoryId
      )
      .maybeSingle();


  if (
    categoryError ||
    !category
  ) {

    console.error(
      categoryError
    );


    postPageTitle.textContent =
      "CATEGORY";


    return;

  }


  postPageTitle.textContent =
    category.name;


  await updatePostAddButton();


  if (updateUrl) {

    history.pushState(
      {
        page:
          "category",

        categoryId:
          Number(
            categoryId
          )
      },
      "",
      buildPostRoute(
        `/category/${categoryId}`
      )
    );

  }


  const {
    data: posts,
    error: postsError
  } =
    await supabaseClient
      .from(
        "posts"
      )
      .select(
        `
        id,
        title,
        created_at
        `
      )
      .eq(
        "category_id",
        categoryId
      )
      .order(
        "created_at",
        {
          ascending:
            false
        }
      );


  if (postsError) {

    console.error(
      postsError
    );


    postList.innerHTML =
      `
        <div class="post-empty">
          failed to load
        </div>
      `;


    return;

  }


  postList.innerHTML =
    "";


  if (
    !posts ||
    posts.length === 0
  ) {

    postList.innerHTML =
      `
        <div class="post-empty">
          no posts yet
        </div>
      `;


    return;

  }


  posts.forEach(
    post => {

      const item =
        document.createElement(
          "a"
        );


      item.className =
        "post-list-item";


      item.href =
        buildPostRoute(
          `/post/${post.id}`
        );


      item.dataset.postId =
        post.id;


      const title =
        document.createElement(
          "span"
        );


      title.className =
        "post-list-title";


      title.textContent =
        post.title ||
        "untitled";


      const date =
        document.createElement(
          "span"
        );


      date.className =
        "post-list-date";


      date.textContent =
        formatPostListDate(
          post.created_at
        );


      item.append(
        title,
        date
      );


      postList.appendChild(
        item
      );

    }
  );

}



/* =========================================================
   POST PAGE
========================================================== */

async function openPostPage(
  postId,
  options = {}
) {

  const {
    updateUrl = true
  } = options;


  if (
    currentPostView ===
      "home"
  ) {

    await showPostArea();

  }


  currentPostView =
    "post";


  currentPostId =
    Number(
      postId
    );


  closePostMenu();


  if (postList) {

    postList.hidden =
      true;

  }


  hidePostEditor();


  if (postDetail) {

    postDetail.hidden =
      false;

  }


  if (postAddButton) {

    postAddButton.hidden =
      true;

  }


  if (postPageTitle) {

    postPageTitle.textContent =
      "";

  }


  if (postDetailTitle) {

    postDetailTitle.textContent =
      "loading...";

  }


  if (postDetailDate) {

    postDetailDate.textContent =
      "";

  }


  if (postDetailContent) {

    postDetailContent.textContent =
      "";

  }


  if (postDetailActions) {

    postDetailActions.hidden =
      true;

  }


  if (postRelated) {

    postRelated.hidden =
      true;

  }


  const {
    data: post,
    error
  } =
    await supabaseClient
      .from(
        "posts"
      )
      .select(
        `
        id,
        category_id,
        user_id,
        title,
        content,
        created_at
        `
      )
      .eq(
        "id",
        postId
      )
      .maybeSingle();


  if (
    error ||
    !post
  ) {

    console.error(
      error
    );


    postDetailTitle.textContent =
      "post not found";


    return;

  }


  currentPostId =
    Number(
      post.id
    );


  currentPostCategoryId =
    post.category_id
      ? Number(
          post.category_id
        )
      : null;


  currentPostOwnerId =
    post.user_id ||
    null;


  postDetailTitle.textContent =
    post.title ||
    "untitled";


  postDetailDate.textContent =
    formatPostDetailDate(
      post.created_at
    );


  await loadPostStylePreset();


  renderStyledPostContent(
    post.content || "",
    postStyleSettings || {}
  );


  let categoryName =
    "";


  if (
    post.category_id
  ) {

    const {
      data: category
    } =
      await supabaseClient
        .from(
          "categories"
        )
        .select(
          "name"
        )
        .eq(
          "id",
          post.category_id
        )
        .maybeSingle();


    categoryName =
      category?.name ||
      "";


    postPageTitle.textContent =
      categoryName;

  }


  await updatePostOwnerActions();


  await loadRelatedPosts(
    post.category_id,
    post.id,
    categoryName
  );


  if (updateUrl) {

    history.pushState(
      {
        page:
          "post",

        postId:
          Number(
            post.id
          )
      },
      "",
      buildPostRoute(
        `/post/${post.id}`
      )
    );

  }

}



/* =========================================================
   OWNER ACTIONS
========================================================== */

async function updatePostOwnerActions() {

  if (
    !postDetailActions
  ) {

    return;

  }


  postDetailActions.hidden =
    true;


  if (
    !currentPostOwnerId
  ) {

    return;

  }


  const user =
    await getSignedInUser();


  if (
    user &&
    user.id ===
      currentPostOwnerId
  ) {

    postDetailActions.hidden =
      false;

  }

}



/* =========================================================
   RELATED POSTS
========================================================== */

async function loadRelatedPosts(
  categoryId,
  currentId,
  categoryName = ""
) {

  if (
    !postRelated ||
    !postRelatedList ||
    !categoryId
  ) {

    return;

  }


  postRelated.hidden =
    false;


  postRelatedTitle.textContent =
    categoryName
      ? `MORE IN ${categoryName}`
      : "MORE POSTS";


  const {
    data: posts,
    error
  } =
    await supabaseClient
      .from(
        "posts"
      )
      .select(
        `
        id,
        title,
        created_at
        `
      )
      .eq(
        "category_id",
        categoryId
      )
      .order(
        "created_at",
        {
          ascending:
            false
        }
      );


  if (error) {

    console.error(
      error
    );

    return;

  }


  postRelatedList.innerHTML =
    "";


  (posts || []).forEach(
    post => {

      const item =
        document.createElement(
          "a"
        );


      item.className =
        "post-related-item";


      const isCurrent =
        Number(
          post.id
        ) ===
        Number(
          currentId
        );


      if (isCurrent) {

        item.classList.add(
          "current"
        );

      }


      else {

        item.href =
          buildPostRoute(
            `/post/${post.id}`
          );


        item.dataset.postId =
          post.id;

      }


      const title =
        document.createElement(
          "span"
        );


      title.className =
        "post-related-item-title";


      title.textContent =
        post.title ||
        "untitled";


      const date =
        document.createElement(
          "span"
        );


      date.className =
        "post-related-item-date";


      date.textContent =
        formatPostListDate(
          post.created_at
        );


      item.append(
        title,
        date
      );


      postRelatedList.appendChild(
        item
      );

    }
  );

}



/* =========================================================
   NEW EDITOR
========================================================== */

async function openNewPostEditor(
  categoryId
) {

  const user =
    await getSignedInUser();


  if (!user) {

    alert(
      "로그인이 필요합니다."
    );

    return;

  }


  currentPostView =
    "editor";


  currentEditorMode =
    "create";


  editorSourcePostId =
    null;


  if (postList) {

    postList.hidden =
      true;

  }


  if (postDetail) {

    postDetail.hidden =
      true;

  }


  if (postEditor) {

    postEditor.hidden =
      false;

  }


  document.body.classList.add(
    "post-editor-mode"
  );


  if (postAddButton) {

    postAddButton.hidden =
      true;

  }


  postPageTitle.textContent =
    "NEW POST";


  postEditorTitle.value =
    "";


  clearRichEditor();


  await loadPostEditorCategories(
    categoryId
  );


  await prepareEditorUI();


  postEditorTitle.focus();

}



/* =========================================================
   EDIT EDITOR
========================================================== */

async function openPostEditor(
  postId
) {

  const user =
    await getSignedInUser();


  if (!user) {

    alert(
      "로그인이 필요합니다."
    );

    return;

  }


  const {
    data: post,
    error
  } =
    await supabaseClient
      .from(
        "posts"
      )
      .select(
        `
        id,
        user_id,
        category_id,
        title,
        content
        `
      )
      .eq(
        "id",
        postId
      )
      .maybeSingle();


  if (
    error ||
    !post
  ) {

    return;

  }


  if (
    post.user_id !==
      user.id
  ) {

    alert(
      "수정 권한이 없습니다."
    );

    return;

  }


  currentPostView =
    "editor";


  currentEditorMode =
    "edit";


  editorSourcePostId =
    Number(
      post.id
    );


  currentPostCategoryId =
    post.category_id
      ? Number(
          post.category_id
        )
      : null;


  if (postList) {

    postList.hidden =
      true;

  }


  if (postDetail) {

    postDetail.hidden =
      true;

  }


  if (postEditor) {

    postEditor.hidden =
      false;

  }


  document.body.classList.add(
    "post-editor-mode"
  );


  if (postAddButton) {

    postAddButton.hidden =
      true;

  }


  postPageTitle.textContent =
    "EDIT POST";


  await loadPostEditorCategories(
    post.category_id
  );


  postEditorTitle.value =
    post.title ||
    "";


  /*
    저장된 rich HTML 또는
    예전 legacy 문법을
    에디터에 실제 스타일로 복원.
  */

  setRichEditorContent(
    post.content || ""
  );


  await prepareEditorUI();


  postEditorTitle.focus();

}



/* =========================================================
   CANCEL EDITOR
========================================================== */

async function cancelPostEditor() {

  const mode =
    currentEditorMode;


  const postId =
    editorSourcePostId;


  const categoryId =
    currentPostCategoryId;


  hidePostEditor();


  if (
    mode === "edit" &&
    postId
  ) {

    await openPostPage(
      postId,
      {
        updateUrl:
          false
      }
    );

    return;

  }


  if (categoryId) {

    currentPostView =
      "category";


    await openCategoryPage(
      categoryId,
      {
        updateUrl:
          false
      }
    );

  }

}
