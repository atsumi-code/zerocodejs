import type { ZeroCodeData, ComponentData, TypeData } from '../../types';
import { extractFieldsFromTemplate } from './field-extractor';
import { findPartById } from './path-utils';

/**
 * パーツテンプレートからフィールドのデフォルト値を取得
 */
function getDefaultFieldValue(
  field: ReturnType<typeof extractFieldsFromTemplate>[0]
): string | string[] | boolean {
  // デフォルト値が明示的に設定されている場合はそれを使用
  if (field.defaultValue !== undefined && field.defaultValue !== '') {
    switch (field.type) {
      case 'rich':
        return `<p>${field.defaultValue}</p>`;
      case 'image':
        return field.defaultValue;
      default:
        return field.defaultValue;
    }
  }

  // デフォルト値が設定されていない場合、型に応じたデフォルト値を返す
  switch (field.type) {
    case 'text':
    case 'textarea':
      return '';
    case 'rich':
      return '<p></p>';
    case 'radio':
    case 'select':
      return field.options?.[0] || '';
    case 'checkbox':
    case 'select-multiple':
      return [];
    case 'boolean':
      return true;
    case 'image':
      return '';
    default:
      return '';
  }
}

/**
 * 単一のコンポーネントに不足しているフィールドを初期化
 */
function initializeComponentFields(
  component: ComponentData,
  parts: { common: TypeData[]; individual: TypeData[]; special: TypeData[] }
): void {
  const part = findPartById(component.part_id, parts);
  if (!part) {
    return;
  }

  const fieldInfos = extractFieldsFromTemplate(part.body);

  fieldInfos.forEach((field) => {
    if (field.optional) {
      return;
    }
    if (component[field.fieldName] === undefined) {
      component[field.fieldName] = getDefaultFieldValue(field);
    }
  });
}

/**
 * すべてのコンポーネント（スロット内も含む）に不足しているフィールドを初期化
 */
export function initializeAllComponentFields(cmsData: ZeroCodeData): void {
  /**
   * コンポーネントを再帰的に処理（スロット内も含む）
   */
  function processComponentRecursive(component: ComponentData): void {
    initializeComponentFields(component, cmsData.parts);

    if (component.slots) {
      Object.values(component.slots).forEach((slotData) => {
        const children: ComponentData[] = Array.isArray(slotData)
          ? slotData
          : (slotData?.children || []);

        children.forEach((child) => {
          processComponentRecursive(child);
        });
      });
    }
  }

  cmsData.page.forEach((component) => {
    processComponentRecursive(component);
  });
}
