// 高壓設備檢查表 —— PDF「底圖套版」座標定義（單位：pt，A4頁面，量測自 03_維運報告_套版範本.docx P35~P36）。
// 底圖 pdf-templates/hv-equipment-check-p1.png 已去除「電廠名稱/檢查日期/檢查人員/檢修說明」欄位文字。
// 注意：原始文件 8.7~8.10（變壓器絕緣油檢測/接地電阻量測/絕緣電阻量測/檢查隔離開關）
// 這4項不是App勾選填寫，而是「檢查結果以高壓檢測報告書提供」——結果來自另外一份外部檢測
// 報告書，App裡不做互動勾選，只在畫面上原樣顯示提醒文字，也不畫進PDF覆蓋層
// （底圖本身就已經印著這4項的原始說明文字）。
// 2頁：P1檢查表，P2相片框格（高壓站全景2格、MP盤熱顯像/可見光各1格、VCB內部盤體2格、
// PT盤熱顯像/可見光各1格、變壓器溫度/油量各1格、異常項目2格，共10+2格）。
const HvEquipmentCheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const HEADER = {
    plantName: { x: 76.3, y: 130.0 },
    checkDate: { x: 227.4, y: 130.0 },
    inspector: { x: 378.4, y: 130.0 },
  };
  const checkboxCols = { ok: 419.5, bad: 452.4, fixed: 487.9 };
  const CHECK_SIZE = 11;
  const ITEM_ROW_Y = [197.4, 213.5, 229.6, 245.6, 261.8, 278.0];
  const REPAIR_NOTE = { x: 55.7, y: 436, w: 480 };

  const P_PHOTOS = {
    overview: [
      { x: 53.1, y: 103.7, w: 234.6, h: 85.9 },
      { x: 287.7, y: 103.7, w: 254.9, h: 85.9 },
    ],
    mpThermal: [{ x: 53.1, y: 205.5, w: 234.6, h: 85.8 }],
    mpVisible: [{ x: 287.7, y: 205.5, w: 254.9, h: 85.8 }],
    vcb: [
      { x: 53.1, y: 307.1, w: 234.6, h: 85.8 },
      { x: 287.7, y: 307.1, w: 254.9, h: 85.8 },
    ],
    ptThermal: [{ x: 53.1, y: 408.8, w: 234.6, h: 85.8 }],
    ptVisible: [{ x: 287.7, y: 408.8, w: 254.9, h: 85.8 }],
    transformerTemp: [{ x: 53.1, y: 510.4, w: 234.6, h: 85.8 }],
    transformerOil: [{ x: 287.7, y: 510.4, w: 254.9, h: 85.8 }],
    abnormal: [
      { x: 53.1, y: 612.1, w: 234.6, h: 86.3 },
      { x: 287.7, y: 612.1, w: 254.9, h: 86.3 },
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
