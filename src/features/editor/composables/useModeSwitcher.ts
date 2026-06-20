import { nextTick, type Ref } from 'vue';
import type { EditorMode } from './useEditorMode';
import { removeActiveOutline, removeHoverOutline } from './useOutlineManager';
import { getSelectedPathForMode } from './mode-selection-handoff';

export interface ModeSelectionHandoffHandlers {
  applyForMode: (mode: EditorMode, path: string) => void;
}

export function useModeSwitcher(
  previewArea: Ref<HTMLElement | null>,
  currentMode: Ref<EditorMode>,
  switchModeBase: (mode: EditorMode) => void,
  editingComponentPath: Ref<string>,
  addTargetPath: Ref<string | null>,
  reorderSourcePath: Ref<string>,
  deleteConfirmPath: Ref<string>,
  closeEditPanel: () => void,
  cancelDelete: () => void,
  cancelAdd: (options?: { scrollBack?: boolean }) => void,
  cancelReorder: (options?: { restoreScroll?: boolean }) => void,
  handoffHandlers: ModeSelectionHandoffHandlers
) {
  function clearAllActiveOutlines() {
    if (!previewArea.value) {
      return;
    }

    previewArea.value
      .querySelectorAll('[data-zcode-path], [data-zcode-slot-path]')
      .forEach((element) => {
        removeActiveOutline(element as HTMLElement);
        removeHoverOutline(element as HTMLElement);
      });
  }

  function clearPreviousModeState(fromMode: EditorMode, toMode: EditorMode) {
    if (fromMode === 'edit' && editingComponentPath.value) {
      closeEditPanel();
      return;
    }

    if (fromMode === 'add' && toMode !== 'add' && addTargetPath.value) {
      cancelAdd({ scrollBack: false });
      return;
    }

    if (fromMode === 'reorder' && reorderSourcePath.value) {
      cancelReorder({ restoreScroll: false });
      return;
    }

    if (fromMode === 'delete' && deleteConfirmPath.value) {
      cancelDelete();
    }
  }

  function switchMode(mode: EditorMode) {
    if (mode === currentMode.value) {
      return;
    }

    const handoffPath = getSelectedPathForMode(currentMode.value, {
      edit: editingComponentPath.value,
      add: addTargetPath.value,
      reorder: reorderSourcePath.value,
      delete: deleteConfirmPath.value
    });

    clearAllActiveOutlines();
    clearPreviousModeState(currentMode.value, mode);
    switchModeBase(mode);

    if (!handoffPath) {
      return;
    }

    nextTick(() => {
      handoffHandlers.applyForMode(mode, handoffPath);
    });
  }

  return {
    switchMode
  };
}
