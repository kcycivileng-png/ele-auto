(function () {
  const FORM_ID = 'report3-check';
  const FORM_TITLE = '電廠損壞報告';
  const SOURCE_OPTIONS = ['客戶屋主告修', '系統警報', '緊急維運告修', '數據分析告修', '定檢告修', '颱風檢查告修', '地震檢查告修', '追蹤告修', '其他告修'];
  const SOURCE_DISPLAY = {
    客戶屋主告修: '客戶、屋主告修', 系統警報: '系統警報', 緊急維運告修: '緊急維運告修', 數據分析告修: '數據分析告修',
    定檢告修: '定檢告修', 颱風檢查告修: '颱風檢查告修', 地震檢查告修: '地震檢查告修', 追蹤告修: '追蹤告修', 其他告修: '其他告修',
  };

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

    holder: document.getElementById('f-holder'),
    plantGroup: document.getElementById('f-plantGroup'),
    plantSite: document.getElementById('f-plantSite'),
    sourceWrap: document.getElementById('sourceWrap'),
    contact: document.getElementById('f-contact'),
    damageTime: document.getElementById('f-damageTime'),
    item: document.getElementById('f-item'),
    lossDuration: document.getElementById('f-lossDuration'),
    lossAmount: document.getElementById('f-lossAmount'),
    description: document.getElementById('f-description'),
    closedYes: document.getElementById('f-closedYes'),
    closedNo: document.getElementById('f-closedNo'),
    closedYesFields: document.getElementById('closedYesFields'),
    closedNoFields: document.getElementById('closedNoFields'),
    closeTime: document.getElementById('f-closeTime'),
    resolutionNote: document.getElementById('f-resolutionNote'),
    suggestedSolution: document.getElementById('f-suggestedSolution'),
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

  const sourceCtrls = {};
  SOURCE_OPTIONS.forEach((key) => {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.addEventListener('change', scheduleAutosave);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(SOURCE_DISPLAY[key]));
    els.sourceWrap.appendChild(label);
    sourceCtrls[key] = cb;
  });

  function applyClosedUI() {
    els.closedYesFields.hidden = els.closedYes.checked !== true;
    els.closedNoFields.hidden = els.closedNo.checked !== true;
  }
  els.closedYes.addEventListener('change', () => { applyClosedUI(); scheduleAutosave(); });
  els.closedNo.addEventListener('change', () => { applyClosedUI(); scheduleAutosave(); });
  applyClosedUI();

  const sigEngineer = KtSignature.createSignaturePad(document.getElementById('sigEngineerWrap'), { onChange: scheduleAutosave });
  const sigSupervisor = KtSignature.createSignaturePad(document.getElementById('sigSupervisorWrap'), { onChange: scheduleAutosave });

  document.querySelectorAll('#formEditorView input[type=text], #formEditorView input[type=datetime-local], #formEditorView textarea').forEach((el) => {
    el.addEventListener('input', scheduleAutosave);
  });

  let currentRecordId = null;

  function showListView() {
    currentRecordId = null;
    els.recordsListView.hidden = false;
    els.formEditorView.hidden = true;
    els.editorActionBar.hidden = true;
    els.headerSubtitle.textContent = '附表三・電廠損壞時填寫';
    els.headerBackBtn.dataset.mode = 'home';
    renderRecordsList();
  }

  function blankFormData() {
    return {
      formTitle: FORM_TITLE,
      holder: '', plantName: '',
      source: [],
      contact: '', damageTime: '', item: '', lossDuration: '', lossAmount: '', description: '',
      closed: '', closeTime: '', resolutionNote: '', suggestedSolution: '',
      signatures: { engineer: null, supervisor: null },
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
    sigEngineer.resize();
    sigSupervisor.resize();
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
      const time = rec.data?.damageTime || '未填損壞時間';
      const closed = rec.data?.closed === '是' ? '已結案' : rec.data?.closed === '否' ? '追蹤中' : '未填結案狀態';
      const statusCls = rec.exportedAt ? 'exported' : 'draft';
      const statusLabel = rec.exportedAt ? '已匯出' : '草稿中';
      card.innerHTML = `
        <div class="rc-main">
          <div class="rc-title">${escapeHtml(plant)}</div>
          <div class="rc-meta">${escapeHtml(time)} · ${escapeHtml(closed)} · 更新於 ${fmtTs(rec.updatedAt)}</div>
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
      holder: src.holder || '', plantName: src.plantName || '',
      source: (src.source || []).slice(),
      contact: src.contact || '', damageTime: '', item: src.item || '',
      lossDuration: src.lossDuration || '', lossAmount: src.lossAmount || '', description: src.description || '',
      closed: '', closeTime: '', resolutionNote: '', suggestedSolution: src.suggestedSolution || '',
      signatures: { engineer: null, supervisor: null },
    };
    const newId = KtDB.newRecordId(FORM_ID);
    await KtDB.saveRecord(newId, FORM_ID, copied);
    showToast('已複製為新紀錄（不含簽名）');
    showEditorView(newId, false);
  }

  function gatherFormData() {
    return {
      formTitle: FORM_TITLE,
      holder: els.holder.value.trim(),
      plantName: getPlantName(),
      source: SOURCE_OPTIONS.filter((key) => sourceCtrls[key].checked),
      contact: els.contact.value.trim(),
      damageTime: els.damageTime.value,
      item: els.item.value.trim(),
      lossDuration: els.lossDuration.value.trim(),
      lossAmount: els.lossAmount.value.trim(),
      description: els.description.value.trim(),
      closed: els.closedYes.checked ? '是' : els.closedNo.checked ? '否' : '',
      closeTime: els.closeTime.value,
      resolutionNote: els.resolutionNote.value.trim(),
      suggestedSolution: els.suggestedSolution.value.trim(),
      signatures: {
        engineer: sigEngineer.toDataURL(),
        supervisor: sigSupervisor.toDataURL(),
      },
    };
  }

  function applyFormData(data) {
    els.holder.value = data.holder || '';
    setPlantName(data.plantName || '');
    SOURCE_OPTIONS.forEach((key) => { sourceCtrls[key].checked = (data.source || []).includes(key); });
    els.contact.value = data.contact || '';
    els.damageTime.value = data.damageTime || '';
    els.item.value = data.item || '';
    els.lossDuration.value = data.lossDuration || '';
    els.lossAmount.value = data.lossAmount || '';
    els.description.value = data.description || '';
    els.closedYes.checked = data.closed === '是';
    els.closedNo.checked = data.closed === '否';
    els.closeTime.value = data.closeTime || '';
    els.resolutionNote.value = data.resolutionNote || '';
    els.suggestedSolution.value = data.suggestedSolution || '';
    applyClosedUI();
    sigEngineer.clear();
    sigSupervisor.clear();
    if (data.signatures?.engineer) sigEngineer.loadDataURL(data.signatures.engineer);
    if (data.signatures?.supervisor) sigSupervisor.loadDataURL(data.signatures.supervisor);
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
    if (!getPlantName()) missing.push('尚未選擇電廠名稱（請選群組+館別）');
    if (!els.holder.value.trim()) missing.push('尚未填寫電廠持有者');
    if (!SOURCE_OPTIONS.some((key) => sourceCtrls[key].checked)) missing.push('尚未勾選障礙來源');
    if (!els.damageTime.value) missing.push('尚未填寫損壞時間');
    if (!els.description.value.trim()) missing.push('尚未填寫說明');
    if (!els.closedYes.checked && !els.closedNo.checked) missing.push('尚未勾選是否結案');
    if (els.closedYes.checked && !els.closeTime.value) missing.push('已勾選結案，尚未填寫結案時間');
    if (els.closedNo.checked && !els.suggestedSolution.value.trim()) missing.push('未結案，尚未填寫建議解決方案之說明');
    if (sigEngineer.isEmpty()) missing.push('現場負責工程師尚未簽名');
    if (sigSupervisor.isEmpty()) missing.push('維運主管尚未簽名');
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
    const parts = [FORM_TITLE, safe(data.plantName), safe(data.damageTime)].filter(Boolean);
    return parts.join('_') + '.' + ext;
  }

  const TEMPLATE_BG_PATH = '../pdf-templates/report3-p1.png';
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
      const page = Report3CheckTemplate.buildPage1(data, bg);
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

  const CSV_HEADERS = ['表單名稱', '電廠持有者', '電廠名稱', '障礙來源', '現場工程師及連絡電話', '損壞時間', '項目', '損失發電期間', '預估損失發電量', '說明', '是否結案', '結案時間', '決方式說明', '建議解決方案之說明', '紀錄建立時間', '最後更新時間'];

  function recordToCsvRow(record) {
    const d = record.data || {};
    return [
      FORM_TITLE, d.holder || '', d.plantName || '',
      (d.source || []).map((k) => SOURCE_DISPLAY[k] || k).join('、'),
      d.contact || '', d.damageTime || '', d.item || '', d.lossDuration || '', d.lossAmount || '', d.description || '',
      d.closed || '', d.closeTime || '', d.resolutionNote || '', d.suggestedSolution || '',
      fmtTs(record.createdAt), fmtTs(record.updatedAt),
    ];
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
