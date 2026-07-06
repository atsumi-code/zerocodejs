// ドキュメントページ共通スクリプト（検索・サイドバー・パンくず）
// 検索インデックスは docs-search-index.js（自動生成）が window.__DOCS_SEARCH_INDEX__ に定義する
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('docs-search-input');
  const searchResults = document.getElementById('docs-search-results');
  const allLinks = document.querySelectorAll(
    '.docs-nav-link, .docs-nav-link-sub, .docs-nav-link-sub-sub'
  );
  const currentPage = location.pathname.split('/').pop() || 'docs.html';
  const searchIndex = window.__DOCS_SEARCH_INDEX__ || [];

  function highlightText(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<span class="result-highlight">$1</span>');
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return false;
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    return true;
  }

  function performSearch(query) {
    if (!query || query.length < 2) {
      searchResults.classList.remove('has-results');
      searchResults.innerHTML = '';
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = searchIndex
      .filter(
        (item) =>
          item.text.toLowerCase().includes(lowerQuery) ||
          item.parent.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10);

    if (results.length === 0) {
      searchResults.classList.remove('has-results');
      searchResults.innerHTML =
        '<div class="docs-search-result-item">検索結果が見つかりません</div>';
      return;
    }

    searchResults.classList.add('has-results');
    searchResults.innerHTML = results
      .map((result) => {
        const path = result.parent ? `${result.parent} > ${result.text}` : result.text;
        return `
          <div class="docs-search-result-item" data-id="${result.id}" data-page="${result.page}">
            <div class="result-title">${highlightText(result.text, query)}</div>
            <div class="result-path">${highlightText(path, query)}</div>
          </div>
        `;
      })
      .join('');

    searchResults.querySelectorAll('.docs-search-result-item').forEach((item) => {
      item.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const page = this.getAttribute('data-page');
        if (!id || !page) return;
        if (page === currentPage) {
          if (scrollToId(id)) {
            searchInput.value = '';
            searchResults.classList.remove('has-results');
            searchResults.innerHTML = '';
          }
        } else {
          location.href = `./${page}#${id}`;
        }
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      performSearch(this.value);
    });

    searchInput.addEventListener('blur', function () {
      setTimeout(() => {
        searchResults.classList.remove('has-results');
        searchResults.innerHTML = '';
      }, 200);
    });
  }

  // サイドバーのアクティブリンクを更新（同一ページ内アンカーのみ対象）
  const sections = document.querySelectorAll('h2[id], h3[id], h4[id]');

  function updateActiveLink() {
    let current = '';
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100) {
        current = section.getAttribute('id');
      }
    });

    allLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

  // スムーススクロール（同一ページ内アンカーのみ。ページ跨ぎリンクは通常遷移）
  allLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        scrollToId(href.slice(1));
      }
    });
  });

  // パンくずリストを更新
  const breadcrumbBase = document.getElementById('docs-breadcrumb-current')
    ? document.getElementById('docs-breadcrumb-current').textContent
    : '';

  function updateBreadcrumb() {
    const breadcrumbCurrent = document.getElementById('docs-breadcrumb-current');
    if (!breadcrumbCurrent) return;

    let currentSection = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100) {
        currentSection = section;
      }
    });

    if (currentSection) {
      breadcrumbCurrent.textContent = `${breadcrumbBase} > ${currentSection.textContent.trim()}`;
    } else {
      breadcrumbCurrent.textContent = breadcrumbBase;
    }
  }

  window.addEventListener('scroll', updateBreadcrumb);
  updateBreadcrumb();
});
