/* =========================================================
   SUPABASE 연결
========================================================== */

const SUPABASE_URL =
  "https://iokdgqzfprtggsnrusez.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_N9mPjBMUQJEhKYPo9ZMlZg_9i7GEsYp";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   사이트 내용 불러오기
========================================================== */

async function loadSiteContent() {

  const { data, error } =
    await supabaseClient
      .from("site_content")
      .select("section, content");

  if (error) {

    console.error(
      "사이트 내용 불러오기 실패:",
      error
    );

    return;
  }

  data.forEach((item) => {

    if (
      !item.content ||
      item.content.trim() === ""
    ) {
      return;
    }

    const target =
      document.getElementById(
        `${item.section}Text`
      );

    if (!target) {
      return;
    }

    target.textContent =
      item.content;

    target.classList.add(
      "from-supabase"
    );

  });

}


/* =========================================================
   카테고리 불러오기
========================================================== */

async function loadCategories() {

  const categoryMenuLinks =
    document.getElementById(
      "categoryMenuLinks"
    );


  if (!categoryMenuLinks) {
    return;
  }


  const { data, error } =
    await supabaseClient
      .from("categories")
      .select(
        "id, name, slug, sort_order"
      )
      .order(
        "sort_order",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "카테고리 불러오기 실패:",
      error
    );

    return;
  }


  categoryMenuLinks.innerHTML =
    "";


  data.forEach((category) => {

    const link =
      document.createElement(
        "a"
      );


    link.href =
      "#";


    link.textContent =
      category.name;


    link.dataset.categoryId =
      category.id;


    link.dataset.categorySlug =
      category.slug;


    categoryMenuLinks.appendChild(
      link
    );

  });

}


/* =========================================================
   YOUTUBE BGM
========================================================== */

const musicButton =
  document.getElementById(
    "musicButton"
  );

let bgmUrl = "";
let bgmVideoId = "";

let youtubePlayer = null;
let youtubeApiPromise = null;

let bgmPlaying = false;


/* YouTube URL → 영상 ID */

function getYouTubeVideoId(url) {

  if (!url) {
    return "";
  }

  try {

    const parsed =
      new URL(url);

    if (
      parsed.hostname === "youtu.be" ||
      parsed.hostname === "www.youtu.be"
    ) {

      return parsed.pathname
        .replace("/", "")
        .split("?")[0];

    }

    if (
      parsed.hostname.includes(
        "youtube.com"
      )
    ) {

      if (
        parsed.pathname.startsWith(
          "/shorts/"
        )
      ) {

        return parsed.pathname
          .split("/")[2]
          .split("?")[0];

      }

      if (
        parsed.pathname.startsWith(
          "/embed/"
        )
      ) {

        return parsed.pathname
          .split("/")[2]
          .split("?")[0];

      }

      return (
        parsed.searchParams.get("v")
        || ""
      );

    }

  } catch (error) {

    console.error(
      "YouTube URL 형식 오류:",
      error
    );

  }

  return "";

}


/* Supabase에서 BGM 주소 불러오기 */

async function loadBgmSetting() {

  const { data, error } =
    await supabaseClient
      .from("site_settings")
      .select("value")
      .eq("key", "bgm_url")
      .maybeSingle();

  if (error) {

    console.error(
      "BGM 설정 불러오기 실패:",
      error
    );

    return;
  }

  bgmUrl =
    data?.value?.trim()
    || "";

  bgmVideoId =
    getYouTubeVideoId(
      bgmUrl
    );

  if (
    !bgmVideoId &&
    musicButton
  ) {

    musicButton.style.display =
      "none";

  }

}


/* YouTube API */

function loadYouTubeApi() {

  if (
    window.YT &&
    window.YT.Player
  ) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise =
    new Promise(
      (resolve) => {

        const previousCallback =
          window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady =
          () => {

            if (
              typeof previousCallback
              === "function"
            ) {

              previousCallback();

            }

            resolve();

          };

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://www.youtube.com/iframe_api";

        document.head.appendChild(
          script
        );

      }
    );

  return youtubeApiPromise;

}


/* 플레이어 생성 */

