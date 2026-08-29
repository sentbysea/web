/* =========================================================
   QUOTE - RENDER / LOAD PRESET LIST

   admin-quote.js 분할본. DOM 참조/상태는
   admin-quote-refs.js에 있음(반드시 먼저 로드돼야 함).

   내용: 저장된 프리셋 목록을 화면에 그리기, DB에서 목록
   불러오기(loadQuotePresets).
========================================================== */


/* =========================================================
   SAVE 버튼 활성/비활성

   save는 "지금 선택된 프리셋에 덮어쓰기"라 선택된 프리셋이
   없을 때는(currentQuotePresetId 없음) 누를 게 없으므로
   비활성화한다. new는 항상 누를 수 있어서 손대지 않음.
========================================================== */

function syncQuotePresetSaveButton() {

  if (!quoteSaveButton) {
    return;
  }


  quoteSaveButton.disabled =
    !currentQuotePresetId;

}


/* =========================================================
   RENDER PRESETS
========================================================== */

function renderQuotePresets(
  presets
) {

  ensureQuotePresetList();

  syncQuotePresetSaveButton();


  if (!quotePresetList) {
    return;
  }


  quotePresetList.innerHTML =
    "";


  if (
    presets.length === 0
  ) {

    const empty =
      document.createElement(
        "p"
      );


    empty.className =
      "quote-preset-empty";


    empty.textContent =
      "saved preset 없음";


    quotePresetList.appendChild(
      empty
    );


    return;

  }


  presets.forEach(
    preset => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "quote-preset-item";


      if (
        preset.id ===
        currentQuotePresetId
      ) {

        item.classList.add(
          "active"
        );

      }


      if (
        preset.is_active
      ) {

        item.classList.add(
          "is-live"
        );

      }


      /* ACTIVATE (실제 프리뷰/게시글에 반영될 프리셋으로 지정) */

      const activateButton =
        document.createElement(
          "button"
        );


      activateButton.type =
        "button";


      activateButton.className =
        "quote-preset-activate";


      activateButton.disabled =
        Boolean(
          preset.is_active
        );


      activateButton.textContent =
        preset.is_active
          ? "사용 중"
          : "사용 중으로 설정";


      activateButton.addEventListener(
        "click",
        async () => {

          await activateQuotePreset(
            preset.id
          );

        }
      );


      /* LOAD */

      const loadButton =
        document.createElement(
          "button"
        );


      loadButton.type =
        "button";


      loadButton.className =
        "quote-preset-load";


      loadButton.textContent =
        preset.name;


      loadButton.addEventListener(
        "click",
        () => {

          currentQuotePresetId =
            preset.id;


          if (quotePresetName) {

            quotePresetName.value =
              preset.name;

          }


          applyQuoteSettings(
            preset.settings ||
            {}
          );


          showQuoteMessage(
            "preset loaded ♡",
            true
          );


          renderQuotePresets(
            presets
          );

        }
      );


      /* DELETE */

      const deleteButton =
        document.createElement(
          "button"
        );


      deleteButton.type =
        "button";


      deleteButton.className =
        "quote-preset-delete";


      deleteButton.textContent =
        "×";


      deleteButton.addEventListener(
        "click",
        async () => {

          await deleteQuotePreset(
            preset.id
          );

        }
      );


      item.append(
        activateButton,
        loadButton,
        deleteButton
      );


      quotePresetList.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   LOAD PRESETS
========================================================== */

async function loadQuotePresets() {

  ensureQuotePresetList();


  if (!quotePresetList) {
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
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .select(
        "id, name, settings, updated_at, is_active"
      )
      .eq(
        "user_id",
        userData.user.id
      )
      .order(
        "updated_at",
        {
          ascending:
            false
        }
      );


  if (error) {

    console.error(
      "quote preset load error:",
      error
    );


    return;

  }


  renderQuotePresets(
    data || []
  );

}


