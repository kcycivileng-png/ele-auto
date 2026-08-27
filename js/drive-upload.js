// 上傳 PDF 到公司 Google 雲端硬碟指定資料夾。
// 使用 Google Identity Services（前端 OAuth），使用者用自己的 Google 帳號登入授權一次，
// 範圍限定 drive.file（這個 App 自己建立的檔案），不會取得整個雲端硬碟的存取權。
// 不含任何 client secret／service account 金鑰——那類金鑰不可放進前端程式碼。
const KtDriveUpload = (() => {
  const CLIENT_ID = '517169898596-lh3m5uvmhrrt847b3p26mngr7k3i8054.apps.googleusercontent.com';
  const FOLDER_ID = '1xa8Zv8gYE_mjCWKX-sHJYek4v8jQrGkN';
  const SCOPE = 'https://www.googleapis.com/auth/drive.file';

  let gisLoadPromise = null;
  function loadGis() {
    if (gisLoadPromise) return gisLoadPromise;
    gisLoadPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('無法載入 Google 登入元件，請確認網路連線後再試一次'));
      document.head.appendChild(script);
    });
    return gisLoadPromise;
  }

  let tokenClient = null;
  let cachedToken = null; // { accessToken, expiresAt }

  function getAccessToken() {
    return loadGis().then(() => new Promise((resolve, reject) => {
      if (cachedToken && cachedToken.expiresAt - 60000 > Date.now()) {
        resolve(cachedToken.accessToken);
        return;
      }
      if (!tokenClient) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          callback: () => {},
        });
      }
      tokenClient.callback = (resp) => {
        if (resp.error) {
          reject(new Error('Google 授權失敗或已取消：' + resp.error));
          return;
        }
        cachedToken = { accessToken: resp.access_token, expiresAt: Date.now() + resp.expires_in * 1000 };
        resolve(resp.access_token);
      };
      tokenClient.requestAccessToken();
    }));
  }

  async function uploadPdf(blob, filename, accessToken) {
    if (!accessToken) accessToken = await getAccessToken();
    const metadata = { name: filename, parents: [FOLDER_ID], mimeType: 'application/pdf' };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
      { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: form }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`上傳失敗（HTTP ${res.status}）${text}`);
    }
    return res.json();
  }

  return { uploadPdf, getAccessToken };
})();
