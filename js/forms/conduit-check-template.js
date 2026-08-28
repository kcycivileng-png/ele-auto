// 線槽/管線檢查表 —— PDF「底圖套版」座標定義（單位：pt，A4頁面，量測自 03_維運報告_套版範本.docx P33）。
// 底圖 pdf-templates/conduit-check-p1.png 已去除「電廠名稱/檢查日期/檢查人員/檢修說明」欄位文字。
// 單頁表單：檢查表格＋相片框格都在同一頁。
const ConduitCheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const HEADER = {
    plantName: { x: 76.3, y: 130.0 },
    checkDate: { x: 227.4, y: 130.0 },
    inspector: { x: 378.4, y: 130.0 },
  };
  const checkboxCols = { ok: 419.5, bad: 449.7, fixed: 485.1 };
  const CHECK_SIZE = 11;
  const ITEM_ROW_Y = [197.4, 213.5, 229.6, 245.6, 261.8];
  const REPAIR_NOTE = { x: 59.8, y: 310, w: 480 };

  const PHOTOS = {
    cableTrough: [
      { x: 54.7, y: 388.7, w: 233.0, h: 85.8 },
      { x: 287.7, y: 388.7, w: 253.3, h: 85.8 },
    ],
    pipe: [
      { x: 54.7, y: 490.4, w: 233.0, h: 85.8 },
      { x: 287.7, y: 490.4, w: 253.3, h: 85.8 },
    ],
    cable: [
      { x: 54.7, y: 592.2, w: 233.0, h: 86.4 },
      { x: 287.7, y: 592.2, w: 253.3, h: 86.4 },
    ],
    abnormal1: [{ x: 54.7, y: 694.8, w: 233.0, h: 86.1 }],
    abnormal2: [{ x: 287.7, y: 694.8, w: 253.3, h: 86.1 }],
  };

  const ABN_LABEL = {
    abnormal1: { x: 203.2, y: 680.8 },
    abnormal2: { x: 448.2, y: 680.8 },
  };
  function abnFillText(pos, value) {
    if (!value || !pos) return '';
    return textDiv(pos.x + 2, pos.y, 90, value, { size: 12, nowrap: true, autofitW: true, min: 7 });
  }

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
    });
    textHtml += abnFillText(ABN_LABEL.abnormal1, captionOf(data, 'abnormal1'));
    textHtml += abnFillText(ABN_LABEL.abnormal2, captionOf(data, 'abnormal2'));

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildRepairNoteText, esc };
})();
