// 附表四・案廠設備經歷/維護紀錄卡 —— PDF「底圖套版」座標定義。
// 這是「累積型」紀錄卡（不是單次巡檢表單），原始Word固定28列，App比照Word固定列數，
// 不開放新增/刪除列；若28列不夠用，使用者可另外新增一筆新紀錄接續使用。
const Report4CheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";
  const ROW_COUNT = 28;

  const HEADER = {
    plantName: { x: 145.2, y: 125.4, w: 180 },
    holder: { x: 407.7, y: 125.4, w: 100 },
    capacity: { x: 145.2, y: 144.7, w: 60 },
    address: { x: 145.2, y: 164.8, w: 365 },
  };

  const COL = {
    date: { x: 93, w: 32 },
    equipStatus: { x: 130, w: 72 },
    handleStatus: { x: 207, w: 98 },
    fixDate: { x: 311, w: 39 },
    staff: { x: 355, w: 58 },
    note: { x: 419, w: 83 },
  };
  const ROW_Y = [238.7, 257.2, 275.7, 294.2, 312.6, 331.1, 349.7, 368.2, 386.7, 405.2, 423.6, 442.1, 460.7, 479.2, 497.7, 516.2, 534.7, 553.2, 571.8, 590.2, 608.7, 627.2, 645.7, 664.2, 682.8, 701.3, 719.7, 738.2];

  function esc(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function textDiv(x, y, w, text, opts) {
    opts = opts || {};
    const size = opts.size || 11;
    const autofitWAttr = opts.autofitW ? `data-autofit-w data-autofit-min="${opts.min || 6.5}"` : '';
    return `<div ${autofitWAttr} style="position:absolute;left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;line-height:1.3;${FONT}color:#000;white-space:nowrap;overflow:hidden;">${esc(text)}</div>`;
  }

  function buildPage1(data, bgDataUrl) {
    let textHtml = '';
    textHtml += textDiv(HEADER.plantName.x, HEADER.plantName.y, HEADER.plantName.w, data.plantName, { size: 12, autofitW: true });
    textHtml += textDiv(HEADER.holder.x, HEADER.holder.y, HEADER.holder.w, data.holder, { size: 12, autofitW: true });
    textHtml += textDiv(HEADER.capacity.x, HEADER.capacity.y, HEADER.capacity.w, data.capacity, { size: 12, autofitW: true });
    textHtml += textDiv(HEADER.address.x, HEADER.address.y, HEADER.address.w, data.address, { size: 12, autofitW: true });

    (data.rows || []).forEach((r, i) => {
      if (i >= ROW_Y.length) return;
      const touched = !!(r.date || r.equipStatus || r.handleStatus || r.fixDate || r.staff || r.note);
      if (!touched) return;
      const y = ROW_Y[i];
      Object.keys(COL).forEach((key) => {
        if (r[key]) textHtml += textDiv(COL[key].x, y, COL[key].w, r[key], { autofitW: true });
      });
    });

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], textHtml };
  }

  return { PAGE_W, PAGE_H, ROW_COUNT, buildPage1, esc };
})();
