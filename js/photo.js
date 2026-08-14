// 可重複使用的「照片欄位」元件：支援相機拍照 / 相簿選取多張、自動壓縮成 dataURL。
// 未來其他 19 張表單要用到照片欄位時，直接呼叫 KtPhoto.createPhotoGroup() 即可。
const KtPhoto = (() => {
  const MAX_DIM = 1600;
  const QUALITY = 0.72;

  function compressFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', QUALITY));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * @param {HTMLElement} container
   * @param {{id:string, title:string, hint?:string, single?:boolean, onChange?:Function}} opts
   *   single: true 時只能有一張照片，選新的會直接取代舊的（不需要先手動刪除）。
   */
  function createPhotoGroup(container, opts) {
    const wrap = document.createElement('div');
    wrap.className = 'photo-group';
    wrap.innerHTML = `
      <div class="pg-title">${opts.title}</div>
      ${opts.hint ? `<div class="hint">${opts.hint}</div>` : ''}
      <div class="photo-thumbs"></div>
      <label class="photo-add-btn">
        📷 ${opts.single ? '拍照/選取照片' : '新增照片'}
        <input type="file" accept="image/*" ${opts.single ? '' : 'multiple'} style="display:none" />
      </label>
    `;
    container.appendChild(wrap);

    const thumbsEl = wrap.querySelector('.photo-thumbs');
    const input = wrap.querySelector('input[type=file]');
    let photos = []; // array of dataURL strings

    function render() {
      thumbsEl.innerHTML = '';
      photos.forEach((src, idx) => {
        const t = document.createElement('div');
        t.className = 'photo-thumb';
        t.innerHTML = `<img src="${src}" alt="${opts.title}" /><button type="button" class="del-btn">✕</button>`;
        t.querySelector('.del-btn').addEventListener('click', () => {
          photos.splice(idx, 1);
          render();
          opts.onChange && opts.onChange(photos);
        });
        thumbsEl.appendChild(t);
      });
    }

    input.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (opts.single) {
        const file = files[0];
        if (file) {
          try {
            photos = [await compressFile(file)];
          } catch (err) {
            console.warn('photo compress failed', err);
          }
        }
      } else {
        for (const file of files) {
          try {
            const dataUrl = await compressFile(file);
            photos.push(dataUrl);
          } catch (err) {
            console.warn('photo compress failed', err);
          }
        }
      }
      input.value = '';
      render();
      opts.onChange && opts.onChange(photos);
    });

    return {
      getPhotos: () => photos.slice(),
      setPhotos: (arr) => { photos = (arr || []).slice(); render(); },
    };
  }

  return { createPhotoGroup, compressFile };
})();
