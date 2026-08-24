/* =========================================================
   SETTINGS 요소
========================================================== */

const aboutInput =
  document.getElementById(
    "aboutInput"
  );


const noticeInput =
  document.getElementById(
    "noticeInput"
  );


const ngInput =
  document.getElementById(
    "ngInput"
  );


const saveButton =
  document.getElementById(
    "saveButton"
  );


const saveMessage =
  document.getElementById(
    "saveMessage"
  );


const bgmUrlInput =
  document.getElementById(
    "bgmUrlInput"
  );


const bgmSaveButton =
  document.getElementById(
    "bgmSaveButton"
  );


const bgmSaveMessage =
  document.getElementById(
    "bgmSaveMessage"
  );

  const profileTabButton =
  document.getElementById(
    "profileTabButton"
  );


const categoryTabButton =
  document.getElementById(
    "categoryTabButton"
  );


const bgmTabButton =
  document.getElementById(
    "bgmTabButton"
  );


const profileSettingsPanel =
  document.getElementById(
    "profileSettingsPanel"
  );


const categorySettingsPanel =
  document.getElementById(
    "categorySettingsPanel"
  );


const bgmSettingsPanel =
  document.getElementById(
    "bgmSettingsPanel"
  );

const categoryList =
  document.getElementById(
    "categoryList"
  );


const addCategoryButton =
  document.getElementById(
    "addCategoryButton"
  );


const categorySaveButton =
  document.getElementById(
    "categorySaveButton"
  );


const categorySaveMessage =
  document.getElementById(
    "categorySaveMessage"
  );


let categories =
  [];


let deletedCategoryIds =
  [];

/* =========================================================
   PROFILE 불러오기
========================================================== */

/* =========================================================
   SETTINGS 내부 탭
========================================================== */

function showSettingsSection(
  section
) {

  profileSettingsPanel.hidden =
    section !== "profile";


  categorySettingsPanel.hidden =
    section !== "category";


  bgmSettingsPanel.hidden =
    section !== "bgm";


  profileTabButton.classList.toggle(
    "active",
    section === "profile"
  );


  categoryTabButton.classList.toggle(
    "active",
    section === "category"
  );


  bgmTabButton.classList.toggle(
    "active",
    section === "bgm"
  );

}


profileTabButton.addEventListener(
  "click",
  () => {

    showSettingsSection(
      "profile"
    );

  }
);


categoryTabButton.addEventListener(
  "click",
  () => {

    showSettingsSection(
      "category"
    );

  }
);


bgmTabButton.addEventListener(
  "click",
  () => {

    showSettingsSection(
      "bgm"
    );

  }
);

async function loadContent(
  user
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "site_content"
      )
      .select(
        "section, content"
      )
      .eq(
        "user_id",
        user.id
      );


  if (error) {

    console.error(
      "load content error:",
      error
    );


    saveMessage.textContent =
      "내용을 불러오지 못했습니다.";


    return;

  }


  const contentMap =
    {};


  data.forEach(
    row => {

      contentMap[
        row.section
      ] =
        row.content || "";

    }
  );


  aboutInput.value =
    contentMap.about || "";


  noticeInput.value =
    contentMap.notice || "";


  ngInput.value =
    contentMap.ng || "";

}



/* =========================================================
   BGM 불러오기
========================================================== */

async function loadBgm(
  user
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "site_settings"
      )
      .select(
        "value"
      )
      .eq(
        "key",
        "bgm_url"
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();


  if (error) {

    console.error(
      "load bgm error:",
      error
    );


    bgmSaveMessage.textContent =
      "BGM을 불러오지 못했습니다.";


    return;

  }


  bgmUrlInput.value =
    data?.value || "";

}

async function loadCategories(
  user
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "categories"
      )
      .select(
        "id, name, slug, sort_order"
      )
      .eq(
        "user_id",
        user.id
      )
      .order(
        "sort_order",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "load categories error:",
      error
    );


    categorySaveMessage.textContent =
      "카테고리를 불러오지 못했습니다.";


    return;

  }


  categories =
    data;


  deletedCategoryIds =
    [];


  renderCategories();

}


