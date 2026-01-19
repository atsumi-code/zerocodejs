import { ref, type Ref } from 'vue';
import type { ZeroCodeData, ComponentData, TypeData, PartData } from '../../../types';
import { getComponentByPath, generateId } from '../../../core/utils/path-utils';
import { extractFieldsFromTemplate } from '../../../core/utils/field-extractor';
import { setActiveOutline, removeActiveOutline } from '../../editor/composables/useOutlineManager';
import { scrollToElement } from '../../../core/utils/dom-utils';

export function useDeleteMode(
  cmsData: ZeroCodeData,
  previewArea: Ref<HTMLElement | null>,
  switchModeBase: (mode: 'add' | 'edit' | 'reorder' | 'delete') => void,
  nextTick: (fn: () => void) => void
) {
  // 状態管理
  const deleteConfirmComponent = ref<ComponentData | null>(null);
  const deleteConfirmPath = ref<string>('');

  // 削除モード: 要素クリック処理
  function handleDeleteClick(path: string, component: ComponentData) {
    // 同じパーツをクリックした場合はパネルを閉じる
    if (deleteConfirmPath.value === path) {
      cancelDelete();
      return;
    }

    // 前回選択していた要素のアウトラインを削除
    if (deleteConfirmPath.value && previewArea.value) {
      const prevElement = previewArea.value.querySelector(
        `[data-zcode-path="${deleteConfirmPath.value}"]`
      ) as HTMLElement;
      if (prevElement) {
        removeActiveOutline(prevElement);
      }
    }

    deleteConfirmComponent.value = component;
    deleteConfirmPath.value = path;

    // 選択中の要素にアウトラインを表示（太い実線）
    // nextTickで確実にDOMが更新された後にアウトラインを設定
    nextTick(() => {
      if (previewArea.value && deleteConfirmPath.value === path) {
        const currentElement = previewArea.value.querySelector(
          `[data-zcode-path="${path}"]`
        ) as HTMLElement;
        if (currentElement) {
          setActiveOutline(currentElement, 'delete');
          scrollToElement(currentElement);
        }
      }
    });
  }

  // 削除確定
  function confirmDelete() {
    if (!deleteConfirmPath.value) return;

    const path = deleteConfirmPath.value;
    const pathParts = path.split('.');

    // 削除前の親パスとスロット名を保存（削除後に空になったスロットをチェックするため）
    let parentPath: string | null = null;
    let slotName: string | null = null;

    // page.X の場合はトップレベル要素
    if (pathParts.length === 2 && pathParts[0] === 'page') {
      const index = parseInt(pathParts[1]);
      if (!isNaN(index) && index >= 0 && index < cmsData.page.length) {
        cmsData.page.splice(index, 1);

        // 最上位のパーツが空になった場合は追加モードに切り替え
        if (cmsData.page.length === 0) {
          nextTick(() => {
            switchModeBase('add');
          });
        }
      }
    }
    // page.X.field のようなネストされた要素の場合
    else if (pathParts.length > 2 && pathParts[0] === 'page') {
      const topIndex = parseInt(pathParts[1]);
      if (isNaN(topIndex) || topIndex < 0 || topIndex >= cmsData.page.length) {
        console.error('Invalid top-level index:', topIndex);
        cancelDelete();
        return;
      }

      // 親オブジェクトと削除するフィールド名を取得
      let current: any = cmsData.page[topIndex];
      const fieldPath = pathParts.slice(2); // ['slots', 'slotName', '0'] など

      // スロット情報を取得
      if (fieldPath.length >= 3 && fieldPath[0] === 'slots') {
        slotName = fieldPath[1];
        // 親パスを構築（例: "page.0"）
        parentPath = `page.${topIndex}`;
      }

      // 最後の一つ手前まで辿る
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current || typeof current !== 'object') {
          console.error('Invalid path:', path);
          cancelDelete();
          return;
        }
        current = current[fieldPath[i]];
      }

      // 最後のフィールドを削除
      const lastField = fieldPath[fieldPath.length - 1];
      if (current && typeof current === 'object') {
        // 配列の場合はspliceで削除
        if (Array.isArray(current)) {
          const index = parseInt(lastField);
          if (!isNaN(index) && index >= 0 && index < current.length) {
            current.splice(index, 1);
          } else {
            console.error('Invalid array index:', lastField);
          }
        } else if (lastField in current) {
          // オブジェクトの場合はdeleteで削除
          delete current[lastField];
        } else {
          console.error('Field not found:', path);
        }
      } else {
        console.error('Invalid current object:', path);
      }
    }

    // 削除後にスロットが空になった場合、初期コンポーネントを1つ作成
    if (parentPath && slotName) {
      nextTick(() => {
        ensureInitialSlotComponent(parentPath!, slotName!);
      });
    }

    cancelDelete();
  }

  // スロットが空の場合、初期コンポーネントを1つ作成
  function ensureInitialSlotComponent(parentPath: string, slotName: string) {
    // 親コンポーネントを取得
    const parentComponent = getComponentByPath(parentPath, cmsData);
    if (!parentComponent) return;

    // スロットを取得
    const slots = parentComponent.slots;
    if (!slots || !Array.isArray(slots[slotName])) return;

    const slotArray = slots[slotName] as ComponentData[];

    // スロットが空の場合のみ処理
    if (slotArray.length === 0) {
      // 親コンポーネントのタイプデータを取得（part_idから検索）
      const partId = parentComponent.part_id;
      const parts = cmsData.parts;
      const allTypes = [...parts.common, ...parts.individual];
      let parentType: TypeData | null = null;
      let parentPart: PartData | null = null;
      for (const type of allTypes) {
        const foundPart = type.parts.find((p) => p.id === partId);
        if (foundPart) {
          parentType = type;
          parentPart = foundPart;
          break;
        }
      }

      if (!parentType || !parentPart) return;

      // パーツのslots設定を使用
      const slotConfig = parentPart?.slots?.[slotName];

      if (slotConfig) {
        // allowedPartsが1つだけの場合は、そのパーツの初期コンポーネントを1つ作成
        const allowedPartIds = slotConfig.allowedParts;
        if (allowedPartIds && allowedPartIds.length === 1) {
          const allowedPartId = allowedPartIds[0];
          let childType: TypeData | null = null;
          let childPart: PartData | null = null;

          for (const type of allTypes) {
            const foundPart = type.parts.find((p) => p.id === allowedPartId);
            if (foundPart) {
              childType = type;
              childPart = foundPart;
              break;
            }
          }

          if (childType && childPart) {
            // 初期コンポーネントを作成（再帰的）
            const childComponent = createInitialComponentFromPart(childType, childPart.id);
            slotArray.push(childComponent);
          }
        }
      }
    }
  }

  // 初期コンポーネントを作成（再帰的、削除処理用）
  function createInitialComponentFromPart(type: TypeData, partId?: string): ComponentData {
    const part = partId ? type.parts.find((p) => p.id === partId) || type.parts[0] : type.parts[0];
    if (!part) {
      throw new Error(`Part not found for type: ${type.type}`);
    }

    // デフォルト値を抽出
    const fieldInfos = extractFieldsFromTemplate(part.body);
    const defaults: Record<string, any> = {};

    fieldInfos.forEach((field) => {
      if (field.optional) {
        defaults[field.fieldName] = undefined;
      } else if (field.type === 'text') {
        defaults[field.fieldName] = field.defaultValue;
      } else if (field.type === 'radio') {
        defaults[field.fieldName] = field.options?.[0];
      } else if (field.type === 'checkbox') {
        defaults[field.fieldName] = [];
      } else if (field.type === 'boolean') {
        defaults[field.fieldName] = true;
      } else if (field.type === 'rich') {
        defaults[field.fieldName] = field.defaultValue ? `<p>${field.defaultValue}</p>` : '<p></p>';
      } else if (field.type === 'image') {
        defaults[field.fieldName] = field.defaultValue || '';
      }
    });

    const component: ComponentData = {
      id: generateId(),
      part_id: part.id,
      ...defaults
    };

    // スロットの初期値を設定（パーツのslots設定を使用）
    const slotConfigs = part.slots;
    if (slotConfigs) {
      const slots: Record<string, ComponentData[]> = {};

      Object.entries(slotConfigs).forEach(([slotName, slotConfig]) => {
        const allowedPartIds = slotConfig.allowedParts;
        if (allowedPartIds && allowedPartIds.length === 1) {
          const allowedPartId = allowedPartIds[0];
          const parts = cmsData.parts;
          const allTypes = [...parts.common, ...parts.individual];
          let childType: TypeData | null = null;
          let childPart: PartData | null = null;

          for (const t of allTypes) {
            const foundPart = t.parts.find((p) => p.id === allowedPartId);
            if (foundPart) {
              childType = t;
              childPart = foundPart;
              break;
            }
          }

          if (childType && childPart) {
            const childComponent = createInitialComponentFromPart(childType, childPart.id);
            slots[slotName] = [childComponent];
          } else {
            slots[slotName] = [];
          }
        } else {
          slots[slotName] = [];
        }
      });

      if (Object.keys(slots).length > 0) {
        component.slots = slots;
      }
    }

    return component;
  }

  // 削除キャンセル
  function cancelDelete() {
    // アウトラインを削除
    if (deleteConfirmPath.value && previewArea.value) {
      const element = previewArea.value.querySelector(
        `[data-zcode-path="${deleteConfirmPath.value}"]`
      ) as HTMLElement;
      if (element) {
        removeActiveOutline(element);
      }
    }

    deleteConfirmComponent.value = null;
    deleteConfirmPath.value = '';
  }

  return {
    // 状態
    deleteConfirmComponent,
    deleteConfirmPath,
    // 関数
    handleDeleteClick,
    confirmDelete,
    cancelDelete
  };
}