async function ensureYouTubePlayer() {

  if (youtubePlayer) {
    return youtubePlayer;
  }

  if (!bgmVideoId) {
    return null;
  }

  await loadYouTubeApi();

  youtubePlayer =
    new YT.Player(
      "youtubePlayer",
      {

        width: "220",
        height: "124",

        videoId:
          bgmVideoId,

        playerVars: {

          autoplay: 0,

          controls: 0,

          loop: 1,

          playlist:
            bgmVideoId,

          playsinline: 1,

          rel: 0

        },

        events: {

          onStateChange:
            (event) => {

              if (
                event.data ===
                YT.PlayerState.PLAYING
              ) {

                bgmPlaying =
                  true;

                musicButton.textContent =
                  "♪";

              }

              if (
                event.data ===
                YT.PlayerState.PAUSED
              ) {

                bgmPlaying =
                  false;

                musicButton.textContent =
                  "♫";

              }

            }

        }

      }
    );

  return youtubePlayer;

}


/* BGM 재생 */

async function playBgm() {

  const player =
    await ensureYouTubePlayer();

  if (!player) {
    return;
  }

  try {

    player.playVideo();

  } catch (error) {

    console.log(
      "브라우저가 재생을 막음:",
      error
    );

  }

}


/* BGM 정지 */

function pauseBgm() {

  if (!youtubePlayer) {
    return;
  }

  youtubePlayer.pauseVideo();

  bgmPlaying =
    false;

  musicButton.textContent =
    "♫";

}


if (musicButton) {

  musicButton.addEventListener(
    "click",
    async (event) => {

      event.stopPropagation();

      if (bgmPlaying) {

        pauseBgm();

      } else {

        await playBgm();

      }

    }
  );

}


loadBgmSetting();


/* =========================================================
   기본 설정
========================================================== */

const INERTIA_STRENGTH =
  0.9;

const INERTIA_FRICTION =
  0.90;


/* =========================================================
   요소
========================================================== */

const menuButton =
  document.getElementById(
    "menuButton"
  );

const menuPanel =
  document.getElementById(
    "menuPanel"
  );

const viewerArea =
  document.getElementById(
    "viewerArea"
  );

const heartViewer =
  document.getElementById(
    "heartViewer"
  );

const heartGroup =
  document.getElementById(
    "heartGroup"
  );

const heartStage =
  document.getElementById(
    "heartStage"
  );

const page1 =
  document.getElementById(
    "profilePage1"
  );

const page2 =
  document.getElementById(
    "profilePage2"
  );

const moreButton =
  document.getElementById(
    "moreButton"
  );

const backButton =
  document.getElementById(
    "backButton"
  );


/* 100회전 이벤트 요소 */

const loveEvent =
  document.getElementById(
    "loveEvent"
  );

const loveRain =
  document.getElementById(
    "loveRain"
  );


/* =========================================================
   상단 고정 버튼(메뉴/음악) 스크롤 시 숨김

   글을 읽을 때 텍스트를 가리지 않도록 아래로 스크롤하면
   숨기고, 위로 스크롤하거나 맨 위 근처로 오면 다시 보여준다.
   posts.js도 글 읽기 화면(#postArea)의 자체 스크롤에서
   이 함수를 그대로 호출한다(전역 함수로 공유).
========================================================== */

let lastFixedButtonScrollTop =
  0;

function updateFixedButtonsOnScroll(
  scrollTop
) {

  const scrollingDown =
    scrollTop >
    lastFixedButtonScrollTop;

  const pastThreshold =
    scrollTop > 24;

  const shouldHide =
    scrollingDown &&
    pastThreshold;


  menuButton?.classList.toggle(
    "is-scroll-hidden",
    shouldHide
  );

  musicButton?.classList.toggle(
    "is-scroll-hidden",
    shouldHide
  );


  lastFixedButtonScrollTop =
    scrollTop;

}


window.addEventListener(
  "scroll",
  () => {

    updateFixedButtonsOnScroll(
      window.scrollY
    );

  },
  {
    passive: true
  }
);


/* =========================================================
   메뉴
========================================================== */

menuButton.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

    const isOpen =
      menuPanel.classList.toggle(
        "open"
      );

    menuButton.classList.toggle(
      "open",
      isOpen
    );

    menuButton.setAttribute(
      "aria-expanded",
      isOpen
    );

  }
);


menuPanel.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

  }
);


/*
  메뉴가 열려 있는 상태에서 메뉴/버튼 바깥을 클릭하면
  자연스럽게 닫힘.
*/

document.addEventListener(
  "click",
  (event) => {

    if (
      !menuPanel.classList.contains(
        "open"
      )
    ) {

      return;

    }


    if (
      menuPanel.contains(
        event.target
      ) ||
      menuButton.contains(
        event.target
      )
    ) {

      return;

    }


    menuPanel.classList.remove(
      "open"
    );

    menuButton.classList.remove(
      "open"
    );

    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );

  }
);


/* =========================================================
   LOVE EVENT
========================================================== */

const LOVE_TURNS_REQUIRED =
  5;


