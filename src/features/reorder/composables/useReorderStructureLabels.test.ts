import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useReorderStructureLabels } from './useReorderStructureLabels';
import type { ZeroCodeData } from '../../../types';

const cmsData = {
  page: [
    { id: 'a', part_id: 'hero', title: 'A' },
    { id: 'b', part_id: 'text', title: 'B' }
  ],
  css: {},
  parts: {
    common: [
      {
        id: 't1',
        type: 'hero',
        description: '',
        parts: [{ id: 'hero', title: 'ヒーロー', description: '', body: '' }]
      },
      {
        id: 't2',
        type: 'text',
        description: '',
        parts: [{ id: 'text', title: 'テキスト', description: '', body: '' }]
      }
    ],
    individual: [],
    special: []
  },
  images: { common: [], individual: [], special: [] }
} as unknown as ZeroCodeData;

describe('useReorderStructureLabels', () => {
  it('先頭パーツにも追加ボタンではなくコンポーネントへラベルを付ける', () => {
    const previewArea = ref(document.createElement('div'));
    previewArea.value.innerHTML = `
      <div class="zcode-add-between">
        <button type="button" class="zcode-add-between-btn" data-zcode-add-before data-zcode-path="page.0"></button>
      </div>
      <section data-zcode-id="a" data-zcode-path="page.0" data-zcode-part="hero"></section>
      <div class="zcode-add-between">
        <button type="button" class="zcode-add-between-btn" data-zcode-add-after data-zcode-path="page.0"></button>
      </div>
      <section data-zcode-id="b" data-zcode-path="page.1" data-zcode-part="text"></section>
    `;

    const { syncStructureLabels } = useReorderStructureLabels(
      previewArea,
      ref('manage'),
      ref('reorder'),
      ref('page'),
      ref(true),
      cmsData
    );

    syncStructureLabels();

    const firstLabel = previewArea.value.querySelector(
      '[data-zcode-structure-label-path="page.0"]'
    );
    expect(firstLabel).not.toBeNull();
    expect(firstLabel?.parentElement?.getAttribute('data-zcode-id')).toBe('a');
    expect(firstLabel?.textContent).toBe('ヒーロー (1/2)');
  });

  it('showReorderStructureLabels が false のときラベルを付けない', () => {
    const previewArea = ref(document.createElement('div'));
    previewArea.value.innerHTML = `
      <section data-zcode-id="a" data-zcode-path="page.0" data-zcode-part="hero"></section>
    `;

    const { syncStructureLabels } = useReorderStructureLabels(
      previewArea,
      ref('manage'),
      ref('reorder'),
      ref('page'),
      ref(false),
      cmsData
    );

    syncStructureLabels();

    expect(previewArea.value.querySelector('.zcode-reorder-structure-label')).toBeNull();
  });
});
