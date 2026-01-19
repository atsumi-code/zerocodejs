import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processTemplateWithDOM } from './template-processor';
import type { ComponentData, PartData } from '../../types';
import { sampleImageData, sampleBackendData } from '../../__tests__/fixtures/sample-data';

describe('processTemplateWithDOM', () => {
  const mockFindPart = vi.fn((_partId: string): PartData | null => null);
  const mockRenderComponentToHtml = vi.fn((_component: ComponentData, _path: string) => '');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('text field replacement', () => {
    it('should replace simple text field', () => {
      const template = '<div>{$title:デフォルトタイトル}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        title: '実際のタイトル'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('実際のタイトル');
      expect(result).not.toContain('{$title');
    });

    it('should return empty string when field is undefined (non-optional)', () => {
      const template = '<div>{$title:デフォルトタイトル}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      // 非オプショナルフィールドでundefinedの場合は空文字列になる
      expect(result).not.toContain('デフォルトタイトル');
      expect(result).toContain('<div></div>');
    });

    it('should return empty string for optional field with undefined value', () => {
      const template = '<div>{$subtitle?:サブタイトル}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      // オプショナルフィールドでundefinedの場合は空文字列になる
      expect(result).not.toContain('サブタイトル');
      expect(result).toContain('<div></div>');
    });
  });

  describe('rich text field', () => {
    it('should replace rich text field', () => {
      const template = '<div>{$content:デフォルト:rich}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        content: '<p>リッチテキスト</p>'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('リッチテキスト');
    });

    it('should wrap plain text in p tag for rich text', () => {
      const template = '<div>{$content:デフォルト:rich}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        content: 'プレーンテキスト'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('<p>プレーンテキスト</p>');
    });

    it('should handle empty rich text', () => {
      const template = '<div>{$content:デフォルト:rich}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        content: ''
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('<p></p>');
    });
  });

  describe('textarea field', () => {
    it('should replace textarea field with line breaks', () => {
      const template = '<div>{$description:説明:textarea}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        description: '行1\n行2\n行3'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('行1');
      expect(result).toContain('行2');
      expect(result).toContain('行3');
      expect(result).toContain('<br>');
    });

    it('should handle empty lines in textarea', () => {
      const template = '<div>{$description:説明:textarea}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        description: '行1\n\n行3'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      const brCount = (result.match(/<br>/g) || []).length;
      expect(brCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('image field', () => {
    it('should replace image field with URL', () => {
      const template = '<div><img src="{$imageUrl:default.jpg:image}" alt="画像"></div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        imageUrl: 'img-1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false,
        sampleImageData,
        [],
        []
      );
      expect(result).toContain('https://example.com/sample.jpg');
    });

    it('should use default image when value not found', () => {
      const template = '<div><img src="{$imageUrl:img-2:image}" alt="画像"></div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        imageUrl: 'not-found'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false,
        sampleImageData,
        [],
        []
      );
      expect(result).toContain('https://example.com/sample2.jpg');
    });
  });

  describe('z-if condition', () => {
    it('should show element when condition is true', () => {
      const template = '<div z-if="showContent">コンテンツ</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        showContent: true
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('コンテンツ');
      expect(result).not.toContain('z-if');
    });

    it('should hide element when condition is false', () => {
      const template = '<div z-if="showContent">コンテンツ</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        showContent: false
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).not.toContain('コンテンツ');
    });

    it('should show element when condition is undefined (defaults to true)', () => {
      const template = '<div z-if="showContent">コンテンツ</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      // z-ifでundefinedの場合はtrueとして扱われる（デフォルトは表示）
      expect(result).toContain('コンテンツ');
    });

    it('should hide element when condition is empty string', () => {
      const template = '<div z-if="showContent">コンテンツ</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        showContent: ''
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).not.toContain('コンテンツ');
    });
  });

  describe('z-empty condition', () => {
    it('should remove element when field is empty', () => {
      const template = '<div z-empty="$subtitle">サブタイトル: {$subtitle:デフォルト}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        subtitle: ''
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).not.toContain('サブタイトル');
      expect(result).not.toContain('z-empty');
    });

    it('should keep element when field has value', () => {
      const template = '<div z-empty="$subtitle">サブタイトル: {$subtitle:デフォルト}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        subtitle: '実際のサブタイトル'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('実際のサブタイトル');
    });

    it('should remove element when rich text is empty', () => {
      const template = '<div z-empty="$content">{$content?:デフォルト:rich}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        content: '<p></p>'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).not.toContain('z-empty');
    });
  });

  describe('z-tag attribute', () => {
    it('should change tag name based on field value', () => {
      const template = '<h2 z-tag="$headingTag:h1|h2|h3">見出し</h2>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        headingTag: 'h1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('<h1');
      expect(result).not.toContain('<h2');
      expect(result).not.toContain('z-tag');
    });

    it('should use field value when it is a valid tag even if not in options', () => {
      const template = '<h2 z-tag="$headingTag:h1|h2|h3">見出し</h2>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        headingTag: 'h4'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      // オプションにない値でも、有効なタグ名（h4はvalidTagsに含まれる）なら使用される
      expect(result).toContain('<h4');
      expect(result).not.toContain('z-tag');
    });
  });

  describe('backend data', () => {
    it('should replace backend data reference', () => {
      const template = '<div>{@user.name}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false,
        [],
        [],
        [],
        sampleBackendData
      );
      expect(result).toContain('John Doe');
    });

    it('should replace nested backend data reference', () => {
      const template = '<div>{@user.profile.city}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false,
        [],
        [],
        [],
        sampleBackendData
      );
      expect(result).toContain('Tokyo');
    });

    it('should replace array backend data reference', () => {
      const template = '<div>{@items[0].name}</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false,
        [],
        [],
        [],
        sampleBackendData
      );
      expect(result).toContain('Item 1');
    });
  });

  describe('URL placeholders', () => {
    it('should expand URL placeholders', () => {
      const template = '<a href="/shop/{shop_id}/products">商品</a>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false,
        [],
        [],
        [],
        sampleBackendData
      );
      expect(result).toContain('/shop/shop-123/products');
    });
  });

  describe('attribute replacement', () => {
    it('should replace field in attribute', () => {
      const template = '<div class="{$className:default}">コンテンツ</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        className: 'custom-class'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('class="custom-class"');
    });

    it('should replace field in href attribute', () => {
      const template = '<a href="/page/{$pageId:1}">リンク</a>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1',
        pageId: '123'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('href="/page/123"');
    });
  });

  describe('edge cases', () => {
    it('should handle empty template', () => {
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        '',
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toBe('');
    });

    it('should handle invalid HTML', () => {
      const template = '<div>未閉じタグ';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toBeDefined();
    });

    it('should handle template without fields', () => {
      const template = '<div>通常のHTML</div>';
      const component: ComponentData = {
        id: '1',
        part_id: 'part1'
      };
      const result = processTemplateWithDOM(
        template,
        component,
        'page.0',
        mockFindPart,
        mockRenderComponentToHtml,
        false
      );
      expect(result).toContain('通常のHTML');
    });
  });
});
