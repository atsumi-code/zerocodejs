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
    'header.menuOpen': 'Open menu',
    'header.menuClose': 'Close menu',
    'footer.license': 'License'
  },
  ja: {
    'header.demo': 'デモ',
    'header.docs': 'ドキュメント',
    'header.menuOpen': 'メニューを開く',
    'header.menuClose': 'メニューを閉じる',
    'footer.license': 'ライセンス'
  }
};

function getCurrentLang() {
  return localStorage.getItem('zerocode-lang') || 'en';
}

function applyHeaderFooterTranslations(container, lang) {
  const t = headerFooterTranslations[lang];
  if (!t) return;
  container.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });
}

function updateLangButtons(lang) {
  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

function setupLangSwitchButtons() {
  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.addEventListener('click', function () {
      if (typeof window.closeHeaderMenu === 'function') {
        window.closeHeaderMenu();
      }
      const lang = this.getAttribute('data-lang');
      localStorage.setItem('zerocode-lang', lang);
      document.documentElement.lang = lang;

      applyHeaderFooterTranslations(document, lang);
      updateLangButtons(lang);

      if (typeof window.applyTranslations === 'function') {
        window.applyTranslations(lang);
      }

      window.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang } }));
    });
  });
}

function updateHamburgerLabel(hamburger, isOpen) {
  if (!hamburger) return;
  const lang = getCurrentLang();
  const t = headerFooterTranslations[lang];
  const key = isOpen ? 'header.menuClose' : 'header.menuOpen';
  hamburger.setAttribute('aria-label', t?.[key] ?? key);
}

function updateDrawerCloseLabel(btn) {
  if (!btn) return;
  const lang = getCurrentLang();
  const t = headerFooterTranslations[lang];
  btn.setAttribute('aria-label', t?.['header.menuClose'] ?? 'header.menuClose');
}

function setupHamburger() {
  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.header-hamburger');
  const overlay = document.getElementById('header-overlay');
  const nav = document.getElementById('header-nav');
  const drawerClose = document.querySelector('.header-drawer-close');
  if (!header || !hamburger || !overlay || !nav) return;

  let savedScrollY = 0;

  function onScrollClose(e) {
    if (!header.classList.contains('is-menu-open')) return;
    if (nav && (e.target === nav || nav.contains(e.target))) return;
    closeHeaderMenu();
  }

  function closeHeaderMenu() {
    if (!header.classList.contains('is-menu-open')) return;
    header.classList.remove('is-menu-open');
    document.documentElement.classList.remove('header-menu-open');
    document.body.classList.remove('header-menu-open');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('left');
    document.body.style.removeProperty('right');
    document.body.style.removeProperty('width');
    window.scrollTo(0, savedScrollY);
    hamburger.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
    updateHamburgerLabel(hamburger, false);
    window.removeEventListener('scroll', onScrollClose, true);
  }

  function openHeaderMenu() {
    savedScrollY = window.scrollY;
    document.documentElement.classList.add('header-menu-open');
    document.body.classList.add('header-menu-open');
    document.body.style.setProperty('position', 'fixed');
    document.body.style.setProperty('top', `-${savedScrollY}px`);
    document.body.style.setProperty('left', '0');
    document.body.style.setProperty('right', '0');
    document.body.style.setProperty('width', '100%');
    header.classList.add('is-menu-open');
    hamburger.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.setAttribute('aria-hidden', 'false');
    updateHamburgerLabel(hamburger, true);
    window.addEventListener('scroll', onScrollClose, true);
  }

  function toggleMenu() {
    if (header.classList.contains('is-menu-open')) {
      closeHeaderMenu();
    } else {
      openHeaderMenu();
    }
  }

  window.closeHeaderMenu = closeHeaderMenu;

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeHeaderMenu);

  if (drawerClose) {
    drawerClose.addEventListener('click', closeHeaderMenu);
    updateDrawerCloseLabel(drawerClose);
  }

  nav.querySelectorAll('.header-link').forEach((link) => {
    link.addEventListener('click', closeHeaderMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-menu-open')) {
      closeHeaderMenu();
    }
  });

  window.addEventListener('lang-changed', () => {
    const isOpen = header.classList.contains('is-menu-open');
    updateHamburgerLabel(hamburger, isOpen);
    if (drawerClose) updateDrawerCloseLabel(drawerClose);
  });

  updateHamburgerLabel(hamburger, false);
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

    const currentLang = getCurrentLang();
    applyHeaderFooterTranslations(document, currentLang);
    updateLangButtons(currentLang);
    setupLangSwitchButtons();
    setupHamburger();
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
