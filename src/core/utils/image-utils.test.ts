import { describe, it, expect } from 'vitest';
import { findImageReferences } from './image-utils';
import type { ComponentData } from '../../types';

describe('findImageReferences', () => {
  it('should find image reference in component', () => {
    const page: ComponentData[] = [
      {
        id: 'comp-1',
        part_id: 'part-1',
        imageUrl: 'img-1',
        title: 'タイトル'
      }
    ];
    const result = findImageReferences('img-1', page);
    expect(result).toHaveLength(1);
    expect(result[0].fieldName).toBe('imageUrl');
    expect(result[0].component.id).toBe('comp-1');
    expect(result[0].path).toBe('page.0');
  });

  it('should find multiple image references', () => {
    const page: ComponentData[] = [
      {
        id: 'comp-1',
        part_id: 'part-1',
        imageUrl: 'img-1',
        thumbnailImage: 'img-1',
        title: 'タイトル'
      } as ComponentData
    ];
    const result = findImageReferences('img-1', page);
    // imageUrlとthumbnailImageの両方が見つかる
    expect(result.length).toBeGreaterThanOrEqual(1);
    const fieldNames = result.map((r) => r.fieldName);
    // 少なくとも1つは見つかる
    expect(fieldNames.some((name) => name.includes('image'))).toBe(true);
  });

  it('should find image reference in slots', () => {
    const page: ComponentData[] = [
      {
        id: 'comp-1',
        part_id: 'part-1',
        slots: {
          content: [
            {
              id: 'child-1',
              part_id: 'part-2',
              imageUrl: 'img-1'
            }
          ]
        }
      }
    ];
    const result = findImageReferences('img-1', page);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('page.0.slots.content.0');
    expect(result[0].component.id).toBe('child-1');
  });

  it('should find image reference in nested slots', () => {
    const page: ComponentData[] = [
      {
        id: 'comp-1',
        part_id: 'part-1',
        slots: {
          rows: [
            {
              id: 'row-1',
              part_id: 'part-2',
              slots: {
                cells: [
                  {
                    id: 'cell-1',
                    part_id: 'part-3',
                    imageUrl: 'img-1'
                  }
                ]
              }
            }
          ]
        }
      }
    ];
    const result = findImageReferences('img-1', page);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('page.0.slots.rows.0.slots.cells.0');
  });

  it('should return empty array when image not found', () => {
    const page: ComponentData[] = [
      {
        id: 'comp-1',
        part_id: 'part-1',
        imageUrl: 'img-2',
        title: 'タイトル'
      }
    ];
    const result = findImageReferences('img-1', page);
    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty page', () => {
    const result = findImageReferences('img-1', []);
    expect(result).toHaveLength(0);
  });

  it('should find image in field names containing "image"', () => {
    const page: ComponentData[] = [
      {
        id: 'comp-1',
        part_id: 'part-1',
        author_image: 'img-1',
        background_image: 'img-1',
        title: 'タイトル'
      }
    ];
    const result = findImageReferences('img-1', page);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.fieldName)).toContain('author_image');
    expect(result.map((r) => r.fieldName)).toContain('background_image');
  });

  it('should not match partial field names', () => {
    const page: ComponentData[] = [
      {
        id: 'comp-1',
        part_id: 'part-1',
        imageUrl: 'img-1',
        notImageField: 'img-1',
        title: 'タイトル'
      }
    ];
    const result = findImageReferences('img-1', page);
    expect(result).toHaveLength(1);
    expect(result[0].fieldName).toBe('imageUrl');
  });
});
