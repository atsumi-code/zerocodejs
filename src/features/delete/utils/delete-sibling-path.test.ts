import { describe, expect, it } from 'vitest';
import type { ZeroCodeData } from '../../../types';
import {
  resolveNextSelectionPathAfterDelete,
  resolveSlotFirstChildPath
} from './delete-sibling-path';

const pageData = {
  page: [
    { id: 'a', part_id: 'hero' },
    { id: 'b', part_id: 'text' },
    { id: 'c', part_id: 'text' }
  ],
  css: {},
  parts: { common: [], individual: [], special: [] },
  images: { common: [], individual: [], special: [] }
} as unknown as ZeroCodeData;

const nestedData = {
  page: [
    {
      id: 'parent',
      part_id: 'layout',
      slots: {
        main: [
          { id: 'child-a', part_id: 'text' },
          { id: 'child-b', part_id: 'text' }
        ]
      }
    }
  ],
  css: {},
  parts: { common: [], individual: [], special: [] },
  images: { common: [], individual: [], special: [] }
} as unknown as ZeroCodeData;

describe('resolveNextSelectionPathAfterDelete', () => {
  it('ページ直下では同じ index の兄弟を返す', () => {
    expect(resolveNextSelectionPathAfterDelete('page.0', pageData)).toBe('page.0');
    expect(resolveNextSelectionPathAfterDelete('page.1', pageData)).toBe('page.1');
  });

  it('末尾削除時は 1 つ前を返す', () => {
    expect(resolveNextSelectionPathAfterDelete('page.2', pageData)).toBe('page.1');
  });

  it('最後の 1 件削除時は null', () => {
    const single = structuredClone(pageData) as ZeroCodeData;
    single.page = [{ id: 'a', part_id: 'hero' }];
    expect(resolveNextSelectionPathAfterDelete('page.0', single)).toBeNull();
  });

  it('スロット内でも同じルールで次を返す', () => {
    expect(resolveNextSelectionPathAfterDelete('page.0.slots.main.0', nestedData)).toBe(
      'page.0.slots.main.0'
    );
    expect(resolveNextSelectionPathAfterDelete('page.0.slots.main.1', nestedData)).toBe(
      'page.0.slots.main.0'
    );
  });
});

describe('resolveSlotFirstChildPath', () => {
  it('スロット先頭の path を返す', () => {
    expect(resolveSlotFirstChildPath('page.0', 'main', nestedData)).toBe('page.0.slots.main.0');
  });
});
