import { describe, it, expect } from 'vitest';
import {
  injectAttributesToRootElement,
  processImageField,
  resolveBackendDataPath,
  expandUrlPlaceholders
} from './template-utils';
import { sampleImageData, sampleBackendData } from '../../__tests__/fixtures/sample-data';

describe('injectAttributesToRootElement', () => {
  it('should inject single attribute', () => {
    const html = '<div>コンテンツ</div>';
    const result = injectAttributesToRootElement(html, { class: 'test-class' });
    expect(result).toContain('class="test-class"');
  });

  it('should inject multiple attributes', () => {
    const html = '<div>コンテンツ</div>';
    const result = injectAttributesToRootElement(html, {
      class: 'test-class',
      id: 'test-id',
      'data-test': 'value'
    });
    expect(result).toContain('class="test-class"');
    expect(result).toContain('id="test-id"');
    expect(result).toContain('data-test="value"');
  });

  it('should preserve existing attributes', () => {
    const html = '<div class="existing">コンテンツ</div>';
    const result = injectAttributesToRootElement(html, { id: 'test-id' });
    expect(result).toContain('class="existing"');
    expect(result).toContain('id="test-id"');
  });

  it('should override existing attributes', () => {
    const html = '<div class="old">コンテンツ</div>';
    const result = injectAttributesToRootElement(html, { class: 'new' });
    expect(result).toContain('class="new"');
    expect(result).not.toContain('class="old"');
  });

  it('should handle empty HTML', () => {
    const html = '';
    const result = injectAttributesToRootElement(html, { class: 'test' });
    expect(result).toBe(html);
  });

  it('should handle invalid HTML', () => {
    const html = '<invalid>';
    const result = injectAttributesToRootElement(html, { class: 'test' });
    // happy-domは無効なHTMLでもパースを試みるため、結果が変わる可能性がある
    expect(result).toBeDefined();
  });
});

describe('processImageField', () => {
  it('should return image URL when value exists', () => {
    const result = processImageField('img-1', 'img-2', sampleImageData, []);
    expect(result).toBe('https://example.com/sample.jpg');
  });

  it('should return default image URL when value is empty', () => {
    const result = processImageField('', 'img-2', sampleImageData, []);
    expect(result).toBe('https://example.com/sample2.jpg');
  });

  it('should return default image URL when value not found', () => {
    const result = processImageField('not-found', 'img-2', sampleImageData, []);
    expect(result).toBe('https://example.com/sample2.jpg');
  });

  it('should return empty string when both value and default not found', () => {
    const result = processImageField('not-found', 'also-not-found', sampleImageData, []);
    expect(result).toBe('');
  });

  it('should search in individual images', () => {
    const individualImages = [
      { id: 'img-3', url: 'https://example.com/individual.jpg' }
    ];
    const result = processImageField('img-3', '', sampleImageData, individualImages);
    expect(result).toBe('https://example.com/individual.jpg');
  });

  it('should prioritize common images over individual', () => {
    const commonImages = [{ id: 'img-1', url: 'https://example.com/common.jpg' }];
    const individualImages = [{ id: 'img-1', url: 'https://example.com/individual.jpg' }];
    const result = processImageField('img-1', '', commonImages, individualImages);
    expect(result).toBe('https://example.com/common.jpg');
  });

  it('should handle empty arrays', () => {
    const result = processImageField('img-1', 'img-2', [], []);
    expect(result).toBe('');
  });
});