const FULL_TURN =
  Math.PI * 2;


/*
  사용자가 직접 돌린 양만 저장.

  자동회전은 카운트하지 않음.
*/

let accumulatedUserRotation =
  0;

let rotationTrackingFrame =
  null;

let lastTrackedTheta =
  null;

let loveEventTriggered =
  false;


/* =========================================================
   각도 차이 보정
========================================================== */

function normalizeAngleDelta(
  delta
) {

  while (
    delta > Math.PI
  ) {

    delta -=
      FULL_TURN;

  }


  while (
    delta < -Math.PI
  ) {

    delta +=
      FULL_TURN;

  }


  return delta;

}


/* =========================================================
   100회전 확인
========================================================== */

function checkLoveEvent() {

  if (loveEventTriggered) {
    return;
  }


  const completedTurns =
    accumulatedUserRotation
    /
    FULL_TURN;


  if (
    completedTurns <
    LOVE_TURNS_REQUIRED
  ) {
    return;
  }


  loveEventTriggered =
    true;


  accumulatedUserRotation =
    0;


  triggerLoveEvent();


  window.setTimeout(
    () => {

      loveEventTriggered =
        false;

    },

    5500
  );

}


/* =========================================================
   회전량 추적 시작
========================================================== */

function startRotationTracking() {

  stopRotationTracking();


  const orbit =
    heartViewer
      .getCameraOrbit();


  lastTrackedTheta =
    orbit.theta;


  function trackRotation() {

    const currentOrbit =
      heartViewer
        .getCameraOrbit();


    const currentTheta =
      currentOrbit.theta;


    if (
      lastTrackedTheta
      !== null
    ) {

      const delta =
        normalizeAngleDelta(
          currentTheta
          -
          lastTrackedTheta
        );


      accumulatedUserRotation +=
        Math.abs(delta);


      checkLoveEvent();

    }


    lastTrackedTheta =
      currentTheta;


    rotationTrackingFrame =
      requestAnimationFrame(
        trackRotation
      );

  }


  rotationTrackingFrame =
    requestAnimationFrame(
      trackRotation
    );

}


/* =========================================================
   회전량 추적 종료
========================================================== */

function stopRotationTracking() {

  if (
    rotationTrackingFrame
  ) {

    cancelAnimationFrame(
      rotationTrackingFrame
    );

    rotationTrackingFrame =
      null;

  }


  lastTrackedTheta =
    null;

}


/* =========================================================
   하트비 하나 만들기
========================================================== */

function createLoveDrop() {

  if (!loveRain) {
    return;
  }


  const drop =
    document.createElement(
      "span"
    );


  drop.className =
    "love-drop";


  const isRibbon =
    Math.random() < 0.30;


  drop.textContent =
    isRibbon
      ? "୨୧"
      : "♡";


  const size =
    10
    +
    Math.random() * 12;


  const finalSize =
    isRibbon
      ? size * 0.84
      : size;


  drop.style.fontSize =
    `${finalSize}px`;


  drop.style.left =
    `${Math.random() * 100}%`;


  const duration =
    1.8
    +
    Math.random() * 1.4;


  drop.style.animationDuration =
    `${duration}s`;


  const delay =
    Math.random() * 1.2;


  drop.style.animationDelay =
    `${delay}s`;


  drop.style.opacity =
    `${
      0.5
      +
      Math.random() * 0.4
    }`;


  const drift =
    -30
    +
    Math.random() * 60;


  drop.style.setProperty(
    "--love-drift",
    `${drift}px`
  );


  const rotation =
    -18
    +
    Math.random() * 36;


  drop.style.setProperty(
    "--love-rotate",
    `${rotation}deg`
  );


  loveRain.appendChild(
    drop
  );


  window.setTimeout(
    () => {

      drop.remove();

    },

    (
      duration
      +
      delay
      +
      0.5
    )
    *
    1000
  );

}


/* =========================================================
   LOVE EVENT 실행
========================================================== */

function triggerLoveEvent() {

  if (
    !loveEvent ||
    !loveRain
  ) {
    return;
  }


  const loveMessages = [
    "spun with love.ᐟ",
    "caught you spinning.ᐟ",
    "look what you started.ᐟ",
    "a little love found you.ᐟ",
    "love was here.ᐟ",
    "something sweet happened.ᐟ"
  ];


  const loveMessage =
    document.getElementById(
      "loveMessage"
    );


  if (loveMessage) {

    const randomMessage =
      loveMessages[
        Math.floor(
          Math.random() *
          loveMessages.length
        )
      ];

    loveMessage.textContent =
      randomMessage;

  }


  loveEvent.classList.add(
    "show"
  );


  loveEvent.setAttribute(
    "aria-hidden",
    "false"
  );


  const DROP_COUNT =
    38;


  for (
    let i = 0;
    i < DROP_COUNT;
    i += 1
  ) {

    createLoveDrop();

  }


  window.setTimeout(
    () => {

      loveEvent.classList.remove(
        "show"
      );


      loveEvent.setAttribute(
        "aria-hidden",
        "true"
      );

    },

    5200
  );

}


