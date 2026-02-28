var ZeroCodeApi = (function () {
  'use strict';

  function applyDataToComponent(component, data) {
    if (!component || !data) return;

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

        for (var i = 0; i < targets.length; i++) {
          var target = targets[i];
          var dataToSave = getDataForTarget(data, target);

          if (dataToSave === undefined) {
            component.dispatchEvent(new CustomEvent('save-result', {
              detail: { requestId: requestId, target: target, ok: false, errors: [{ message: 'Unknown target: ' + target }] }
            }));
            continue;
          }

          try {
            var page = component.getAttribute('data-current-page') || 'default';
            var res = await fetch('/api/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: target, data: dataToSave, page: page })
            });
            var body = await res.json().catch(function () { return {}; });

            component.dispatchEvent(new CustomEvent('save-result', {
              detail: { requestId: requestId, target: target, ok: body.ok !== false, errors: body.errors || [] }
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

  return {
    applyDataToComponent: applyDataToComponent,
    setupApiSaveListeners: setupApiSaveListeners
  };
})();
