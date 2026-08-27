(function () {
  const FORM_ID = 'hv-equipment-check';
  const FORM_TITLE = '高壓設備檢查表';
  const FILE_PREFIX = '1-';

  // 8.1~8.6：App互動勾選項目。8.7~8.10（絕緣油/接地電阻/絕緣電阻/隔離開關）
  // 原始文件寫明「檢查結果以高壓檢測報告書提供」，不是App填寫項目，只在畫面上
  // 顯示提醒文字（見HTML的infoItems區塊），不計入這裡的CHECK_ITEMS。
  const CHECK_ITEMS = [
    { no: '8.1', label: '8.1 外部清潔及檢查(目視檢查)' },
    { no: '8.2', label: '8.2 變壓器油量檢查(目視檢查)' },
    { no: '8.3', label: '8.3 變壓器溫度計檢查(目視檢查)' },
    { no: '8.4', label: '8.4 電驛運作是否正常(目視檢查)' },
    { no: '8.5', label: '8.5 檢查是否有動物侵入(目視檢查)' },
    { no: '8.6', label: '8.6 檢查是否有異味、各電器是否有燒焦痕跡或其它異常現象(熱顯像)' },
  ];

  const PHOTO_GROUPS = [
    { id: 'overview', title: '檢查項目-高壓站全景', max: 2 },
    { id: 'mpThermal', title: '檢查項目-MP盤熱顯像', single: true },
    { id: 'mpVisible', title: '檢查項目-MP盤可見光', single: true },
    { id: 'vcb', title: '檢查項目-VCB內部盤體(低壓操作)', max: 2 },
    { id: 'ptThermal', title: '檢查項目-PT盤熱顯像', single: true },
    { id: 'ptVisible', title: '檢查項目-PT盤可見光', single: true },
    { id: 'transformerTemp', title: '檢查項目-變壓器溫度', single: true },
    { id: 'transformerOil', title: '檢查項目-變壓器油量', single: true },
    { id: 'abnormal', title: '異常項目相片（異常時提供，非必填）', max: 2, caption: true },
  ];
  const REQUIRED_PHOTO_IDS = ['overview', 'mpThermal', 'mpVisible', 'vcb', 'ptThermal', 'ptVisible', 'transformerTemp', 'transformerOil'];

  const STATUS_LABEL = { ok: '正常', bad: '異常', fixed: '調整/更換' };

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
    checkDate: document.getElementById('f-checkDate'),
    inspector: document.getElementById('f-inspector'),
    repairNote: document.getElementById('f-repairNote'),
    draftStatus: document.getElementById('draftStatus'),
    toast: document.getElementById('toast'),

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

  const checklistWrap = document.getElementById('checklistWrap');
  const checklistCtrls = CHECK_ITEMS.map((item) =>
    Object.assign({ item }, { ctrl: KtFormKit.createChecklistItem(checklistWrap, { label: item.label, onChange: scheduleAutosave }) })
  );

  const photoWrap = document.getElementById('photoWrap');
  const photoCtrls = {};
  PHOTO_GROUPS.forEach((g) => {
    photoCtrls[g.id] = KtPhoto.createPhotoGroup(photoWrap, {
      id: g.id,
      title: g.title,
      single: g.single,
max: g.max,
      caption: g.caption,
            onChange: () => scheduleAutosave(),
    });
  });

  document.querySelectorAll('#formEditorView input[type=text], #formEditorView input[type=date], #formEditorView textarea').forEach((el) => {
    el.addEventListener('input', scheduleAutosave);
  });

  // ======================================================================
  // 紀錄列表「多選模式」：一鍵匯出（合併成一份多頁PDF，每筆紀錄本身就是2頁）／一鍵刪除
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
      const bg = await loadBackgrounds();
      const pages = [];
      for (const id of ids) {
        const rec = await KtDB.loadRecord(id);
        if (!rec) continue;
        pages.push(HvEquipmentCheckTemplate.buildPage1(rec.data, bg.p1));
        pages.push(HvEquipmentCheckTemplate.buildPagePhotos(rec.data, bg.p2));
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

  let currentRecordId = null;

  function showListView() {
    currentRecordId = null;
    els.recordsListView.hidden = false;
    els.formEditorView.hidden = true;
    els.editorActionBar.hidden = true;
    els.headerSubtitle.textContent = '附表一・維運報告 子檢查表';
    els.headerBackBtn.dataset.mode = 'home';
    renderRecordsList();
  }

  function blankFormData() {
    return {
      formTitle: FORM_TITLE,
      meta: { plantName: '', checkDate: '', inspector: '' },
      items: [],
      repairNote: { text: '' },
      photoGroups: PHOTO_GROUPS.map((g) => ({ id: g.id, title: g.title, photos: [], caption: '' })),
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
      els.headerSubtitle.textContent = rec && rec.data.meta.plantName ? rec.data.meta.plantName : '（未命名紀錄）';
      els.draftStatus.textContent = rec ? `最後更新於 ${fmtTs(rec.updatedAt)}` : '尚未儲存';
    }
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
      case 'date_desc':
        return arr.sort((a, b) => (b.data?.meta?.checkDate || '').localeCompare(a.data?.meta?.checkDate || ''));
      case 'date_asc':
        return arr.sort((a, b) => (a.data?.meta?.checkDate || '').localeCompare(b.data?.meta?.checkDate || ''));
      case 'plant_asc':
        return arr.sort((a, b) => (a.data?.meta?.plantName || '').localeCompare(b.data?.meta?.plantName || '', 'zh-Hant'));
      case 'updated_desc':
      default:
        return arr.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  }

  function filterRecords(records, keyword) {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return records;
    return records.filter((rec) => {
      const plant = (rec.data?.meta?.plantName || '').toLowerCase();
      const inspector = (rec.data?.meta?.inspector || '').toLowerCase();
      return plant.includes(kw) || inspector.includes(kw);
    });
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
      const plant = rec.data?.meta?.plantName || '（未命名紀錄）';
      const date = rec.data?.meta?.checkDate || '未填日期';
      const inspector = rec.data?.meta?.inspector || '未填人員';
      const statusCls = rec.exportedAt ? 'exported' : 'draft';
      const statusLabel = rec.exportedAt ? '已匯出' : '草稿中';
      const selectMode = bulkSelect.isActive();
      card.innerHTML = `
        ${selectMode ? `<input type="checkbox" class="rc-check" ${bulkSelect.isSelected(rec.id) ? 'checked' : ''} />` : ''}
        <div class="rc-main">
          <div class="rc-title">${escapeHtml(plant)}</div>
          <div class="rc-meta">${escapeHtml(date)} · ${escapeHtml(inspector)} · 更新於 ${fmtTs(rec.updatedAt)}</div>
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
      meta: { ...src.meta },
      items: (src.items || []).map((it) => ({ ...it })),
      repairNote: { ...src.repairNote },
      photoGroups: PHOTO_GROUPS.map((g) => ({ id: g.id, title: g.title, photos: [], caption: '' })),
    };
    const newId = KtDB.newRecordId(FORM_ID);
    await KtDB.saveRecord(newId, FORM_ID, copied);
    showToast('已複製為新紀錄（不含照片）');
    showEditorView(newId, false);
  }

  function gatherFormData() {
    return {
      formTitle: FORM_TITLE,
      meta: {
        plantName: getPlantName(),
        checkDate: els.checkDate.value,
        inspector: els.inspector.value.trim(),
      },
      items: checklistCtrls.map(({ item, ctrl }) => Object.assign({ no: item.no, label: item.label }, ctrl.getValue())),
      repairNote: {
        text: els.repairNote.value.trim(),
      },
      photoGroups: PHOTO_GROUPS.map((g) => ({
        id: g.id,
        title: g.title,
        photos: photoCtrls[g.id].getPhotos(),
        caption: g.caption ? photoCtrls[g.id].getCaption() : undefined,
      })),
    };
  }

  function applyFormData(data) {
    setPlantName(data.meta?.plantName || '');
    els.checkDate.value = data.meta?.checkDate || '';
    els.inspector.value = data.meta?.inspector || '';
    els.repairNote.value = data.repairNote?.text || '';

    checklistCtrls.forEach(({ ctrl }, idx) => {
      const saved = (data.items || []).find((it) => it.no === CHECK_ITEMS[idx].no);
      ctrl.setValue(saved || { status: null });
    });

    PHOTO_GROUPS.forEach((g) => {
      const saved = (data.photoGroups || []).find((x) => x.id === g.id);
      photoCtrls[g.id].setPhotos(saved ? saved.photos : []);
      if (g.caption && photoCtrls[g.id].setCaption) photoCtrls[g.id].setCaption(saved ? saved.caption : '');
    });
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
      els.headerSubtitle.textContent = data.meta.plantName || '（未命名紀錄）';
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
    if (!els.checkDate.value) missing.push('尚未填寫檢查日期');
    if (!els.inspector.value.trim()) missing.push('尚未填寫檢查人員');
    let hasAbnormal = false;
    checklistCtrls.forEach(({ item, ctrl }) => {
      const status = ctrl.getValue().status;
      if (!status) missing.push(`檢查項目 ${item.no} 尚未勾選正常/異常/調整更換`);
      if (status === 'bad' || status === 'fixed') hasAbnormal = true;
    });
    if (hasAbnormal && !els.repairNote.value.trim()) {
      missing.push('有檢查項目勾選「異常」或「調整/更換」，請在「檢修說明」填寫說明');
    }
    REQUIRED_PHOTO_IDS.forEach((id) => {
      if (photoCtrls[id].getPhotos().length === 0) {
        const title = PHOTO_GROUPS.find((g) => g.id === id).title;
        missing.push(`「${title}」尚未上傳照片`);
      }
    });
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
    const parts = [FILE_PREFIX + FORM_TITLE, safe(data.meta.plantName), safe(data.meta.checkDate)].filter(Boolean);
    return parts.join('_') + '.' + ext;
  }

  const TEMPLATE_BG_PATHS = {
    p1: '../pdf-templates/hv-equipment-check-p1.png',
    p2: '../pdf-templates/hv-equipment-check-p2-photos.png',
  };
  let bgCachePromise = null;
  function loadBackgrounds() {
    if (!bgCachePromise) {
      bgCachePromise = Promise.all(
        Object.entries(TEMPLATE_BG_PATHS).map(([key, path]) =>
          fetch(path)
            .then((r) => r.blob())
            .then(
              (blob) =>
                new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve([key, reader.result]);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                })
            )
        )
      ).then((entries) => Object.fromEntries(entries));
    }
    return bgCachePromise;
  }

  async function buildCurrentPdfBlob() {
    await doSave(false);
    const data = gatherFormData();
    const bg = await loadBackgrounds();
    const pages = [HvEquipmentCheckTemplate.buildPage1(data, bg.p1), HvEquipmentCheckTemplate.buildPagePhotos(data, bg.p2)];
    const blob = await KtPdf.renderTemplatedPdf(pages);
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

  const CSV_HEADERS = [
    '表單名稱', '電廠名稱', '檢查日期', '檢查人員',
    ...CHECK_ITEMS.map((it) => `${it.no}狀態`),
    '檢修說明', '紀錄建立時間', '最後更新時間',
  ];

  function recordToCsvRow(record) {
    const d = record.data || {};
    const items = CHECK_ITEMS.map((ci) => {
      const found = (d.items || []).find((x) => x.no === ci.no) || {};
      return STATUS_LABEL[found.status] || '';
    });
    const hasAbnormal = (d.items || []).some((it) => it.status === 'bad' || it.status === 'fixed');
    const repairText = hasAbnormal ? (d.repairNote?.text || '') : (d.repairNote?.text || '無異常');
    return [
      FORM_TITLE, d.meta?.plantName || '', d.meta?.checkDate || '', d.meta?.inspector || '',
      ...items, repairText, fmtTs(record.createdAt), fmtTs(record.updatedAt),
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
