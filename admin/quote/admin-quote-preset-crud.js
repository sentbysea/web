/* =========================================================
   QUOTE - SAVE / DELETE / ACTIVATE PRESET, INIT

   admin-quote.js 분할본 중 마지막. DOM 참조/상태는
   admin-quote-refs.js에 있음(반드시 먼저 로드돼야 함).

   내용: 프리셋 저장/삭제/"사용 중" 지정, 저장 버튼 이벤트,
   QUOTE 패널 열기, 로그인 확인, 페이지 로드 시 초기 실행부
   (여기서 실제로 함수들을 호출하므로 이 파일이
   admin/quote/ 안에서 제일 마지막에 로드돼야 함).
========================================================== */


/* =========================================================
   SAVE PRESET
========================================================== */

async function saveQuotePreset() {

  const presetName =
    quotePresetName
      ?.value
      .trim() ||
    "";


  if (!presetName) {

    showQuoteMessage(
      "프리셋 이름을 입력해주세요."
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

    showQuoteMessage(
      "로그인이 필요합니다."
    );


    return;

  }


  const user =
    userData.user;


  const settings =
    collectQuoteSettings();


  if (quoteSaveButton) {

    quoteSaveButton.disabled =
      true;

  }


  showQuoteMessage(
    "저장 중..."
  );


  /* UPDATE */

  if (
    currentQuotePresetId
  ) {

    const {
      error
    } =
      await supabaseClient
        .from(
          "quote_presets"
        )
        .update({

          name:
            presetName,

          settings:
            settings,

          updated_at:
            new Date()
              .toISOString()

        })
        .eq(
          "id",
          currentQuotePresetId
        )
        .eq(
          "user_id",
          user.id
        );


    if (error) {

      console.error(
        "quote preset update error:",
        error
      );


      showQuoteMessage(
        "저장에 실패했습니다."
      );


      quoteSaveButton.disabled =
        false;


      return;

    }

  }


  /* INSERT */

  else {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "quote_presets"
        )
        .insert({

          user_id:
            user.id,

          name:
            presetName,

          settings:
            settings,

          updated_at:
            new Date()
              .toISOString()

        })
        .select(
          "id"
        )
        .single();


    if (error) {

      console.error(
        "quote preset insert error:",
        error
      );


      showQuoteMessage(
        "저장에 실패했습니다."
      );


      quoteSaveButton.disabled =
        false;


      return;

    }


    currentQuotePresetId =
      data.id;

  }


  quoteSaveButton.disabled =
    false;


  showQuoteMessage(
    "saved ♡",
    true
  );


  await loadQuotePresets();

}


/* =========================================================
   DELETE PRESET
========================================================== */

async function deleteQuotePreset(
  presetId
) {

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
    error
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .delete()
      .eq(
        "id",
        presetId
      )
      .eq(
        "user_id",
        userData.user.id
      );


  if (error) {

    console.error(
      "quote preset delete error:",
      error
    );


    showQuoteMessage(
      "삭제에 실패했습니다."
    );


    return;

  }


  if (
    currentQuotePresetId ===
    presetId
  ) {

    currentQuotePresetId =
      null;


    if (quotePresetName) {

      quotePresetName.value =
        "";

    }

  }


  showQuoteMessage(
    "deleted ♡",
    true
  );


  await loadQuotePresets();

}


/* =========================================================
   ACTIVATE PRESET

   "사용 중"으로 지정한 프리셋이 실제 발행된 글
   (posts/style/posts-style-preset.js의 loadPostStylePreset)에도 그대로 적용됨.
   한 유저당 하나만 사용 중일 수 있으므로, 지정한 것만 켜고
   나머지는 전부 끈다.
========================================================== */

async function activateQuotePreset(
  presetId
) {

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
    error: clearError
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .update(
        {
          is_active: false
        }
      )
      .eq(
        "user_id",
        userData.user.id
      );


  if (clearError) {

    console.error(
      "quote preset activate(clear) error:",
      clearError
    );


    showQuoteMessage(
      "적용에 실패했습니다."
    );


    return;

  }


  const {
    error: setError
  } =
    await supabaseClient
      .from(
        "quote_presets"
      )
      .update(
        {
          is_active: true
        }
      )
      .eq(
        "id",
        presetId
      )
      .eq(
        "user_id",
        userData.user.id
      );


  if (setError) {

    console.error(
      "quote preset activate(set) error:",
      setError
    );


    showQuoteMessage(
      "적용에 실패했습니다."
    );


    return;

  }


  showQuoteMessage(
    "이 프리셋이 실제 글에도 적용됩니다 ♡",
    true
  );


  await loadQuotePresets();

}


/* =========================================================
   SAVE EVENT
========================================================== */

quoteSaveButton
  ?.addEventListener(
    "click",
    saveQuotePreset
  );


/* =========================================================
   QUOTE OPEN
========================================================== */

const openQuoteButtonForPresets =
  document.getElementById(
    "openQuoteButton"
  );


openQuoteButtonForPresets
  ?.addEventListener(
    "click",
    () => {

      setTimeout(
        loadQuotePresets,
        0
      );

    }
  );


/* =========================================================
   AUTH
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

        loadQuotePresets();

      }

    }
  );


/* =========================================================
   START
========================================================== */

ensureQuotePresetList();

restoreQuoteAccordionState();

updateQuotePreview();


window.addEventListener(
  "load",
  loadQuotePresets
);