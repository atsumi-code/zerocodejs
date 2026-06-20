import { describe, expect, it } from 'vitest';
import type { ZeroCodeData } from '../../../types';
import {
  canHandoffPathToAddMode,
  getSelectedPathForMode,
  resolveComponentPathForMode
} from './mode-selection-handoff';

const cmsData = {
  page: [
    {
      id: 'c0',
      part_id: 'hero',
      title: 'Hero',
      slots: {
        main: [{ id: 'c1', part_id: 'text', body: 'Child' }]
      }
    },
    { id: 'c2', part_id: 'text', body: 'Second' }
  ],
  css: {},
  parts: { common: [], individual: [], special: [] },
  images: { common: [], individual: [], special: [] }
} as unknown as ZeroCodeData;

describe('mode-selection-handoff', () => {
  it('getSelectedPathForMode はモードごとの path を返す', () => {
    const paths = {
      edit: 'page.0',
      add: 'page.1',
      reorder: 'page.0.slots.main.0',
      delete: 'page.1'
    };

    expect(getSelectedPathForMode('edit', paths)).toBe('page.0');
    expect(getSelectedPathForMode('add', paths)).toBe('page.1');
    expect(getSelectedPathForMode('reorder', paths)).toBe('page.0.slots.main.0');
    expect(getSelectedPathForMode('delete', paths)).toBe('page.1');
  });

  it('resolveComponentPathForMode はスロット path から親コンポーネント path を解決する', () => {
    expect(resolveComponentPathForMode('page.0.slots.main.0', cmsData)).toBe('page.0.slots.main.0');
    expect(resolveComponentPathForMode('page.0.slots.main', cmsData)).toBe('page.0');
  });

  it('canHandoffPathToAddMode は page 直下とスロット path を許可する', () => {
    expect(canHandoffPathToAddMode('page.0', cmsData)).toBe(true);
    expect(canHandoffPathToAddMode('page.0.slots.main', cmsData)).toBe(true);
    expect(canHandoffPathToAddMode('page.0.slots.main.0', cmsData)).toBe(true);
  });
});
