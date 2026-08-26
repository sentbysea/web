/* =========================================================
   POSTS VIEW - CATEGORY / LIST

   posts-view.js 분할본. DOM 참조/상태는
   posts/editor/posts-refs.js에 있음(반드시 먼저 로드돼야 함).
========================================================== */


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
        "id, name, type"
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


  currentPostCategoryType =
    category.type ||
    "post";


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


  if (
    currentPostCategoryType ===
    "banner"
  ) {

    if (postList) {

      postList.hidden =
        true;

    }


    await renderBannerCategory(
      categoryId
    );


    return;

  }


  if (bannerGrid) {

    bannerGrid.hidden =
      true;

  }


  if (bannerEditor) {

    bannerEditor.hidden =
      true;

  }


  if (
    bannerEditToggleButton
  ) {

    bannerEditToggleButton.hidden =
      true;

  }


  postListEditModeOn =
    false;


  selectedPostIdsForDelete =
    new Set();


  if (
    postListSelectBar
  ) {

    postListSelectBar.hidden =
      true;

  }


  postListEditToggleButton
    ?.setAttribute(
      "aria-pressed",
      "false"
    );


  postList.hidden =
    false;


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
        created_at,
        visibility
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


  currentCategoryPosts =
    posts ||
    [];


  renderPostListItems();

}



/* =========================================================
   POST LIST 렌더

   글 목록 편집(선택 삭제) 모드 여부에 따라 아이템을
   <a>(눌러서 글로 이동) 또는 <div>(눌러서 체크 토글)로
   그린다. 실제 선택/삭제 동작은 posts-view-list-select.js.
========================================================== */

function renderPostListItems() {

  if (!postList) {
    return;
  }


  postList.innerHTML =
    "";


  if (
    currentCategoryPosts.length === 0
  ) {

    postList.innerHTML =
      `
        <div class="post-empty">
          no posts yet
        </div>
      `;


    return;

  }


  currentCategoryPosts.forEach(
    post => {

      postList.appendChild(
        postListEditModeOn
          ? createSelectablePostListItem(
              post
            )
          : createPostListItem(
              post
            )
      );

    }
  );

}


function createPostListItem(
  post
) {

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


  applyPostVisibilityTitle(
    title,
    post.visibility,
    post.title
  );


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


  return item;

}



