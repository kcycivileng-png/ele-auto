// 共用表單元件庫：檢查項目（正常/異常/調整更換）、量測表格（可增減列 或 比照Word固定列數兩種模式）。
// 目的是讓「太陽能模組設備檢查表」之後，其餘19張表單能快速套用同一套元件。
const KtFormKit = (() => {
  function createChecklistItem(container, opts) {
    // opts: { label, onChange }
    const el = document.createElement('div');
    el.className = 'checklist-item';
    el.innerHTML = `
      <div class="item-label">${opts.label}</div>
      <div class="status-group">
        <button type="button" class="status-btn" data-status="ok">正常</button>
        <button type="button" class="status-btn" data-status="bad">異常</button>
        <button type="button" class="status-btn" data-status="fixed">調整/更換</button>
      </div>
      <div class="item-remark" hidden>
        <textarea placeholder="請描述異常狀況或處理方式…"></textarea>
      </div>
    `;
    container.appendChild(el);

    const btns = Array.from(el.querySelectorAll('.status-btn'));
    const remarkWrap = el.querySelector('.item-remark');
    const remarkInput = el.querySelector('textarea');
    let status = null;

    function applyUI() {
      btns.forEach((b) => (b.dataset.active = String(b.dataset.status === status)));
      remarkWrap.hidden = !(status === 'bad' || status === 'fixed');
    }

    btns.forEach((b) => {
      b.addEventListener('click', () => {
        status = b.dataset.status;
        applyUI();
        opts.onChange && opts.onChange();
      });
    });
    remarkInput.addEventListener('input', () => opts.onChange && opts.onChange());

    return {
      getValue: () => ({ status, remark: remarkInput.value.trim() }),
      setValue: (v) => {
        status = (v && v.status) || null;
        remarkInput.value = (v && v.remark) || '';
        applyUI();
      },
    };
  }

  /**
   * 量測表格。
   * columns: [{key, label, type: 'text'|'number'|'select', options?, placeholder?}]
   * fixedRows: 給一個數字時，固定列數（比照Word格式，不能新增/刪除列，用於「PDF需與Word完全一致」的表格）
   * minRows: 沒有給 fixedRows 時，預設可增減列模式的起始列數
   */
  function createEditableTable(container, opts) {
    const isFixed = typeof opts.fixedRows === 'number';

    const wrap = document.createElement('div');
    wrap.className = 'mtable-wrap';
    const table = document.createElement('table');
    table.className = 'mtable';
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>${opts.columns.map((c) => `<th>${c.label}</th>`).join('')}${isFixed ? '' : '<th></th>'}</tr>`;
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);

    let addBtn = null;
    if (!isFixed) {
      addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'small-btn';
      addBtn.textContent = '＋ 新增一列';
      container.appendChild(addBtn);
    }

    function addRow(values, rowIndex) {
      values = values || {};
      const tr = document.createElement('tr');
      opts.columns.forEach((col) => {
        const td = document.createElement('td');
        if (col.type === 'label') {
          // 固定列標題（例如R-S/S-T這種相別），不可編輯，只是把Word原表格的欄位結構
          // 原樣呈現在畫面上；資料不用存進getRows()，因為欄位順序本身就是固定的。
          td.textContent = (col.labels && col.labels[rowIndex]) || '';
          td.className = 'mtable-label-cell';
        } else if (col.type === 'select') {
          const sel = document.createElement('select');
          col.options.forEach((o) => {
            const optEl = document.createElement('option');
            optEl.value = o;
            optEl.textContent = o;
            sel.appendChild(optEl);
          });
          sel.value = values[col.key] || col.options[0];
          sel.dataset.key = col.key;
          td.appendChild(sel);
        } else {
          const input = document.createElement('input');
          input.type = col.type === 'number' ? 'number' : 'text';
          input.dataset.key = col.key;
          input.value = values[col.key] || '';
          if (col.placeholder) input.placeholder = col.placeholder;
          td.appendChild(input);
        }
        tr.appendChild(td);
      });
      if (!isFixed) {
        const tdRm = document.createElement('td');
        const rmBtn = document.createElement('button');
        rmBtn.type = 'button';
        rmBtn.className = 'rm-row-btn';
        rmBtn.textContent = '✕';
        rmBtn.addEventListener('click', () => {
          tr.remove();
          opts.onChange && opts.onChange();
        });
        tdRm.appendChild(rmBtn);
        tr.appendChild(tdRm);
      }
      tbody.appendChild(tr);
    }

    if (addBtn) addBtn.addEventListener('click', () => { addRow(); opts.onChange && opts.onChange(); });

    // 任何儲存格內容變動都通知外部（用於觸發自動儲存草稿）
    tbody.addEventListener('input', () => opts.onChange && opts.onChange());
    tbody.addEventListener('change', () => opts.onChange && opts.onChange());

    const initialRows = isFixed ? opts.fixedRows : (opts.minRows || 1);
    for (let i = 0; i < initialRows; i++) addRow(undefined, i);

    return {
      getRows: () =>
        Array.from(tbody.querySelectorAll('tr')).map((tr) => {
          const row = {};
          Array.from(tr.querySelectorAll('[data-key]')).forEach((input) => {
            row[input.dataset.key] = input.value;
          });
          return row;
        }),
      setRows: (rows) => {
        tbody.innerHTML = '';
        const src = rows || [];
        if (isFixed) {
          for (let i = 0; i < opts.fixedRows; i++) addRow(src[i], i);
        } else {
          (src.length ? src : [{}]).forEach((r, i) => addRow(r, i));
        }
      },
    };
  }

  return { createChecklistItem, createEditableTable };
})();
