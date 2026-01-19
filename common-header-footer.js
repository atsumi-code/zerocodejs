/**
 * ZeroCode.js - 共通ヘッダー・フッター読み込み
 */

const baseUrl = (() => {
  const base = (import.meta && import.meta.env && import.meta.env.BASE_URL) || '/';
  return base.endsWith('/') ? base : `${base}/`;
})();

async function loadHeader() {
  try {
    const response = await fetch(`${baseUrl}header.html`);
    if (!response.ok) {
      console.warn('ヘッダーの読み込みに失敗しました');
      return;
    }
    const html = await response.text();
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
      headerPlaceholder.outerHTML = html;
    } else {
      document.body.insertAdjacentHTML('afterbegin', html);
    }
  } catch (error) {
    console.warn('ヘッダーの読み込み中にエラーが発生しました:', error);
  }
}

async function loadFooter() {
  try {
    const response = await fetch(`${baseUrl}footer.html`);
    if (!response.ok) {
      console.warn('フッターの読み込みに失敗しました');
      return;
    }
    const html = await response.text();
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = html;
    } else {
      document.body.insertAdjacentHTML('beforeend', html);
    }
  } catch (error) {
    console.warn('フッターの読み込み中にエラーが発生しました:', error);
  }
}

// ページ読み込み時に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();
  });
} else {
  loadHeader();
  loadFooter();
}

