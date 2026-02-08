import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ZeroCodeData, ComponentData, PartData } from '../../types';
import {
  renderComponentCore,
  RenderError,
  type RenderComponentCoreContext
} from '../renderer/renderer';
import { findPartById } from '../utils/path-utils';

function renderErrorToHtml(error: RenderError): string {
  return `<div class="zcode-error-message" data-error-code="${error.code}">${error.message}</div>`;
}

export function useZeroCodeRenderer(cmsData: ZeroCodeData, enableEditorAttributes: boolean = true) {
  const { t } = useI18n();

  function findPart(partId: string): PartData | null {
    return findPartById(partId, cmsData.parts);
  }

  const context = computed<RenderComponentCoreContext>(() => ({
    findPart,
    enableEditorAttributes,
    imagesCommon: cmsData.images.common,
    imagesIndividual: cmsData.images.individual,
    imagesSpecial: cmsData.images.special,
    backendData: cmsData.backendData,
    options: enableEditorAttributes
      ? { translations: { addSlotButton: t('emptyState.addPart') } }
      : undefined
  }));

  function renderComponentToHtml(
    component: ComponentData,
    path: string = '',
    processedPaths: Set<string> = new Set()
  ): string {
    try {
      return renderComponentCore(
        component,
        path,
        processedPaths,
        context.value,
        (childComponent, childPath) =>
          renderComponentToHtml(childComponent, childPath, processedPaths)
      );
    } catch (error) {
      if (error instanceof RenderError) {
        return renderErrorToHtml(error);
      }
      throw error;
    }
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
