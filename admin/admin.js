/* =========================================================
   SUPABASE
========================================================== */

const SUPABASE_URL =
  "https://iokdgqzfprtggsnrusez.supabase.co";


const SUPABASE_KEY =
  "sb_publishable_N9mPjBMUQJEhKYPo9ZMlZg_9i7GEsYp";


const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );



/* =========================================================
   공통 요소
========================================================== */

const adminPage =
  document.querySelector(
    ".admin-page"
  );


const loginBox =
  document.getElementById(
    "loginBox"
  );


const adminDashboard =
  document.getElementById(
    "adminDashboard"
  );


const googleLoginButton =
  document.getElementById(
    "googleLoginButton"
  );


const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const loginMessage =
  document.getElementById(
    "loginMessage"
  );


const userEmail =
  document.getElementById(
    "userEmail"
  );



/* =========================================================
   화면 요소
========================================================== */

const adminHome =
  document.getElementById(
    "adminHome"
  );


const writePanel =
  document.getElementById(
    "writePanel"
  );


const quotePanel =
  document.getElementById(
    "quotePanel"
  );


const settingsPanel =
  document.getElementById(
    "settingsPanel"
  );



/* =========================================================
   메뉴 버튼
========================================================== */

const openWriteButton =
  document.getElementById(
    "openWriteButton"
  );


const openQuoteButton =
  document.getElementById(
    "openQuoteButton"
  );


const openSettingsButton =
  document.getElementById(
    "openSettingsButton"
  );


const writeBackButton =
  document.getElementById(
    "writeBackButton"
  );


const quoteBackButton =
  document.getElementById(
    "quoteBackButton"
  );


const settingsBackButton =
  document.getElementById(
    "settingsBackButton"
  );



/* =========================================================
   현재 큰 화면 기억

   home
   write
   quote
   settings
========================================================== */

let currentAdminView =
  sessionStorage.getItem(
    "admin-current-view"
  ) ||
  "home";



function saveCurrentAdminView(
  view
) {

  currentAdminView =
    view;


  sessionStorage.setItem(
    "admin-current-view",
    view
  );

}



/* =========================================================
   로그인 화면
========================================================== */

function showLogin() {

  adminPage.classList.remove(
    "quote-mode"
  );


  loginBox.hidden =
    false;


  adminDashboard.hidden =
    true;


  userEmail.textContent =
    "";

}



/* =========================================================
   관리자 화면
========================================================== */

function showDashboard(
  user
) {

  loginBox.hidden =
    true;


  adminDashboard.hidden =
    false;


  userEmail.textContent =
    user.email || "";


  /*
    로그인 상태가 다시 확인됐다고 해서
    무조건 HOME으로 보내지 않는다.

    현재 보고 있던 큰 화면 유지.
  */

  restoreAdminView();

}



/* =========================================================
   ADMIN HOME
========================================================== */

function showAdminHome(
  saveState = true
) {

  if (
    saveState
  ) {

    saveCurrentAdminView(
      "home"
    );

  }


  adminPage.classList.remove(
    "quote-mode"
  );


  adminHome.hidden =
    false;


  writePanel.hidden =
    true;


  quotePanel.hidden =
    true;


  settingsPanel.hidden =
    true;

}



/* =========================================================
   WRITE
========================================================== */

function showWritePanel(
  saveState = true
) {

  if (
    saveState
  ) {

    saveCurrentAdminView(
      "write"
    );

  }


  adminPage.classList.remove(
    "quote-mode"
  );


  adminHome.hidden =
    true;


  writePanel.hidden =
    false;


  quotePanel.hidden =
    true;


  settingsPanel.hidden =
    true;


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}



/* =========================================================
   QUOTE
========================================================== */

