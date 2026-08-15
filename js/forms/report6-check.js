(function () {
  const FORM_ID = 'report6-check';
  const FORM_TITLE = '太陽光電電廠設備颱風過後檢查表';

  const ITEMS = [
    { no: 1, group: '太陽能模組', label: '模組外觀是否有損壞' },
    { no: 2, group: '', label: '模組螺絲是否鬆脫，模組是否飛脫' },
    { no: 3, group: '', label: 'PV線路是否損傷斷裂' },
    { no: 4, group: '直交流配電盤', label: '盤體是否脫落' },
    { no: 5, group: '', label: '盤體外觀是否損傷' },
    { no: 6, group: '', label: '盤體門板是否開合正常' },
    { no: 7, group: '支架及線槽及輸配線路', label: '支架是否變形' },
    { no: 8, group: '', label: '檢查固定螺絲是否鬆弛' },
    { no: 9, group: '', label: '檢查線槽是否有蓋板脫離/遺失' },
    { no: 10, group: '周遭環境檢查', label: '檢查模組周遭是否有其他異物' },
    { no: 11, group: '', label: '檢查屋頂排水槽(孔)是否有異物阻塞' },
    { no: 12, group: '避雷針', label: '避雷針是否損壞' },
    { no: 13, group: '', label: '檢查線路是否損傷' },
    { no: 14, group: '逆變器', label: '逆變器是否損壞' },
    { no: 15, group: '', label: '檢查AC/DC接頭是否鬆脫或脫落' },
    { no: 16, group: '變壓器', label: '檢查外觀是否損壞' },
    { no: 17, group: '', label: '檢查是否運作正常' },
    { no: 18, group: '', label: '檢查接地線是否損傷' },
  ];
  const STATUS_LABEL = { ok: '正常', bad: '異常' };

  const els = {
    headerBackBtn: document.getElementById('headerBackBtn'),
    headerSubtitle: document.getElementById('headerSubtitle'),
    recordsListView: document.getElementById('recordsListView'),
    formEditorView: document.getElementById('formEditorView'),
    editorActionBar: document.getElementById('editorActionBar'),
    recordsList: document.getElementById('recordsList'),
    emptyState: document.getElementById('emptyState'),
    newRecordBtn: document.getElementById('newRecordBtn'),
    exportAllCsvBtn: document.getElementById('exportAllCsvBtn'),
    csvCount: document.getElementById('csvCount'),
    sortSelect: document.getElementById('sortSelect'),
    filterInput: document.getElementById('filterInput'),

    plantGroup: document.getElementById('f-plantGroup'),
    plantSite: document.getElementById('f-plantSite'),
    typhoonName: document.getElementById('f-typhoonName'),
    typhoonLevel: document.getElementById('f-typhoonLevel'),
    inspector: document.getElementById('f-inspector'),
    inspectDate: document.getElementById('f-inspectDate'),
    draftStatus: document.getElementById('draftStatus'),
    toast: document.getElementById('toast'),
  };

  const PLANT_LOCATIONS = {
    甲群組: ['670館', '321館', '211三樓', '211廠房'],
    乙群組: ['681館', '210館', '331館', '682館(上)', '682館(下)', '701館', '218館', '401館', '405館', '中一變電站'],
    丙群組: ['326館', '357館', '330館', '660C館', '238館', '662館', '045館', '328一期', '328二期'],
    庚群組: ['308館', '302館', '302A館', '217館'],
    戊群組: ['243/243A館', '322館'],
    辛群組: ['307館', '212館', '642/646館', '519館', '222館', '605G南北館', '605H', '605E', '112館', '245'],
    全包式: ['504AB館', '646B館', '220館', '317館'],
  };
  Object.keys(PLANT_LOCATIONS).forEach((group) => {
    const opt = document.createElement('option');
    opt.value = group;
    opt.textContent = group;
    els.plantGroup.appendChild(opt);
  });
  function populateSiteOptions(group, selectedSite) {
    els.plantSite.innerHTML = '';
    const sites = PLANT_LOCATIONS[group] || [];
    if (!sites.length) {
      els.plantSite.innerHTML = '<option value="">請先選群組</option>';
      els.plantSite.disabled = true;
      return;
    }
    els.plantSite.disabled = false;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '請選擇館別';
    els.plantSite.appendChild(placeholder);
    sites.forEach((site) => {
      const opt = document.createElement('option');
      opt.value = site;
      opt.textContent = site;
      if (site === selectedSite) opt.selected = true;
      els.plantSite.appendChild(opt);
    });
  }
  els.plantGroup.addEventListener('change', () => {
    populateSiteOptions(els.plantGroup.value);
    scheduleAutosave();
  });
  els.plantSite.addEventListener('change', scheduleAutosave);

  function getPlantName() {
    if (!els.plantGroup.value || !els.plantSite.value) return '';
    return `${els.plantGroup.value}-${els.plantSite.value}`;
  }
  function setPlantName(value) {
    const [group, ...rest] = (value || '').split('-');
    const site = rest.join('-');
    if (group && PLANT_LOCATIONS[group]) {
      els.plantGroup.value = group;
      populateSiteOptions(group, site);
    } else {
      els.plantGroup.value = '';
      populateSiteOptions('');
    }
  }

  // ---- 檢查項目：正常/異常 兩態按鈕 + 一律顯示的備註欄 ----
  const itemsWrap = document.getElementById('itemsWrap');
  const itemCtrls = ITEMS.map((item) => {
    if (item.group) {
      const h = document.createElement('div');
      h.className = 'checklist-group-header';
      h.textContent = item.group;
      itemsWrap.appendChild(h);
    }
    const el = document.createElement('div');
    el.className = 'checklist-item';
    el.innerHTML = `
      <div class="item-label">${item.no}. ${item.label}</div>
      <div class="status-group">
        <button type="button" class="status-btn" data-status="ok">正常</button>
        <button type="button" class="status-btn" data-status="bad">異常</button>
      </div>
      <div class="item-remark">
        <textarea placeholder="異常狀況處理&備註…"></textarea>
      </div>
    `;
    itemsWrap.appendChild(el);
    const btns = Array.from(el.querySelectorAll('.status-btn'));
    const noteInput = el.querySelector('textarea');
    let status = null;
    function applyUI() {
      btns.forEach((b) => (b.dataset.active = String(b.dataset.status === status)));
    }
    btns.forEach((b) => {
      b.addEventListener('click', () => {
        status = b.dataset.status;
        applyUI();
        scheduleAutosave();
      });
    });
    noteInput.addEventListener('input', scheduleAutosave);
    return {
      item,
      getValue: () => ({ status, note: noteInput.value.trim() }),
      setValue: (v) => {
        status = (v && v.status) || null;
        noteInput.value = (v && v.note) || '';
        applyUI();
      },
    };
  });

  const sigPad = KtSignature.createSignaturePad(document.getElementById('sigWrap'), { onChange: scheduleAutosave });

  document.querySelectorAll('#formEditorView input[type=text], #formEditorView input[type=date]').forEach((el) => {
    el.addEventListener('input', scheduleAutosave);
  });

  let currentRecordId = null;

  function showListView() {
    currentRecordId = null;
    els.recordsListView.hidden = false;
    els.formEditorView.hidden = true;
    els.editorActionBar.hidden = true;
    els.headerSubtitle.textContent = '附表六・颱風警報解除後填寫';
    els.headerBackBtn.dataset.mode = 'home';
    renderRecordsList();
  }

  function blankFormData() {
    return {
      formTitle: FORM_TITLE,
      plantName: '',
      typhoonName: '', typhoonLevel: '', inspector: '', inspectDate: '',
      items: [],
      signature: null,
    };
  }

  async function showEditorView(recordId, isNew) {
    currentRecordId = recordId;
    els.recordsListView.hidden = true;
    els.formEditorView.hidden = false;
    els.editorActionBar.hidden = false;
    els.headerBackBtn.dataset.mode = 'list';

    if (isNew) {
      applyFormData(blankFormData());
      els.headerSubtitle.textContent = '新紀錄（尚未儲存）';
      els.draftStatus.textContent = '尚未儲存';
    } else {
      const rec = await KtDB.loadRecord(recordId);
      applyFormData(rec ? rec.data : blankFormData());
      els.headerSubtitle.textContent = rec && rec.data.plantName ? rec.data.plantName : '（未命名紀錄）';
      els.draftStatus.textContent = rec ? `最後更新於 ${fmtTs(rec.updatedAt)}` : '尚未儲存';
    }
    sigPad.resize();
    window.scrollTo(0, 0);
  }

  els.headerBackBtn.addEventListener('click', () => {
    if (els.headerBackBtn.dataset.mode === 'list') {
      showListView();
    } else {
      location.href = '../index.html';
    }
  });

  els.newRecordBtn.addEventListener('click', () => {
    showEditorView(KtDB.newRecordId(FORM_ID), true);
  });

  els.sortSelect.addEventListener('change', () => renderRecordsList());
  let filterDebounce = null;
  els.filterInput.addEventListener('input', () => {
    clearTimeout(filterDebounce);
    filterDebounce = setTimeout(() => renderRecordsList(), 200);
  });

  function sortRecords(records, sortKey) {
    const arr = records.slice();
    switch (sortKey) {
      case 'updated_asc':
        return arr.sort((a, b) => a.updatedAt - b.updatedAt);
      case 'plant_asc':
        return arr.sort((a, b) => (a.data?.plantName || '').localeCompare(b.data?.plantName || '', 'zh-Hant'));
      case 'updated_desc':
      default:
        return arr.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  }

  function filterRecords(records, keyword) {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return records;
    return records.filter((rec) => (rec.data?.plantName || '').toLowerCase().includes(kw));
  }

  async function renderRecordsList() {
    const allRecords = await KtDB.listRecords(FORM_ID);
    const filtered = filterRecords(allRecords, els.filterInput.value);
    const records = sortRecords(filtered, els.sortSelect.value);
    els.recordsList.innerHTML = '';
    els.emptyState.hidden = allRecords.length > 0;
    els.exportAllCsvBtn.disabled = allRecords.length === 0;
    els.csvCount.textContent = allRecords.length ? `（共 ${allRecords.length} 筆）` : '';
    if (allRecords.length > 0 && records.length === 0) {
      els.emptyState.hidden = false;
      els.emptyState.textContent = '沒有符合搜尋條件的紀錄。';
    } else {
      els.emptyState.textContent = '尚未有任何紀錄，點上方「＋ 新增一筆」開始填寫。';
    }

    records.forEach((rec) => {
      const card = document.createElement('div');
      card.className = 'record-card';
      const plant = rec.data?.plantName || '（未命名紀錄）';
      const typhoon = rec.data?.typhoonName || '未填颱風名稱';
      const statusCls = rec.exportedAt ? 'exported' : 'draft';
      const statusLabel = rec.exportedAt ? '已匯出' : '草稿中';
      card.innerHTML = `
        <div class="rc-main">
          <div class="rc-title">${escapeHtml(plant)}</div>
          <div class="rc-meta">${escapeHtml(typhoon)} · 更新於 ${fmtTs(rec.updatedAt)}</div>
        </div>
        <div class="rc-status ${statusCls}">${statusLabel}</div>
        <button type="button" class="rc-copy" aria-label="複製">📄</button>
        <button type="button" class="rc-del" aria-label="刪除">🗑</button>
      `;
      card.querySelector('.rc-main').addEventListener('click', () => showEditorView(rec.id, false));
      card.querySelector('.rc-status').addEventListener('click', () => showEditorView(rec.id, false));
      card.querySelector('.rc-copy').addEventListener('click', async (e) => {
        e.stopPropagation();
        await duplicateRecord(rec);
      });
      card.querySelector('.rc-del').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`確定要刪除「${plant}」這筆紀錄嗎？此動作無法復原。`)) {
          await KtDB.deleteRecord(rec.id);
          renderRecordsList();
        }
      });
      els.recordsList.appendChild(card);
    });
  }

  async function duplicateRecord(rec) {
    const src = rec.data || {};
    const copied = {
      formTitle: FORM_TITLE,
      plantName: src.plantName || '',
      typhoonName: '', typhoonLevel: '', inspector: src.inspector || '', inspectDate: '',
      items: (src.items || []).map((it) => ({ ...it })),
      signature: null,
    };
    const newId = KtDB.newRecordId(FORM_ID);
    await KtDB.saveRecord(newId, FORM_ID, copied);
    showToast('已複製為新紀錄（不含簽名）');
    showEditorView(newId, false);
  }

  function gatherFormData() {
    return {
      formTitle: FORM_TITLE,
      plantName: getPlantName(),
      typhoonName: els.typhoonName.value.trim(),
      typhoonLevel: els.typhoonLevel.value.trim(),
      inspector: els.inspector.value.trim(),
      inspectDate: els.inspectDate.value,
      items: itemCtrls.map(({ item, getValue }) => Object.assign({ no: item.no, label: item.label }, getValue())),
      signature: sigPad.toDataURL(),
    };
  }

  function applyFormData(data) {
    setPlantName(data.plantName || '');
    els.typhoonName.value = data.typhoonName || '';
    els.typhoonLevel.value = data.typhoonLevel || '';
    els.inspector.value = data.inspector || '';
    els.inspectDate.value = data.inspectDate || '';
    itemCtrls.forEach(({ item, setValue }) => {
      const saved = (data.items || []).find((it) => it.no === item.no);
      setValue(saved || { status: null, note: '' });
    });
    sigPad.clear();
    if (data.signature) sigPad.loadDataURL(data.signature);
  }

  let autosaveTimer = null;
  function scheduleAutosave() {
    if (!currentRecordId) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(doSave, 700);
  }

  async function doSave(showMsg) {
    if (!currentRecordId) return;
    try {
      const data = gatherFormData();
      await KtDB.saveRecord(currentRecordId, FORM_ID, data);
      els.draftStatus.textContent = `草稿已自動儲存於 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}（僅存本機）`;
      els.headerSubtitle.textContent = data.plantName || '（未命名紀錄）';
      if (showMsg) showToast('草稿已儲存');
    } catch (err) {
      console.error(err);
      if (showMsg) showToast('草稿儲存失敗');
    }
  }

  document.getElementById('saveDraftBtn').addEventListener('click', () => doSave(true));

  let toastTimer = null;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (els.toast.hidden = true), 2200);
  }

  function validateForExport() {
    const missing = [];
    if (!els.typhoonName.value.trim()) missing.push('尚未填寫颱風名稱');
    if (!els.inspectDate.value) missing.push('尚未填寫巡檢日期');
    itemCtrls.forEach(({ item, getValue }) => {
      if (!getValue().status) missing.push(`檢查項目 ${item.no}. ${item.label} 尚未勾選正常/異常`);
    });
    if (sigPad.isEmpty()) missing.push('尚未簽名');
    return missing;
  }

  const missingFieldsModal = document.getElementById('missingFieldsModal');
  function showMissingFieldsModal(missing) {
    const list = document.getElementById('missingFieldsList');
    list.innerHTML = missing.map((m) => `<li>${escapeHtml(m)}</li>`).join('');
    missingFieldsModal.hidden = false;
  }
  document.getElementById('closeMissingModalBtn').addEventListener('click', () => (missingFieldsModal.hidden = true));

  function buildFilename(data, ext) {
    const safe = (s) => (s || '').replace(/[\\/:*?"<>|]/g, '').trim();
    const parts = [FORM_TITLE, safe(data.plantName), safe(data.typhoonName)].filter(Boolean);
    return parts.join('_') + '.' + ext;
  }

  const TEMPLATE_BG_PATH = '../pdf-templates/report6-p1.png';
  let bgCachePromise = null;
  function loadBackground() {
    if (!bgCachePromise) {
      bgCachePromise = fetch(TEMPLATE_BG_PATH)
        .then((r) => r.blob())
        .then((blob) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }));
    }
    return bgCachePromise;
  }

  document.getElementById('exportPdfBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (!currentRecordId) return;
    const missing = validateForExport();
    if (missing.length) {
      showMissingFieldsModal(missing);
      return;
    }
    btn.textContent = '產生中…';
    btn.disabled = true;
    try {
      await doSave(false);
      const data = gatherFormData();
      const bg = await loadBackground();
      const page = Report6CheckTemplate.buildPage1(data, bg);
      const blob = await KtPdf.renderTemplatedPdf([page]);
      await KtShare.shareOrSavePdf(blob, buildFilename(data, 'pdf'));
      await KtDB.saveRecord(currentRecordId, FORM_ID, data, { markExported: true });
      els.draftStatus.textContent = `已於 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 匯出 PDF`;
    } catch (err) {
      console.error(err);
      showToast('PDF 產生失敗，請重試');
    } finally {
      btn.textContent = '📄 匯出 PDF';
      btn.disabled = false;
    }
  });

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const CSV_HEADERS = ['表單名稱', '電廠名稱', '颱風名稱', '颱風等級', '巡檢人員', '巡檢日期', ...ITEMS.flatMap((it) => [`${it.no}狀態`, `${it.no}備註`]), '紀錄建立時間', '最後更新時間'];

  function recordToCsvRow(record) {
    const d = record.data || {};
    const items = ITEMS.flatMap((it) => {
      const found = (d.items || []).find((x) => x.no === it.no) || {};
      return [STATUS_LABEL[found.status] || '', found.note || ''];
    });
    return [FORM_TITLE, d.plantName || '', d.typhoonName || '', d.typhoonLevel || '', d.inspector || '', d.inspectDate || '', ...items, fmtTs(record.createdAt), fmtTs(record.updatedAt)];
  }

  els.exportAllCsvBtn.addEventListener('click', async () => {
    const records = await KtDB.listRecords(FORM_ID);
    if (!records.length) {
      showToast('尚無紀錄可匯出');
      return;
    }
    const rows = records.map(recordToCsvRow);
    const blob = KtCsv.buildCsvBlob(CSV_HEADERS, rows);
    const today = fmtTs(Date.now()).slice(0, 10).replace(/-/g, '');
    await KtShare.shareOrSaveCsv(blob, `${FORM_TITLE}_全部紀錄_${today}.csv`);
  });

  function fmtTs(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  showListView();
})();
