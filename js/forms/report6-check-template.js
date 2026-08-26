// 附表六・太陽光電電廠設備颱風過後檢查表 —— PDF「底圖套版」座標定義。
// 結構跟附表五幾乎一樣（正常/異常兩態、備註一律顯示、單一簽名），原始文件同樣沒有
// 「電廠名稱」欄位，App裡的電廠名稱只用於排序/篩選，不畫進PDF。
const Report6CheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";
  const CHECK_SIZE = 12;

  const HEADER = {
    typhoonName: { x: 113, y: 148.2, w: 200 },
    typhoonLevel: { x: 396, y: 148.2, w: 170 },
    inspector: { x: 113, y: 168.9, w: 200 },
    inspectDate: { x: 396, y: 168.9, w: 170 },
  };
  const checkboxCols = { ok: 337.3, bad: 387.65 };
  const ROW_Y = [211.8, 240.6, 269.4, 298.4, 327.2, 356.1, 384.9, 413.8, 442.6, 471.4, 500.3, 536.8, 565.6, 594.5, 623.4, 652.3, 681.1, 709.9];
  const NOTE = { x: 424, w: 145 };
  // 標籤文字頂端 y=739.4；之前誤把y往上減導致疊到表格，已修正對齊標籤本身。
  const SIGNATURE = { x: 441, y: 740, w: 125, h: 26 };

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