/* =========================================================
   드래그 상태
========================================================== */

let startX = 0;
let startY = 0;

let lastX = 0;
let lastTime = 0;

let velocityX = 0;

let moved = false;
let profileOpen = false;

let inertiaFrame = null;


/* =========================================================
   부드러운 GLOW
========================================================== */

const BASE_GLOW = {

  core: 0.58,

  mid: 0.38,

  outer: 0.20,

  edge: 0.08

};


const MAX_GLOW = {

  core: 0.72,

  mid: 0.46,

  outer: 0.22,

  edge: 0.08

};


let currentGlow = {

  core:
    BASE_GLOW.core,

  mid:
    BASE_GLOW.mid,

  outer:
    BASE_GLOW.outer,

  edge:
    BASE_GLOW.edge

};


let targetGlow = {

  core:
    BASE_GLOW.core,

  mid:
    BASE_GLOW.mid,

  outer:
    BASE_GLOW.outer,

  edge:
    BASE_GLOW.edge

};


/* =========================================================
   CSS에 GLOW 적용
========================================================== */

function applyGlow() {

  document.documentElement
    .style
    .setProperty(
      "--glow-core",
      currentGlow.core
    );


  document.documentElement
    .style
    .setProperty(
      "--glow-mid",
      currentGlow.mid
    );


  document.documentElement
    .style
    .setProperty(
      "--glow-outer",
      currentGlow.outer
    );


  document.documentElement
    .style
    .setProperty(
      "--glow-edge",
      currentGlow.edge
    );

}


/* =========================================================
   GLOW 부드러운 애니메이션
========================================================== */

function animateGlow() {

  const easing =
    0.065;


  currentGlow.core +=
    (
      targetGlow.core
      -
      currentGlow.core
    )
    *
    easing;


  currentGlow.mid +=
    (
      targetGlow.mid
      -
      currentGlow.mid
    )
    *
    easing;


  currentGlow.outer +=
    (
      targetGlow.outer
      -
      currentGlow.outer
    )
    *
    easing;


  currentGlow.edge +=
    (
      targetGlow.edge
      -
      currentGlow.edge
    )
    *
    easing;


  applyGlow();


  requestAnimationFrame(
    animateGlow
  );

}


animateGlow();


/* =========================================================
   회전 속도 → GLOW 목표값
========================================================== */

function setGlowFromSpeed(
  speed
) {

  let power =
    Math.abs(speed);


  if (power < 0.12) {

    power =
      0;

  }


  power =
    Math.min(
      1,
      power * 0.42
    );


  power =
    power * power;


  targetGlow.core =
    BASE_GLOW.core
    +
    (
      MAX_GLOW.core
      -
      BASE_GLOW.core
    )
    *
    power;


  targetGlow.mid =
    BASE_GLOW.mid
    +
    (
      MAX_GLOW.mid
      -
      BASE_GLOW.mid
    )
    *
    power;


  targetGlow.outer =
    BASE_GLOW.outer
    +
    (
      MAX_GLOW.outer
      -
      BASE_GLOW.outer
    )
    *
    power;


  targetGlow.edge =
    BASE_GLOW.edge
    +
    (
      MAX_GLOW.edge
      -
      BASE_GLOW.edge
    )
    *
    power;

}


/* GLOW 기본값 */

function resetGlow() {

  targetGlow.core =
    BASE_GLOW.core;

  targetGlow.mid =
    BASE_GLOW.mid;

  targetGlow.outer =
    BASE_GLOW.outer;

  targetGlow.edge =
    BASE_GLOW.edge;

}


/* =========================================================
   관성 정지
========================================================== */

function stopInertia() {

  if (!inertiaFrame) {
    return;
  }


  cancelAnimationFrame(
    inertiaFrame
  );


  inertiaFrame =
    null;

}


/* =========================================================
   드래그 시작
========================================================== */

heartViewer.addEventListener(
  "pointerdown",
  (event) => {

    stopInertia();


    startRotationTracking();


    heartViewer.autoRotate =
      false;


    startX =
      event.clientX;

    startY =
      event.clientY;

    lastX =
      event.clientX;

    lastTime =
      performance.now();

    velocityX =
      0;

    moved =
      false;

  }
);


