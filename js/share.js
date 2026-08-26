// 儲存檔案（PDF 或 CSV）。
// PDF：直接下載到裝置（不再嘗試手機分享選單——部分手機的分享選單不會列出LINE，
// 改用「下載」+「上傳雲端」兩個明確的按鈕取代，行為較一致好教學）。
// CSV：維持原本「優先分享、退回下載」的行為。
const KtShare = (() => {
  function downloadBlob(blob, filename) {
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

    return downloadBlob(blob, filename);
  }

  function shareOrSavePdf(blob, filename) {
    return downloadBlob(blob, filename);
  }

  function shareOrSaveCsv(blob, filename) {
    return shareOrSaveFile(blob, filename, 'text/csv');
  }

  return { shareOrSaveFile, shareOrSavePdf, shareOrSaveCsv };
})();
