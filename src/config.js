// 먹숭이 — 런타임 설정
// 제보 폼은 아래 URL로 POST 됩니다. Google Apps Script 웹앱 URL을 붙여넣으세요.
// (배포 가이드는 README 참조)

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHJ2s1qiZI2AoTACT7uytYtGBB6RE3fNxz0M8gNlVIB_iRiIBH6hgeW4QtDdMer8Zj6A/exec";

window.APP_CONFIG = {
  APPS_SCRIPT_URL,
  RESTAURANTS_JSON: "src/data/restaurants.json",
};