function showQuotePanel(
  saveState = true
) {

  if (
    saveState
  ) {

    saveCurrentAdminView(
      "quote"
    );

  }


  adminPage.classList.add(
    "quote-mode"
  );


  adminHome.hidden =
    true;


  writePanel.hidden =
    true;


  quotePanel.hidden =
    false;


  settingsPanel.hidden =
    true;


  /*
    저장된 PRESET만 최신 상태로 갱신.
  */

  if (
    typeof loadQuotePresets ===
      "function"
  ) {

    loadQuotePresets();

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}



/* =========================================================
   SETTINGS
========================================================== */

function showSettingsPanel(
  saveState = true
) {

  if (
    saveState
  ) {

    saveCurrentAdminView(
      "settings"
    );

  }


  adminPage.classList.remove(
    "quote-mode"
  );


  adminHome.hidden =
    true;


  writePanel.hidden =
    true;


  quotePanel.hidden =
    true;


  settingsPanel.hidden =
    false;


  if (
    typeof showSettingsSection ===
      "function"
  ) {

    showSettingsSection(
      "profile"
    );

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}



/* =========================================================
   저장된 큰 화면 복원
========================================================== */

function restoreAdminView() {

  if (
    currentAdminView ===
    "quote"
  ) {

    showQuotePanel(
      false
    );

    return;

  }


  if (
    currentAdminView ===
    "write"
  ) {

    showWritePanel(
      false
    );

    return;

  }


  if (
    currentAdminView ===
    "settings"
  ) {

    showSettingsPanel(
      false
    );

    return;

  }


  showAdminHome(
    false
  );

}



/* =========================================================
   메뉴 이동
========================================================== */

openWriteButton
  .addEventListener(
    "click",
    () => {

      showWritePanel();

    }
  );


openQuoteButton
  .addEventListener(
    "click",
    () => {

      showQuotePanel();

    }
  );


openSettingsButton
  .addEventListener(
    "click",
    () => {

      showSettingsPanel();

    }
  );



/* =========================================================
   BACK
========================================================== */

writeBackButton
  .addEventListener(
    "click",
    () => {

      showAdminHome();

    }
  );


quoteBackButton
  .addEventListener(
    "click",
    () => {

      showAdminHome();

    }
  );


settingsBackButton
  .addEventListener(
    "click",
    () => {

      showAdminHome();

    }
  );



/* =========================================================
   현재 로그인 상태 확인
========================================================== */

async function checkSession() {

  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .getSession();


  if (
    error
  ) {

    console.error(
      "session error:",
      error
    );


    showLogin();

    return;

  }


  const session =
    data.session;


  if (
    session &&
    session.user
  ) {

    showDashboard(
      session.user
    );


    /*
      SETTINGS 데이터
    */

    if (
      typeof loadAdminSettings ===
        "function"
    ) {

      await loadAdminSettings(
        session.user
      );

    }


    /*
      PRESET 데이터
    */

    if (
      typeof loadQuotePresets ===
        "function"
    ) {

      await loadQuotePresets();

    }

  }


  else {

    showLogin();

  }

}



/* =========================================================
   Google 로그인
========================================================== */

googleLoginButton
  .addEventListener(
    "click",
    async () => {

      googleLoginButton.disabled =
        true;


      loginMessage.textContent =
        "Google 로그인으로 이동 중...";


      const redirectUrl =
        `${window.location.origin}/admin/`;


      const {
        error
      } =
        await supabaseClient
          .auth
          .signInWithOAuth({

            provider:
              "google",

            options: {

              redirectTo:
                redirectUrl

            }

          });


      if (
        error
      ) {

        console.error(
          "Google login error:",
          error
        );


        loginMessage.textContent =
          "로그인에 실패했습니다.";


        googleLoginButton.disabled =
          false;

      }

    }
  );



/* =========================================================
   로그아웃
========================================================== */

logoutButton
  .addEventListener(
    "click",
    async () => {

      /*
        다음 로그인 때는
        HOME부터 시작.
      */

      saveCurrentAdminView(
        "home"
      );


      const {
        error
      } =
        await supabaseClient
          .auth
          .signOut();


      if (
        error
      ) {

        console.error(
          "logout error:",
          error
        );


        return;

      }


      showLogin();

    }
  );



/* =========================================================
   로그인 상태 변화 감지
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

        /*
          여기서 showAdminHome()을 하지 않는다.

          토큰 갱신이나
          브라우저 탭 복귀가 발생해도
          현재 보고 있는 화면 유지.
        */

        loginBox.hidden =
          true;


        adminDashboard.hidden =
          false;


        userEmail.textContent =
          session.user.email ||
          "";


        restoreAdminView();

      }


      else {

        showLogin();

      }

    }
  );

/* =========================================================
   공통 상태 메시지

   2초 표시
   → 서서히 사라짐
   → 문구 제거
========================================================== */

function showAdminMessage(
  element,
  message
) {

  if (
    !element
  ) {
    return;
  }


  /*
    이전 타이머가 있다면 제거
  */

  if (
    element._messageTimer
  ) {

    clearTimeout(
      element._messageTimer
    );

  }


  if (
    element._fadeTimer
  ) {

    clearTimeout(
      element._fadeTimer
    );

  }


  element.style.transition =
    "none";


  element.style.opacity =
    "1";


  element.textContent =
    message;


  /*
    2초 동안 그대로 표시
  */

  element._messageTimer =
    setTimeout(
      () => {

        element.style.transition =
          "opacity 0.6s ease";


        element.style.opacity =
          "0";


        /*
          fade가 끝난 뒤
          내용 자체도 비움
        */

        element._fadeTimer =
          setTimeout(
            () => {

              element.textContent =
                "";


              element.style.transition =
                "none";


              element.style.opacity =
                "1";

            },
            600
          );

      },
      2000
    );

}

/* =========================================================
   시작
========================================================== */

window.addEventListener(
  "load",
  checkSession
);