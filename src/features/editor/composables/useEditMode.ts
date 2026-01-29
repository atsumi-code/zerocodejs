import { ref, nextTick, type Ref } from 'vue';
import type { ZeroCodeData, ComponentData, PartData } from '../../../types';
import { getComponentByPath } from '../../../core/utils/path-utils';
import {
  getAvailableFieldsFromPart,
  type EditPanelField
} from '../../../core/utils/edit-panel-fields';
import { setActiveOutline, removeActiveOutline } from './useOutlineManager';
import { scrollToElement } from '../../../core/utils/dom-utils';

export function useEditMode(cmsData: ZeroCodeData, previewArea: Ref<HTMLElement | null>) {
  const editingComponent = ref<ComponentData | null>(null);
  const editingComponentIndex = ref<number>(-1);
  const editingComponentPath = ref<string>('');
  const editingAvailableFields = ref<EditPanelField[]>([]);

  function getAvailableFields(component: ComponentData): EditPanelField[] {
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
    return getAvailableFieldsFromPart(part, component);
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
    type:
      | 'text'
      | 'textarea'
      | 'radio'
      | 'checkbox'
      | 'rich'
      | 'image'
      | 'select'
      | 'select-multiple';
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
