// 附表一・維運報告（主表單，4頁）—— PDF「底圖套版」座標定義（單位：pt，A4頁面）。
// 座標量測自 03_維運報告_套版範本.docx（P13~P16，含 {{}} 佔位符，比對比對填實例更準）。
// 底圖 pdf-templates/cover-report-check-p{1..4}.png 已去除所有 {{欄位名}} 佔位符文字。
const CoverReportCheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";

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

  // ======================================================================
  // Page 1（P13）：維運報告封面
  // ======================================================================
  const P1 = {
    holder: { x: 76.6, y: 179, w: 442 },
    plantName: { x: 76.6, y: 244, w: 442 },
    plantAddr: { x: 76.6, y: 309, w: 442 },
    capacity: { x: 76.6, y: 388, w: 216 },
    gridDate: { x: 297.8, y: 388, w: 226 },
    year: { x: 71.3, y: 481, w: 226 },
    period: { x: 297.8, y: 481, w: 226 },
    vendor: { x: 71.3, y: 574, w: 226 },
    staffName: { x: 297.8, y: 568, w: 118 },
    supervisorName: { x: 297.8, y: 581, w: 118 },
    supervisorSig: { x: 155, y: 638, w: 130, h: 34 },
    supervisorSigDate: { x: 154, y: 674, w: 90 },
    staffSig: { x: 382, y: 638, w: 130, h: 34 },
    staffSigDate: { x: 381, y: 674, w: 90 },
  };

  function buildPage1(data, bgDataUrl) {
    const textHtml = `
      ${textDiv(P1.holder.x, P1.holder.y, P1.holder.w, data.holder, { nowrap: true, autofitW: true, size: 13 })}
      ${textDiv(P1.plantName.x, P1.plantName.y, P1.plantName.w, data.plantName, { nowrap: true, autofitW: true, size: 13 })}
      ${textDiv(P1.plantAddr.x, P1.plantAddr.y, P1.plantAddr.w, data.plantAddr, { autofit: true, h: 18, size: 12 })}
      ${textDiv(P1.capacity.x, P1.capacity.y, P1.capacity.w, data.capacity ? `${data.capacity} kWp` : '', { nowrap: true, autofitW: true })}
      ${textDiv(P1.gridDate.x, P1.gridDate.y, P1.gridDate.w, data.gridDate, { nowrap: true, autofitW: true })}
      ${textDiv(P1.year.x, P1.year.y, P1.year.w, data.year, { nowrap: true, autofitW: true })}
      ${textDiv(P1.period.x, P1.period.y, P1.period.w, data.period, { nowrap: true, autofitW: true })}
      ${textDiv(P1.vendor.x, P1.vendor.y, P1.vendor.w, data.vendor, { nowrap: true, autofitW: true })}
      ${textDiv(P1.staffName.x, P1.staffName.y, P1.staffName.w, data.staffName, { nowrap: true, autofitW: true, size: 10.5 })}
      ${textDiv(P1.supervisorName.x, P1.supervisorName.y, P1.supervisorName.w, data.supervisorName, { nowrap: true, autofitW: true, size: 10.5 })}
      ${textDiv(P1.supervisorSigDate.x, P1.supervisorSigDate.y, P1.supervisorSigDate.w, data.supervisorSigDate, { nowrap: true, autofitW: true, size: 10.5 })}
      ${textDiv(P1.staffSigDate.x, P1.staffSigDate.y, P1.staffSigDate.w, data.staffSigDate, { nowrap: true, autofitW: true, size: 10.5 })}
    `;
    const images = [];
    if (data.supervisorSig) images.push({ dataUrl: data.supervisorSig, x: P1.supervisorSig.x, y: P1.supervisorSig.y, w: P1.supervisorSig.w, h: P1.supervisorSig.h });
    if (data.staffSig) images.push({ dataUrl: data.staffSig, x: P1.staffSig.x, y: P1.staffSig.y, w: P1.staffSig.w, h: P1.staffSig.h });
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images, textHtml };
  }

  // ======================================================================
  // Page 2（P14）：電廠基本資料
  // ======================================================================
  const CB = 3.5; // checkbox 半徑近似值：小勾選方塊邊長
  const P2 = {
    vendorName: { x: 351, y: 102, w: 90 },
    vendorContact: { x: 355.5, y: 118.5, w: 70 },
    vendorPhone: { x: 261.8, y: 135, w: 55 },
    vendorMobile: { x: 453.3, y: 135, w: 55 },
    vendorEmail: { x: 358, y: 151, w: 130 },
    plantName: { x: 333.4, y: 167, w: 190 },
    plantAddr: { x: 333.4, y: 183.5, w: 190 },
    capacity: { x: 313.8, y: 199.7, w: 90 },
    gridDate: { x: 324.9, y: 216, w: 90 },
    strings: { x: 329.2, y: 232.2, w: 190 },
    // 模組1
    m1TypeCheck: { crystalline: { x: 313, y: 254 }, poly: { x: 331, y: 254 }, amorphous: { x: 349, y: 254 }, other: { x: 367, y: 254 } },
    m1Brand: { x: 267, y: 280.5, w: 43 },
    m1Model: { x: 458.6, y: 280.5, w: 43 },
    m1Watt: { x: 243.2, y: 297.4, w: 55 },
    m1Spec: { x: 450.1, y: 297.4, w: 60 },
    // 模組2
    m2TypeCheck: { crystalline: { x: 313, y: 319 }, poly: { x: 331, y: 319 }, amorphous: { x: 349, y: 319 }, other: { x: 367, y: 319 } },
    m2Brand: { x: 260.5, y: 345.8, w: 43 },
    m2Model: { x: 458.6, y: 345.8, w: 43 },
    m2Watt: { x: 243.6, y: 359.7, w: 55 },
    m2Spec: { x: 447.9, y: 364.6, w: 65 },
    // 逆變器1
    inv1Brand: { x: 256.1, y: 383.3, w: 43 },
    inv1Model: { x: 454.3, y: 383.3, w: 43 },
    inv1Qty: { x: 256.1, y: 407.2, w: 43 },
    inv1Power: { x: 437.4, y: 407.2, w: 78 },
    inv1VRange: { x: 247.5, y: 433.4, w: 60 },
    inv1Current: { x: 437.4, y: 439.0, w: 78 },
    inv1MpptRange: { x: 243.3, y: 465.2, w: 65 },
    inv1OutVSpec: { x: 437.1, y: 465.2, w: 78 },
    // 逆變器2
    inv2Brand: { x: 256.1, y: 494.6, w: 43 },
    inv2Model: { x: 454.3, y: 494.6, w: 43 },
    inv2Qty: { x: 256.1, y: 518.5, w: 43 },
    inv2Power: { x: 437.4, y: 518.5, w: 78 },
    inv2VRange: { x: 247.5, y: 544.8, w: 60 },
    inv2Current: { x: 437.4, y: 550.3, w: 78 },
    inv2MpptRange: { x: 243.3, y: 576.4, w: 65 },
    inv2OutVSpec: { x: 437.1, y: 576.4, w: 78 },
    // 變壓器
    xfmrIn: { x: 250.9, y: 605.8, w: 55 },
    xfmrOut: { x: 250.9, y: 622.0, w: 55 },
    xfmrCapacity: { x: 438.9, y: 605.8, w: 55 },
    xfmrQty: { x: 444.8, y: 622.0, w: 40 },
    // 模組架台
    rackMaterialCheck: { hotgalv: { x: 344, y: 636 }, stainless: { x: 362, y: 636 }, aluminum: { x: 380, y: 636 }, other: { x: 398, y: 636 } },
    tiltAngle: { x: 342.7, y: 654.2, w: 55 },
    // PV輸出電壓規格
    pvPhaseCheck: { p2w: { x: 300, y: 668 }, p3w1: { x: 318, y: 668 }, p3w3: { x: 336, y: 668 }, p3w4: { x: 354, y: 668 } },
    pvVoltCheck: { v110: { x: 300, y: 682 }, v220: { x: 318, y: 682 }, v220_380: { x: 336, y: 682 }, other: { x: 400, y: 682 } },
  };

  function buildPage2(data, bgDataUrl) {
    const m = data.meta || {};
    let textHtml = '';
    const T = (def, val, opts) => { if (val) textHtml += textDiv(def.x, def.y, def.w, val, Object.assign({ nowrap: true, autofitW: true, size: 9.5 }, opts || {})); };

    T(P2.vendorName, m.vendorName);
    T(P2.vendorContact, m.vendorContact);
    T(P2.vendorPhone, m.vendorPhone);
    T(P2.vendorMobile, m.vendorMobile);
    T(P2.vendorEmail, m.vendorEmail);
    T(P2.plantName, m.plantName, { size: 10 });
    T(P2.plantAddr, m.plantAddr, { size: 9 });
    T(P2.capacity, m.capacity ? `${m.capacity} kW` : '');
    T(P2.gridDate, m.gridDate);
    T(P2.strings, m.strings, { size: 9 });

    T(P2.m1Brand, m.m1Brand);
    T(P2.m1Model, m.m1Model);
    T(P2.m1Watt, m.m1Watt ? `${m.m1Watt} Wp` : '');
    T(P2.m1Spec, m.m1Spec, { size: 8.5 });
    T(P2.m2Brand, m.m2Brand);
    T(P2.m2Model, m.m2Model);
    T(P2.m2Watt, m.m2Watt ? `${m.m2Watt} Wp` : '');
    T(P2.m2Spec, m.m2Spec, { size: 8.5 });

    T(P2.inv1Brand, m.inv1Brand);
    T(P2.inv1Model, m.inv1Model);
    T(P2.inv1Qty, m.inv1Qty);
    T(P2.inv1Power, m.inv1Power);
    T(P2.inv1VRange, m.inv1VRange, { size: 8.5 });
    T(P2.inv1Current, m.inv1Current);
    T(P2.inv1MpptRange, m.inv1MpptRange, { size: 8.5 });
    T(P2.inv1OutVSpec, m.inv1OutVSpec);
    T(P2.inv2Brand, m.inv2Brand);
    T(P2.inv2Model, m.inv2Model);
    T(P2.inv2Qty, m.inv2Qty);
    T(P2.inv2Power, m.inv2Power);
    T(P2.inv2VRange, m.inv2VRange, { size: 8.5 });
    T(P2.inv2Current, m.inv2Current);
    T(P2.inv2MpptRange, m.inv2MpptRange, { size: 8.5 });
    T(P2.inv2OutVSpec, m.inv2OutVSpec);

    T(P2.xfmrIn, m.xfmrIn);
    T(P2.xfmrOut, m.xfmrOut);
    T(P2.xfmrCapacity, m.xfmrCapacity ? `${m.xfmrCapacity} Kva` : '');
    T(P2.xfmrQty, m.xfmrQty ? `${m.xfmrQty} 個` : '');
    T(P2.tiltAngle, m.tiltAngle ? `${m.tiltAngle} 度` : '');

    const rects = [];
    const SIZE = 8;
    function checkOne(group, key) {
      const box = P2[group] && P2[group][key];
      if (box) rects.push({ x: box.x, y: box.y, w: SIZE, h: SIZE });
    }
    if (m.m1Type) checkOne('m1TypeCheck', m.m1Type);
    if (m.m2Type) checkOne('m2TypeCheck', m.m2Type);
    if (m.rackMaterial) checkOne('rackMaterialCheck', m.rackMaterial);
    if (m.pvPhase) checkOne('pvPhaseCheck', m.pvPhase);
    if (m.pvVolt) checkOne('pvVoltCheck', m.pvVolt);

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images: [], textHtml };
  }

  // ======================================================================
  // Page 3（P15）：逆變器配置表（固定10列）
  // ======================================================================
  const P3 = {
    rowY: [129.6, 178.9, 228.3, 277.5, 326.8, 376.1, 425.3, 474.7, 524.0, 573.2],
    rowH: 49.3,
    col: {
      serial: { x: 100, w: 98 },
      brand: { x: 202, w: 36 },
      model: { x: 242.5, w: 73 },
      dcBox: { x: 319.6, w: 57 },
      config: { x: 380.8, w: 84 },
      capacity: { x: 469.3, w: 53 },
    },
  };

  function buildPage3(data, bgDataUrl) {
    let textHtml = '';
    const rows = data.inverterRows || [];
    rows.forEach((r, i) => {
      if (i >= P3.rowY.length) return;
      const y = P3.rowY[i] + (P3.rowH - 12) / 2;
      Object.keys(P3.col).forEach((key) => {
        const val = r[key];
        if (!val) return;
        const def = P3.col[key];
        textHtml += textDiv(def.x, y, def.w, val, { autofit: true, h: P3.rowH - 4, size: 9, min: 6.5 });
      });
    });
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images: [], textHtml };
  }

  // ======================================================================
  // Page 4（P16）：定檢項目列表 + 總結說明 + 簽名
  // ======================================================================
  const P4 = {
    summary: { x: 82.5, y: 336, w: 448, h: 290 },
    staffSig: { x: 170, y: 636, w: 125, h: 34 },
    supervisorSig: { x: 385, y: 636, w: 125, h: 34 },
  };

  function buildPage4(data, bgDataUrl) {
    const textHtml = `
      ${textDiv(P4.summary.x, P4.summary.y, P4.summary.w, data.summary, { autofit: true, h: P4.summary.h, size: 11, min: 7 })}
    `;
    const images = [];
    if (data.staffSig) images.push({ dataUrl: data.staffSig, x: P4.staffSig.x, y: P4.staffSig.y, w: P4.staffSig.w, h: P4.staffSig.h });
    if (data.supervisorSig) images.push({ dataUrl: data.supervisorSig, x: P4.supervisorSig.x, y: P4.supervisorSig.y, w: P4.supervisorSig.w, h: P4.supervisorSig.h });
    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects: [], images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, buildPage2, buildPage3, buildPage4, esc };
})();
