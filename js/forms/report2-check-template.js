// 附表二・電廠檢修報告 —— PDF「底圖套版」座標定義。
// 這張表跟其他設備檢查表結構完全不同：單頁的事故報告表單，沒有可預先填好範例的
// 佔位文字（欄位原本就是空的），所以底圖不需要做任何redact，直接截原始P41即可。
const Report2CheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";
  const CHECK_SIZE = 12;

  const F = {
    holder: { x: 175, y: 131.8, w: 350 },
    plantName: { x: 175, y: 160.6, w: 350 },
    // 障礙來源：9個選項，座標對應原始文件的□位置（多選）
    source: {
      客戶屋主告修: { x: 175.1, y: 190.1 },
      系統警報: { x: 277.1, y: 190.1 },
      緊急維運告修: { x: 343.1, y: 190.1 },
      數據分析告修: { x: 433.1, y: 190.1 },
      定檢告修: { x: 175.1, y: 205.7 },
      颱風檢查告修: { x: 241.1, y: 205.7 },
      地震檢查告修: { x: 325.1, y: 205.7 },
      追蹤告修: { x: 415.1, y: 205.7 },
      其他告修: { x: 175.1, y: 221.3 },
    },
    reportTime: { x: 175, y: 250.8, w: 350 },
    completeTime: { x: 175, y: 279.6, w: 350 },
    issueDesc: { x: 175, y: 302, w: 348, h: 79 },
    cause: { x: 175, y: 388, w: 348, h: 51 },
    impact: { x: 175, y: 445, w: 348, h: 51 },
    solution: { x: 175, y: 502, w: 348, h: 51 },
    closedYes: { x: 125.8, y: 565.7 },
    closedNo: { x: 125.8, y: 620.9 },
    closeTime: { x: 280, y: 565.7, w: 245 },
    followUp: { x: 280, y: 621, w: 245, h: 42 },
    sigEngineer: { x: 169.9, y: 683.9, w: 180.7, h: 56.4 },
    sigSupervisor: { x: 351.1, y: 683.9, w: 180.5, h: 56.4 },
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
    return `<div ${autofitAttr} ${autofitWAttr} style="position:absolute;left:${x}px;top:${y}px;width:${w}px;${h}font-size:${size}px;line-height:1.35;${FONT}color:#000;white-space:${opts.nowrap ? 'nowrap' : 'normal'};">${esc(text)}</div>`;
  }

  function buildPage1(data, bgDataUrl) {
    const rects = [];
    (data.source || []).forEach((key) => {
      const pos = F.source[key];
      if (pos) rects.push({ x: pos.x, y: pos.y, w: CHECK_SIZE, h: CHECK_SIZE });
    });
    if (data.closed === '是') rects.push({ x: F.closedYes.x, y: F.closedYes.y, w: CHECK_SIZE, h: CHECK_SIZE });
    if (data.closed === '否') rects.push({ x: F.closedNo.x, y: F.closedNo.y, w: CHECK_SIZE, h: CHECK_SIZE });

    let textHtml = '';
    textHtml += textDiv(F.holder.x, F.holder.y, F.holder.w, data.holder, { nowrap: true, autofitW: true });
    textHtml += textDiv(F.plantName.x, F.plantName.y, F.plantName.w, data.plantName, { nowrap: true, autofitW: true });
    textHtml += textDiv(F.reportTime.x, F.reportTime.y, F.reportTime.w, data.reportTime, { nowrap: true, autofitW: true });
    textHtml += textDiv(F.completeTime.x, F.completeTime.y, F.completeTime.w, data.completeTime, { nowrap: true, autofitW: true });
    textHtml += textDiv(F.issueDesc.x, F.issueDesc.y, F.issueDesc.w, data.issueDesc, { autofit: true, h: F.issueDesc.h });
    textHtml += textDiv(F.cause.x, F.cause.y, F.cause.w, data.cause, { autofit: true, h: F.cause.h });
    textHtml += textDiv(F.impact.x, F.impact.y, F.impact.w, data.impact, { autofit: true, h: F.impact.h });
    textHtml += textDiv(F.solution.x, F.solution.y, F.solution.w, data.solution, { autofit: true, h: F.solution.h });
    if (data.closed === '是') {
      textHtml += textDiv(F.closeTime.x, F.closeTime.y, F.closeTime.w, `結案時間：${data.closeTime || ''}`, { nowrap: true, autofitW: true });
    } else if (data.closed === '否') {
      textHtml += textDiv(F.followUp.x, F.followUp.y, F.followUp.w, `追蹤事項：${data.followUp || ''}`, { autofit: true, h: F.followUp.h });
    }

    const images = [];
    if (data.signatures && data.signatures.engineer) {
      images.push({ dataUrl: data.signatures.engineer, x: F.sigEngineer.x, y: F.sigEngineer.y, w: F.sigEngineer.w, h: F.sigEngineer.h });
    }
    if (data.signatures && data.signatures.supervisor) {
      images.push({ dataUrl: data.signatures.supervisor, x: F.sigSupervisor.x, y: F.sigSupervisor.y, w: F.sigSupervisor.w, h: F.sigSupervisor.h });
    }

    return { pageW: PAGE_W, pageH: PAGE_H, background: bgDataUrl, rects, images, textHtml };
  }

  return { PAGE_W, PAGE_H, buildPage1, esc, SOURCE_KEYS: Object.keys(F.source) };
})();
