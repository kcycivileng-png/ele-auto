// 共用初始化：註冊 service worker、判斷是否顯示「加入主畫面」提示
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // 表單頁在 /forms/ 子目錄，首頁在根目錄，統一以根目錄註冊，scope 涵蓋全站
      const rootSwPath = location.pathname.includes('/forms/') ? '../service-worker.js' : './service-worker.js';
      const scope = location.pathname.includes('/forms/') ? '../' : './';
      navigator.serviceWorker.register(rootSwPath, { scope }).catch(() => {
        /* 離線或無法註冊時忽略，不影響表單基本使用 */
      });
    });
  }

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const banner = document.getElementById('installBanner');
  if (banner && !isStandalone) {
    banner.hidden = false;
  }
})();
