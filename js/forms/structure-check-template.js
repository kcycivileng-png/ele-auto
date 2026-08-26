// 結構系統檢查表 —— PDF「底圖套版」座標定義（單位：pt，A4頁面，量測自 03_維運報告_套版範本.docx P39）。
// 底圖 pdf-templates/structure-check-p1.png 已去除「電廠名稱/檢查日期/檢查人員/檢修說明」欄位文字。
// 原始文件本表「相片需求：無」，且不像其它幾張表另外保留「異常項目」空格，所以完全不需要照片欄位。
const StructureCheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const HEADER = {
    plantName: { x: 62.1, y: 108.0 },
    checkDate: { x: 211.2, y: 108.0 },
    inspector: { x: 361.1, y: 108.0 },
  };
  const checkboxCols = { ok: 419.1, bad: 449.3, fixed: 484.7 };
  const CHECK_SIZE = 11;
  const ITEM_ROW_Y = [185.0, 221.5, 240.0, 258.6, 295.1, 313.6, 332.1, 368.6, 405.0, 423.7, 442.1, 460.6, 479.1, 497.6, 516.1];
  const REPAIR_NOTE = { x: 59.2, y: 568.5, w: 480 };

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

  function buildRepairNoteText(data) {
    if (data.repairNote && data.repairNote.noIssue) return '無異常';
    return (data.repairNote && data.repairNote.text) || '（未填寫）';
  }

  function buildPage1(data, bgDataUrl) {
    const rects = [];
    (data.items || []).forEach((it, idx) => {
      const y = ITEM_ROW_Y[idx];
      if (!it.status || y == null) return;
      rects.push({ x: checkboxCols[it.status], y: y + 2, w: CHECK_SIZE, h: CHECK_SIZE });
    });

    const textHtml = `
      ${textDiv(HEADER.plantName.x, HEADER.plantName.y, 130, `電廠名稱：${data.meta.plantName}`, { nowrap: true, autofitW: true })}
      ${textDiv(HEADER.checkDate.x, HEADER.checkDate.y, 135, `檢查日期：${data.meta.checkDate}`, { nowrap: true, autofitW: true })}
      ${textDiv(HEADER.inspector.x, HEADER.inspector.y, 165, `檢查人員：${data.meta.inspector}`, { nowrap: true, autofitW: true })}
      ${textDiv(REPAIR_NOTE.x, REPAIR_NOTE.y, REPAIR_NOTE.w, buildRepairNoteText(data), { autofit: true, h: 20 })}
    `;

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images: [], textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildRepairNoteText, esc };
})();
