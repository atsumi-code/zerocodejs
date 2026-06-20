import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useDeleteMode } from './useDeleteMode';
import type { ZeroCodeData } from '../../../types';

vi.mock('../../editor/composables/useOutlineManager', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../editor/composables/useOutlineManager')>();
  return {
    ...actual,
    setActiveOutlineForPath: vi.fn(),
    removeActiveOutlineForPath: vi.fn(),
    findElementsByZcodePath: vi.fn(() => [])
  };
});

vi.mock('../../../core/utils/dom-utils', () => ({
  scrollToElement: vi.fn()
}));

const cmsData = {
  page: [
    { id: 'a', part_id: 'hero' },
    { id: 'b', part_id: 'text' },
    { id: 'c', part_id: 'text' }
  ],
  css: {},
  parts: { common: [], individual: [], special: [] },
  images: { common: [], individual: [], special: [] }
} as unknown as ZeroCodeData;

describe('useDeleteMode continueDeleteAfter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('オフのとき削除後は選択を解除する', async () => {
    const previewArea = ref(document.createElement('div'));
    const data = structuredClone(cmsData) as ZeroCodeData;
    const { deleteConfirmPath, continueDeleteAfter, handleDeleteClick, confirmDelete } =
      useDeleteMode(data, previewArea, vi.fn(), nextTick, ref(false));

    handleDeleteClick('page.1', data.page[1]);
    expect(deleteConfirmPath.value).toBe('page.1');

    confirmDelete();
    await nextTick();

    expect(deleteConfirmPath.value).toBe('');
    expect(data.page.map((component) => component.id)).toEqual(['a', 'c']);
    expect(continueDeleteAfter.value).toBe(false);
  });

  it('オンのとき削除後に次の兄弟を選ぶ', async () => {
    const previewArea = ref(document.createElement('div'));
    const data = structuredClone(cmsData) as ZeroCodeData;
    const {
      deleteConfirmPath,
      deleteConfirmComponent,
      continueDeleteAfter,
      handleDeleteClick,
      confirmDelete
    } = useDeleteMode(data, previewArea, vi.fn(), nextTick, ref(false));

    continueDeleteAfter.value = true;
    handleDeleteClick('page.0', data.page[0]);
    confirmDelete();
    await nextTick();

    expect(data.page.map((component) => component.id)).toEqual(['b', 'c']);
    expect(deleteConfirmPath.value).toBe('page.0');
    expect(deleteConfirmComponent.value?.id).toBe('b');
  });

  it('末尾削除時は 1 つ前を選ぶ', async () => {
    const previewArea = ref(document.createElement('div'));
    const data = structuredClone(cmsData) as ZeroCodeData;
    const {
      deleteConfirmPath,
      deleteConfirmComponent,
      continueDeleteAfter,
      handleDeleteClick,
      confirmDelete
    } = useDeleteMode(data, previewArea, vi.fn(), nextTick, ref(false));

    continueDeleteAfter.value = true;
    handleDeleteClick('page.2', data.page[2]);
    confirmDelete();
    await nextTick();

    expect(data.page.map((component) => component.id)).toEqual(['a', 'b']);
    expect(deleteConfirmPath.value).toBe('page.1');
    expect(deleteConfirmComponent.value?.id).toBe('b');
  });
});
