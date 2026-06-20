import type { ImageData } from '../../types';

export type SpecialImageScope = 'shared' | 'page';

export function isLegacySharedSpecialImage(image: ImageData): boolean {
  return image.scope === undefined || image.scope === 'shared';
}

export function isSpecialImageVisibleForPage(image: ImageData, pageId?: string): boolean {
  if (isLegacySharedSpecialImage(image)) {
    return true;
  }
  if (image.scope === 'page') {
    if (!pageId) {
      return true;
    }
    return image.pageId === pageId;
  }
  return true;
}

export function filterSpecialImagesForPage(images: ImageData[], pageId?: string): ImageData[] {
  if (!pageId) {
    return images;
  }
  return images.filter((image) => isSpecialImageVisibleForPage(image, pageId));
}

export function getSpecialImageAddDefaults(
  pageId?: string
): Pick<ImageData, 'scope' | 'pageId'> | Record<string, never> {
  if (pageId) {
    return { scope: 'page', pageId };
  }
  return { scope: 'shared' };
}
