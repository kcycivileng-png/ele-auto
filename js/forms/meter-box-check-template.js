// 售電表箱檢查表 —— PDF「底圖套版」座標定義（單位：pt，A4頁面，量測自 03_維運報告_套版範本.docx P37）。
// 底圖 pdf-templates/meter-box-check-p1.png 已去除「電廠名稱/檢查日期/檢查人員/檢修說明範例」欄位文字。
const MeterBoxCheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const HEADER = {
    plantName: { x: 76.3, y: 140.4 },
    checkDate: { x: 227.4, y: 140.4 },
    inspector: { x: 378.4, y: 140.4 },
  };
  const checkboxCols = { ok: 419.5, bad: 449.7, fixed: 485.1 };
  const CHECK_SIZE = 11;
  const ITEM_ROW_Y = [207.7, 223.9];
  const REPAIR_NOTE = { x: 59.2, y: 272, w: 480 };

  const PHOTOS = {
    meterReading: [{ x: 53.6, y: 350.8, w: 234.2, h: 86.6 }],
    meterBox: [{ x: 287.8, y: 350.8, w: 254.2, h: 86.6 }],
    abnormal: [
      { x: 53.6, y: 453.5, w: 234.2, h: 86.2 },
      { x: 287.8, y: 453.5, w: 254.2, h: 86.2 },
    ],
  };

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

  function photosOf(data, id) {
    const g = (data.photoGroups || []).find((x) => x.id === id);
    return (g && g.photos) || [];
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

    const images = [];
    Object.keys(PHOTOS).forEach((id) => {
      const boxes = PHOTOS[id];
      photosOf(data, id).forEach((photo, idx) => {
        const box = boxes[idx];
        if (!box) return;
        images.push({ dataUrl: photo, x: box.x, y: box.y, w: box.w, h: box.h });
      });
    });

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildRepairNoteText, esc };
})();
