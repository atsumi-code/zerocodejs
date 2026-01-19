import { type Ref } from 'vue';
import type { EditorMode } from './useEditorMode';
import { removeActiveOutline, removeHoverOutline } from './useOutlineManager';
import type { ComponentData, TypeData, PartData } from '../../../types';

export function useModeSwitcher(
  previewArea: Ref<HTMLElement | null>,
  currentMode: Ref<EditorMode>,
  switchModeBase: (mode: EditorMode) => void,
  editingComponentPath: Ref<string>,
  addTargetPath: Ref<string | null>,
  reorderSourcePath: Ref<string>,
  deleteConfirmPath: Ref<string>,
  editingComponent: Ref<ComponentData | null>,
  addSelectedType: Ref<TypeData | null>,
  addSelectedPart: Ref<PartData | null>,
  addPartCategory: Ref<'common' | 'individual' | 'special'>,
  addTypeTab: Ref<string | null>,
  cancelDelete: () => void
) {
  // モード切り替え（拡張版）
  function switchMode(mode: EditorMode) {
    // すべてのアクティブアウトラインを削除
    if (previewArea.value) {
      const allElements = previewArea.value.querySelectorAll(
        '[data-zcode-path], [data-zcode-slot-path]'
      );
      allElements.forEach((element) => {
        removeActiveOutline(element as HTMLElement);
        removeHoverOutline(element as HTMLElement);
      });
    }

    // 前のモードの状態をクリーンアップ
    if (currentMode.value === 'edit' && editingComponentPath.value) {
      editingComponent.value = null;
      editingComponentPath.value = '';
    } else if (currentMode.value === 'add' && addTargetPath.value) {
      addTargetPath.value = null;
      addSelectedType.value = null;
      addSelectedPart.value = null;
      addPartCategory.value = 'common';
      addTypeTab.value = null;
    } else if (currentMode.value === 'reorder' && reorderSourcePath.value) {
      reorderSourcePath.value = '';
    } else if (currentMode.value === 'delete' && deleteConfirmPath.value) {
      cancelDelete();
    }

    // ベースのswitchModeを呼び出す
    switchModeBase(mode);
  }

  return {
    switchMode
  };
}
