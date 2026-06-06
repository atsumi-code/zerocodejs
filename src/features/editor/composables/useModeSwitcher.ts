import { type Ref } from 'vue';
import type { EditorMode } from './useEditorMode';
import { removeActiveOutline, removeHoverOutline } from './useOutlineManager';
import type { ComponentData } from '../../../types';

export function useModeSwitcher(
  previewArea: Ref<HTMLElement | null>,
  currentMode: Ref<EditorMode>,
  switchModeBase: (mode: EditorMode) => void,
  editingComponentPath: Ref<string>,
  addTargetPath: Ref<string | null>,
  reorderSourcePath: Ref<string>,
  deleteConfirmPath: Ref<string>,
  editingComponent: Ref<ComponentData | null>,
  cancelDelete: () => void,
  cancelAdd: (options?: { scrollBack?: boolean }) => void
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

    // add 以外へ切り替えるときは追加パネルを閉じる（空ページからの追加など currentMode が add でない場合も含む）
    if (mode !== 'add' && addTargetPath.value) {
      cancelAdd({ scrollBack: false });
    }

    // 前のモードの状態をクリーンアップ
    if (currentMode.value === 'edit' && editingComponentPath.value) {
      editingComponent.value = null;
      editingComponentPath.value = '';
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
