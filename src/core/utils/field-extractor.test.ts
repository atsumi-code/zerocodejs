import { describe, it, expect } from 'vitest';
import {
  extractFieldsFromTemplate,
  splitDefaultAndValidation,
  parseValidationFromTokens
} from './field-extractor';
import { sampleTemplates } from '../../__tests__/fixtures/sample-templates';

describe('parseValidationFromTokens', () => {
  it('should parse required token', () => {
    const result = parseValidationFromTokens(['required']);
    expect(result.required).toBe(true);
  });

  it('should parse readonly token', () => {
    const result = parseValidationFromTokens(['readonly']);
    expect(result.readonly).toBe(true);
  });

  it('should parse disabled token', () => {
    const result = parseValidationFromTokens(['disabled']);
    expect(result.disabled).toBe(true);
  });

  it('should parse maxLength token', () => {
    const result = parseValidationFromTokens(['max=100']);
    expect(result.maxLength).toBe(100);
  });

  it('should parse multiple tokens', () => {
    const result = parseValidationFromTokens(['required', 'max=50', 'readonly']);
    expect(result.required).toBe(true);
    expect(result.maxLength).toBe(50);
    expect(result.readonly).toBe(true);
  });

  it('should ignore invalid max token', () => {
    const result = parseValidationFromTokens(['max=invalid']);
    expect(result.maxLength).toBeUndefined();
  });
});

describe('splitDefaultAndValidation', () => {
  it('should split default value and validation', () => {
    const result = splitDefaultAndValidation('デフォルト値:required:max=100');
    expect(result.defaultValue).toBe('デフォルト値');
    expect(result.validation.required).toBe(true);
    expect(result.validation.maxLength).toBe(100);
  });

  it('should handle default value with colons', () => {
    const result = splitDefaultAndValidation('値1:値2:値3:required');
    expect(result.defaultValue).toBe('値1:値2:値3');
    expect(result.validation.required).toBe(true);
  });

  it('should handle no validation tokens', () => {
    const result = splitDefaultAndValidation('デフォルト値');
    expect(result.defaultValue).toBe('デフォルト値');
    expect(result.validation.required).toBeUndefined();
  });

  it('should handle multiple validation tokens', () => {
    const result = splitDefaultAndValidation('デフォルト:required:readonly:disabled:max=200');
    expect(result.defaultValue).toBe('デフォルト');
    expect(result.validation.required).toBe(true);
    expect(result.validation.readonly).toBe(true);
    expect(result.validation.disabled).toBe(true);
    expect(result.validation.maxLength).toBe(200);
  });
});

