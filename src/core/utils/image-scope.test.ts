import { describe, it, expect } from 'vitest';
import {
  filterSpecialImagesForPage,
  getSpecialImageAddDefaults,
  isLegacySharedSpecialImage,
  isSpecialImageVisibleForPage
} from './image-scope';
import type { ImageData } from '../../types';

const sharedImage: ImageData = { id: 'img-1', name: 'Shared', url: '/a.png', scope: 'shared' };
const legacyImage: ImageData = { id: 'img-2', name: 'Legacy', url: '/b.png' };
const pageImageA: ImageData = {
  id: 'img-3',
  name: 'Page A',
  url: '/c.png',
  scope: 'page',
  pageId: 'post-a'
};
const pageImageB: ImageData = {
  id: 'img-4',
  name: 'Page B',
  url: '/d.png',
  scope: 'page',
  pageId: 'post-b'
};

describe('image-scope', () => {
  it('treats missing scope as shared', () => {
    expect(isLegacySharedSpecialImage(legacyImage)).toBe(true);
    expect(isSpecialImageVisibleForPage(legacyImage, 'post-a')).toBe(true);
  });

  it('filters page-scoped images by pageId', () => {
    const images = [sharedImage, legacyImage, pageImageA, pageImageB];
    const filtered = filterSpecialImagesForPage(images, 'post-a');

    expect(filtered.map((img) => img.id)).toEqual(['img-1', 'img-2', 'img-3']);
  });

  it('returns all special images when pageId is omitted', () => {
    const images = [sharedImage, pageImageA, pageImageB];
    expect(filterSpecialImagesForPage(images)).toHaveLength(3);
  });

  it('sets page scope defaults when pageId is provided', () => {
    expect(getSpecialImageAddDefaults('post-a')).toEqual({
      scope: 'page',
      pageId: 'post-a'
    });
  });

  it('sets shared scope when pageId is omitted', () => {
    expect(getSpecialImageAddDefaults()).toEqual({ scope: 'shared' });
  });
});
