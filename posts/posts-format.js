/* =========================================================
   POSTS - DATE

   posts.js에서 분리됨.
   다른 파일에 의존하지 않는 순수 함수들.
========================================================== */

/* =========================================================
   VISIBILITY

   목록에서 제목 앞에 붙이는 자물쇠/비공개 아이콘.
   public은 아무것도 안 붙임.
========================================================== */

function getPostVisibilityPrefix(
  visibility
) {

  if (
    visibility ===
    "secret"
  ) {
    return "🔒 ";
  }


  if (
    visibility ===
    "private"
  ) {
    return "🙈 ";
  }


  return "";

}



/* =========================================================
   DATE
========================================================== */

function formatPostListDate(
  dateString
) {

  if (!dateString) {
    return "";
  }


  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Seoul",

        month:
          "2-digit",

        day:
          "2-digit"
      }
    )
      .formatToParts(
        new Date(
          dateString
        )
      );


  const month =
    parts.find(
      part =>
        part.type === "month"
    )?.value || "";


  const day =
    parts.find(
      part =>
        part.type === "day"
    )?.value || "";


  return `${month}.${day}`;

}


function formatPostDetailDate(
  dateString
) {

  if (!dateString) {
    return "";
  }


  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Seoul",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          false
      }
    )
      .formatToParts(
        new Date(
          dateString
        )
      );


  const getPart =
    type =>
      parts.find(
        part =>
          part.type === type
      )?.value || "";


  return (
    `${getPart("year")}.`
    +
    `${getPart("month")}.`
    +
    `${getPart("day")} `
    +
    `${getPart("hour")}:`
    +
    `${getPart("minute")}`
  );

}
