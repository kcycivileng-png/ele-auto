// 直流箱檢查表 —— PDF「底圖套版」座標定義（同太陽能模組表的做法：底圖是原始PDF截圖，
// 只去除一定會被覆蓋的欄位文字，其餘框線/說明文字/頁尾都跟Word一模一樣）。
// 4頁對應原始文件P20(檢查表)、P21(熱顯像)、P22(組串絕緣電阻檢查)、P23(接地電阻檢查)。
const DcboxCheckTemplate = (() => {
  const PAGE_W = 595.44;
  const PAGE_H = 841.68;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const P1 = {
    plantName: { x: 76.3, y: 114.4 },
    checkDate: { x: 227.4, y: 114.4 },
    inspector: { x: 378.4, y: 114.4 },
    // 三欄勾選框的x座標已對齊各欄「欄寬置中」（欄位邊界：397.4~439.4／439.9~474.8／475.3~540.2）
    checkboxCols: { ok: 413.4, bad: 452.35, fixed: 502.75 },
    checkboxSize: 10,
    // 2.1 ~ 2.13（手動勾選）+ 2.14組串絕緣電阻量測(年)、2.15接地電阻量測(年)（由量測表自動判定）
    itemRowY: [182.8, 198.9, 215.0, 231.1, 255.1, 279.0, 295.0, 311.1, 327.3, 343.4, 359.5, 375.6, 391.8, 415.7, 447.3],
    // 「(該年度量測日期:)」整行文字（含括號）在底圖裡已去除，這裡連同日期一起重畫，
    // 避免底圖文字與疊字圖分開繪製導致基準線對不齊。
    insulationDateLine: { x: 136.7, y: 422.5, w: 260 },
    groundingDateLine: { x: 136.7, y: 454.1, w: 260 },
    repairNote: { x: 59.8, y: 533.7, w: 478 },
  };

  // P21 熱顯像頁：3組「熱顯像/可見光對照」相片對 + 2格「異常項目」相片
  const LEFT_X = 51.4, LEFT_W = 233.4;
  const RIGHT_X = 286.2, RIGHT_W = 258.1;
  const P_THERMAL = {
    thermalIr1: [{ x: LEFT_X, y: 90.4, w: LEFT_W, h: 113.3 }],
    thermalVis1: [{ x: RIGHT_X, y: 90.4, w: RIGHT_W, h: 113.3 }],
    thermalIr2: [{ x: LEFT_X, y: 222.4, w: LEFT_W, h: 113.3 }],
    thermalVis2: [{ x: RIGHT_X, y: 222.4, w: RIGHT_W, h: 113.3 }],
    thermalIr3: [{ x: LEFT_X, y: 355.1, w: LEFT_W, h: 113.4 }],
    thermalVis3: [{ x: RIGHT_X, y: 355.1, w: RIGHT_W, h: 113.4 }],
    thermalAbn1: [{ x: 51.4, y: 486.1, w: 233.4, h: 113.4 }],
    thermalAbn2: [{ x: 285.3, y: 486.1, w: 259.0, h: 113.4 }],
  };

  // P22 直流箱組串絕緣電阻檢查（10列固定表格 + 2格異常相片）
  const P_INSUL = {
    rowY: [148.8, 164.9, 181.0, 197.2, 213.3, 229.4, 245.4, 261.6, 277.7, 293.8],
    rowH: 16.1,
    circuit: { x: 45, w: 105 },
    value: { x: 157, w: 155 },
    passBox: { x: 320.4, w: 12, h: 12 },
    failBox: { x: 368.4, w: 12, h: 12 },
    action: { x: 433.8, w: 118 },
    photo: [
      { x: 50.8, y: 486.0, w: 233.7, h: 113.3 },
      { x: 284.9, y: 486.0, w: 257.7, h: 113.3 },
    ],
  };

  // P23 直流箱接地電阻檢查（10列固定表格 + 2格異常相片）
  const P_GROUND = {
    rowY: [148.8, 164.9, 181.0, 197.2, 213.3, 229.4, 245.4, 261.6, 277.7, 293.8],
    rowH: 16.1,
    boxNo: { x: 56, w: 75 },
    value: { x: 140.3, w: 96 },
    passBox: { x: 246.6, w: 12, h: 12 },
    failBox: { x: 294.7, w: 12, h: 12 },
    action: { x: 360.1, w: 178 },
    photo: [
      { x: 50.8, y: 407.8, w: 233.7, h: 113.3 },
      { x: 284.9, y: 407.8, w: 257.7, h: 113.3 },
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

  function buildRepairNoteText(data) {
    const itemRemarks = (data.items || []).filter((it) => it.remark).map((it) => `${it.no} ${it.remark}`);
    if (data.repairNote.noIssue && !itemRemarks.length) return '無異常';
    const bits = [];
    if (data.repairNote.text) bits.push(data.repairNote.text);
    bits.push(...itemRemarks);
    return bits.join('；') || '（未填寫）';
  }

  function photoOf(data, id) {
    const g = (data.photoGroups || []).find((x) => x.id === id);
    return g && g.photos && g.photos[0] ? g.photos[0] : null;
  }

  function photosOf(data, id) {
    const g = (data.photoGroups || []).find((x) => x.id === id);
    return (g && g.photos) || [];
  }

  function placeSingle(images, boxes, photo) {
    if (photo && boxes && boxes[0]) images.push({ dataUrl: photo, x: boxes[0].x, y: boxes[0].y, w: boxes[0].w, h: boxes[0].h });
  }

  // ---- Page 1（P20）：直流箱檢查表 ----
  function buildPage1(data, bgDataUrl) {
    const rects = [];
    const allItems = data.items.concat([
      { no: '2.14', status: deriveItemStatus(data.insulationRows) },
      { no: '2.15', status: deriveItemStatus(data.groundingRows) },
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

  // ---- Page 2（P21）：DC BOX熱顯像 ----
  function buildPageThermal(data, bgDataUrl) {
    const images = [];
    Object.keys(P_THERMAL).forEach((id) => {
      placeSingle(images, P_THERMAL[id], photoOf(data, id));
    });
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images, textHtml: '' };
  }

  function buildMeasureTable(P, rows, idKey) {
    const rects = [];
    let textHtml = '';
    (rows || []).forEach((r, i) => {
      if (i >= P.rowY.length) return;
      const touched = !!(r[idKey] || r.value || r.action);
      if (!touched) return;
      const y = P.rowY[i];
      if (r[idKey]) textHtml += textDiv(P[idKey].x, y, P[idKey].w, r[idKey], { nowrap: true, autofitW: true });
      if (r.value) textHtml += textDiv(P.value.x, y, P.value.w, r.value, { nowrap: true, autofitW: true });
      if (r.action) textHtml += textDiv(P.action.x, y, P.action.w, r.action, { autofit: true, min: 7, h: P.rowH - 2 });
      if (r.result === '不合格') {
        rects.push({ x: P.failBox.x, y: y + 2, w: P.failBox.w, h: P.failBox.h });
      } else if (r.result === '合格') {
        rects.push({ x: P.passBox.x, y: y + 2, w: P.passBox.w, h: P.passBox.h });
      }
    });
    return { rects, textHtml };
  }

  // ---- Page 3（P22）：直流箱組串絕緣電阻檢查 ----
  function buildPageInsulation(data, bgDataUrl) {
    const { rects, textHtml } = buildMeasureTable(P_INSUL, data.insulationRows, 'circuit');
    const images = [];
    placeSingle(images, [P_INSUL.photo[0]], photoOf(data, 'insulAbn1'));
    placeSingle(images, [P_INSUL.photo[1]], photoOf(data, 'insulAbn2'));
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  // ---- Page 4（P23）：直流箱接地電阻檢查 ----
  function buildPageGrounding(data, bgDataUrl) {
    const { rects, textHtml } = buildMeasureTable(P_GROUND, data.groundingRows, 'boxNo');
    const images = [];
    placeSingle(images, [P_GROUND.photo[0]], photoOf(data, 'groundAbn1'));
    placeSingle(images, [P_GROUND.photo[1]], photoOf(data, 'groundAbn2'));
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildPageThermal, buildPageInsulation, buildPageGrounding, buildRepairNoteText, esc, photosOf };
})();
