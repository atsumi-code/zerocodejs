import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useReorderMode } from './useReorderMode';
import type { ZeroCodeData } from '../../../types';

const { setActiveOutlineForPath, removeActiveOutlineForPath } = vi.hoisted(() => ({
  setActiveOutlineForPath: vi.fn(),
  removeActiveOutlineForPath: vi.fn()
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../editor/composables/useOutlineManager', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../editor/composables/useOutlineManager')>();
  return {
    ...actual,
    setActiveOutlineForPath,
    removeActiveOutlineForPath,
    removeHoverOutlineForPath: vi.fn(),
    setHoverOutline: vi.fn()
  };
});

vi.mock('../../../core/utils/dom-utils', () => ({
  scrollToElement: vi.fn()
}));

const cmsData = {
  page: [
    { id: 'a', part_id: 'hero' },
    { id: 'b', part_id: 'text' }
  ],
  css: {},
  parts: { common: [], individual: [], special: [] },
  images: { common: [], individual: [], special: [] }
} as unknown as ZeroCodeData;

describe('useReorderMode structure locate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scrollPreviewFromStructureList は先頭パーツのコンポーネント要素へスクロールする', async () => {
    const { scrollToElement } = await import('../../../core/utils/dom-utils');
    const previewArea = ref(document.createElement('div'));
    previewArea.value.innerHTML = `
      <div class="zcode-add-between">
        <button type="button" class="zcode-add-between-btn" data-zcode-add-before data-zcode-path="page.0"></button>
      </div>
      <section data-zcode-id="a" data-zcode-path="page.0" data-zcode-part="hero"></section>
    `;
    const component = previewArea.value.querySelector('[data-zcode-id="a"]') as HTMLElement;
    const { handleStructureListLocate } = useReorderMode(cmsData, previewArea, ref(false));

    handleStructureListLocate('page.0');
    expect(scrollToElement).toHaveBeenCalledWith(component);
  });

  it('handleStructureListLocate は未選択時に行クリックで移動元を選択してプレビューをスクロールする', async () => {
    const { scrollToElement } = await import('../../../core/utils/dom-utils');
    const previewArea = ref(document.createElement('div'));
    previewArea.value.innerHTML =
      '<section data-zcode-id="b" data-zcode-path="page.1" data-zcode-part="text"></section>';
    const { reorderSourcePath, handleStructureListLocate } = useReorderMode(
      cmsData,
      previewArea,
      ref(false)
    );

    handleStructureListLocate('page.1');
    expect(reorderSourcePath.value).toBe('page.1');
    expect(setActiveOutlineForPath).toHaveBeenCalledWith(previewArea.value, 'page.1', 'reorder');
    expect(scrollToElement).toHaveBeenCalled();
  });

  it('handleStructureListLocate は別行選択中はスクロールのみで移動元は変わらない', async () => {
    const { scrollToElement } = await import('../../../core/utils/dom-utils');
    const previewArea = ref(document.createElement('div'));
    previewArea.value.innerHTML = `
      <section data-zcode-id="a" data-zcode-path="page.0" data-zcode-part="hero"></section>
      <section data-zcode-id="b" data-zcode-path="page.1" data-zcode-part="text"></section>
    `;
    const { reorderSourcePath, handleReorderClick, handleStructureListLocate } = useReorderMode(
      cmsData,
      previewArea,
      ref(false)
    );

    handleReorderClick('page.0');
    vi.clearAllMocks();

    handleStructureListLocate('page.1');
    expect(reorderSourcePath.value).toBe('page.0');
    expect(scrollToElement).toHaveBeenCalled();
    expect(setActiveOutlineForPath).not.toHaveBeenCalled();
  });

  it('handleStructureListLocate はページ選択中の同じ行クリックで選択を解除する', () => {
    const previewArea = ref(document.createElement('div'));
    const {
      reorderSourcePath,
      structureListGroupId,
      handleReorderClick,
      handleStructureListLocate
    } = useReorderMode(cmsData, previewArea, ref(false));

    handleReorderClick('page.0');
    expect(reorderSourcePath.value).toBe('page.0');
    expect(structureListGroupId.value).toBe('page');

    handleStructureListLocate('page.0');
    expect(reorderSourcePath.value).toBe('');
    expect(structureListGroupId.value).toBe('page');
    expect(removeActiveOutlineForPath).toHaveBeenCalled();
  });

  it('applyReorderHandoff はグループ表示と移動元選択を設定する', () => {
    const previewArea = ref(document.createElement('div'));
    const { reorderSourcePath, structureListGroupId, applyReorderHandoff } = useReorderMode(
      cmsData,
      previewArea,
      ref(false)
    );

    applyReorderHandoff('page.0');
    expect(reorderSourcePath.value).toBe('page.0');
    expect(structureListGroupId.value).toBe('page');
    expect(setActiveOutlineForPath).toHaveBeenCalledWith(previewArea.value, 'page.0', 'reorder');
  });

  it('reorderStructureByDragIndices 成功後はページ選択状態を解除する', async () => {
    const previewArea = ref(document.createElement('div'));
    const { reorderSourcePath, handleReorderClick, reorderStructureByDragIndices } = useReorderMode(
      cmsData,
      previewArea,
      ref(false)
    );

    handleReorderClick('page.0');
    expect(reorderSourcePath.value).toBe('page.0');

    const success = reorderStructureByDragIndices('page', 0, 1);
    expect(success).toBe(true);
    expect(reorderSourcePath.value).toBe('');
    expect(removeActiveOutlineForPath).toHaveBeenCalled();
  });
});
