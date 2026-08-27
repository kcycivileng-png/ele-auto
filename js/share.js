// 分享 / 儲存檔案（PDF 或 CSV）：優先使用手機原生分享選單（可分享到 LINE 等 App），
// 若裝置不支援檔案分享，退回「下載檔案」。
//
// 為什麼PDF不能直接固定用「下載」：iOS Safari 對 blob網址的<a download>支援很差，
// 常常點了完全沒反應、也不會真的存進「檔案」App（桌機Chrome/Android則正常）。
// 曾經試過把PDF改成固定用下載（為了解決「分享選單沒有LINE」的抱怨），結果變成iOS
// 完全存不到檔案，屬於更嚴重的迴歸，所以改回「優先分享、退回下載」這個原本就驗證過
// 在iOS上能正常運作的方式。
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
