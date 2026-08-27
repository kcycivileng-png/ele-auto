// 其它環境設施檢查表 —— PDF「底圖套版」座標定義（單位：pt，A4頁面，量測自 03_維運報告_套版範本.docx P38）。
// 底圖 pdf-templates/environment-check-p1.png 已去除「電廠名稱/檢查日期/檢查人員/檢修說明」欄位文字。
// 原始文件本表「相片需求：無」，僅保留「異常項目」這2格供異常時選填，不強制上傳照片。
const EnvironmentCheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const HEADER = {
    plantName: { x: 62.1, y: 108.0 },
    checkDate: { x: 211.2, y: 108.0 },
    inspector: { x: 361.1, y: 108.0 },
  };
  const checkboxCols = { ok: 419.8, bad: 455.2, fixed: 491.4 };
  const CHECK_SIZE = 11;
  const ITEM_ROW_Y = [203.0, 221.5, 240.0, 258.6, 277.1, 295.6, 314.1, 332.6, 351.0, 369.6];
  const REPAIR_NOTE = { x: 59.2, y: 422, w: 480 };

  // 異常項目相片框格座標為估算值（原始表格此區沒有明確格線資料，非必填欄位，
  // 視覺位置大致正確即可，之後如需更精準可再依實際輸出微調）。
  const PHOTOS = {
    abnormal: [
      { x: 59, y: 486, w: 230, h: 85 },
      { x: 298, y: 486, w: 230, h: 85 },
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
    const hasAbnormal = (data.items || []).some((it) => it.status === 'bad' || it.status === 'fixed');
    if (!hasAbnormal) return (data.repairNote && data.repairNote.text) || '無異常';
    return (data.repairNote && data.repairNote.text) || '（未填寫）';
  }

  function captionOf(data, id) {
    const g = (data.photoGroups || []).find((x) => x.id === id);
    return (g && g.caption) || '';
  }

  function captionStrip(box, caption) {
    if (!caption || !box) return '';
    const y = box.y + box.h - 15;
    return (
      `<div style="position:absolute;left:${box.x}px;top:${y}px;width:${box.w}px;height:15px;background:rgba(255,255,255,0.82);"></div>` +
      textDiv(box.x + 2, y + 1, box.w - 4, caption, { size: 8.5, autofit: true, h: 13, min: 6.5 })
    );
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

    let textHtml = `
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
      if (id === 'abnormal' && boxes[0] && boxes[1]) {
        const combined = { x: boxes[0].x, y: boxes[0].y, w: (boxes[1].x + boxes[1].w) - boxes[0].x, h: boxes[0].h };
        textHtml += captionStrip(combined, captionOf(data, id));
      }
    });

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildRepairNoteText, esc };
})();
