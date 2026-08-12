// 太陽能模組設備檢查表 —— PDF「底圖套版」座標定義。
// 所有座標都是直接用程式從原始 PDF（國泰電業維運契約附件一）量出來的（單位：pt，A4頁面）。
// 底圖圖檔在 pdf-templates/solar-module-check-p{1,2,3}.png，已預先去除「電廠名稱/檢查日期/
// 檢查人員/無異常/00-00範例迴路編號」這幾個一定會被覆蓋掉的欄位文字，其餘（框線、灰底、
// 標準說明文字、頁尾）都是原始文件截圖，保證跟Word一模一樣。
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

  const P3 = {
    rowY: [148.8, 164.9, 181.0, 197.2, 213.2, 229.3, 245.4, 261.6, 277.7, 293.8],
    rowH: 16.1,
    circuit: { x: 60, w: 90 },
    value: { x: 156, w: 100 },
    passBox: { x: 272.8, w: 8, h: 8 },
    failBox: { x: 320.8, w: 8, h: 8 },
    action: { x: 389, w: 148 },
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
    if (data.repairNote.noIssue && !itemRemarks.length) return '☑ 無異常';
    const bits = [];
    if (data.repairNote.text) bits.push(data.repairNote.text);
    bits.push(...itemRemarks);
    return bits.join('；') || '（未填寫）';
  }

  // ---- Page 1：太陽能模組設備檢查表 ----
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

  // ---- Page 2：太陽能模組熱顯像檢查（完全靜態，不需要疊資料） ----
  function buildPage2(bgDataUrl) {
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], textHtml: '' };
  }

  // ---- Page 3：太陽能模組接地連續性檢查 ----
  function buildPage3(data, bgDataUrl) {
    const rows = data.groundingRows && data.groundingRows.length ? data.groundingRows : [];
    const rects = [];
    let textHtml = '';
    rows.forEach((r, i) => {
      if (i >= P3.rowY.length) return;
      // 迴路編號/測量值兩者都沒填，代表這一列使用者根本沒有動過——結果欄位的
      // <select>一定會有預設值（合格），但這不代表使用者真的檢測過，
      // 所以完全沒填資料的列不畫任何勾選記號，避免看起來像「已檢測且合格」。
      const touched = !!(r.circuit || r.value || r.action);
      if (!touched) return;
      const y = P3.rowY[i];
      if (r.circuit) textHtml += textDiv(P3.circuit.x, y, P3.circuit.w, r.circuit, { nowrap: true, autofitW: true });
      if (r.value) textHtml += textDiv(P3.value.x, y, P3.value.w, r.value, { nowrap: true, autofitW: true });
      if (r.action) textHtml += textDiv(P3.action.x, y, P3.action.w, r.action, { autofit: true, min: 7, h: P3.rowH - 2 });
      if (r.result === '不合格') {
        rects.push({ x: P3.failBox.x, y: y + 2, w: P3.failBox.w, h: P3.failBox.h });
      } else if (r.result === '合格') {
        rects.push({ x: P3.passBox.x, y: y + 2, w: P3.passBox.w, h: P3.passBox.h });
      }
    });
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, textHtml };
  }

  // ---- 附錄頁：照片＋簽名 ----
  // 原始Word裡「太陽能模組設備檢查表」這幾頁本身沒有簽名欄（簽名印在「定檢項目列表」封面頁，
  // 涵蓋全部11張設備表單一起簽），所以這裡不疊在正式3頁上，另外附一頁清楚列出，
  // 避免正式頁面出現原文件沒有的內容。相片同理——原始表格是給人工貼照片的固定小方格，
  // 張數固定、放不下手機隨拍的張數，所以也用這種「附錄清單」方式呈現，比較實用。
  function buildAppendixPage(data, photoGroups) {
    const sections = photoGroups
      .filter((g) => g.photos.length)
      .map(
        (g) => `
        <div style="margin-bottom:16px;">
          <div style="font-weight:bold;font-size:13px;margin-bottom:8px;${FONT}">${esc(g.title)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${g.photos.map((p) => `<img src="${p}" style="width:160px;height:120px;object-fit:cover;border:1px solid #000;" />`).join('')}
          </div>
        </div>`
      )
      .join('');

    const sig = (label, s) => `
      <div style="flex:1;text-align:center;">
        <div style="font-size:12px;margin-bottom:6px;${FONT}">${label}：${esc(s.name)}</div>
        <div style="border:1px solid #000;height:60px;display:flex;align-items:center;justify-content:center;">
          ${s.dataUrl ? `<img src="${s.dataUrl}" style="max-height:52px;max-width:90%;" />` : ''}
        </div>
      </div>`;

    const html = `
      <div style="padding:30px 28px;${FONT}">
        <div style="text-align:center;font-size:17px;font-weight:bold;margin-bottom:18px;">
          附錄：現場照片與簽名確認（${esc(data.formTitle)}）
        </div>
        <div style="font-size:11px;color:#555;margin-bottom:18px;">
          說明：原始表單這幾頁本身沒有簽名欄位（簽名印在「定檢項目列表」封面頁，一次涵蓋全部設備表單），
          此頁為本次數位化紀錄額外附加的照片與簽名存證，非原始文件內容。
        </div>
        ${sections || '<div style="font-size:12px;color:#888;margin-bottom:18px;">（本次紀錄未附照片）</div>'}
        <div style="display:flex;gap:20px;margin-top:20px;">
          ${sig('維運工程師', data.signatures.engineer)}
          ${sig('維運主管', data.signatures.supervisor)}
        </div>
      </div>`;

    return { freeform: true, pageW: PAGE_W, html };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildPage2, buildPage3, buildAppendixPage, buildRepairNoteText, esc };
})();
