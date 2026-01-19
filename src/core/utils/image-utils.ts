import type { ComponentData } from '../../types';

export function findImageReferences(
  imageId: string,
  page: ComponentData[]
): Array<{ path: string; component: ComponentData; fieldName: string }> {
  const references: Array<{ path: string; component: ComponentData; fieldName: string }> = [];

  const checkComponent = (component: ComponentData, path: string) => {
    // 画像フィールドをチェック（image_url, image_alt, author_image など）
    Object.keys(component).forEach((key) => {
      if (key.includes('image') && component[key] === imageId) {
        references.push({ path, component, fieldName: key });
      }
    });

    // スロット内も再帰的にチェック
    if (component.slots) {
      Object.entries(component.slots).forEach(([slotName, slotData]) => {
        if (Array.isArray(slotData)) {
          slotData.forEach((child, index) => {
            checkComponent(child, `${path}.slots.${slotName}.${index}`);
          });
        }
      });
    }
  };

  page.forEach((component, index) => {
    checkComponent(component, `page.${index}`);
  });

  return references;
}
