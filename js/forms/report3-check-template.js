// 附表三・電廠損壞報告 —— PDF「底圖套版」座標定義（做法同附表二，底圖不需redact）。
const Report3CheckTemplate = (() => {
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const FONT = "font-family:'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif;";
  const CHECK_SIZE = 12;

  const F = {
    holder: { x: 168, y: 131.8, w: 358 },
    plantName: { x: 168, y: 160.6, w: 358 },
    source: {
      客戶屋主告修: { x: 168.0, y: 190.1 },
      系統警報: { x: 270.0, y: 190.1 },
      緊急維運告修: { x: 336.1, y: 190.1 },
      數據分析告修: { x: 168.0, y: 205.7 },
      定檢告修: { x: 258.0, y: 205.7 },
      颱風檢查告修: { x: 324.1, y: 205.7 },
      地震檢查告修: { x: 168.0, y: 221.3 },
      追蹤告修: { x: 258.0, y: 221.3 },
      其他告修: { x: 324.1, y: 221.3 },
    },
    contact: { x: 168, y: 258, w: 358 },
    damageTime: { x: 168, y: 288, w: 358 },
    item: { x: 168, y: 316, w: 358, h: 40 },
    lossDuration: { x: 168, y: 372, w: 358, h: 33 },
    lossAmount: { x: 168, y: 420, w: 358, h: 33 },
    description: { x: 168, y: 468, w: 358, h: 33 },
    closedYes: { x: 122.2, y: 526.1 },
    closeTime: { x: 250, y: 508.5, w: 275 },
    resolutionNote: { x: 250, y: 537.8, w: 275, h: 22 },
    closedNo: { x: 122.2, y: 596.1 },
    suggestedSolution: { x: 250, y: 588, w: 275, h: 53 },
    sigEngineer: { x: 180.9, y: 666.7, w: 175.1, h: 56.4 },
    sigSupervisor: { x: 356.5, y: 666.7, w: 175.1, h: 56.4 },
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
    textHtml += textDiv(F.contact.x, F.contact.y, F.contact.w, data.contact, { nowrap: true, autofitW: true });
    textHtml += textDiv(F.damageTime.x, F.damageTime.y, F.damageTime.w, data.damageTime, { nowrap: true, autofitW: true });
    textHtml += textDiv(F.item.x, F.item.y, F.item.w, data.item, { autofit: true, h: F.item.h });
    textHtml += textDiv(F.lossDuration.x, F.lossDuration.y, F.lossDuration.w, data.lossDuration, { autofit: true, h: F.lossDuration.h });
    textHtml += textDiv(F.lossAmount.x, F.lossAmount.y, F.lossAmount.w, data.lossAmount, { autofit: true, h: F.lossAmount.h });
    textHtml += textDiv(F.description.x, F.description.y, F.description.w, data.description, { autofit: true, h: F.description.h });
    if (data.closed === '是') {
      textHtml += textDiv(F.closeTime.x, F.closeTime.y, F.closeTime.w, `結案時間：${data.closeTime || ''}`, { nowrap: true, autofitW: true });
      textHtml += textDiv(F.resolutionNote.x, F.resolutionNote.y, F.resolutionNote.w, `決方式說明：${data.resolutionNote || ''}`, { autofit: true, h: F.resolutionNote.h });
    } else if (data.closed === '否') {
      textHtml += textDiv(F.suggestedSolution.x, F.suggestedSolution.y, F.suggestedSolution.w, data.suggestedSolution, { autofit: true, h: F.suggestedSolution.h });
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