function renderCategories() {

  categoryList.innerHTML =
    "";


  categories.forEach(
    (
      category,
      index
    ) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "category-item";


      const input =
        document.createElement(
          "input"
        );


      input.type =
        "text";


      input.className =
        "category-name-input";


      input.value =
        category.name;


      input.addEventListener(
        "input",
        () => {

          category.name =
            input.value;

        }
      );


      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "category-actions";


      const upButton =
        document.createElement(
          "button"
        );


      upButton.type =
        "button";


      upButton.className =
        "category-action";


      upButton.textContent =
        "↑";


      upButton.disabled =
        index === 0;


      upButton.addEventListener(
        "click",
        () => {

          moveCategory(
            index,
            -1
          );

        }
      );


      const downButton =
        document.createElement(
          "button"
        );


      downButton.type =
        "button";


      downButton.className =
        "category-action";


      downButton.textContent =
        "↓";


      downButton.disabled =
        index ===
        categories.length - 1;


      downButton.addEventListener(
        "click",
        () => {

          moveCategory(
            index,
            1
          );

        }
      );


      const deleteButton =
        document.createElement(
          "button"
        );


      deleteButton.type =
        "button";


      deleteButton.className =
        "category-action delete";


      deleteButton.textContent =
        "×";


      deleteButton.addEventListener(
        "click",
        () => {

          removeCategory(
            index
          );

        }
      );


      actions.append(
        upButton,
        downButton,
        deleteButton
      );


      item.append(
        input,
        actions
      );


      categoryList.appendChild(
        item
      );

    }
  );

}


function moveCategory(
  index,
  direction
) {

  const newIndex =
    index + direction;


  if (
    newIndex < 0 ||
    newIndex >= categories.length
  ) {
    return;
  }


  const temp =
    categories[index];


  categories[index] =
    categories[newIndex];


  categories[newIndex] =
    temp;


  renderCategories();

}


function removeCategory(
  index
) {

  const category =
    categories[index];


  if (category.id) {

    deletedCategoryIds.push(
      category.id
    );

  }


  categories.splice(
    index,
    1
  );


  renderCategories();

}


function addCategory() {

  categories.push({

    id:
      null,

    name:
      "NEW CATEGORY",

    slug:
      `category-${Date.now()}`,

    sort_order:
      categories.length + 1

  });


  renderCategories();

}


addCategoryButton.addEventListener(
  "click",
  addCategory
);

/* =========================================================
   SETTINGS 전체 불러오기
========================================================== */

async function loadAdminSettings(
  user
) {

  await loadContent(
    user
  );


  await loadBgm(
    user
  );

  await loadCategories(
  user
);

}



/* =========================================================
   PROFILE 저장
========================================================== */

saveButton
  .addEventListener(
    "click",
    async () => {

      const {
        data:
        userData,

        error:
        userError
      } =
        await supabaseClient
          .auth
          .getUser();


      if (
        userError ||
        !userData.user
      ) {

        saveMessage.textContent =
          "로그인이 필요합니다.";


        return;

      }


      const user =
        userData.user;


      saveButton.disabled =
        true;


      saveMessage.textContent =
        "저장 중...";


      const updates = [

        {
          section:
            "about",

          content:
            aboutInput.value
        },

        {
          section:
            "notice",

          content:
            noticeInput.value
        },

        {
          section:
            "ng",

          content:
            ngInput.value
        }

      ];


      for (
        const item
        of updates
      ) {

        const {
          error
        } =
          await supabaseClient
            .from(
              "site_content"
            )
            .update({

              content:
                item.content

            })
            .eq(
              "section",
              item.section
            )
            .eq(
              "user_id",
              user.id
            );


        if (error) {

          console.error(
            "save error:",
            error
          );


          saveMessage.textContent =
            "저장에 실패했습니다.";


          saveButton.disabled =
            false;


          return;

        }

      }


      saveMessage.textContent =
        "saved ♡";


      saveButton.disabled =
        false;

    }
  );



/* =========================================================
   BGM 저장
========================================================== */

