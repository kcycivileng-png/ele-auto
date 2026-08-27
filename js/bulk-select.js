// 紀錄列表「多選模式」共用邏輯：管理選取狀態、切換模式的按鈕/工具列，
// 每個表單各自的匯出/刪除邏輯不同（單頁 vs 多頁PDF），所以那部分留給呼叫端自己實作，
// 這裡只負責「哪些紀錄被選起來了」這件事本身，讓17張表單不用各自重寫一次狀態管理。
const KtBulkSelect = (() => {
  function attach(opts) {
    // opts: {
    //   selectModeBtn, selectToolbar, selectAllBtn, selectNoneBtn, selectCountEl, bulkActionBar,
    //   exitBtn: 離開多選模式的按鈕,
    //   getAllIds: () => 目前列表顯示中的所有紀錄id陣列（依畫面上目前的排序/篩選結果）,
    //   onRenderNeeded: () => 需要重新畫列表時呼叫（進入/離開多選模式、全選/取消全選都要重畫）,
    // }
    let active = false;
    const selected = new Set();

    function updateCount() {
      opts.selectCountEl.textContent = `已選 ${selected.size} 筆`;
    }

    function enter() {
      active = true;
      selected.clear();
      opts.selectModeBtn.hidden = true;
      opts.selectToolbar.hidden = false;
      opts.bulkActionBar.hidden = false;
      updateCount();
      opts.onRenderNeeded();
    }

    function exit() {
      active = false;
      selected.clear();
      opts.selectModeBtn.hidden = false;
      opts.selectToolbar.hidden = true;
      opts.bulkActionBar.hidden = true;
      opts.onRenderNeeded();
    }

    function toggle(id, checked) {
      if (checked) selected.add(id);
      else selected.delete(id);
      updateCount();
    }

    opts.selectModeBtn.addEventListener('click', enter);
    opts.exitBtn.addEventListener('click', exit);
    opts.selectAllBtn.addEventListener('click', () => {
      opts.getAllIds().forEach((id) => selected.add(id));
      updateCount();
      opts.onRenderNeeded();
    });
    opts.selectNoneBtn.addEventListener('click', () => {
      selected.clear();
      updateCount();
      opts.onRenderNeeded();
    });

    return {
      isActive: () => active,
      isSelected: (id) => selected.has(id),
      toggle,
      getSelectedIds: () => Array.from(selected),
      exit,
      updateCount,
    };
  }

  return { attach };
})();