describe('extractFieldsFromTemplate', () => {
  describe('text fields', () => {
    it('should extract simple text field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.simpleText);
      expect(fields).toHaveLength(1);
      expect(fields[0]).toMatchObject({
        fieldName: 'title',
        type: 'text',
        defaultValue: 'デフォルトタイトル'
      });
    });

    it('should extract optional text field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.optionalField);
      expect(fields).toHaveLength(1);
      expect(fields[0].optional).toBe(true);
      expect(fields[0].fieldName).toBe('subtitle');
    });

    it('should extract text field with validation', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.withValidation);
      expect(fields[0].required).toBe(true);
      expect(fields[0].maxLength).toBe(100);
    });

    it('should extract grouped text field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.groupedField);
      expect(fields[0].groupName).toBe('header');
      expect(fields[0].fieldName).toBe('title');
    });
  });

  describe('rich text fields', () => {
    it('should extract rich text field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.richText);
      expect(fields[0].type).toBe('rich');
      expect(fields[0].fieldName).toBe('content');
    });

    it('should extract optional rich text field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.optionalRichText);
      expect(fields[0].type).toBe('rich');
      expect(fields[0].optional).toBe(true);
    });
  });

  describe('textarea fields', () => {
    it('should extract textarea field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.textarea);
      expect(fields[0].type).toBe('textarea');
      expect(fields[0].fieldName).toBe('description');
    });
  });

  describe('image fields', () => {
    it('should extract image field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.image);
      expect(fields[0].type).toBe('image');
      expect(fields[0].fieldName).toBe('imageUrl');
    });
  });

  describe('selection fields', () => {
    it('should extract radio field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.radio);
      expect(fields[0].type).toBe('radio');
      expect(fields[0].options).toEqual(['option1', 'option2', 'option3']);
    });

    it('should extract checkbox field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.checkbox);
      expect(fields[0].type).toBe('checkbox');
      expect(fields[0].options).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should extract select field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.select);
      expect(fields[0].type).toBe('select');
      expect(fields[0].options).toEqual(['option1', 'option2', 'option3']);
    });

    it('should extract select-multiple field', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.selectMultiple);
      expect(fields[0].type).toBe('select-multiple');
      expect(fields[0].options).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });

  describe('z-if attribute', () => {
    it('should extract z-if field as boolean', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.zIf);
      expect(fields).toContainEqual(
        expect.objectContaining({
          fieldName: 'showContent',
          type: 'boolean',
          defaultValue: 'true'
        })
      );
    });
  });

  describe('z-tag attribute', () => {
    it('should extract z-tag field with options', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.zTag);
      const tagField = fields.find((f) => f.fieldName === 'headingTag');
      expect(tagField).toBeDefined();
      expect(tagField?.type).toBe('tag');
      expect(tagField?.options).toEqual(['h1', 'h2', 'h3']);
      expect(tagField?.defaultValue).toBe('h2');
    });

    it('should use current tag name as default value', () => {
      const template = '<div z-tag="$containerTag:div|section|article">コンテンツ</div>';
      const fields = extractFieldsFromTemplate(template);
      const tagField = fields.find((f) => f.fieldName === 'containerTag');
      expect(tagField?.defaultValue).toBe('div');
    });
  });

  describe('fields in attributes', () => {
    it('should extract fields from href attribute', () => {
      const template = '<a href="/shop/{$shopId:default}/products">リンク</a>';
      const fields = extractFieldsFromTemplate(template);
      expect(fields).toContainEqual(
        expect.objectContaining({
          fieldName: 'shopId',
          type: 'text'
        })
      );
    });

    it('should extract fields from class attribute', () => {
      const template = '<div class="{$className:default}">コンテンツ</div>';
      const fields = extractFieldsFromTemplate(template);
      expect(fields).toContainEqual(
        expect.objectContaining({
          fieldName: 'className',
          type: 'text'
        })
      );
    });
  });

  describe('duplicate fields', () => {
    it('should not extract duplicate fields', () => {
      const template = '<div>{$title:タイトル}</div><div>{$title:タイトル2}</div>';
      const fields = extractFieldsFromTemplate(template);
      const titleFields = fields.filter((f) => f.fieldName === 'title');
      expect(titleFields).toHaveLength(1);
    });
  });

  describe('complex template', () => {
    it('should extract all fields from complex template', () => {
      const fields = extractFieldsFromTemplate(sampleTemplates.complex);
      const fieldNames = fields.map((f) => f.fieldName);
      expect(fieldNames).toContain('headingTag');
      expect(fieldNames).toContain('showTitle');
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('subtitle');
      expect(fieldNames).toContain('content');
    });
  });

  describe('edge cases', () => {
    it('should handle empty template', () => {
      const fields = extractFieldsFromTemplate('');
      expect(fields).toHaveLength(0);
    });

    it('should handle template without fields', () => {
      const template = '<div>通常のHTML</div>';
      const fields = extractFieldsFromTemplate(template);
      expect(fields).toHaveLength(0);
    });

    it('should handle invalid template', () => {
      const template = '<div>{$invalid</div>';
      const fields = extractFieldsFromTemplate(template);
      expect(fields).toHaveLength(0);
    });
  });
});
