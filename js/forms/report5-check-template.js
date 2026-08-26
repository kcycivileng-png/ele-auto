// 附表五・太陽光電電廠設備防颱檢查表 —— PDF「底圖套版」座標定義。
// 這張表跟其他季檢表不同：只有「正常/異常」兩個狀態（沒有調整/更換），且「異常狀況
// 處理&備註」欄一律顯示（不像其他表單備註只在異常時才出現），底部只有1個簽名欄。
// 原始文件沒有「電廠名稱」欄位，App裡的電廠名稱只用於紀錄列表排序/篩選，不畫進PDF。
const Report5CheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";
  const CHECK_SIZE = 12;

  const HEADER = {
    typhoonName: { x: 145, y: 137.5, w: 170 },
    typhoonLevel: { x: 395, y: 137.5, w: 170 },
    inspector: { x: 145, y: 158.2, w: 170 },
    inspectDate: { x: 395, y: 158.2, w: 170 },
  };
  const checkboxCols = { ok: 338.2, bad: 388.45 };
  const ROW_Y = [201.0, 229.9, 258.8, 287.7, 316.5, 345.4, 374.2, 403.0, 431.9, 460.7, 497.2, 526.1, 554.9, 583.9, 612.7, 641.5, 670.4, 699.2];
  const NOTE = { x: 424, w: 145 };
  // 簽名欄在表格外面，緊接在「巡檢人員簽名：」標籤右側（標籤文字頂端 y=728.7）。
  // 之前這裡誤把y往上減，結果簽名疊到表格最後一列，已修正為對齊標籤本身的高度。
  const SIGNATURE = { x: 441, y: 729, w: 125, h: 26 };

  function esc(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function textDiv(x, y, w, text, opts) {
    opts = opts || {};
    const size = opts.size || 12;
    const autofitAttr = opts.autofit ? `data-autofit data-autofit-min="${opts.min || 7}"` : '';
    const autofitWAttr = opts.autofitW ? `data-autofit-w data-autofit-min="${opts.min || 7}"` : '';
    const h = opts.h ? `height:${opts.h}px;overflow:hidden;` : '';
    return `<div ${autofitAttr} ${autofitWAttr} style="position:absolute;left:${x}px;top:${y}px;width:${w}px;${h}font-size:${size}px;line-height:1.3;${FONT}color:#000;white-space:${opts.nowrap ? 'nowrap' : 'normal'};">${esc(text)}</div>`;
  }

  function buildPage1(data, bgDataUrl) {
    const rects = [];
    let textHtml = '';
    textHtml += textDiv(HEADER.typhoonName.x, HEADER.typhoonName.y, HEADER.typhoonName.w, data.typhoonName, { nowrap: true, autofitW: true });
    textHtml += textDiv(HEADER.typhoonLevel.x, HEADER.typhoonLevel.y, HEADER.typhoonLevel.w, data.typhoonLevel, { nowrap: true, autofitW: true });
    textHtml += textDiv(HEADER.inspector.x, HEADER.inspector.y, HEADER.inspector.w, data.inspector, { nowrap: true, autofitW: true });
    textHtml += textDiv(HEADER.inspectDate.x, HEADER.inspectDate.y, HEADER.inspectDate.w, data.inspectDate, { nowrap: true, autofitW: true });

    (data.items || []).forEach((it, idx) => {
      if (idx >= ROW_Y.length) return;
      const y = ROW_Y[idx];
      if (it.status === 'ok') rects.push({ x: checkboxCols.ok, y, w: CHECK_SIZE, h: CHECK_SIZE });
      if (it.status === 'bad') rects.push({ x: checkboxCols.bad, y, w: CHECK_SIZE, h: CHECK_SIZE });
      if (it.note) textHtml += textDiv(NOTE.x, y, NOTE.w, it.note, { size: 10, autofitW: true, nowrap: true });
    });

    const images = [];
    if (data.signature) {
      images.push({ dataUrl: data.signature, x: SIGNATURE.x, y: SIGNATURE.y, w: SIGNATURE.w, h: SIGNATURE.h });
    }

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, esc };
})();
