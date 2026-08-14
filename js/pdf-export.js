// PDF 匯出：將畫面外渲染好的 HTML（由各表單自行決定排版）用 html2canvas 拍成圖片，再組成 A4 PDF。
//
// 為什麼不用 jsPDF 內建文字/表格 API 直接畫中文？
// jsPDF 預設字型（Helvetica 等）不含中文字圖，直接畫中文會變成亂碼方塊。
// 要正確顯示中文必須內嵌一整套中文字型檔（單一字重常常超過 10MB），會讓 PWA 變得很肥大、
// 且離線快取也會變慢。改用「畫面快照轉圖片」的方式，直接借用手機瀏覽器本身內建的中文字型
// （iOS 的 PingFang TC、Android 的 Noto Sans CJK 等）來畫字，不必額外下載任何字型檔，
// 畫出來的中文品質也比較好、與網頁上看到的一致。
const KtPdf = (() => {
  const { jsPDF } = window.jspdf;
  const PAGE_W = 595.28; // A4 pt
  const PAGE_H = 841.89;

  // 文字自動塞進固定儲存格：先縮小字體，縮到最小仍放不下時才讓該儲存格微幅增高。
  // 用於「PDF必須跟Word原始表格一模一樣」的欄位——絕大多數情況版面會跟Word完全一致，
  // 只有填寫的文字量遠超一般狀況時，才會犧牲一點點列高來保證資料不被截斷或跑版。
  function autofitCells(host) {
    const els = host.querySelectorAll('[data-autofit]');
    els.forEach((el) => {
      const min = parseFloat(el.dataset.autofitMin || '8');
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollHeight > el.clientHeight + 1 && size > min) {
        size -= 0.5;
        el.style.fontSize = size + 'px';
      }
      if (el.scrollHeight > el.clientHeight + 1) {
        el.style.height = 'auto';
        el.style.maxHeight = 'none';
      }
    });
    // 單行、限制「寬度」不能超出的欄位（例如電廠名稱這種橫向並排的欄位，
    // 塞太長會蓋到旁邊的欄位）——縮字體讓寬度塞得下，而不是縮高度。
    const wEls = host.querySelectorAll('[data-autofit-w]');
    wEls.forEach((el) => {
      const min = parseFloat(el.dataset.autofitMin || '7');
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 1 && size > min) {
        size -= 0.5;
        el.style.fontSize = size + 'px';
      }
    });
  }

  async function captureCanvas(hostElement) {
    return html2canvas(hostElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  }

  // canvases: 一個畫面區塊（例如文件裡的一個「段落/分頁」）對應一張canvas。
  // 每張canvas永遠從新的一頁開始——html2canvas不會理會CSS的page-break，
  // 所以「每個段落各自從新頁開始」這件事，必須靠「每個段落各自獨立拍照」來保證，
  // 不能靠把所有HTML串在一起再切圖（那樣切頁位置會切在任意一列中間，切斷表格列）。
  function addCanvasAsPages(doc, canvas, isVeryFirstPage) {
    const pageAspect = PAGE_H / PAGE_W;
    const pxPerPage = Math.floor(canvas.width * pageAspect);
    let rendered = 0;
    let first = isVeryFirstPage;

    while (rendered < canvas.height) {
      const sliceH = Math.min(pxPerPage, canvas.height - rendered);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceH;
      const ctx = pageCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, rendered, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.88);
      if (!first) doc.addPage();
      const renderH = (sliceH / canvas.width) * PAGE_W;
      doc.addImage(imgData, 'JPEG', 0, 0, PAGE_W, renderH);
      rendered += sliceH;
      first = false;
    }
  }

  async function renderHtmlToPdf(hostElement) {
    const canvas = await captureCanvas(hostElement);
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    addCanvasAsPages(doc, canvas, true);
    return doc.output('blob');
  }

  // sections: 陣列，每個元素是 {host, render(data)} 或已經是渲染好的 HTMLElement。
  // 呼叫端負責依序把每段HTML塞進共用的host、等圖片載入、跑autofit，再把host傳進來這裡拍照。
  async function renderSectionsToPdf(canvases) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    canvases.forEach((canvas, idx) => addCanvasAsPages(doc, canvas, idx === 0));
    return doc.output('blob');
  }

  // ------------------------------------------------------------------
  // 底圖套版：用原始文件截圖當背景，保證框線/灰底/字體/頁尾跟Word一模一樣，
  // 使用者填的內容只是「蓋章」蓋上去，不用自己刻表格結構。
  //   - background：原始頁面截圖（build時已去除電廠名稱等固定會被覆蓋的欄位）
  //   - rects：勾選框這類不需要中文字型的標記，直接用jsPDF原生矩形畫（清晰、不會有字型問題）
  //   - textHtml：需要中文字的內容（電廠名稱、備註...），用透明背景的html2canvas疊圖
  //   - images：照片、簽名
  //   - freeform：不套底圖的附錄頁（例如照片/簽名附錄），直接整頁拍照
  // ------------------------------------------------------------------
  function waitForImages(host) {
    const imgs = Array.from(host.querySelectorAll('img'));
    return Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
  }

  async function renderTextOverlay(html, pageW, pageH, scale) {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    host.style.top = '0';
    host.style.width = pageW + 'px';
    host.style.height = pageH + 'px';
    host.style.overflow = 'hidden';
    host.innerHTML = html;
    document.body.appendChild(host);
    await waitForImages(host);
    autofitCells(host);
    // scale 要跟底圖合成畫布的解析度一致，不然疊字圖解析度較低，合成後文字會比底圖模糊。
    const canvas = await html2canvas(host, { scale: scale || 2, backgroundColor: null, width: pageW, height: pageH });
    document.body.removeChild(host);
    return canvas;
  }

  // freeform頁的HTML可能比一頁A4還長（例如照片很多張），所以用「自然高度拍照→切成多頁」，
  // 跟templated頁共用同一份doc、同一組「是否已經有第一頁」狀態，確保接續在同一份PDF裡。
  async function renderFreeformFlow(html, pageW) {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    host.style.top = '0';
    host.style.width = pageW + 'px';
    host.style.background = '#ffffff';
    host.innerHTML = html;
    document.body.appendChild(host);
    await waitForImages(host);
    autofitCells(host);
    const canvas = await captureCanvas(host);
    document.body.removeChild(host);
    return canvas;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // 把照片「完整縮放進」目標框格，維持原始長寬比、不裁切任何內容（object-fit:contain
  // 的邏輯）——現場照片是稽核證據，不能因為框格比例不同就被裁掉一部分。多出來的空間
  // 置中留白（框格底色本來就是白的，不會顯得突兀）。
  function drawImageContain(ctx, img, dx, dy, dw, dh) {
    const srcRatio = img.width / img.height;
    const dstRatio = dw / dh;
    let w, h;
    if (srcRatio > dstRatio) {
      w = dw;
      h = dw / srcRatio;
    } else {
      h = dh;
      w = dh * srcRatio;
    }
    const x = dx + (dw - w) / 2;
    const y = dy + (dh - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }

  // 重點：jsPDF 內嵌「帶透明背景的PNG」時幾乎不會壓縮（實測一張疊字圖從 <100KB 的
  // canvas 資料膨脹成嵌入PDF後 5~7MB），推測是它把RGB+透明遮罩拆成兩張點陣圖分別存，
  // 沒有妥善套用壓縮。解法是自己在canvas上把底圖、勾選框、疊字圖、照片都合成到
  // 「同一張不透明canvas」，最後只輸出一張JPEG給jsPDF，完全避開這個問題，
  // 檔案大小也回到正常水準（一頁大約100~300KB）。
  async function renderTemplatedPdf(pages) {
    const doc = new jsPDF({ unit: 'pt', format: [pages[0].pageW, pages[0].pageH] });
    let pageStarted = false;

    for (const page of pages) {
      if (page.freeform) {
        const canvas = await renderFreeformFlow(page.html, page.pageW);
        addCanvasAsPages(doc, canvas, !pageStarted);
        pageStarted = true;
        continue;
      }

      if (pageStarted) doc.addPage([page.pageW, page.pageH]);
      pageStarted = true;

      let bgImg = null;
      if (page.background) bgImg = await loadImage(page.background);
      // 用底圖本身的解析度合成畫布，確保底圖不失真（框線、細字最敏感）
      const scale = bgImg ? bgImg.width / page.pageW : 2;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(page.pageW * scale);
      canvas.height = Math.round(page.pageH * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (bgImg) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      (page.rects || []).forEach((r) => {
        ctx.fillRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale);
      });

      for (const im of page.images || []) {
        const img = await loadImage(im.dataUrl);
        // contain 模式不一定會填滿整個框格（可能上下或左右留白），
        // 所以要先畫白色蓋掉底圖裡原本的說明文字（例如"(支架)"），避免露出來跟照片重疊。
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(im.x * scale, im.y * scale, im.w * scale, im.h * scale);
        drawImageContain(ctx, img, im.x * scale, im.y * scale, im.w * scale, im.h * scale);
      }

      if (page.textHtml) {
        const textCanvas = await renderTextOverlay(page.textHtml, page.pageW, page.pageH, scale);
        ctx.drawImage(textCanvas, 0, 0, canvas.width, canvas.height);
      }

      doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, page.pageW, page.pageH);
    }

    return doc.output('blob');
  }

  return { renderHtmlToPdf, renderSectionsToPdf, captureCanvas, autofitCells, renderTemplatedPdf };
})();
