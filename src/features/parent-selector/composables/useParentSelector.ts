import { computed, type Ref } from 'vue';
import type { ZeroCodeData, ComponentData } from '../../../types';
import { getComponentByPath, getParentPath } from '../../../core/utils/path-utils';
import {
  removeHoverOutline,
  removeActiveOutline
} from '../../editor/composables/useOutlineManager';
import type { EditorMode } from '../../editor/composables/useEditorMode';

export function useParentSelector(
  cmsData: ZeroCodeData,
  previewArea: Ref<HTMLElement | null>,
  currentMode: Ref<EditorMode>,
  currentSelectedPath: Ref<string | null>,
  handleEditClick: (path: string, component: ComponentData) => void,
  handleAddClick: (path: string, isParentSelection?: boolean) => void,
  handleReorderClick: (path: string) => void,
  handleDeleteClick: (path: string, component: ComponentData) => void,
  reorderSourcePath: Ref<string>
) {
  const parentPath = computed(() => {
    if (!currentSelectedPath.value) return null;
    return getParentPath(currentSelectedPath.value);
  });

  const canSelectParent = computed(() => {
    if (!parentPath.value) return false;
    const parentComponent = getComponentByPath(parentPath.value, cmsData);
    return parentComponent !== null && parentComponent !== undefined;
  });

  // 親要素を選択する関数（親要素をクリックしたのと同じ動作）
  function selectParentElement() {
    if (!parentPath.value) return;

    // 親要素のパスを保存（computedが変わる前に）
    const targetParentPath = parentPath.value;

    // 親要素のDOM要素を取得
    if (!previewArea.value) return;

    const parentElement = previewArea.value.querySelector(
      `[data-zcode-path="${targetParentPath}"]`
    ) as HTMLElement;

    if (!parentElement) return;

    // 親要素のコンポーネントを取得
    const parentComponent = getComponentByPath(targetParentPath, cmsData);
    if (!parentComponent) return;

    // クリック時にホバーアウトラインを削除（現在の要素から）
    if (currentSelectedPath.value && previewArea.value) {
      const currentElement = previewArea.value.querySelector(
        `[data-zcode-path="${currentSelectedPath.value}"]`
      ) as HTMLElement;
      if (currentElement) {
        removeHoverOutline(currentElement);
      }
    }

    // 親要素をクリックしたのと同じ処理
    switch (currentMode.value) {
      case 'edit':
        handleEditClick(targetParentPath, parentComponent);
        break;
      case 'add':
        handleAddClick(targetParentPath, true); // 親要素選択時であることを示す
        break;
      case 'reorder':
        // 並べ替えモードの場合、既存の選択をリセットしてから親要素を選択
        if (reorderSourcePath.value) {
          // 既存の選択のアウトラインを削除
          const currentElement = previewArea.value.querySelector(
            `[data-zcode-path="${reorderSourcePath.value}"]`
          ) as HTMLElement;
          if (currentElement) {
            removeActiveOutline(currentElement);
          }
          // 選択をリセット
          reorderSourcePath.value = '';
        }
        // 親要素を移動元として選択（保存したパスを使用）
        handleReorderClick(targetParentPath);
        break;
      case 'delete':
        handleDeleteClick(targetParentPath, parentComponent);
        break;
    }
  }

  return {
    parentPath,
    canSelectParent,
    selectParentElement
  };
}
