import { describe, it, expect } from 'vitest';
import {
  getComponentByPath,
  generateId,
  humanize,
  getFieldLabel,
  getParentPath,
  findPartById
} from './path-utils';
import type { ZeroCodeData, PartData, TypeData } from '../../types';
import { sampleZeroCodeData, sampleComponentData } from '../../__tests__/fixtures/sample-data';

describe('getComponentByPath', () => {
  it('should get component from simple path', () => {
    const result = getComponentByPath('page.0', sampleZeroCodeData);
    expect(result).toBeDefined();
    expect(result?.id).toBe('comp-1');
  });

  it('should return null for invalid path', () => {
    const result = getComponentByPath('page.999', sampleZeroCodeData);
    expect(result).toBeNull();
  });

  it('should return null for non-existent path', () => {
    const result = getComponentByPath('invalid.path', sampleZeroCodeData);
    expect(result).toBeNull();
  });

  it('should handle nested slots path', () => {
    const data: ZeroCodeData = {
      ...sampleZeroCodeData,
      page: [
        {
          ...sampleComponentData,
          slots: {
            content: [
              {
                id: 'child-1',
                part_id: 'part-2',
                title: '子コンポーネント'
              }
            ]
          }
        }
      ]
    };
    const result = getComponentByPath('page.0.slots.content.0', data);
    expect(result).toBeDefined();
    expect(result?.id).toBe('child-1');
  });

  it('should return null for empty path', () => {
    const result = getComponentByPath('', sampleZeroCodeData);
    expect(result).toBeNull();
  });
});

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate ID with zcode prefix', () => {
    const id = generateId();
    expect(id).toMatch(/^zcode-/);
  });

  it('should generate ID with timestamp', () => {
    const id = generateId();
    const timestamp = parseInt(id.split('-')[1]);
    expect(timestamp).toBeGreaterThan(0);
  });
});

describe('humanize', () => {
  it('should convert snake_case to space separated', () => {
    expect(humanize('field_name')).toBe('Field name');
  });

  it('should convert camelCase to space separated', () => {
    expect(humanize('fieldName')).toBe('Field Name');
  });

  it('should capitalize first letter', () => {
    expect(humanize('title')).toBe('Title');
  });

  it('should handle mixed case', () => {
    expect(humanize('fieldName_test')).toBe('Field Name test');
  });

  it('should handle already capitalized', () => {
    expect(humanize('Title')).toBe('Title');
  });
});

describe('getFieldLabel', () => {
  it('should return humanized field name', () => {
    expect(getFieldLabel('fieldName')).toBe('Field Name');
  });

  it('should handle snake_case', () => {
    expect(getFieldLabel('field_name')).toBe('Field name');
  });
});

describe('getParentPath', () => {
  it('should return null for top-level path', () => {
    expect(getParentPath('page.0')).toBeNull();
  });

  it('should return parent path for nested path', () => {
    // 最後のセグメントが数値の場合、最後の'slots'セグメントの前までが返される
    expect(getParentPath('page.0.slots.content.0')).toBe('page.0');
  });

  it('should handle slots path correctly', () => {
    expect(getParentPath('page.0.slots.rows.1')).toBe('page.0');
  });

  it('should handle nested slots path', () => {
    expect(getParentPath('page.0.slots.rows.1.slots.cells.0')).toBe('page.0.slots.rows.1');
  });

  it('should return null for empty path', () => {
    expect(getParentPath('')).toBeNull();
  });

  it('should return parent for simple nested path', () => {
    expect(getParentPath('page.0.field')).toBe('page.0');
  });
});

describe('findPartById', () => {
  const samplePart: PartData = {
    id: 'part-1',
    title: 'サンプルパーツ',
    description: '説明',
    body: '<div>ボディ</div>'
  };

  const sampleType: TypeData = {
    id: 'type-1',
    type: 'sample',
    description: 'サンプルタイプ',
    parts: [samplePart]
  };

  const parts = {
    common: [sampleType],
    individual: [],
    special: []
  };

  it('should find part in common parts', () => {
    const result = findPartById('part-1', parts);
    expect(result).toBeDefined();
    expect(result?.id).toBe('part-1');
  });

  it('should find part in individual parts', () => {
    const individualType: TypeData = {
      id: 'type-2',
      type: 'individual',
      description: '個別タイプ',
      parts: [
        {
          id: 'part-2',
          title: '個別パーツ',
          description: '説明',
          body: '<div>ボディ</div>'
        }
      ]
    };
    const partsWithIndividual = {
      common: [],
      individual: [individualType],
      special: []
    };
    const result = findPartById('part-2', partsWithIndividual);
    expect(result).toBeDefined();
    expect(result?.id).toBe('part-2');
  });

  it('should return null for non-existent part', () => {
    const result = findPartById('non-existent', parts);
    expect(result).toBeNull();
  });

  it('should prioritize common over individual when both exist', () => {
    const commonPart: PartData = {
      id: 'part-3',
      title: '共通パーツ',
      description: '説明',
      body: '<div>共通</div>'
    };
    const individualPart: PartData = {
      id: 'part-3',
      title: '個別パーツ',
      description: '説明',
      body: '<div>個別</div>'
    };
    const partsWithBoth = {
      common: [
        {
          id: 'type-1',
          type: 'common',
          description: '共通タイプ',
          parts: [commonPart]
        }
      ],
      individual: [
        {
          id: 'type-2',
          type: 'individual',
          description: '個別タイプ',
          parts: [individualPart]
        }
      ],
      special: []
    };
    const result = findPartById('part-3', partsWithBoth);
    expect(result).toBeDefined();
    expect(result?.title).toBe('共通パーツ');
  });
});
