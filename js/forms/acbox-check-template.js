// 交流箱檢查表 —— PDF「底圖套版」座標定義（做法同直流箱：底圖是原始PDF截圖，
// 只去除一定會被覆蓋的欄位文字，其餘框線/說明文字/頁尾都跟Word一模一樣）。
// 4頁對應原始文件P24(檢查表)、P25(熱顯像)、P26(絕緣電阻檢查)、P27(接地電阻檢查)。
const AcboxCheckTemplate = (() => {
  const PAGE_W = 595.44;
  const PAGE_H = 841.68;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const P1 = {
    plantName: { x: 76.3, y: 114.4 },
    checkDate: { x: 227.4, y: 114.4 },
    inspector: { x: 378.4, y: 114.4 },
    checkboxCols: { ok: 408.85, bad: 445.95, fixed: 501.5 },
    checkboxSize: 10,
    // 3.1 ~ 3.11（手動勾選）+ 3.12三相電力之各相絕緣電阻量測(年)、3.13接地電阻量測(年)（自動判定）
    itemRowY: [182.8, 198.9, 215.0, 231.1, 255.1, 279.0, 295.0, 311.1, 327.3, 343.4, 359.5, 383.4, 415.2],
    insulationDateLine: { x: 121.8, y: 390.3, w: 270 },
    groundingDateLine: { x: 121.8, y: 422.0, w: 270 },
    repairNote: { x: 52.1, y: 501.5, w: 487 },
  };

  const LEFT_X = 54.0, LEFT_W = 233.3;
  const RIGHT_X = 287.8, RIGHT_W = 253.9;
  const P_THERMAL = {
    thermalIr1: [{ x: LEFT_X, y: 90.4, w: LEFT_W, h: 113.3 }],
    thermalVis1: [{ x: RIGHT_X, y: 90.4, w: RIGHT_W, h: 113.3 }],
    thermalIr2: [{ x: LEFT_X, y: 222.4, w: LEFT_W, h: 113.3 }],
    thermalVis2: [{ x: RIGHT_X, y: 222.4, w: RIGHT_W, h: 113.3 }],
    thermalIr3: [{ x: LEFT_X, y: 355.1, w: LEFT_W, h: 113.4 }],
    thermalVis3: [{ x: RIGHT_X, y: 355.1, w: RIGHT_W, h: 113.4 }],
    thermalAbn1: [{ x: 54.0, y: 486.1, w: 233.3, h: 113.4 }],
    thermalAbn2: [{ x: 287.8, y: 486.1, w: 253.9, h: 113.4 }],
  };

  // P26 交流箱絕緣電阻檢查：一次側／二次側各6列（R-S/S-T/R-T/R-G/S-G/T-G），
  // 相別標籤是Word原始固定內容，底圖沒有去除，App只需要疊上量測值/結果/改善對策。
  const P_INSUL = {
    rowY: [148.8, 164.9, 181.0, 197.2, 213.3, 229.4, 261.6, 277.7, 293.8, 309.9, 326.1, 342.2],
    value: { x: 125.4, w: 125 },
    passBox: { x: 264.6, w: 12, h: 12 },
    failBox: { x: 312.7, w: 12, h: 12 },
    action: { x: 380.6, w: 155 },
    photo: [
      { x: 52.9, y: 456.1, w: 231.6, h: 85.1 },
      { x: 285.9, y: 456.1, w: 256.7, h: 85.1 },
    ],
  };

  // P27 交流箱接地電阻檢查：固定6列
  const P_GROUND = {
    rowY: [148.8, 164.9, 181.0, 197.2, 213.3, 229.4],
    boxNo: { x: 56, w: 75 },
    value: { x: 140.9, w: 90 },
    passBox: { x: 247.2, w: 12, h: 12 },
    failBox: { x: 295.3, w: 12, h: 12 },
    action: { x: 360.7, w: 170 },
    photo: [
      { x: 40.0, y: 343.4, w: 258.6, h: 113.3 },
      { x: 299.1, y: 343.4, w: 256.7, h: 113.3 },
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
    const filled = (rows || []).filter((r) => r.circuit || r.boxNo || r.value || r.result === '不合格');
    if (!filled.length) return null;
    return filled.some((r) => r.result === '不合格') ? 'bad' : 'ok';
  }

  // 一次側/二次側12列的整體狀態：任一列標示不合格就視為異常
  function deriveInsulationStatus(primaryRows, secondaryRows) {
    const all = (primaryRows || []).concat(secondaryRows || []);
    const filled = all.filter((r) => r.value || r.action || r.result === '不合格');
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

  // ---- Page 1（P24）：交流箱檢查表 ----
  function buildPage1(data, bgDataUrl) {
    const rects = [];
    const allItems = data.items.concat([
      { no: '3.12', status: deriveInsulationStatus(data.primaryRows, data.secondaryRows) },
      { no: '3.13', status: deriveItemStatus(data.groundingRows) },
    ]);
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
      ${textDiv(P1.insulationDateLine.x, P1.insulationDateLine.y, P1.insulationDateLine.w, `(該年度量測日期：${data.insulationDate || ''})`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.groundingDateLine.x, P1.groundingDateLine.y, P1.groundingDateLine.w, `(該年度量測日期：${data.groundingDate || ''})`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.repairNote.x, P1.repairNote.y, P1.repairNote.w, buildRepairNoteText(data), { autofit: true, h: 18 })}
    `;

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, textHtml };
  }

  // ---- Page 2（P25）：AC BOX熱顯像 ----
  function buildPageThermal(data, bgDataUrl) {
    const images = [];
    let textHtml = '';
    Object.keys(P_THERMAL).forEach((id) => {
      placeSingle(images, P_THERMAL[id], photoOf(data, id));
      if (id === 'thermalAbn1' || id === 'thermalAbn2') {
        textHtml += captionStrip(P_THERMAL[id][0], captionOf(data, id));
      }
    });
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images, textHtml };
  }

  function buildMeasureRows(P, rows, offset) {
    const rects = [];
    let textHtml = '';
    (rows || []).forEach((r, i) => {
      const rowIdx = offset + i;
      if (rowIdx >= P.rowY.length) return;
      const touched = !!(r.value || r.action || r.result);
      if (!touched) return;
      const y = P.rowY[rowIdx];
      if (r.value) textHtml += textDiv(P.value.x, y, P.value.w, r.value, { nowrap: true, autofitW: true });
      if (r.action) textHtml += textDiv(P.action.x, y, P.action.w, r.action, { autofit: true, min: 7, h: 14.1 });
      if (r.result === '不合格') {
        rects.push({ x: P.failBox.x, y: y + 2, w: P.failBox.w, h: P.failBox.h });
      } else if (r.result === '合格') {
        rects.push({ x: P.passBox.x, y: y + 2, w: P.passBox.w, h: P.passBox.h });
      }
    });
    return { rects, textHtml };
  }

  // ---- Page 3（P26）：交流箱絕緣電阻檢查（一次側6列 + 二次側6列，相別為固定標籤） ----
  function buildPageInsulation(data, bgDataUrl) {
    const primary = buildMeasureRows(P_INSUL, data.primaryRows, 0);
    const secondary = buildMeasureRows(P_INSUL, data.secondaryRows, 6);
    const images = [];
    placeSingle(images, [P_INSUL.photo[0]], photoOf(data, 'insulAbn1'));
    placeSingle(images, [P_INSUL.photo[1]], photoOf(data, 'insulAbn2'));
    const captionHtml = captionStrip(P_INSUL.photo[0], captionOf(data, 'insulAbn1')) + captionStrip(P_INSUL.photo[1], captionOf(data, 'insulAbn2'));
    return {
      pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl,
      rects: primary.rects.concat(secondary.rects),
      images,
      textHtml: primary.textHtml + secondary.textHtml + captionHtml,
    };
  }

  // ---- Page 4（P27）：交流箱接地電阻檢查（固定6列） ----
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

  return { PAGE_W, PAGE_H, buildPage1, buildPageThermal, buildPageInsulation, buildPageGrounding, buildRepairNoteText, esc };
})();
