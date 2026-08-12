// 分享 / 儲存檔案（PDF 或 CSV）：優先使用手機原生分享選單（可分享到 LINE 等 App），
// 若裝置不支援檔案分享，退回「下載檔案」，使用者可自行用瀏覽器另存或分享。
const KtShare = (() => {
  async function shareOrSaveFile(blob, filename, mimeType) {
    const file = new File([blob], filename, { type: mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        // 故意不帶 title/text：帶了的話，分享到LINE等App時容易被當成一則
        // 附加文字訊息（檔名）先送出，使用者只想要單純分享檔案本身。
        await navigator.share({ files: [file] });
        return { method: 'share' };
      } catch (err) {
        if (err && err.name === 'AbortError') return { method: 'cancelled' };
        // 分享失敗則退回下載
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { method: 'download' };
  }

  function shareOrSavePdf(blob, filename) {
    return shareOrSaveFile(blob, filename, 'application/pdf');
  }

  function shareOrSaveCsv(blob, filename) {
    return shareOrSaveFile(blob, filename, 'text/csv');
  }

  return { shareOrSaveFile, shareOrSavePdf, shareOrSaveCsv };
})();
