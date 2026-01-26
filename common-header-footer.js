/**
 * ZeroCode.js - 共通ヘッダー・フッター読み込み & 言語切り替え
 */

const baseUrl = (() => {
  const base = (import.meta && import.meta.env && import.meta.env.BASE_URL) || '/';
  return base.endsWith('/') ? base : `${base}/`;
})();

// 翻訳データ（ヘッダー・フッター用）
const headerFooterTranslations = {
  en: {
    'header.demo': 'Demo',
    'header.docs': 'Documentation',
    'footer.license': 'License'
  },
  ja: {
    'header.demo': 'デモ',
    'header.docs': 'ドキュメント',
    'footer.license': 'ライセンス'
  }
};

function getCurrentLang() {
  return localStorage.getItem('zerocode-lang') || 'en';
}

function applyHeaderFooterTranslations(container, lang) {
  const t = headerFooterTranslations[lang];
  if (!t) return;
  container.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });
}

function updateLangButtons(lang) {
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

function setupLangSwitchButtons() {
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      localStorage.setItem('zerocode-lang', lang);
      document.documentElement.lang = lang;
      
      // ヘッダー・フッターの翻訳を適用
      applyHeaderFooterTranslations(document, lang);
      updateLangButtons(lang);
      
      // ページ本体の翻訳を適用（グローバル関数がある場合）
      if (typeof window.applyTranslations === 'function') {
        window.applyTranslations(lang);
      } else if (typeof applyTranslations === 'function') {
        applyTranslations(lang);
      }
      
      // カスタムイベントを発火（他のスクリプトが購読可能）
      window.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang } }));
    });
  });
}

async function loadHeader() {
  try {
    const response = await fetch(`${baseUrl}header.html`);
    if (!response.ok) {
      console.warn('Failed to load header');
      return;
    }
    const html = await response.text();
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
      headerPlaceholder.outerHTML = html;
    } else {
      document.body.insertAdjacentHTML('afterbegin', html);
    }
    
    // ヘッダー読み込み後に翻訳を適用
    const currentLang = getCurrentLang();
    applyHeaderFooterTranslations(document, currentLang);
    updateLangButtons(currentLang);
    setupLangSwitchButtons();
  } catch (error) {
    console.warn('Error loading header:', error);
  }
}

async function loadFooter() {
  try {
    const response = await fetch(`${baseUrl}footer.html`);
    if (!response.ok) {
      console.warn('Failed to load footer');
      return;
    }
    const html = await response.text();
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = html;
    } else {
      document.body.insertAdjacentHTML('beforeend', html);
    }
    
    // フッター読み込み後に翻訳を適用
    const currentLang = getCurrentLang();
    applyHeaderFooterTranslations(document.querySelector('footer'), currentLang);
  } catch (error) {
    console.warn('Error loading footer:', error);
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