describe('resolveBackendDataPath', () => {
  it('should resolve simple path', () => {
    const result = resolveBackendDataPath(sampleBackendData, 'user.name');
    expect(result).toBe('John Doe');
  });

  it('should resolve nested path', () => {
    const result = resolveBackendDataPath(sampleBackendData, 'user.profile.city');
    expect(result).toBe('Tokyo');
  });

  it('should resolve array index', () => {
    const result = resolveBackendDataPath(sampleBackendData, 'items[0].name');
    expect(result).toBe('Item 1');
  });

  it('should resolve nested array access', () => {
    const result = resolveBackendDataPath(sampleBackendData, 'items[1].price');
    expect(result).toBe('200');
  });

  it('should return empty string for invalid path', () => {
    const result = resolveBackendDataPath(sampleBackendData, 'invalid.path');
    expect(result).toBe('');
  });

  it('should return empty string for out of bounds array index', () => {
    const result = resolveBackendDataPath(sampleBackendData, 'items[10]');
    expect(result).toBe('');
  });

  it('should return empty string for null value', () => {
    const data = { user: null };
    const result = resolveBackendDataPath(data, 'user.name');
    expect(result).toBe('');
  });

  it('should return empty string for undefined value', () => {
    const data = { user: undefined };
    const result = resolveBackendDataPath(data, 'user.name');
    expect(result).toBe('');
  });

  it('should handle empty backendData', () => {
    const result = resolveBackendDataPath({}, 'user.name');
    expect(result).toBe('');
  });

  it('should handle null backendData', () => {
    const result = resolveBackendDataPath(null as any, 'user.name');
    expect(result).toBe('');
  });

  it('should handle empty path', () => {
    const result = resolveBackendDataPath(sampleBackendData, '');
    expect(result).toBe('');
  });

  it('should convert number to string', () => {
    const result = resolveBackendDataPath(sampleBackendData, 'items[0].id');
    expect(result).toBe('1');
  });

  it('should handle complex nested path', () => {
    const data = {
      level1: {
        level2: {
          level3: {
            value: 'deep'
          }
        }
      }
    };
    const result = resolveBackendDataPath(data, 'level1.level2.level3.value');
    expect(result).toBe('deep');
  });
});

describe('expandUrlPlaceholders', () => {
  it('should expand single placeholder', () => {
    const url = '/shop/{shop_id}/products';
    const result = expandUrlPlaceholders(url, sampleBackendData);
    expect(result).toBe('/shop/shop-123/products');
  });

  it('should expand multiple placeholders', () => {
    const url = '/user/{user_id}/shop/{shop_id}';
    const data = { user_id: 'user-1', shop_id: 'shop-123' };
    const result = expandUrlPlaceholders(url, data);
    expect(result).toBe('/user/user-1/shop/shop-123');
  });

  it('should leave placeholder when value not found', () => {
    const url = '/shop/{not_found}/products';
    const result = expandUrlPlaceholders(url, sampleBackendData);
    expect(result).toBe('/shop/{not_found}/products');
  });

  it('should leave placeholder when value is null', () => {
    const url = '/shop/{null_value}/products';
    const data = { null_value: null };
    const result = expandUrlPlaceholders(url, data);
    expect(result).toBe('/shop/{null_value}/products');
  });

  it('should leave placeholder when value is undefined', () => {
    const url = '/shop/{undefined_value}/products';
    const data = { undefined_value: undefined };
    const result = expandUrlPlaceholders(url, data);
    expect(result).toBe('/shop/{undefined_value}/products');
  });

  it('should convert number to string', () => {
    const url = '/item/{item_id}';
    const data = { item_id: 123 };
    const result = expandUrlPlaceholders(url, data);
    expect(result).toBe('/item/123');
  });

  it('should handle empty URL', () => {
    const result = expandUrlPlaceholders('', sampleBackendData);
    expect(result).toBe('');
  });

  it('should handle URL without placeholders', () => {
    const url = '/shop/products';
    const result = expandUrlPlaceholders(url, sampleBackendData);
    expect(result).toBe('/shop/products');
  });

  it('should handle empty backendData', () => {
    const url = '/shop/{shop_id}/products';
    const result = expandUrlPlaceholders(url, {});
    expect(result).toBe('/shop/{shop_id}/products');
  });

  it('should handle null backendData', () => {
    const url = '/shop/{shop_id}/products';
    const result = expandUrlPlaceholders(url, null as any);
    expect(result).toBe('/shop/{shop_id}/products');
  });
});
