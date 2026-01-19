import { ref, nextTick, type Ref } from 'vue';
import type { ZeroCodeData, ComponentData, PartData } from '../../../types';
import { getComponentByPath, getFieldLabel } from '../../../core/utils/path-utils';
import { extractFieldsFromTemplate } from '../../../core/utils/field-extractor';
import { setActiveOutline, removeActiveOutline } from './useOutlineManager';
import { scrollToElement } from '../../../core/utils/dom-utils';

export function useEditMode(cmsData: ZeroCodeData, previewArea: Ref<HTMLElement | null>) {
  const editingComponent = ref<ComponentData | null>(null);
  const editingComponentIndex = ref<number>(-1);
  const editingComponentPath = ref<string>('');
  const editingAvailableFields = ref<
    Array<{
      type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'boolean' | 'rich' | 'image' | 'select' | 'select-multiple' | 'tag';
      fieldName: string;
      groupName?: string; // グループ名（オプション）
      label: string;
      defaultValue?: string;
      options?: string[];
      currentValue: any;
      optional?: boolean; // オプショナルフィールドかどうか
      required?: boolean;
      maxLength?: number;
      readonly?: boolean;
      disabled?: boolean;
    }>
  >([]);

  function getAvailableFields(component: ComponentData) {
    const partId = component.part_id;
    const parts = cmsData.parts;
    const allTypes = [...parts.common, ...parts.individual];
    let part: PartData | null = null;
    for (const type of allTypes) {
      const foundPart = type.parts.find((p) => p.id === partId);
      if (foundPart) {
        part = foundPart;
        break;
      }
    }
    if (!part) return [];

    const fieldInfos = extractFieldsFromTemplate(part.body);

    return fieldInfos.map((field) => {
      const baseField = {
        fieldName: field.fieldName,
        groupName: field.groupName,
        label: getFieldLabel(field.fieldName),
        required: field.required,
        maxLength: field.maxLength,
        readonly: field.readonly,
        disabled: field.disabled
      };

      if (field.type === 'text') {
        return {
          ...baseField,
          type: 'text' as const,
          defaultValue: field.defaultValue,
          optional: field.optional,
          currentValue: component[field.fieldName] !== undefined 
            ? component[field.fieldName] 
            : (field.optional ? undefined : field.defaultValue)
        };
      } else if (field.type === 'textarea') {
        return {
          ...baseField,
          type: 'textarea' as const,
          defaultValue: field.defaultValue,
          optional: field.optional,
          currentValue: component[field.fieldName] !== undefined 
            ? component[field.fieldName] 
            : (field.optional ? undefined : (field.defaultValue || ''))
        };
      } else if (field.type === 'rich') {
        return {
          ...baseField,
          type: 'rich' as const,
          defaultValue: field.defaultValue,
          optional: field.optional,
          currentValue: component[field.fieldName] !== undefined 
            ? component[field.fieldName] 
            : (field.optional ? undefined : (field.defaultValue || ''))
        };
      } else if (field.type === 'radio') {
        return {
          ...baseField,
          type: 'radio' as const,
          options: field.options,
          optional: field.optional,
          currentValue: component[field.fieldName] !== undefined 
            ? component[field.fieldName] 
            : (field.optional ? undefined : field.options?.[0])
        };
      } else if (field.type === 'boolean') {
        return {
          ...baseField,
          type: 'boolean' as const,
          defaultValue: field.defaultValue,
          optional: field.optional,
          currentValue: component[field.fieldName] !== undefined 
            ? component[field.fieldName] 
            : true
        };
      } else if (field.type === 'image') {
        return {
          ...baseField,
          type: 'image' as const,
          defaultValue: field.defaultValue,
          optional: field.optional,
          currentValue: component[field.fieldName] !== undefined 
            ? component[field.fieldName] 
            : (field.optional ? undefined : (field.defaultValue || ''))
        };
      } else if (field.type === 'select') {
        return {
          ...baseField,
          type: 'select' as const,
          options: field.options,
          optional: field.optional,
          currentValue: component[field.fieldName] !== undefined 
            ? component[field.fieldName] 
            : (field.optional ? undefined : field.options?.[0])
        };
      } else if (field.type === 'select-multiple') {
        return {
          ...baseField,
          type: 'select-multiple' as const,
          options: field.options,
          optional: field.optional,
          currentValue: Array.isArray(component[field.fieldName]) ? component[field.fieldName] : []
        };
      } else if (field.type === 'tag') {
        // 選択肢が指定されている場合はそれを使用、なければ全量表示
        const allTags = [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'div', 'p', 'span',
          'li', 'ul', 'ol',
          'section', 'article', 'aside', 'nav',
          'header', 'footer', 'main',
          'figure', 'figcaption',
          'blockquote', 'pre', 'code',
          'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ];
        
        const tagOptions = field.options || allTags;
        
        return {
          ...baseField,
          type: 'tag' as const,
          options: tagOptions,
          defaultValue: field.defaultValue || 'div',
          currentValue: component[field.fieldName] !== undefined 
            ? component[field.fieldName] 
            : (field.defaultValue || 'div')
        };
      } else {
        return {
          ...baseField,
          type: 'checkbox' as const,
          options: field.options,
          optional: field.optional,
          currentValue: Array.isArray(component[field.fieldName]) ? component[field.fieldName] : []
        };
      }
    });
  }

  function handleEditClick(path: string, component: ComponentData) {
    if (editingComponentPath.value === path) {
      closeEditPanel();
      return;
    }

    const pathParts = path.split('.');
    let index = -1;

    if (pathParts[0] === 'page' && pathParts.length >= 2) {
      index = parseInt(pathParts[1]);
    }
    if (editingComponentPath.value && previewArea.value) {
      const prevElement = previewArea.value.querySelector(
        `[data-zcode-path="${editingComponentPath.value}"]`
      ) as HTMLElement;
      if (prevElement) {
        removeActiveOutline(prevElement);
      }
    }

    editingComponent.value = component;
    editingComponentIndex.value = index;
    editingComponentPath.value = path;
    editingAvailableFields.value = getAvailableFields(component);

    nextTick(() => {
      if (previewArea.value && editingComponentPath.value === path) {
        const currentElement = previewArea.value.querySelector(
          `[data-zcode-path="${path}"]`
        ) as HTMLElement;
        if (currentElement) {
          setActiveOutline(currentElement, 'edit');
          scrollToElement(currentElement);
        }
      }
    });
  }

  function saveFieldEdit(field: {
    type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'rich' | 'image' | 'select' | 'select-multiple';
    fieldName: string;
    currentValue: any;
    optional?: boolean;
  }) {
    if (editingComponent.value && editingComponentPath.value) {
      const component = getComponentByPath(editingComponentPath.value, cmsData);
      if (component) {
        if (field.optional && (field.currentValue === '' || field.currentValue === null)) {
          component[field.fieldName] = undefined;
        } else {
          component[field.fieldName] = field.currentValue;
        }
      }
    }
  }

  function closeEditPanel() {
    if (editingComponentPath.value && previewArea.value) {
      const editingElement = previewArea.value.querySelector(
        `[data-zcode-path="${editingComponentPath.value}"]`
      ) as HTMLElement;
      if (editingElement) {
        removeActiveOutline(editingElement);
      }
    }

    editingComponent.value = null;
    editingComponentPath.value = '';
    editingAvailableFields.value = [];
  }

  return {
    editingComponent,
    editingComponentIndex,
    editingComponentPath,
    editingAvailableFields,
    handleEditClick,
    saveFieldEdit,
    closeEditPanel
  };
}
