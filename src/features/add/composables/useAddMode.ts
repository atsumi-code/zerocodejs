import { ref, computed, nextTick, type Ref } from 'vue';

import type { ZeroCodeData, ComponentData, TypeData, PartData, SlotConfig, CMSConfig } from '../../../types';
import { getComponentByPath, generateId } from '../../../core/utils/path-utils';
import { extractFieldsFromTemplate } from '../../../core/utils/field-extractor';
import { setActiveOutline, removeActiveOutline } from '../../editor/composables/useOutlineManager';
import { scrollToElement } from '../../../core/utils/dom-utils';

export function useAddMode(
  cmsData: ZeroCodeData,
  previewArea: Ref<HTMLElement | null>,
  renderComponentToHtml: (component: ComponentData, path: string) => string,
  config?: Partial<CMSConfig>
) {
  const addTargetPath = ref<string | null>(null);
  const addSelectedType = ref<TypeData | null>(null);
  const addSelectedPart = ref<PartData | null>(null);
  const addPartCategory = ref<'common' | 'individual' | 'special'>(
    config?.categoryOrder === 'individual' ? 'individual' : config?.categoryOrder === 'special' ? 'special' : 'common'
  );
  const addTypeTab = ref<string | 'all' | 'selected' | null>('all');
  const clickedComponent = ref<ComponentData | null>(null);
  const keepAdding = ref<boolean>(false);

  function getSlotPath(path: string): string {
    if (path.includes('.slots.')) {
      const pathParts = path.split('.');
      let lastSlotIndex = -1;
      for (let i = pathParts.length - 1; i >= 0; i--) {
        if (pathParts[i] === 'slots') {
          lastSlotIndex = i;
          break;
        }
      }
      if (lastSlotIndex !== -1 && lastSlotIndex + 1 < pathParts.length) {
        return pathParts.slice(0, lastSlotIndex + 2).join('.');
      }
    }
    return path;
  }

  const availablePartTypes = computed(() => {
    const parts = cmsData.parts;
    const targetTypes = addPartCategory.value === 'common' ? parts.common : addPartCategory.value === 'individual' ? parts.individual : parts.special;

    if (addTargetPath.value && addTargetPath.value.includes('.slots.')) {
      const allTypes = [...parts.common, ...parts.individual, ...parts.special];
      const slotPath = getSlotPath(addTargetPath.value);
      return getAvailableTypesForSlot(slotPath, allTypes, targetTypes);
    }

    const allTypeNames = [...new Set(targetTypes.map((t) => t.type))];
    return allTypeNames;
  });

  function getAvailablePartsForSlot(path: string, allTypesForLookup: TypeData[]): string[] | null {
    const pathParts = path.split('.');

    let lastSlotIndex = -1;
    for (let i = pathParts.length - 1; i >= 0; i--) {
      if (pathParts[i] === 'slots') {
        lastSlotIndex = i;
        break;
      }
    }

    if (lastSlotIndex === -1) {
      return null;
    }

    const parentPath = pathParts.slice(0, lastSlotIndex).join('.');
    const slotName = pathParts[lastSlotIndex + 1];

    const parent = getComponentByPath(parentPath, cmsData);
    if (!parent) {
      return null;
    }

    const partId = parent.part_id;
    let typeData: TypeData | null = null;
    for (const type of allTypesForLookup) {
      if (type.parts.some((p) => p.id === partId)) {
        typeData = type;
        break;
      }
    }

    if (!typeData) {
      return null;
    }

    const part = typeData.parts.find((p) => p.id === partId) || typeData.parts[0];

    const slotConfig = part?.slots?.[slotName];

    if (slotConfig) {
      const allowedParts = slotConfig.allowedParts;
      if (allowedParts && Array.isArray(allowedParts)) {
        return allowedParts;
      }
    }

    return null;
  }

  const groupedPartsByType = computed(() => {
    const parts = cmsData.parts;
    const targetTypes = addPartCategory.value === 'common' ? parts.common : addPartCategory.value === 'individual' ? parts.individual : parts.special;

    const availableTypes = availablePartTypes.value;
    let filteredTypes = targetTypes.filter((t) => availableTypes.includes(t.type));

    if (addTypeTab.value && addTypeTab.value !== 'all' && addTypeTab.value !== 'selected') {
      filteredTypes = filteredTypes.filter((t) => t.type === addTypeTab.value);
    }

    const allTypes = [...parts.common, ...parts.individual];
    const availableParts =
      addTargetPath.value && addTargetPath.value.includes('.slots.')
        ? getAvailablePartsForSlot(getSlotPath(addTargetPath.value), allTypes)
        : null;

    const grouped = new Map<string, { type: TypeData; parts: PartData[] }>();

    filteredTypes.forEach((type) => {
      if (!grouped.has(type.type)) {
        grouped.set(type.type, {
          type,
          parts: []
        });
      }
      const group = grouped.get(type.type)!;

      if (availableParts !== null) {
        if (availableParts.length > 0) {
          type.parts.forEach((p) => {
            if (availableParts.includes(p.id)) {
              group.parts.push(p);
            }
          });
        }
      } else {
        type.parts.forEach((p) => {
          if (!p.slotOnly) {
            group.parts.push(p);
          }
        });
      }
    });

    return Array.from(grouped.values()).map((group) => ({
      type: group.type.type,
      description: group.type.description,
      typeData: group.type,
      parts: group.parts
    }));
  });

  // スロット用の利用可能なタイプを取得
  function getAvailableTypesForSlot(
    path: string,
    allTypesForLookup: TypeData[],
    filteredTypes: TypeData[]
  ): string[] {
    // pathから親コンポーネントを取得
    const pathParts = path.split('.');

    // 最後の'slots'セグメントを見つける（ネストされたスロットに対応）
    let lastSlotIndex = -1;
    for (let i = pathParts.length - 1; i >= 0; i--) {
      if (pathParts[i] === 'slots') {
        lastSlotIndex = i;
        break;
      }
    }

    if (lastSlotIndex === -1) {
      // スロットがない場合は全タイプを返す
      return [...new Set(filteredTypes.map((t) => t.type))];
    }

    // 最後の'slots'セグメントまでの親パスを取得
    const parentPath = pathParts.slice(0, lastSlotIndex).join('.');
    const slotName = pathParts[lastSlotIndex + 1];

    const parent = getComponentByPath(parentPath, cmsData);
    if (!parent) {
      return [...new Set(filteredTypes.map((t) => t.type))];
    }

    // タイプデータ側の設定を確認（part_idからパーツを検索）
    const partId = parent.part_id;
    let typeData: TypeData | null = null;
    let partData: PartData | null = null;
    for (const type of allTypesForLookup) {
      const foundPart = type.parts.find((p) => p.id === partId);
      if (foundPart) {
        typeData = type;
        partData = foundPart;
        break;
      }
    }

    if (!typeData || !partData) {
      return [...new Set(filteredTypes.map((t) => t.type))];
    }

    // パーツのslots設定を使用
    const slotConfig = partData?.slots?.[slotName];

    if (slotConfig) {
      const allowedPartIds = slotConfig.allowedParts;
      if (allowedPartIds && Array.isArray(allowedPartIds)) {
        // すべてのタイプから、指定されたパーツIDを含むタイプを取得
        const typesWithAllowedParts = new Set<string>();
        allTypesForLookup.forEach((type) => {
          type.parts.forEach((p) => {
            if (allowedPartIds.includes(p.id)) {
              typesWithAllowedParts.add(type.type);
            }
          });
        });

        let types = Array.from(typesWithAllowedParts);

        // 最後に、filteredTypesに存在するタイプのみを返す（カテゴリフィルタリング）
        types = types.filter((t) => filteredTypes.some((type) => type.type === t));

        return types;
      }
    }

    return [...new Set(filteredTypes.map((t) => t.type))];
  }

  function handleAddClick(path: string, isParentSelection: boolean = false) {
    void isParentSelection;
    if (addTargetPath.value === path) {
      cancelAdd();
      return;
    }

    if (addTargetPath.value && previewArea.value) {
      const previousElement = previewArea.value.querySelector(
        `[data-zcode-path="${addTargetPath.value}"]`
      ) as HTMLElement;
      if (previousElement) {
        removeActiveOutline(previousElement);
      }

      const previousSlotElement = previewArea.value.querySelector(
        `[data-zcode-slot-path="${addTargetPath.value}"]`
      ) as HTMLElement;
      if (previousSlotElement) {
        removeActiveOutline(previousSlotElement);
      }
    }

    addTargetPath.value = path;

    addTypeTab.value = 'all';
    addPartCategory.value = 'common';
    addSelectedType.value = null;
    addSelectedPart.value = null;

    const component = getComponentByPath(path, cmsData);
    if (component && component.part_id) {
      clickedComponent.value = component;
    } else {
      clickedComponent.value = null;
    }

    const parts = cmsData.parts;
    const commonTypes = parts.common;
    const individualTypes = parts.individual;
    const specialTypes = parts.special;

    let commonAvailableTypes: string[] = [];
    let individualAvailableTypes: string[] = [];
    // specialAvailableTypesは現在未使用（将来の拡張用）
    // let specialAvailableTypes: string[] = [];

    if (path.includes('.slots.')) {
      const allTypes = [...commonTypes, ...individualTypes, ...specialTypes];
      const slotPath = getSlotPath(path);
      commonAvailableTypes = getAvailableTypesForSlot(slotPath, allTypes, commonTypes);
      individualAvailableTypes = getAvailableTypesForSlot(slotPath, allTypes, individualTypes);
      // specialAvailableTypesは現在未使用（将来の拡張用）
      // specialAvailableTypes = getAvailableTypesForSlot(slotPath, allTypes, specialTypes);
    } else {
      commonAvailableTypes = [...new Set(commonTypes.map((t: TypeData) => t.type))];
      individualAvailableTypes = [...new Set(individualTypes.map((t: TypeData) => t.type))];
      // specialAvailableTypesは現在未使用（将来の拡張用）
      // specialAvailableTypes = [...new Set(specialTypes.map((t: TypeData) => t.type))];
    }

    const hasCommonParts = commonAvailableTypes.length > 0;
    const hasIndividualParts = individualAvailableTypes.length > 0;
    const hasSpecialParts = specialTypes.length > 0;

    const categoryOrder = config?.categoryOrder;

    let selectedCategory: 'common' | 'individual' | 'special';

    if (categoryOrder === 'special' && hasSpecialParts) {
      selectedCategory = 'special';
    } else if (categoryOrder === 'individual' && hasIndividualParts) {
      selectedCategory = 'individual';
    } else if (categoryOrder === 'common' && hasCommonParts) {
      selectedCategory = 'common';
    } else if (hasCommonParts) {
      selectedCategory = 'common';
    } else if (hasIndividualParts) {
      selectedCategory = 'individual';
    } else if (hasSpecialParts) {
      selectedCategory = 'special';
    } else {
      selectedCategory = 'common';
    }

    addPartCategory.value = selectedCategory;

    nextTick(() => {
      if (previewArea.value && addTargetPath.value === path) {
        const currentElement = previewArea.value.querySelector(
          `[data-zcode-path="${path}"]`
        ) as HTMLElement;
        if (currentElement) {
          setActiveOutline(currentElement, 'add');
          scrollToElement(currentElement);
        } else {
          const slotPath = getSlotPath(path);
          if (slotPath !== path) {
            const slotElement = previewArea.value.querySelector(
              `[data-zcode-slot-path="${slotPath}"]`
            ) as HTMLElement;
            if (slotElement) {
              setActiveOutline(slotElement, 'add');
              scrollToElement(slotElement);
            }
          }
        }
      }
    });
  }

  function handleCategoryTabClick(category: 'common' | 'individual' | 'special') {
    addPartCategory.value = category;
    addTypeTab.value = 'all';
    addSelectedType.value = null;
    addSelectedPart.value = null;
    keepAdding.value = false;
  }

  function handleTypeTabClick(type: string | 'all' | 'selected') {
    addTypeTab.value = type;
    if (type === 'selected' && clickedComponent.value && clickedComponent.value.part_id) {
      const parts = cmsData.parts;
      const allTypes = [...parts.common, ...parts.individual, ...parts.special];
      for (const typeData of allTypes) {
        const part = typeData.parts.find((p) => p.id === clickedComponent.value!.part_id);
        if (part) {
          addSelectedType.value = typeData;
          addSelectedPart.value = part;
          break;
        }
      }
    } else if (type !== 'selected') {
      addSelectedType.value = null;
      addSelectedPart.value = null;
    }
    keepAdding.value = false;
  }

  function getPartPreviewHtml(type: TypeData, part: PartData): string {
    const tempComponent = createTempComponentFromType(type, part);
    return renderComponentToHtml(tempComponent, '');
  }

  function getClickedComponentPreviewHtml(): string {
    if (!clickedComponent.value) {
      return '';
    }
    return renderComponentToHtml(clickedComponent.value, '');
  }

  function createTempComponentFromType(type: TypeData, part: PartData): ComponentData {
    const tempComponent = createComponentFromTypeRecursive(type, false, new Set(), part.id);
    tempComponent.id = 'preview';
    return tempComponent;
  }

  function selectPart(type: TypeData, part: PartData) {
    if (addSelectedPart.value?.id === part.id) {
      addSelectedType.value = null;
      addSelectedPart.value = null;
      return;
    }

    addSelectedType.value = type;
    addSelectedPart.value = part;
    if (addTypeTab.value === 'selected') {
      addTypeTab.value = 'all';
    }
    keepAdding.value = false;
  }

  function createComponentFromTypeRecursive(
    type: TypeData,
    useSelectedPart: boolean = false,
    processedParts: Set<string> = new Set(),
    partId?: string
  ): ComponentData {
    const part = partId
      ? type.parts.find((p) => p.id === partId) || type.parts[0]
      : useSelectedPart && addSelectedPart.value
        ? addSelectedPart.value
        : type.parts[0];

    if (!part) {
      throw new Error(`Part not found for type: ${type.type}`);
    }

    const partKey = `${type.id}:${part.id}`;
    if (processedParts.has(partKey)) {
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
        defaults[field.fieldName] = field.defaultValue
          ? `<p>${field.defaultValue}</p>`
          : '<p></p>';
      } else if (field.type === 'image') {
        defaults[field.fieldName] = field.defaultValue || '';
      }
    });
      return {
        id: generateId(),
        part_id: part.id,
        ...defaults
      };
    }
    processedParts.add(partKey);

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

    const slotConfigs = part.slots;
    if (slotConfigs) {
      const slots: Record<string, ComponentData[]> = {};

      Object.entries(slotConfigs).forEach(([slotName, slotConfig]) => {
        const allowedPartIds = slotConfig.allowedParts;
        if (allowedPartIds && allowedPartIds.length === 1) {
          const allowedPartId = allowedPartIds[0];
          const parts = cmsData.parts;
          const allTypes = [...parts.common, ...parts.individual, ...parts.special];
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
            const childComponent = createComponentFromTypeRecursive(
              childType,
              false,
              processedParts,
              childPart.id
            );
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

  function createComponentFromType(type: TypeData): ComponentData {
    return createComponentFromTypeRecursive(type, true);
  }

  function confirmAddPart(position: 'before' | 'after') {
    if (!addSelectedType.value || !addSelectedPart.value || !addTargetPath.value) {
      console.error('Missing required values:', {
        addSelectedType: addSelectedType.value,
        addSelectedPart: addSelectedPart.value,
        addTargetPath: addTargetPath.value
      });
      return;
    }

    let newComponent: ComponentData;
    if (addTypeTab.value === 'selected' && clickedComponent.value) {
      newComponent = JSON.parse(JSON.stringify(clickedComponent.value));
      newComponent.id = generateId();

      if (newComponent.slots) {
        const updateIds = (components: ComponentData[]) => {
          components.forEach((component) => {
            component.id = generateId();
            if (component.slots) {
              Object.values(component.slots).forEach((slotData) => {
                if (Array.isArray(slotData)) {
                  updateIds(slotData);
                } else if (
                  slotData &&
                  typeof slotData === 'object' &&
                  (slotData as SlotConfig).children
                ) {
                  updateIds((slotData as SlotConfig).children || []);
                }
              });
            }
          });
        };

        Object.values(newComponent.slots).forEach((slotData) => {
          if (Array.isArray(slotData)) {
            updateIds(slotData);
          } else if (
            slotData &&
            typeof slotData === 'object' &&
            (slotData as SlotConfig).children
          ) {
            updateIds((slotData as SlotConfig).children || []);
          }
        });
      }
    } else {
      newComponent = createComponentFromType(addSelectedType.value);
    }

    const targetPath = addTargetPath.value;
    const pathParts = targetPath.split('.');

    if (pathParts[0] === 'page' && pathParts.length === 2) {
      const index = parseInt(pathParts[1]);
      if (position === 'before') {
        cmsData.page.splice(index, 0, newComponent);
        if (keepAdding.value) {
          addTargetPath.value = `page.${index + 1}`;
        }
      } else {
        cmsData.page.splice(index + 1, 0, newComponent);
      }
    } else if (pathParts.includes('slots')) {
      const slotPath = getSlotPath(targetPath);
      const slotPathParts = slotPath.split('.');

      let lastSlotIndex = -1;
      for (let i = slotPathParts.length - 1; i >= 0; i--) {
        if (slotPathParts[i] === 'slots') {
          lastSlotIndex = i;
          break;
        }
      }

      if (lastSlotIndex === -1 || lastSlotIndex >= slotPathParts.length - 1) {
        console.error('Invalid slot path:', slotPath);
        return;
      }

      const parentPath = slotPathParts.slice(0, lastSlotIndex).join('.');
      const slotName = slotPathParts[lastSlotIndex + 1];

      const slotItemIndex =
        targetPath !== slotPath ? parseInt(pathParts[pathParts.length - 1]) : -1;

      const parent = getComponentByPath(parentPath, cmsData);
      if (!parent) {
        console.error('Parent component not found:', parentPath);
        return;
      }

      if (!parent.slots) {
        parent.slots = {};
      }

      const slotData = parent.slots[slotName];
      let children: ComponentData[] = [];

      if (Array.isArray(slotData)) {
        children = slotData;
      } else if (slotData && typeof slotData === 'object' && (slotData as SlotConfig).children) {
        children = (slotData as SlotConfig).children || [];
        if (!(slotData as SlotConfig).children) {
          (slotData as SlotConfig).children = [];
        }
      } else {
        parent.slots[slotName] = [];
        children = parent.slots[slotName] as ComponentData[];
      }

      if (slotItemIndex === -1) {
        children.push(newComponent);
      } else {
        if (position === 'before') {
          children.splice(slotItemIndex, 0, newComponent);
          if (keepAdding.value) {
            const slotPath = getSlotPath(targetPath);
            if (targetPath !== slotPath) {
              const newPathParts = [...pathParts];
              newPathParts[newPathParts.length - 1] = String(slotItemIndex + 1);
              addTargetPath.value = newPathParts.join('.');
            } else {
              const slotPathParts = slotPath.split('.');
              const newPathParts = [...slotPathParts];
              newPathParts.push('0');
              addTargetPath.value = newPathParts.join('.');
            }
          }
        } else {
          children.splice(slotItemIndex + 1, 0, newComponent);
        }
      }

      if (!Array.isArray(parent.slots[slotName])) {
        (parent.slots[slotName] as SlotConfig).children = children;
      }
    }

    if (!clickedComponent.value) {
      if (addTypeTab.value === 'selected') {
        addTypeTab.value = 'all';
      }
    }

    if (!keepAdding.value) {
      cancelAdd();
    } else {
      if (position === 'before' && previewArea.value && addTargetPath.value) {
        const previousElement = previewArea.value.querySelector(
          `[data-zcode-path="${targetPath}"]`
        ) as HTMLElement;
        if (previousElement) {
          removeActiveOutline(previousElement);
        }
        nextTick(() => {
          if (previewArea.value && addTargetPath.value) {
            const currentElement = previewArea.value.querySelector(
              `[data-zcode-path="${addTargetPath.value}"]`
            ) as HTMLElement;
            if (currentElement) {
              setActiveOutline(currentElement, 'add');
            }
          }
        });
      }
    }
  }

  function cancelAdd() {
    if (addTargetPath.value && previewArea.value) {
      const element = previewArea.value.querySelector(
        `[data-zcode-path="${addTargetPath.value}"]`
      ) as HTMLElement;
      if (element) {
        removeActiveOutline(element);
      }
      const slotElement = previewArea.value.querySelector(
        `[data-zcode-slot-path="${addTargetPath.value}"]`
      ) as HTMLElement;
      if (slotElement) {
        removeActiveOutline(slotElement);
      }
    }

    addTargetPath.value = null;
    addSelectedType.value = null;
    addSelectedPart.value = null;
    clickedComponent.value = null;
    addPartCategory.value = 'common';
    addTypeTab.value = 'all';
    keepAdding.value = false;
  }

  const hasSpecialParts = computed(() => cmsData.parts.special.length > 0);

  return {
    addTargetPath,
    addSelectedType,
    addSelectedPart,
    clickedComponent,
    addPartCategory,
    addTypeTab,
    keepAdding,
    availablePartTypes,
    groupedPartsByType,
    hasSpecialParts,
    handleAddClick,
    handleCategoryTabClick,
    handleTypeTabClick,
    selectPart,
    getPartPreviewHtml,
    getClickedComponentPreviewHtml,
    confirmAddPart,
    cancelAdd
  };
}
