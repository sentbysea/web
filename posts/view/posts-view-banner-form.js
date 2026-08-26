/* =========================================================
   POSTS VIEW - BANNER ADD/EDIT FORM

   posts-view-banner.js 분할본. DOM 참조/상태는
   posts/editor/posts-refs.js에 있음, renderBannerGrid 등은
   posts-view-banner.js에 있음(둘 다 이 파일보다 먼저
   로드돼야 함).

   내용: 배너 추가/수정 폼 열기/닫기, 이미지 URL 미리보기,
   저장(insert/update), 삭제.
========================================================== */


/* =========================================================
   폼 열기/닫기
========================================================== */

function openBannerForm(
  banner =
    null
) {

  editingBannerId =
    banner
      ? banner.id
      : null;


  if (
    bannerEditorHeading
  ) {

    bannerEditorHeading.textContent =
      banner
        ? "EDIT BANNER"
        : "ADD BANNER";

  }


  if (bannerEditorName) {

    bannerEditorName.value =
      banner?.name ||
      "";

  }


  if (bannerEditorUrl) {

    bannerEditorUrl.value =
      banner?.url ||
      "";

  }


  if (
    bannerEditorImageUrl
  ) {

    bannerEditorImageUrl.value =
      banner?.image_url ||
      "";

  }


  updateBannerEditorPreview();


  if (
    bannerEditorDelete
  ) {

    bannerEditorDelete.hidden =
      !banner;

  }


  if (
    bannerEditorMessage
  ) {

    bannerEditorMessage.textContent =
      "";

  }


  if (bannerGrid) {

    bannerGrid.hidden =
      true;

  }


  if (bannerEditor) {

    bannerEditor.hidden =
      false;

  }


  bannerEditorName
    ?.focus();

}


function closeBannerForm() {

  editingBannerId =
    null;


  if (bannerEditor) {

    bannerEditor.hidden =
      true;

  }


  if (bannerGrid) {

    bannerGrid.hidden =
      false;

  }

}


function updateBannerEditorPreview() {

  if (
    !bannerEditorPreview
  ) {
    return;
  }


  const url =
    bannerEditorImageUrl
      ?.value
      .trim() ||
    "";


  if (!url) {

    bannerEditorPreview.hidden =
      true;


    bannerEditorPreview.removeAttribute(
      "src"
    );


    return;

  }


  bannerEditorPreview.src =
    url;


  bannerEditorPreview.hidden =
    false;

}



/* =========================================================
   저장 / 삭제
========================================================== */

async function saveBannerForm() {

  const name =
    bannerEditorName
      ?.value
      .trim() ||
    "";


  const url =
    bannerEditorUrl
      ?.value
      .trim() ||
    "";


  const imageUrl =
    bannerEditorImageUrl
      ?.value
      .trim() ||
    "";


  if (
    !url ||
    !imageUrl
  ) {

    if (
      bannerEditorMessage
    ) {

      bannerEditorMessage.textContent =
        "url / 이미지 url을 입력해주세요.";

    }

    return;

  }


  const user =
    await getSignedInUser();


  if (!user) {

    if (
      bannerEditorMessage
    ) {

      bannerEditorMessage.textContent =
        "로그인이 필요합니다.";

    }

    return;

  }


  if (
    bannerEditorSave
  ) {

    bannerEditorSave.disabled =
      true;

  }


  const error =
    editingBannerId
      ? (
          await supabaseClient
            .from(
              "banners"
            )
            .update({
              name,
              url,
              image_url:
                imageUrl
            })
            .eq(
              "id",
              editingBannerId
            )
            .eq(
              "user_id",
              user.id
            )
        ).error
      : (
          await supabaseClient
            .from(
              "banners"
            )
            .insert({
              category_id:
                currentPostCategoryId,

              user_id:
                user.id,

              name,
              url,

              image_url:
                imageUrl,

              sort_order:
                currentBanners.length
            })
        ).error;


  if (
    bannerEditorSave
  ) {

    bannerEditorSave.disabled =
      false;

  }


  if (error) {

    console.error(
      error
    );


    if (
      bannerEditorMessage
    ) {

      bannerEditorMessage.textContent =
        "저장하지 못했습니다.";

    }

    return;

  }


  closeBannerForm();


  await refreshBannerList();

}


/*
  저장/삭제 뒤 그리드만 다시 불러온다. renderBannerCategory와
  달리 edit 모드/소유자 여부는 건드리지 않는다(방금 그 모드로
  폼을 열었던 것이므로 그대로 유지되어야 자연스러움).
*/

async function refreshBannerList() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "banners"
      )
      .select(
        "id, name, url, image_url, sort_order"
      )
      .eq(
        "category_id",
        currentPostCategoryId
      )
      .order(
        "sort_order",
        {
          ascending:
            true
        }
      );


  if (error) {

    console.error(
      error
    );

    return;

  }


  currentBanners =
    data ||
    [];


  renderBannerGrid();

}


async function deleteBannerFromEditor() {

  if (
    !editingBannerId
  ) {
    return;
  }


  await deleteBanner(
    editingBannerId
  );


  closeBannerForm();

}


async function deleteBanner(
  id
) {

  if (
    !confirm(
      "이 배너를 삭제할까요?"
    )
  ) {
    return;
  }


  const user =
    await getSignedInUser();


  if (!user) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from(
        "banners"
      )
      .delete()
      .eq(
        "id",
        id
      )
      .eq(
        "user_id",
        user.id
      );


  if (error) {

    console.error(
      error
    );

    return;

  }


  currentBanners =
    currentBanners.filter(
      banner =>
        banner.id !==
        id
    );


  renderBannerGrid();

}