bgmSaveButton
  .addEventListener(
    "click",
    async () => {

      const {
        data:
        userData,

        error:
        userError
      } =
        await supabaseClient
          .auth
          .getUser();


      if (
        userError ||
        !userData.user
      ) {

        bgmSaveMessage.textContent =
          "로그인이 필요합니다.";


        return;

      }


      const user =
        userData.user;


      const bgmUrl =
        bgmUrlInput
          .value
          .trim();


      bgmSaveButton.disabled =
        true;


      bgmSaveMessage.textContent =
        "저장 중...";


      const {
        error
      } =
        await supabaseClient
          .from(
            "site_settings"
          )
          .upsert(
            {

              user_id:
                user.id,

              key:
                "bgm_url",

              value:
                bgmUrl

            },
            {

              onConflict:
                "user_id,key"

            }
          );


      if (error) {

        console.error(
          "bgm save error:",
          error
        );


        bgmSaveMessage.textContent =
          "저장에 실패했습니다.";


        bgmSaveButton.disabled =
          false;


        return;

      }


      bgmSaveMessage.textContent =
        "saved ♡";


      bgmSaveButton.disabled =
        false;

    }
  );

  /* =========================================================
   CATEGORIES 저장
========================================================== */

categorySaveButton
  .addEventListener(
    "click",
    async () => {

      const {
        data:
        userData,

        error:
        userError
      } =
        await supabaseClient
          .auth
          .getUser();


      if (
        userError ||
        !userData.user
      ) {

        categorySaveMessage.textContent =
          "로그인이 필요합니다.";

        return;

      }


      const user =
        userData.user;


      /* 이름 비어있는 항목 제외 */

      const validCategories =
        categories.filter(
          category =>
            category.name
              .trim()
              .length > 0
        );


      if (
        validCategories.length === 0
      ) {

        categorySaveMessage.textContent =
          "카테고리를 하나 이상 남겨주세요.";

        return;

      }


      categorySaveButton.disabled =
        true;


      categorySaveMessage.textContent =
        "저장 중...";


      /* =====================================================
         삭제된 카테고리 DB에서 삭제
      ====================================================== */

      if (
        deletedCategoryIds.length > 0
      ) {

        const {
          error:
          deleteError
        } =
          await supabaseClient
            .from(
              "categories"
            )
            .delete()
            .in(
              "id",
              deletedCategoryIds
            )
            .eq(
              "user_id",
              user.id
            );


        if (deleteError) {

          console.error(
            "category delete error:",
            deleteError
          );


          categorySaveMessage.textContent =
            "저장에 실패했습니다.";


          categorySaveButton.disabled =
            false;


          return;

        }

      }


      /* =====================================================
         기존 항목 수정 / 새 항목 추가
      ====================================================== */

      for (
        let i = 0;
        i <
        validCategories.length;
        i += 1
      ) {

        const category =
          validCategories[i];


        const sortOrder =
          i + 1;


        /* 기존 카테고리 */

        if (
          category.id
        ) {

          const {
            error:
            updateError
          } =
            await supabaseClient
              .from(
                "categories"
              )
              .update({

                name:
                  category.name
                    .trim(),

                sort_order:
                  sortOrder

              })
              .eq(
                "id",
                category.id
              )
              .eq(
                "user_id",
                user.id
              );


          if (updateError) {

            console.error(
              "category update error:",
              updateError
            );


            categorySaveMessage.textContent =
              "저장에 실패했습니다.";


            categorySaveButton.disabled =
              false;


            return;

          }

        }

        /* 새 카테고리 */

        else {

          const {
            error:
            insertError
          } =
            await supabaseClient
              .from(
                "categories"
              )
              .insert({

                user_id:
                  user.id,

                name:
                  category.name
                    .trim(),

                slug:
                  category.slug,

                sort_order:
                  sortOrder

              });


          if (insertError) {

            console.error(
              "category insert error:",
              insertError
            );


            categorySaveMessage.textContent =
              "저장에 실패했습니다.";


            categorySaveButton.disabled =
              false;


            return;

          }

        }

      }


      categorySaveMessage.textContent =
        "saved ♡";


      categorySaveButton.disabled =
        false;


      /* 새로 생성된 id까지 다시 맞추기 */

      await loadCategories(
        user
      );

    }
  );