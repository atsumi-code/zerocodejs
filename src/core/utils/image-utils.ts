import type { ComponentData } from '../../types';
import { traverseComponents } from './path-utils';

export function findImageReferences(
  imageId: string,
  page: ComponentData[]
): Array<{ path: string; component: ComponentData; fieldName: string }> {
  const references: Array<{ path: string; component: ComponentData; fieldName: string }> = [];

  traverseComponents(page, 'page', (component, path) => {
    Object.keys(component).forEach((key) => {
      if (key.includes('image') && component[key] === imageId) {
        references.push({ path, component, fieldName: key });
      }
    });
    return undefined;
  });

  return references;
}
