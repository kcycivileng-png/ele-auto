(function () {
  const FORM_ID = 'report6-check';
  const FORM_TITLE = '太陽光電電廠設備颱風過後檢查表';
  const FILE_PREFIX = '6-';

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

    batchNewBtn: document.getElementById('batchNewBtn'),
    batchCreateView: document.getElementById('batchCreateView'),
    batchActionBar: document.getElementById('batchActionBar'),
    batchPlantWrap: document.getElementById('batchPlantWrap'),
    batchSelectAllBtn: document.getElementById('batchSelectAllBtn'),
    batchClearAllBtn: document.getElementById('batchClearAllBtn'),
    batchSelectedCount: document.getElementById('batchSelectedCount'),
    batchTyphoonName: document.getElementById('bf-typhoonName'),
    batchTyphoonLevel: document.getElementById('bf-typhoonLevel'),
    batchInspector: document.getElementById('bf-inspector'),
    batchInspectDate: document.getElementById('bf-inspectDate'),
    batchStatus: document.getElementById('batchStatus'),
    batchCancelBtn: document.getElementById('batchCancelBtn'),
    batchSubmitBtn: document.getElementById('batchSubmitBtn'),

    selectModeBtn: document.getElementById('selectModeBtn'),
    selectToolbar: document.getElementById('selectToolbar'),
    selectAllRecordsBtn: document.getElementById('selectAllRecordsBtn'),
    selectNoneRecordsBtn: document.getElementById('selectNoneRecordsBtn'),
    selectCount: document.getElementById('selectCount'),
    bulkActionBar: document.getElementById('bulkActionBar'),
    bulkDeleteBtn: document.getElementById('bulkDeleteBtn'),
    bulkExportBtn: document.getElementById('bulkExportBtn'),
    exitSelectModeBtn: document.getElementById('exitSelectModeBtn'),
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
  // 抽成函式是因為「批次新增」畫面需要一份完全獨立的檢查項目控制項（不同的DOM容器），
  // 兩份互不影響——每個控制項的狀態都關在自己的closure裡，不靠共用id，天生就可以蓋兩份。
  function buildItemControls(itemsWrap, onChange) {
    return ITEMS.map((item) => {
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
          <textarea placeholder="異常狀況處理&備註…" maxlength="32"></textarea>
          <div class="char-count">0/32</div>
        </div>
      `;
      itemsWrap.appendChild(el);
      const btns = Array.from(el.querySelectorAll('.status-btn'));
      const noteInput = el.querySelector('textarea');
      const charCount = el.querySelector('.char-count');
      let status = null;
      function applyUI() {
        btns.forEach((b) => (b.dataset.active = String(b.dataset.status === status)));
      }
      function updateCharCount() {
        const n = noteInput.value.length;
        charCount.textContent = `${n}/32`;
        charCount.classList.toggle('near-limit', n >= 28);
      }
      btns.forEach((b) => {
        b.addEventListener('click', () => {
          status = b.dataset.status;
          applyUI();
          onChange && onChange();
        });
      });
      noteInput.addEventListener('input', () => {
        updateCharCount();
        onChange && onChange();
      });
      return {
        item,
        getValue: () => ({ status, note: noteInput.value.trim() }),
        setValue: (v) => {
          status = (v && v.status) || null;
          noteInput.value = (v && v.note) || '';
          applyUI();
          updateCharCount();
        },
      };
    });
  }

  const itemCtrls = buildItemControls(document.getElementById('itemsWrap'), scheduleAutosave);
  const sigPad = KtSignature.createSignaturePad(document.getElementById('sigWrap'), { onChange: scheduleAutosave });

  document.querySelectorAll('#formEditorView input[type=text], #formEditorView input[type=date]').forEach((el) => {
    el.addEventListener('input', scheduleAutosave);
  });

  // ======================================================================
  // 紀錄列表「多選模式」：一鍵匯出（合併成一份多頁PDF）／一鍵刪除
  // ======================================================================
  const bulkSelect = KtBulkSelect.attach({
    selectModeBtn: els.selectModeBtn,
    selectToolbar: els.selectToolbar,
    selectAllBtn: els.selectAllRecordsBtn,
    selectNoneBtn: els.selectNoneRecordsBtn,
    selectCountEl: els.selectCount,
    bulkActionBar: els.bulkActionBar,
    exitBtn: els.exitSelectModeBtn,
    getAllIds: () => currentListedIds,
    onRenderNeeded: () => renderRecordsList(),
  });

  els.bulkDeleteBtn.addEventListener('click', async () => {
    const ids = bulkSelect.getSelectedIds();
    if (!ids.length) { showToast('尚未選取任何紀錄'); return; }
    if (!confirm(`確定要刪除選取的 ${ids.length} 筆紀錄嗎？此動作無法復原。`)) return;
    for (const id of ids) await KtDB.deleteRecord(id);
    showToast(`已刪除 ${ids.length} 筆紀錄`);
    bulkSelect.exit();
  });

  els.bulkExportBtn.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const ids = bulkSelect.getSelectedIds();
    if (!ids.length) { showToast('尚未選取任何紀錄'); return; }
    btn.textContent = '產生中…';
    btn.disabled = true;
    try {
      const bg = await loadBackground();
      const pages = [];
      for (const id of ids) {
        const rec = await KtDB.loadRecord(id);
        if (!rec) continue;
        pages.push(Report6CheckTemplate.buildPage1(rec.data, bg));
        await KtDB.saveRecord(id, FORM_ID, rec.data, { markExported: true });
      }
      const blob = await KtPdf.renderTemplatedPdf(pages);
      const today = fmtTs(Date.now()).slice(0, 10);
      await KtShare.shareOrSavePdf(blob, `${FILE_PREFIX}${FORM_TITLE}_選取${ids.length}筆_${today}.pdf`);
      showToast(`已匯出 ${ids.length} 筆紀錄的PDF`);
      bulkSelect.exit();
    } catch (err) {
      console.error(err);
      showToast('PDF 產生失敗，請重試');
    } finally {
      btn.textContent = '📄 匯出選取PDF';
      btn.disabled = false;
    }
  });

  // ======================================================================
  // 批次新增（多電廠颱風過後檢查）：一次勾選多個電廠、填一次共用答案，
  // 送出後替每個電廠各自建立一筆獨立紀錄（之後仍可個別修改），並直接產生一份
  // 包含所有電廠、每廠各一頁的PDF——不需要每個電廠分開匯出分開分享。
  // ======================================================================
  const plantCheckboxes = []; // {checkbox, plantName}
  Object.keys(PLANT_LOCATIONS).forEach((group) => {
    const h = document.createElement('div');
    h.className = 'checklist-group-header';
    h.textContent = group;
    els.batchPlantWrap.appendChild(h);
    PLANT_LOCATIONS[group].forEach((site) => {
      const plantName = `${group}-${site}`;
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid var(--line);font-size:14px;';
      label.innerHTML = `<input type="checkbox" value="${escapeHtml(plantName)}" style="width:18px;height:18px;flex-shrink:0;" /> ${escapeHtml(site)}`;
      els.batchPlantWrap.appendChild(label);
      const checkbox = label.querySelector('input');
      checkbox.addEventListener('change', updateBatchSelectedCount);
      plantCheckboxes.push({ checkbox, plantName });
    });
  });

  function updateBatchSelectedCount() {
    const n = plantCheckboxes.filter((p) => p.checkbox.checked).length;
    els.batchSelectedCount.textContent = n ? `已選 ${n} 個電廠` : '尚未選擇電廠';
  }

  els.batchSelectAllBtn.addEventListener('click', () => {
    plantCheckboxes.forEach((p) => (p.checkbox.checked = true));
    updateBatchSelectedCount();
  });
  els.batchClearAllBtn.addEventListener('click', () => {
    plantCheckboxes.forEach((p) => (p.checkbox.checked = false));
    updateBatchSelectedCount();
  });

  const batchItemCtrls = buildItemControls(document.getElementById('batchItemsWrap'), null);
  const batchSigPad = KtSignature.createSignaturePad(document.getElementById('batchSigWrap'), {});

  function resetBatchView() {
    plantCheckboxes.forEach((p) => (p.checkbox.checked = false));
    updateBatchSelectedCount();
    els.batchTyphoonName.value = '';
    els.batchTyphoonLevel.value = '';
    els.batchInspector.value = '';
    els.batchInspectDate.value = '';
    batchItemCtrls.forEach(({ setValue }) => setValue({ status: null, note: '' }));
    batchSigPad.clear();
    els.batchStatus.textContent = '';
  }

  function showBatchView() {
    currentRecordId = null;
    els.recordsListView.hidden = true;
    els.formEditorView.hidden = true;
    els.editorActionBar.hidden = true;
    els.batchCreateView.hidden = false;
    els.batchActionBar.hidden = false;
    els.headerSubtitle.textContent = '批次新增（多電廠）';
    els.headerBackBtn.dataset.mode = 'batch';
    resetBatchView();
    batchSigPad.resize();
    window.scrollTo(0, 0);
  }

  els.batchNewBtn.addEventListener('click', () => {
    if (bulkSelect.isActive()) bulkSelect.exit();
    showBatchView();
  });
  els.batchCancelBtn.addEventListener('click', () => showListView());

  function validateBatchForExport(selectedPlants) {
    const missing = [];
    if (!selectedPlants.length) missing.push('尚未勾選任何電廠');
    if (!els.batchTyphoonName.value.trim()) missing.push('尚未填寫颱風名稱');
    if (!els.batchInspectDate.value) missing.push('尚未填寫巡檢日期');
    batchItemCtrls.forEach(({ item, getValue }) => {
      if (!getValue().status) missing.push(`檢查項目 ${item.no}. ${item.label} 尚未勾選正常/異常`);
    });
    if (batchSigPad.isEmpty()) missing.push('尚未簽名');
    return missing;
  }

  function buildBatchFilename(typhoonName, count) {
    const safe = (s) => (s || '').replace(/[\\/:*?"<>|]/g, '').trim();
    const today = fmtTs(Date.now()).slice(0, 10);
    return `${FILE_PREFIX}${FORM_TITLE}_批次${count}廠_${safe(typhoonName)}_${today}.pdf`;
  }

  els.batchSubmitBtn.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const selectedPlants = plantCheckboxes.filter((p) => p.checkbox.checked).map((p) => p.plantName);
    const missing = validateBatchForExport(selectedPlants);
    if (missing.length) {
      showMissingFieldsModal(missing);
      return;
    }
    btn.textContent = '產生中…';
    btn.disabled = true;
    els.batchCancelBtn.disabled = true;
    try {
      const commonFields = {
        typhoonName: els.batchTyphoonName.value.trim(),
        typhoonLevel: els.batchTyphoonLevel.value.trim(),
        inspector: els.batchInspector.value.trim(),
        inspectDate: els.batchInspectDate.value,
        items: batchItemCtrls.map(({ item, getValue }) => Object.assign({ no: item.no, label: item.label }, getValue())),
        signature: batchSigPad.toDataURL(),
      };
      const bg = await loadBackground();
      const pages = [];
      for (const plantName of selectedPlants) {
        const data = { formTitle: FORM_TITLE, plantName, ...commonFields };
        const newId = KtDB.newRecordId(FORM_ID);
        await KtDB.saveRecord(newId, FORM_ID, data, { markExported: true });
        pages.push(Report6CheckTemplate.buildPage1(data, bg));
      }
      const blob = await KtPdf.renderTemplatedPdf(pages);
      await KtShare.shareOrSavePdf(blob, buildBatchFilename(commonFields.typhoonName, selectedPlants.length));
      showToast(`已建立 ${selectedPlants.length} 筆電廠紀錄並匯出PDF`);
      showListView();
    } catch (err) {
      console.error(err);
      els.batchStatus.textContent = '部分電廠紀錄可能已建立，但PDF產生失敗，請重試或到紀錄列表個別匯出。';
      showToast('PDF 產生失敗，請重試');
    } finally {
      btn.textContent = '✅ 建立並匯出PDF';
      btn.disabled = false;
      els.batchCancelBtn.disabled = false;
    }
  });

  let currentRecordId = null;

  function showListView() {
    currentRecordId = null;
    els.recordsListView.hidden = false;
    els.formEditorView.hidden = true;
    els.editorActionBar.hidden = true;
    els.batchCreateView.hidden = true;
    els.batchActionBar.hidden = true;
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
    els.batchCreateView.hidden = true;
    els.batchActionBar.hidden = true;
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
    if (els.headerBackBtn.dataset.mode === 'list' || els.headerBackBtn.dataset.mode === 'batch') {
      showListView();
    } else {
      location.href = '../index.html';
    }
  });

  els.newRecordBtn.addEventListener('click', () => {
    if (bulkSelect.isActive()) bulkSelect.exit();
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

  let currentListedIds = [];

  async function renderRecordsList() {
    const allRecords = await KtDB.listRecords(FORM_ID);
    const filtered = filterRecords(allRecords, els.filterInput.value);
    const records = sortRecords(filtered, els.sortSelect.value);
    currentListedIds = records.map((r) => r.id);
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
      const selectMode = bulkSelect.isActive();
      card.innerHTML = `
        ${selectMode ? `<input type="checkbox" class="rc-check" ${bulkSelect.isSelected(rec.id) ? 'checked' : ''} />` : ''}
        <div class="rc-main">
          <div class="rc-title">${escapeHtml(plant)}</div>
          <div class="rc-meta">${escapeHtml(typhoon)} · 更新於 ${fmtTs(rec.updatedAt)}</div>
        </div>
        <div class="rc-status ${statusCls}">${statusLabel}</div>
        ${selectMode ? '' : '<button type="button" class="rc-copy" aria-label="複製">📄</button><button type="button" class="rc-del" aria-label="刪除">🗑</button>'}
      `;
      if (selectMode) {
        const check = card.querySelector('.rc-check');
        const toggle = () => {
          check.checked = !check.checked;
          bulkSelect.toggle(rec.id, check.checked);
        };
        check.addEventListener('click', (e) => { e.stopPropagation(); bulkSelect.toggle(rec.id, check.checked); });
        card.querySelector('.rc-main').addEventListener('click', toggle);
        card.querySelector('.rc-status').addEventListener('click', toggle);
      } else {
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
      }
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
    const parts = [FILE_PREFIX + FORM_TITLE, safe(data.plantName), safe(data.typhoonName)].filter(Boolean);
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

  async function buildCurrentPdfBlob() {
    await doSave(false);
    const data = gatherFormData();
    const bg = await loadBackground();
    const page = Report6CheckTemplate.buildPage1(data, bg);
    const blob = await KtPdf.renderTemplatedPdf([page]);
    return { blob, filename: buildFilename(data, 'pdf') };
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
      const { blob, filename } = await buildCurrentPdfBlob();
      await KtShare.shareOrSavePdf(blob, filename);
      await KtDB.saveRecord(currentRecordId, FORM_ID, gatherFormData(), { markExported: true });
      els.draftStatus.textContent = `已於 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 匯出 PDF`;
    } catch (err) {
      console.error(err);
      showToast('PDF 產生失敗，請重試');
    } finally {
      btn.textContent = '📄 匯出 PDF';
      btn.disabled = false;
    }
  });

  document.getElementById('uploadCloudBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (!currentRecordId) return;
    const missing = validateForExport();
    if (missing.length) {
      showMissingFieldsModal(missing);
      return;
    }
    btn.textContent = '登入中…';
    btn.disabled = true;
    try {
      // 先在點擊當下立刻要求Google登入授權（還在使用者手勢的時間窗內），
      // 瀏覽器才不會把稍後才彈出的登入視窗當成廣告彈窗擋掉；
      // PDF畫面渲染比較耗時，等授權拿到之後再做。
      const accessToken = await KtDriveUpload.getAccessToken();
      btn.textContent = '上傳中…';
      const { blob, filename } = await buildCurrentPdfBlob();
      await KtDriveUpload.uploadPdf(blob, filename, accessToken);
      await KtDB.saveRecord(currentRecordId, FORM_ID, gatherFormData(), { markExported: true });
      els.draftStatus.textContent = `已於 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 上傳雲端`;
      showToast('已上傳到雲端資料夾');
    } catch (err) {
      console.error(err);
      showToast(err && err.message ? err.message : '上傳失敗，請重試');
    } finally {
      btn.textContent = '☁️ 上傳雲端';
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
    await KtShare.shareOrSaveCsv(blob, `${FILE_PREFIX}${FORM_TITLE}_全部紀錄_${today}.csv`);
  });

  function fmtTs(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  showListView();
})();
