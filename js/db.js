// 極簡 IndexedDB 包裝：在「本機裝置」保存表單的多筆填寫紀錄（含照片、簽名），
// 不會有任何網路傳輸。使用者換手機或清除瀏覽器資料就會遺失，這是預期行為。
//
// 一張表單（formId）可以有多筆紀錄（record），例如同一天巡檢兩個不同電廠，
// 使用者按「新增一筆」各自獨立保存，彼此不會互相覆蓋。
const KtDB = (() => {
  const DB_NAME = 'kt-om-db';
  const DB_VERSION = 2;
  const STORE = 'records';

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = req.result;
        if (db.objectStoreNames.contains('drafts')) {
          db.deleteObjectStore('drafts'); // 舊版單筆草稿結構，改用多筆紀錄結構取代
        }
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('formId', 'formId', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function newRecordId(formId) {
    const rand = Math.random().toString(36).slice(2, 8);
    return `${formId}__${Date.now()}_${rand}`;
  }

  async function saveRecord(id, formId, data, opts) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        const now = Date.now();
        const markExported = !!(opts && opts.markExported);
        const record = {
          id,
          formId,
          data,
          createdAt: existing ? existing.createdAt : now,
          updatedAt: now,
          exportedAt: markExported ? now : (existing ? existing.exportedAt || null : null),
        };
        store.put(record);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadRecord(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function listRecords(formId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const idx = tx.objectStore(STORE).index('formId');
      const req = idx.getAll(IDBKeyRange.only(formId));
      req.onsuccess = () => {
        const rows = (req.result || []).sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(rows);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteRecord(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  return { newRecordId, saveRecord, loadRecord, listRecords, deleteRecord };
})();
