import { ref, type Ref } from 'vue';
import type { ZeroCodeData, ComponentData, SlotConfig } from '../../../types';
import { getComponentByPath, getParentPath } from '../../../core/utils/path-utils';
import {
  setActiveOutline,
  removeActiveOutline,
  removeHoverOutline
} from '../../editor/composables/useOutlineManager';
import { scrollToElement } from '../../../core/utils/dom-utils';

export function useReorderMode(cmsData: ZeroCodeData, previewArea: Ref<HTMLElement | null>) {
  // 状態管理
  const reorderSourcePath = ref<string>('');

  // 並べ替え可能かどうかを判定する関数
  function canReorderWith(sourcePath: string, targetPath: string): boolean {
    if (!sourcePath || !targetPath) return false;

    const sourceParts = sourcePath.split('.');
    const targetParts = targetPath.split('.');

    // 同じ階層かチェック（パスの長さが同じ）
    if (sourceParts.length !== targetParts.length) {
      return false;
    }

    // 同じ要素の場合は並べ替え不可
    if (sourcePath === targetPath) {
      return false;
    }

    // スロット内の要素の場合、最後の'slots'セグメントまでを比較
    if (sourceParts.includes('slots') && targetParts.includes('slots')) {
      // 最後の'slots'セグメントを見つける
      let sourceLastSlotIndex = -1;
      let targetLastSlotIndex = -1;

      for (let i = sourceParts.length - 1; i >= 0; i--) {
        if (sourceParts[i] === 'slots') {
          sourceLastSlotIndex = i;
          break;
        }
      }

      for (let i = targetParts.length - 1; i >= 0; i--) {
        if (targetParts[i] === 'slots') {
          targetLastSlotIndex = i;
          break;
        }
      }

      if (sourceLastSlotIndex === -1 || targetLastSlotIndex === -1) {
        return false;
      }

      // 最後の'slots'セグメントまでのパスが同じかチェック
      const sourceParentPath = sourceParts.slice(0, sourceLastSlotIndex).join('.');
      const targetParentPath = targetParts.slice(0, targetLastSlotIndex).join('.');

      if (sourceParentPath !== targetParentPath) {
        return false;
      }

      // スロット名が同じかチェック
      const sourceSlotName = sourceParts[sourceLastSlotIndex + 1];
      const targetSlotName = targetParts[targetLastSlotIndex + 1];

      if (sourceSlotName !== targetSlotName) {
        return false;
      }

      return true;
    }

    // ネストの場合、親が同じかチェック
    if (sourceParts.length > 2) {
      const sourceParent = sourceParts.slice(0, -1).join('.');
      const targetParent = targetParts.slice(0, -1).join('.');
      if (sourceParent !== targetParent) {
        return false;
      }
    }

    return true;
  }

  // 並べ替えモード: クリック処理
  function handleReorderClick(path: string) {
    if (!path) {
      return;
    }

    // 1回目のクリック: 移動元を選択
    if (!reorderSourcePath.value) {
      // 親要素のホバーアウトラインを削除
      const parentPath = getParentPath(path);
      if (parentPath && previewArea.value) {
        const parentElement = previewArea.value.querySelector(
          `[data-zcode-path="${parentPath}"]`
        ) as HTMLElement;
        if (parentElement) {
          removeHoverOutline(parentElement);
        }
      }

      reorderSourcePath.value = path;

      // 選択した要素に太いアウトラインを表示
      if (previewArea.value) {
        const element = previewArea.value.querySelector(
          `[data-zcode-path="${path}"]`
        ) as HTMLElement;
        if (element) {
          setActiveOutline(element, 'reorder');
          scrollToElement(element);
        }
      }
      return;
    }

    // 同じ要素をクリック: キャンセル
    if (reorderSourcePath.value === path) {
      cancelReorder();
      return;
    }

    if (!canReorderWith(reorderSourcePath.value, path)) {
      alert('この要素とは並べ替えできません。同じ階層の要素を選択してください。');
      cancelReorder();
      return;
    }

    // 並べ替え実行
    const success = reorderComponents(reorderSourcePath.value, path);
    if (!success) {
      alert('並べ替えに失敗しました。同じ階層の要素を選択してください。');
    }
    cancelReorder();
  }

  // 並べ替えをキャンセル
  function cancelReorder() {
    if (reorderSourcePath.value && previewArea.value) {
      const element = previewArea.value.querySelector(
        `[data-zcode-path="${reorderSourcePath.value}"]`
      ) as HTMLElement;
      if (element) {
        removeActiveOutline(element);
      }
    }
    reorderSourcePath.value = '';
  }

  // 並べ替え処理
  function reorderComponents(fromPath: string, toPath: string): boolean {
    const fromParts = fromPath.split('.');
    const toParts = toPath.split('.');

    // トップレベルの並べ替え
    if (
      fromParts.length === 2 &&
      toParts.length === 2 &&
      fromParts[0] === 'page' &&
      toParts[0] === 'page'
    ) {
      const fromIndex = parseInt(fromParts[1]);
      const toIndex = parseInt(toParts[1]);

      if (!isNaN(fromIndex) && !isNaN(toIndex) && fromIndex !== toIndex) {
        const items = [...cmsData.page];
        const [removed] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, removed);
        cmsData.page = items;
        return true;
      }
      return false;
    }
    // スロット内の要素の並べ替え
    else if (fromParts.includes('slots') && toParts.includes('slots')) {
      // 最後の'slots'セグメントを見つける
      let fromLastSlotIndex = -1;
      let toLastSlotIndex = -1;

      for (let i = fromParts.length - 1; i >= 0; i--) {
        if (fromParts[i] === 'slots') {
          fromLastSlotIndex = i;
          break;
        }
      }

      for (let i = toParts.length - 1; i >= 0; i--) {
        if (toParts[i] === 'slots') {
          toLastSlotIndex = i;
          break;
        }
      }

      if (fromLastSlotIndex === -1 || toLastSlotIndex === -1) {
        return false;
      }

      const fromParentPath = fromParts.slice(0, fromLastSlotIndex).join('.');
      const toParentPath = toParts.slice(0, toLastSlotIndex).join('.');

      if (fromParentPath !== toParentPath) {
        return false;
      }

      const fromSlotName = fromParts[fromLastSlotIndex + 1];
      const toSlotName = toParts[toLastSlotIndex + 1];

      if (fromSlotName !== toSlotName) {
        return false;
      }

      const fromIndex = parseInt(fromParts[fromParts.length - 1]);
      const toIndex = parseInt(toParts[toParts.length - 1]);

      if (isNaN(fromIndex) || isNaN(toIndex) || fromIndex === toIndex) {
        return false;
      }

      const parent = getComponentByPath(fromParentPath, cmsData);
      if (!parent || !parent.slots || !parent.slots[fromSlotName]) {
        return false;
      }

      const slotData = parent.slots[fromSlotName];
      let children: ComponentData[] = [];

      if (Array.isArray(slotData)) {
        children = slotData;
      } else if (slotData && typeof slotData === 'object' && (slotData as SlotConfig).children) {
        children = (slotData as SlotConfig).children || [];
      } else {
        return false;
      }

      // 並べ替え実行
      const [removed] = children.splice(fromIndex, 1);
      children.splice(toIndex, 0, removed);

      // SlotConfigの場合はchildrenを更新
      if (
        !Array.isArray(slotData) &&
        typeof slotData === 'object' &&
        (slotData as SlotConfig).children
      ) {
        (slotData as SlotConfig).children = children;
      }
      return true;
    }
    // ネストされた配列の並べ替え（将来の拡張用）
    else if (fromParts.length > 2 && toParts.length > 2) {
      // 親パスが同じかチェック
      const fromParentPath = fromParts.slice(0, -1).join('.');
      const toParentPath = toParts.slice(0, -1).join('.');

      if (fromParentPath === toParentPath) {
        const fromIndex = parseInt(fromParts[fromParts.length - 1]);
        const toIndex = parseInt(toParts[toParts.length - 1]);

        if (!isNaN(fromIndex) && !isNaN(toIndex) && fromIndex !== toIndex) {
          // 親配列を取得
          const topIndex = parseInt(fromParts[1]);
          let current: any = cmsData.page[topIndex];

          for (let i = 2; i < fromParts.length - 1; i++) {
            current = current[fromParts[i]];
          }

          // 配列であることを確認
          if (Array.isArray(current)) {
            const [removed] = current.splice(fromIndex, 1);
            current.splice(toIndex, 0, removed);
            return true;
          }
        }
      }
    }
    return false;
  }

  return {
    // 状態
    reorderSourcePath,
    // 関数
    handleReorderClick,
    canReorderWith,
    cancelReorder
  };
}
