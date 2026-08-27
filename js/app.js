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

  // 分享清單有時候不會列出LINE（LINE自己沒有跟系統登記可以接收PDF檔案，
  // 這是LINE/作業系統那邊的限制，網頁端無法強迫它出現）。在匯出按鈕旁邊加一行
  // 提示，教使用者遇到這種情況時的替代做法。集中寫在這裡，每個表單頁面都會自動套用，
  // 不用每個表單各自加一次。
  const exportBtn = document.getElementById('exportPdfBtn');
  const actionBar = exportBtn && exportBtn.closest('.action-bar');
  if (actionBar && !actionBar.querySelector('.share-hint')) {
    const hint = document.createElement('div');
    hint.className = 'share-hint';
    hint.textContent = '分享清單沒有LINE？請選「儲存到檔案」，再從LINE聊天室選檔案傳送';
    actionBar.appendChild(hint);
  }
})();
