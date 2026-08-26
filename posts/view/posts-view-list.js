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
        getPostVisibilityPrefix(
          post.visibility
        ) +
        (
          post.title ||
          "untitled"
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


      postList.appendChild(
        item
      );

    }
  );

}



