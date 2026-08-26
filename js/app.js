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

  // 匯出按鈕旁加一行提示：PDF會直接下載，若要分享請自行從手機下載/檔案APP選檔案傳送，
  // 或用「上傳雲端」直接存進公司雲端資料夾。集中寫在這裡，每個表單頁面自動套用。
  const exportBtn = document.getElementById('exportPdfBtn');
  const actionBar = exportBtn && exportBtn.closest('.action-bar');
  if (actionBar && !actionBar.querySelector('.share-hint')) {
    const hint = document.createElement('div');
    hint.className = 'share-hint';
    hint.textContent = 'PDF會直接下載。要傳LINE請至手機下載/檔案APP選檔案傳送；要存公司雲端請按「上傳雲端」';
    actionBar.appendChild(hint);
  }
})();
