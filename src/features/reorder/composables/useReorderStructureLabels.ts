import { onUnmounted, type Ref } from 'vue';
import type { ZeroCodeData } from '../../../types';
import type { EditorMode } from '../../editor/composables/useEditorMode';
import { findComponentElementsByZcodePath } from '../../editor/composables/useOutlineManager';
import {
  getStructureGroupLabelEntries,
  getStructureEntryPreviewLabel
} from '../utils/page-reorder';

const LABEL_CLASS = 'zcode-reorder-structure-label';

export function useReorderStructureLabels(
  previewArea: Ref<HTMLElement | null>,
  viewMode: Ref<'preview' | 'manage'>,
  currentMode: Ref<EditorMode>,
  structureListGroupId: Ref<string | null>,
  showReorderStructureLabels: Ref<boolean>,
  cmsData: ZeroCodeData
) {
  function clearStructureLabels() {
    if (!previewArea.value) {
      return;
    }
    previewArea.value.querySelectorAll(`.${LABEL_CLASS}`).forEach((element) => {
      element.remove();
    });
  }

  function shouldShowStructureLabels(): boolean {
    return (
      showReorderStructureLabels.value &&
      viewMode.value === 'manage' &&
      currentMode.value === 'reorder' &&
      structureListGroupId.value != null
    );
  }

  function createLabelElement(text: string): HTMLDivElement {
    const chip = document.createElement('div');
    chip.className = LABEL_CLASS;
    chip.setAttribute('aria-hidden', 'true');
    chip.textContent = text;
    return chip;
  }

  function syncStructureLabels() {
    clearStructureLabels();
    if (!previewArea.value || !shouldShowStructureLabels()) {
      return;
    }

    const entries = getStructureGroupLabelEntries(cmsData, structureListGroupId.value);
    for (const entry of entries) {
      const element = findComponentElementsByZcodePath(previewArea.value, entry.path)[0];
      if (!element) {
        continue;
      }
      const chip = createLabelElement(getStructureEntryPreviewLabel(entry));
      chip.setAttribute('data-zcode-structure-label-path', entry.path);
      element.insertBefore(chip, element.firstChild);
    }
  }

  onUnmounted(() => {
    clearStructureLabels();
  });

  return {
    syncStructureLabels,
    clearStructureLabels
  };
}
