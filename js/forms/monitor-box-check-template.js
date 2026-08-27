// 發電廠監控箱檢查表 —— PDF「底圖套版」座標定義（單位：pt，A4頁面，量測自 03_維運報告_套版範本.docx P31~P32）。
// 底圖 pdf-templates/monitor-box-check-p1.png 已去除「電廠名稱/檢查日期/檢查人員/檢修說明」欄位文字。
// 2頁：P1檢查表，P2相片框格（日照計1格、監控箱2格、異常項目2格）。
const MonitorBoxCheckTemplate = (() => {
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
  // 14項（5.1~5.14）；原始文件本身把5.3誤植為「7.3」（PDF底圖上看到的還是「7.3」，
  // 是原始文件的錯字，App內部仍用5.3編號以維持與其它項目一致的邏輯順序）。
  const ITEM_ROW_Y = [197.4, 213.5, 229.6, 261.4, 277.5, 293.6, 309.6, 325.8, 341.9, 358.0, 374.1, 390.3, 406.4, 422.4];
  const REPAIR_NOTE = { x: 59, y: 486, w: 480 };

  const P_PHOTOS = {
    sunSensor: [{ x: 53.0, y: 103.7, w: 234.8, h: 114.2 }],
    monitorBox: [
      { x: 287.8, y: 103.7, w: 254.9, h: 114.2 },
      { x: 53.0, y: 233.8, w: 234.8, h: 114.9 },
    ],
    abnormal: [
      { x: 53.0, y: 364.8, w: 234.8, h: 114.5 },
      { x: 287.8, y: 364.8, w: 254.9, h: 114.5 },
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

  function photosOf(data, id) {
    const g = (data.photoGroups || []).find((x) => x.id === id);
    return (g && g.photos) || [];
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

  function buildPagePhotos(data, bgDataUrl) {
    const images = [];
    let textHtml = '';
    Object.keys(P_PHOTOS).forEach((id) => {
      const boxes = P_PHOTOS[id];
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
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildPagePhotos, buildRepairNoteText, esc };
})();