/* =========================================================
   드래그 중
========================================================== */

heartViewer.addEventListener(
  "pointermove",
  (event) => {

    const distanceX =
      Math.abs(
        event.clientX
        -
        startX
      );


    const distanceY =
      Math.abs(
        event.clientY
        -
        startY
      );


    if (
      distanceX > 8 ||
      distanceY > 8
    ) {

      moved =
        true;

    }


    const now =
      performance.now();


    const deltaTime =
      Math.max(
        1,
        now - lastTime
      );


    const deltaX =
      event.clientX
      -
      lastX;


    velocityX =
      deltaX
      /
      deltaTime;


    setGlowFromSpeed(
      velocityX * 2.2
    );


    lastX =
      event.clientX;


    lastTime =
      now;

  }
);


/* =========================================================
   드래그 종료
========================================================== */

heartViewer.addEventListener(
  "pointerup",
  () => {

    if (!moved) {

      stopRotationTracking();


      if (
        bgmVideoId &&
        !bgmPlaying
      ) {

        playBgm();

      }


      openProfile();


      return;
    }


    startInertia();

  }
);


/* 손가락 이벤트 취소 */

heartViewer.addEventListener(
  "pointercancel",
  () => {

    stopRotationTracking();

    resetGlow();

    if (!profileOpen) {

      heartViewer.autoRotate =
        true;

    }

  }
);


/* =========================================================
   관성 회전
========================================================== */

function startInertia() {

  stopInertia();


  let speed =
    velocityX
    *
    INERTIA_STRENGTH;


  function inertia() {

    if (
      Math.abs(speed)
      <
      0.0005
    ) {

      inertiaFrame =
        null;


      stopRotationTracking();


      if (!profileOpen) {

        heartViewer.autoRotate =
          true;

      }


      resetGlow();


      return;
    }


    const orbit =
      heartViewer
        .getCameraOrbit();


    const nextTheta =
      orbit.theta
      -
      speed;


    heartViewer.cameraOrbit =
      `${nextTheta}rad ${orbit.phi}rad ${orbit.radius}m`;


    setGlowFromSpeed(
      speed * 1.6
    );


    speed *=
      INERTIA_FRICTION;


    inertiaFrame =
      requestAnimationFrame(
        inertia
      );

  }


  inertiaFrame =
    requestAnimationFrame(
      inertia
    );

}


/* =========================================================
   프로필
========================================================== */

function openProfile() {

  stopInertia();

  stopRotationTracking();

  resetGlow();


  profileOpen =
    true;


  heartViewer.autoRotate =
    false;


  showPage1();


  heartGroup.classList.add(
    "profile-open"
  );

}


function closeProfile() {

  resetGlow();


  profileOpen =
    false;


  heartGroup.classList.remove(
    "profile-open"
  );


  showPage1();


  heartViewer.autoRotate =
    true;

}


/* 프로필 1페이지 */

function showPage1() {

  page1.classList.add(
    "active"
  );


  page2.classList.remove(
    "active"
  );


  heartGroup.classList.remove(
    "detail-open"
  );

}


/* 프로필 2페이지 */

function showPage2() {

  page1.classList.remove(
    "active"
  );


  page2.classList.add(
    "active"
  );


  heartGroup.classList.add(
    "detail-open"
  );

}


/* MORE */

moreButton.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

    showPage2();

  }
);


/* BACK */

backButton.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

    showPage1();

  }
);


/* =========================================================
   하트 내부 클릭
========================================================== */

heartStage.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

  }
);


/* =========================================================
   흰 배경 클릭 → 프로필 닫기
========================================================== */

viewerArea.addEventListener(
  "click",
  (event) => {

    if (!profileOpen) {
      return;
    }


    if (
      heartStage.contains(
        event.target
      )
    ) {
      return;
    }


    closeProfile();

  }
);


/* =========================================================
   하트 재질
========================================================== */

heartViewer.addEventListener(
  "load",
  () => {

    const materials =
      heartViewer.model.materials;


    materials.forEach(
      (material) => {

        material
          .pbrMetallicRoughness
          .setBaseColorFactor([
            1.0,
            0.72,
            0.82,
            1.0
          ]);


        material
          .pbrMetallicRoughness
          .setMetallicFactor(
            0
          );


        material
          .pbrMetallicRoughness
          .setRoughnessFactor(
            0.14
          );

      }
    );

  }
);


/* =========================================================
   초기 로드
========================================================== */

loadSiteContent();

loadCategories();