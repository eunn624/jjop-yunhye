// 먹숭이 — 런타임 설정
// 제보 폼은 아래 URL로 POST 됩니다. Google Apps Script 웹앱 URL을 붙여넣으세요.
// (배포 가이드는 README 참조)

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_7KbH3UQaGPOMAqKU1SM7Oy44QGJpA7LIc1Bz9EPd2Fd6ZkjxMV8v8Wli1xREq0bO/exec";

window.APP_CONFIG = {
  APPS_SCRIPT_URL,
  RESTAURANTS_JSON: "src/data/restaurants.json",
};
