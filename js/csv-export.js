// 通用 CSV 產生工具：給表頭與多列資料，組成可用 Excel/Google試算表開啟的 CSV 檔。
// 各表單自己決定要匯出哪些欄位（把填寫資料攤平成一列），這裡只負責正確跳脫字元與編碼。
const KtCsv = (() => {
  function escapeField(value) {
    const s = value === null || value === undefined ? '' : String(value);
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  function buildCsvBlob(headers, rows) {
    const lines = [headers.map(escapeField).join(',')];
    rows.forEach((row) => {
      lines.push(row.map(escapeField).join(','));
    });
    const csvText = lines.join('\r\n');
    // 加上 UTF-8 BOM（U+FEFF），避免 Excel 開啟中文時變亂碼
    const bom = '﻿';
    return new Blob([bom + csvText], { type: 'text/csv;charset=utf-8;' });
  }

  return { buildCsvBlob };
})();
