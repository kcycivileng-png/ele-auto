// 逆變器檢查表 —— PDF「底圖套版」座標定義（做法同直流箱/交流箱）。
// 3頁對應原始文件P28(檢查表)、P29(清潔後外觀相片)、P30(接地電阻檢查)。
// 逆變器沒有絕緣電阻檢查表，且「4.9機殼接地量測(年)」這個自動判定項目是夾在
// 手動項目「中間」（4.1~4.8 之後、4.10~4.12 之前），不是像直流箱/交流箱接在最後面。
const InverterCheckTemplate = (() => {
  const PAGE_W = 595.44;
  const PAGE_H = 841.68;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const P1 = {
    plantName: { x: 76.3, y: 114.4 },
    checkDate: { x: 227.4, y: 114.4 },
    inspector: { x: 378.4, y: 114.4 },
    checkboxCols: { ok: 417.0, bad: 452.75, fixed: 503.05 },
    checkboxSize: 10,
    // index0~7 = 4.1~4.8（手動），index8 = 4.9機殼接地量測(年)（自動判定），index9~11 = 4.10~4.12（手動）
    itemRowY: [182.8, 198.9, 215.0, 231.1, 247.3, 263.4, 279.4, 295.5, 319.5, 343.4, 359.5, 375.6],
    groundingDateLine: { x: 129.5, y: 326.3, w: 260 },
    repairNote: { x: 59.8, y: 425.7, w: 476 },
  };

  // P29 INVERTER清潔後外觀：3列×2欄＝6個設備單張相片框 + 1列×2欄異常項目
  const LEFT_X = 54.0, LEFT_W = 233.3;
  const RIGHT_X = 287.8, RIGHT_W = 253.9;
  const P_PHOTOS = {
    invPhoto1: [{ x: LEFT_X, y: 121.6, w: LEFT_W, h: 113.3 }],
    invPhoto2: [{ x: RIGHT_X, y: 121.6, w: RIGHT_W, h: 113.3 }],
    invPhoto3: [{ x: LEFT_X, y: 269.2, w: LEFT_W, h: 113.3 }],
    invPhoto4: [{ x: RIGHT_X, y: 269.2, w: RIGHT_W, h: 113.3 }],
    invPhoto5: [{ x: LEFT_X, y: 417.5, w: LEFT_W, h: 113.4 }],
    invPhoto6: [{ x: RIGHT_X, y: 417.5, w: RIGHT_W, h: 113.4 }],
    invAbn1: [{ x: LEFT_X, y: 548.5, w: LEFT_W, h: 113.4 }],
    invAbn2: [{ x: RIGHT_X, y: 548.5, w: RIGHT_W, h: 113.4 }],
  };

  // P30 逆變器接地電阻檢查：固定15列
  const P_GROUND = {
    rowY: [164.4, 180.5, 196.7, 212.8, 228.9, 245.0, 261.0, 277.2, 293.3, 309.4, 325.5, 341.7, 357.8, 373.8, 389.9],
    boxNo: { x: 61, w: 80 },
    value: { x: 150.9, w: 90 },
    passBox: { x: 257.2, w: 12, h: 12 },
    failBox: { x: 305.2, w: 12, h: 12 },
    action: { x: 370.6, w: 160 },
    photo: [
      { x: 40.0, y: 504.1, w: 258.6, h: 113.3 },
      { x: 299.1, y: 504.1, w: 256.7, h: 113.3 },
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

  function deriveItemStatus(rows) {
    const filled = (rows || []).filter((r) => r.boxNo || r.value || r.result === '不合格');
    if (!filled.length) return null;
    return filled.some((r) => r.result === '不合格') ? 'bad' : 'ok';
  }

  function buildRepairNoteText(data) {
    const hasAbnormal = (data.items || []).some((it) => it.status === 'bad' || it.status === 'fixed');
    if (!hasAbnormal) return (data.repairNote && data.repairNote.text) || '無異常';
    return (data.repairNote && data.repairNote.text) || '（未填寫）';
  }

  function photoOf(data, id) {
    const g = (data.photoGroups || []).find((x) => x.id === id);
    return g && g.photos && g.photos[0] ? g.photos[0] : null;
  }

  function placeSingle(images, boxes, photo) {
    if (photo && boxes && boxes[0]) images.push({ dataUrl: photo, x: boxes[0].x, y: boxes[0].y, w: boxes[0].w, h: boxes[0].h });
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

  // ---- Page 1（P28）：逆變器檢查表 ----
  function buildPage1(data, bgDataUrl) {
    const rects = [];
    // 手動項目(4.1~4.8) + 自動判定的4.9(機殼接地) + 手動項目(4.10~4.12)，依原始文件順序排列
    const manualItems = data.items || [];
    const allItems = manualItems.slice(0, 8).concat(
      [{ no: '4.9', status: deriveItemStatus(data.groundingRows) }],
      manualItems.slice(8)
    );
    allItems.forEach((it, idx) => {
      const y = P1.itemRowY[idx];
      if (!it.status || y === undefined) return;
      const colX = P1.checkboxCols[it.status];
      rects.push({ x: colX, y, w: P1.checkboxSize, h: P1.checkboxSize });
    });

    const textHtml = `
      ${textDiv(P1.plantName.x, P1.plantName.y, 145, `電廠名稱:${data.meta.plantName}`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.checkDate.x, P1.checkDate.y, 145, `檢查日期：${data.meta.checkDate}`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.inspector.x, P1.inspector.y, 160, `檢查人員：${data.meta.inspector}`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.groundingDateLine.x, P1.groundingDateLine.y, P1.groundingDateLine.w, `(該年度量測日期：${data.groundingDate || ''})`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.repairNote.x, P1.repairNote.y, P1.repairNote.w, buildRepairNoteText(data), { autofit: true, h: 18 })}
    `;

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, textHtml };
  }

  // ---- Page 2（P29）：INVERTER清潔後外觀 ----
  function buildPagePhotos(data, bgDataUrl) {
    const images = [];
    let textHtml = '';
    Object.keys(P_PHOTOS).forEach((id) => {
      placeSingle(images, P_PHOTOS[id], photoOf(data, id));
      if (id === 'invAbn1' || id === 'invAbn2') {
        textHtml += captionStrip(P_PHOTOS[id][0], captionOf(data, id));
      }
    });
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images, textHtml };
  }

  // ---- Page 3（P30）：逆變器接地電阻檢查（固定15列） ----
  function buildPageGrounding(data, bgDataUrl) {
    const rects = [];
    let textHtml = '';
    (data.groundingRows || []).forEach((r, i) => {
      if (i >= P_GROUND.rowY.length) return;
      const touched = !!(r.boxNo || r.value || r.action);
      if (!touched) return;
      const y = P_GROUND.rowY[i];
      if (r.boxNo) textHtml += textDiv(P_GROUND.boxNo.x, y, P_GROUND.boxNo.w, r.boxNo, { nowrap: true, autofitW: true });
      if (r.value) textHtml += textDiv(P_GROUND.value.x, y, P_GROUND.value.w, r.value, { nowrap: true, autofitW: true });
      if (r.action) textHtml += textDiv(P_GROUND.action.x, y, P_GROUND.action.w, r.action, { autofit: true, min: 7, h: 14.1 });
      if (r.result === '不合格') {
        rects.push({ x: P_GROUND.failBox.x, y: y + 2, w: P_GROUND.failBox.w, h: P_GROUND.failBox.h });
      } else if (r.result === '合格') {
        rects.push({ x: P_GROUND.passBox.x, y: y + 2, w: P_GROUND.passBox.w, h: P_GROUND.passBox.h });
      }
    });
    const images = [];
    placeSingle(images, [P_GROUND.photo[0]], photoOf(data, 'groundAbn1'));
    placeSingle(images, [P_GROUND.photo[1]], photoOf(data, 'groundAbn2'));
    textHtml += captionStrip(P_GROUND.photo[0], captionOf(data, 'groundAbn1')) + captionStrip(P_GROUND.photo[1], captionOf(data, 'groundAbn2'));
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildPagePhotos, buildPageGrounding, buildRepairNoteText, esc };
})();
