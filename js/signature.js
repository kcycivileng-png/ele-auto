// 輕量手寫簽名元件（不依賴外部套件），支援手指/觸控筆與滑鼠。
const KtSignature = (() => {
  function createSignaturePad(container, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'sig-pad-wrap';
    wrap.innerHTML = `<canvas></canvas>`;
    container.appendChild(wrap);

    const actions = document.createElement('div');
    actions.className = 'sig-actions';
    actions.innerHTML = `
      <span class="sig-status">尚未簽名</span>
      <button type="button" class="sig-clear-btn">清除重簽</button>
    `;
    container.appendChild(actions);

    const canvas = wrap.querySelector('canvas');
    const statusEl = actions.querySelector('.sig-status');
    const clearBtn = actions.querySelector('.sig-clear-btn');
    const ctx = canvas.getContext('2d');

    let drawing = false;
    let hasSignature = false;
    let last = null;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const prevData = hasSignature ? canvas.toDataURL() : null;
      canvas.width = rect.width * dpr;
      canvas.height = 160 * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1c2320';
      if (prevData) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, 160);
        img.src = prevData;
      }
    }

    function pointerPos(e) {
      const rect = canvas.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      return { x: point.clientX - rect.left, y: point.clientY - rect.top };
    }

    function start(e) {
      e.preventDefault();
      drawing = true;
      last = pointerPos(e);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      const p = pointerPos(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
      if (!hasSignature) {
        hasSignature = true;
        statusEl.textContent = '✓ 已簽名';
        opts.onChange && opts.onChange(true);
      }
    }
    function end() { drawing = false; }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);

    clearBtn.addEventListener('click', () => {
      const rect = wrap.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, 160);
      hasSignature = false;
      statusEl.textContent = '尚未簽名';
      opts.onChange && opts.onChange(false);
    });

    window.addEventListener('resize', resize);
    // 延遲一個 tick 讓容器版面確定寬度後再設定畫布尺寸
    requestAnimationFrame(resize);

    return {
      isEmpty: () => !hasSignature,
      toDataURL: () => (hasSignature ? canvas.toDataURL('image/png') : null),
      loadDataURL: (dataUrl) => {
        if (!dataUrl) return;
        const rect = wrap.getBoundingClientRect();
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, 160);
          hasSignature = true;
          statusEl.textContent = '✓ 已簽名';
        };
        img.src = dataUrl;
      },
      clear: () => clearBtn.click(),
      // 容器從 hidden 切換成顯示後（例如切換紀錄列表⇄編輯畫面），
      // 必須重新呼叫這個方法量測實際寬度，否則畫布會維持建立當下量到的 0 尺寸，
      // 導致簽名畫了也存不下來。
      resize,
    };
  }

  return { createSignaturePad };
})();
