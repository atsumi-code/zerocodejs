(function () {
  'use strict';

  function applyDataToComponent(component, data) {
    if (!component || !data) return;
    if (data.backendData) {
      component.setAttribute('backend-data', JSON.stringify(data.backendData));
    }
    component.setAttribute('page', JSON.stringify(data.page || []));
    if (data.css) {
      if (data.css.common) component.setAttribute('css-common', data.css.common);
      if (data.css.individual) component.setAttribute('css-individual', data.css.individual);
      if (data.css.special) component.setAttribute('css-special', data.css.special);
    }
    component.setAttribute('parts-common', JSON.stringify(data.parts?.common || []));
    component.setAttribute('parts-individual', JSON.stringify(data.parts?.individual || []));
    component.setAttribute('parts-special', JSON.stringify(data.parts?.special || []));
    component.setAttribute('images-common', JSON.stringify(data.images?.common || []));
    component.setAttribute('images-individual', JSON.stringify(data.images?.individual || []));
    component.setAttribute('images-special', JSON.stringify(data.images?.special || []));
  }

  function getDataForTarget(fullData, target) {
    var map = {
      'page': fullData.page,
      'parts-common': fullData.parts?.common,
      'parts-individual': fullData.parts?.individual,
      'parts-special': fullData.parts?.special,
      'parts-common-css': fullData.css?.common || '',
      'parts-individual-css': fullData.css?.individual || '',
      'parts-special-css': fullData.css?.special || '',
      'images-common': fullData.images?.common,
      'images-individual': fullData.images?.individual,
      'images-special': fullData.images?.special
    };
    return map[target];
  }

  function getContext(component) {
    var wrapper = component.closest('[data-page-id], [data-news-id]');
    if (!wrapper) return null;
    var pageId = wrapper.getAttribute('data-page-id');
    var newsId = wrapper.getAttribute('data-news-id');
    var mode = wrapper.getAttribute('data-mode') || 'admin';
    var source = mode === 'cms' ? 'cms' : 'editor';
    return { pageId: pageId || null, newsId: newsId ? parseInt(newsId, 10) : null, source: source };
  }

  function setupApiSaveListeners() {
    var components = document.querySelectorAll('zcode-cms, zcode-editor');
    components.forEach(function (component) {
      component.addEventListener('save-request', async function (e) {
        var detail = e.detail;
        var targets = detail.targets || [];
        var requestId = detail.requestId;
        if (!targets.length) return;
        var data = component.getData();
        if (!data) return;
        var ctx = getContext(component);
        if (!ctx || (ctx.pageId === null && ctx.newsId === null)) {
          components.forEach(function (c) {
            c.dispatchEvent(new CustomEvent('save-result', {
              detail: { requestId: requestId, target: targets[0], ok: false, errors: [{ message: 'Missing page_id or news_id context' }] }
            }));
          });
          return;
        }
        for (var i = 0; i < targets.length; i++) {
          var target = targets[i];
          var dataToSave = getDataForTarget(data, target);
          if (dataToSave === undefined) {
            component.dispatchEvent(new CustomEvent('save-result', {
              detail: { requestId: requestId, target: target, ok: false, errors: [{ message: 'Unknown target: ' + target }] }
            }));
            continue;
          }
          if (target !== 'page') {
            component.dispatchEvent(new CustomEvent('save-result', {
              detail: { requestId: requestId, target: target, ok: false, errors: [{ message: 'Only target=page is supported' }] }
            }));
            continue;
          }
          try {
            var body = { target: 'page', source: ctx.source, data: dataToSave };
            if (ctx.pageId) body.page_id = ctx.pageId;
            if (ctx.newsId) body.news_id = ctx.newsId;
            var res = await fetch('/api/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(body)
            });
            var resBody = await res.json().catch(function () { return {}; });
            if (!res.ok) {
              component.dispatchEvent(new CustomEvent('save-result', {
                detail: { requestId: requestId, target: target, ok: false, errors: resBody.errors || [{ message: resBody.error || 'Save failed' }] }
              }));
              continue;
            }
            component.dispatchEvent(new CustomEvent('save-result', {
              detail: { requestId: requestId, target: target, ok: resBody.ok !== false, errors: resBody.errors || [] }
            }));
          } catch (err) {
            component.dispatchEvent(new CustomEvent('save-result', {
              detail: { requestId: requestId, target: target, ok: false, errors: [{ message: err.message }] }
            }));
          }
        }
      });
    });
  }

  function loadDataIntoComponent(component, pageId, newsSlug) {
    var url = pageId
      ? '/api/data?page=' + encodeURIComponent(pageId)
      : '/api/data?news=' + encodeURIComponent(newsSlug);
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load data');
        return res.json();
      })
      .then(function (data) {
        applyDataToComponent(component, data);
      });
  }

  window.ZeroCodeApi = {
    applyDataToComponent: applyDataToComponent,
    setupApiSaveListeners: setupApiSaveListeners,
    loadDataIntoComponent: loadDataIntoComponent
  };
})();
