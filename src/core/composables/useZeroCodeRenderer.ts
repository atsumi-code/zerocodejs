import { computed } from 'vue';
import type { ZeroCodeData, ComponentData, PartData } from '../../types';
import { processTemplateWithDOM } from '../utils/template-processor';
import { injectAttributesToRootElement } from '../utils/template-utils';
import { findPartById } from '../utils/path-utils';

export function useZeroCodeRenderer(cmsData: ZeroCodeData, enableEditorAttributes: boolean = true) {
  function findPart(partId: string): PartData | null {
    return findPartById(partId, cmsData.parts);
  }

  function renderComponentToHtml(
    component: ComponentData,
    path: string = '',
    processedPaths: Set<string> = new Set()
  ): string {
    if (processedPaths.has(path)) {
      console.warn(`循環参照を検出しました: ${path}`);
      return `<div class="zcode-error-message">循環参照が検出されました: ${path}</div>`;
    }
    processedPaths.add(path);

    const partId = component.part_id;
    const part = findPart(partId);
    if (!part) {
      return `<div class="zcode-error-message">パーツが見つかりません: ${partId}</div>`;
    }

    const html = processTemplateWithDOM(
      part.body,
      component,
      path,
      findPart,
      (childComponent: ComponentData, childPath: string) =>
        renderComponentToHtml(childComponent, childPath, processedPaths),
      enableEditorAttributes,
      cmsData.images.common,
      cmsData.images.individual,
      cmsData.images.special,
      cmsData.backendData
    );

    if (enableEditorAttributes) {
      return injectAttributesToRootElement(html, {
        'data-zcode-id': component.id,
        'data-zcode-path': path,
        'data-zcode-part': partId
      });
    }
    return html;
  }

  const fullPageHtml = computed(() => {
    return cmsData.page
      .map((component, index) => renderComponentToHtml(component, `page.${index}`))
      .join('');
  });

  return {
    fullPageHtml,
    renderComponentToHtml,
    findPart
  };
}
