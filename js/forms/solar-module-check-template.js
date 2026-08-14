// 太陽能模組設備檢查表 —— PDF「底圖套版」座標定義。
// 所有座標都是直接用程式從原始 PDF（國泰電業維運契約附件一，20260814更新版）量出來的（單位：pt，A4頁面）。
// 底圖圖檔在 pdf-templates/solar-module-check-p{1..4}*.png，已預先去除「電廠名稱/檢查日期/
// 檢查人員/無異常/00-00範例迴路編號」這幾個一定會被覆蓋掉的欄位文字，其餘（框線、灰底、
// 標準說明文字、頁尾）都是原始文件截圖，保證跟Word一模一樣。
// 4頁對應原始文件的P16(檢查表)、P17(相片框格)、P18(熱顯像)、P19(接地連續性)。
const SolarModuleCheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  // 注意：字型名稱要用單引號，因為外層 style="..." 已經用雙引號，
  // 用雙引號包字型名稱會提早把 style 屬性截斷，後面的樣式（例如white-space:nowrap）會整個失效。
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

  const P1 = {
    plantName: { x: 95.4, y: 129.0 },
    checkDate: { x: 231.9, y: 129.0 },
    inspector: { x: 373.3, y: 129.0 },
    // 正常/異常/調整更換 三欄的勾選框左上角座標（框大小 11x11）
    checkboxCols: { ok: 409, bad: 450, fixed: 503 },
    checkboxSize: 11,
    // 每一列（1.1~1.7 + 接地連續性量測列）勾選框的 y 座標
    itemRowY: [209, 227.5, 246, 264.5, 283, 301.6, 320.1, 347.6],
    repairNote: { x: 55.6, y: 442, w: 486 },
  };

  // P17 相片框格頁：只用得到「模組支架/模組壓塊/太陽能板近拍/太陽能板遠拍」這4個
  // App裡真的有蒐集的欄位，各自對應原始表格裡第一個同名框格；重複的近拍/異常項目框格
  // 維持原樣不疊照片（App設計是每類只拍一張，不需要多張）。
  const P_PHOTOS = {
    rack: { x: 58.2, y: 104.1, w: 224.0, h: 113.5 },
    clamp: { x: 293.0, y: 104.1, w: 244.5, h: 113.5 },
    near: { x: 58.2, y: 234.2, w: 224.0, h: 113.4 },
    far: { x: 58.2, y: 494.2, w: 224.0, h: 113.5 },
  };

  // P18 熱顯像頁：對應「檢查項目-異常位置1」的「太陽能板熱顯像相片」框格
  const P_THERMAL = {
    thermal: { x: 57.5, y: 425.7, w: 237.8, h: 113.4 },
  };

  const P4 = {
    rowY: [148.8, 164.9, 181.0, 197.2, 213.2, 229.3, 245.4, 261.6, 277.7, 293.8],
    rowH: 16.1,
    circuit: { x: 60, w: 90 },
    value: { x: 156, w: 100 },
    passBox: { x: 272.8, w: 8, h: 8 },
    failBox: { x: 320.8, w: 8, h: 8 },
    action: { x: 389, w: 148 },
    // P19「檢查項目-異常位置1」相片框格，對應 groundAbn 照片
    photo: { x: 57.3, y: 575.5, w: 227.2, h: 93.5 },
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

  function deriveGroundingItemStatus(rows) {
    const filled = (rows || []).filter((r) => r.circuit || r.value || r.result === '不合格');
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

  // ---- Page 1（P16）：太陽能模組設備檢查表 ----
  function buildPage1(data, bgDataUrl) {
    const rects = [];
    const allItems = data.items.concat([
      { no: '1.8', status: deriveGroundingItemStatus(data.groundingRows) },
    ]);
    allItems.forEach((it, idx) => {
      const y = P1.itemRowY[idx];
      if (!it.status) return;
      const colX = P1.checkboxCols[it.status];
      rects.push({ x: colX, y, w: P1.checkboxSize, h: P1.checkboxSize });
    });

    const textHtml = `
      ${textDiv(P1.plantName.x, P1.plantName.y, 130, `電廠名稱：${data.meta.plantName}`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.checkDate.x, P1.checkDate.y, 135, `檢查日期：${data.meta.checkDate}`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.inspector.x, P1.inspector.y, 165, `檢查人員：${data.meta.inspector}`, { nowrap: true, autofitW: true })}
      ${textDiv(P1.repairNote.x, P1.repairNote.y, P1.repairNote.w, buildRepairNoteText(data), { autofit: true, h: 18 })}
    `;

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, textHtml };
  }

  // ---- Page 2（P17）：相片框格頁 ----
  function buildPagePhotos(data, bgDataUrl) {
    const images = [];
    Object.keys(P_PHOTOS).forEach((id) => {
      const photo = photoOf(data, id);
      if (photo) {
        const box = P_PHOTOS[id];
        images.push({ dataUrl: photo, x: box.x, y: box.y, w: box.w, h: box.h });
      }
    });
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images, textHtml: '' };
  }

  // ---- Page 3（P18）：太陽能模組熱顯像檢查 ----
  function buildPageThermal(data, bgDataUrl) {
    const images = [];
    const photo = photoOf(data, 'thermal');
    if (photo) {
      const box = P_THERMAL.thermal;
      images.push({ dataUrl: photo, x: box.x, y: box.y, w: box.w, h: box.h });
    }
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images, textHtml: '' };
  }

  // ---- Page 4（P19）：太陽能模組接地連續性檢查 ----
  function buildPageGrounding(data, bgDataUrl) {
    const rows = data.groundingRows && data.groundingRows.length ? data.groundingRows : [];
    const rects = [];
    let textHtml = '';
    rows.forEach((r, i) => {
      if (i >= P4.rowY.length) return;
      // 迴路編號/測量值兩者都沒填，代表這一列使用者根本沒有動過——結果欄位的
      // <select>一定會有預設值（合格），但這不代表使用者真的檢測過，
      // 所以完全沒填資料的列不畫任何勾選記號，避免看起來像「已檢測且合格」。
      const touched = !!(r.circuit || r.value || r.action);
      if (!touched) return;
      const y = P4.rowY[i];
      if (r.circuit) textHtml += textDiv(P4.circuit.x, y, P4.circuit.w, r.circuit, { nowrap: true, autofitW: true });
      if (r.value) textHtml += textDiv(P4.value.x, y, P4.value.w, r.value, { nowrap: true, autofitW: true });
      if (r.action) textHtml += textDiv(P4.action.x, y, P4.action.w, r.action, { autofit: true, min: 7, h: P4.rowH - 2 });
      if (r.result === '不合格') {
        rects.push({ x: P4.failBox.x, y: y + 2, w: P4.failBox.w, h: P4.failBox.h });
      } else if (r.result === '合格') {
        rects.push({ x: P4.passBox.x, y: y + 2, w: P4.passBox.w, h: P4.passBox.h });
      }
    });

    const images = [];
    const abnPhoto = photoOf(data, 'groundAbn');
    if (abnPhoto) {
      images.push({ dataUrl: abnPhoto, x: P4.photo.x, y: P4.photo.y, w: P4.photo.w, h: P4.photo.h });
    }

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  // 注意：這裡故意不做「簽名附錄頁」——原始Word「太陽能模組設備檢查表」本身沒有
  // 簽名欄（簽名印在「定檢項目列表」封面頁，一次涵蓋全部設備表單），以後另外做。

  return { PAGE_W, PAGE_H, buildPage1, buildPagePhotos, buildPageThermal, buildPageGrounding, buildRepairNoteText, esc };
})();
