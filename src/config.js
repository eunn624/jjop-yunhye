// 쩝쩝윤혜 — 런타임 설정
// 제보 폼은 아래 URL로 POST 됩니다. Google Apps Script 웹앱 URL을 붙여넣으세요.
// (배포 가이드는 README 참조)

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwm0u9EJN17pdSTmwxYyrNP-wWP9wtAWknC3nTa6ncLjKTF24atac-ptL6xw3v8bKo3zg/exec";

window.APP_CONFIG = {
  APPS_SCRIPT_URL,
  RESTAURANTS_JSON: "src/data/restaurants.json",
};
