/* =========================================================
   ADMIN - SUPABASE / DASHBOARD PANEL SWITCHING

   이 파일도 커져서(960줄+), 세션/로그인 확인 로직은
   admin-session.js로 옮겼음 — 그 파일은 이 파일보다
   나중에 로드되어야 함(admin/index.html 순서 참고).
========================================================== */


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


  /*
    panel이 hidden이던 동안엔 stage 너비가 0이라 프리뷰
    축소 계산(applyQuotePreviewScale)이 제대로 안 됐을 수
    있어서, 실제로 보이는 시점에 다시 계산해준다.
  */

  if (
    typeof applyQuotePreviewScale ===
      "function"
  ) {

    requestAnimationFrame(
      applyQuotePreviewScale
    );

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



