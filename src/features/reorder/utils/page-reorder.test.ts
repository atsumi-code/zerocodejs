import { describe, expect, it } from 'vitest';
import type { ZeroCodeData } from '../../../types';
import {
  buildStructureTree,
  buildStructureGroupView,
  buildStructureGroupViewByGroupId,
  canReorderSiblingPaths,
  findComponentPathById,
  getComponentDisplayLabel,
  getStructureEntryPositionLabel,
  getStructureEntryPreviewLabel,
  getStructureGroupLabelEntries,
  movePageComponentByIndex,
  moveStructureGroupByIndex,
  reorderSiblingsByPath,
  resolveStructureSortableGroupFromPath
} from './page-reorder';

const cmsData = {
  page: [
    { id: 'a', part_id: 'hero', title: 'A' },
    { id: 'b', part_id: 'text', title: 'B' },
    { id: 'c', part_id: 'text', title: 'C' }
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

const nestedCmsData = {
  ...cmsData,
  page: [
    {
      id: 'parent',
      part_id: 'hero',
      slots: {
        main: [
          { id: 'child-a', part_id: 'text' },
          { id: 'child-b', part_id: 'text' }
        ]
      }
    }
  ]
} as unknown as ZeroCodeData;

describe('page-reorder', () => {
  it('buildStructureGroupViewByGroupId は page 直下のラベル付き一覧を返す', () => {
    const view = buildStructureGroupViewByGroupId(cmsData, 'page');
    expect(view?.nodes).toHaveLength(3);
    expect(view?.nodes[0].entry).toMatchObject({ path: 'page.0', label: 'ヒーロー' });
    expect(view?.nodes[1].entry).toMatchObject({ path: 'page.1', label: 'テキスト' });
  });

  it('buildStructureTree はスロット内ノードを含む', () => {
    const tree = buildStructureTree(nestedCmsData);
    expect(tree).toHaveLength(1);
    expect(tree[0].slotGroups).toHaveLength(1);
    expect(tree[0].slotGroups[0].groupId).toBe('page.0.slots.main');
    expect(tree[0].slotGroups[0].nodes.map((n) => n.entry.componentId)).toEqual([
      'child-a',
      'child-b'
    ]);
  });

  it('getComponentDisplayLabel は part_id をフォールバックにする', () => {
    expect(getComponentDisplayLabel({ id: 'x', part_id: 'unknown' } as never, cmsData.parts)).toBe(
      'unknown'
    );
  });

  it('movePageComponentByIndex は要素を移動する', () => {
    const result = movePageComponentByIndex(cmsData.page, 0, 2);
    expect(result?.map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });

  it('findComponentPathById は並べ替え後の path を返す', () => {
    const data = structuredClone(cmsData);
    moveStructureGroupByIndex(data, 'page', 0, 2);
    expect(findComponentPathById(data, 'a')).toBe('page.2');
  });

  it('moveStructureGroupByIndex はスロット内の順序を変更する', () => {
    const data = structuredClone(nestedCmsData);
    const result = moveStructureGroupByIndex(data, 'page.0.slots.main', 0, 1);
    expect(result?.movedComponentId).toBe('child-a');
    const children = (data.page[0].slots!.main as { id: string }[]).map((c) => c.id);
    expect(children).toEqual(['child-b', 'child-a']);
    expect(findComponentPathById(data, 'child-a')).toBe('page.0.slots.main.1');
  });

  it('reorderSiblingsByPath はクリック式と D&D で同じ insert 移動を行う', () => {
    const data = structuredClone(cmsData);
    const result = reorderSiblingsByPath(data, 'page.0', 'page.2');
    expect(result?.movedComponentId).toBe('a');
    expect(data.page.map((component) => component.id)).toEqual(['b', 'c', 'a']);
  });

  it('canReorderSiblingPaths は同じ sortable group 内のみ true', () => {
    expect(canReorderSiblingPaths('page.0', 'page.2')).toBe(true);
    expect(canReorderSiblingPaths('page.0', 'page.0.slots.main.0')).toBe(false);
    expect(canReorderSiblingPaths('page.0', 'page.0')).toBe(false);
  });

  it('getStructureEntryPositionLabel は siblings が2件以上のとき順番を返す', () => {
    const view = buildStructureGroupViewByGroupId(cmsData, 'page')!;
    expect(getStructureEntryPositionLabel(view.nodes[0].entry)).toBe('1/3');
    expect(getStructureEntryPositionLabel(view.nodes[2].entry)).toBe('3/3');
    expect(getStructureEntryPreviewLabel(view.nodes[1].entry)).toBe('テキスト (2/3)');
  });

  it('getStructureEntryPositionLabel は siblings が1件のとき null', () => {
    const view = buildStructureGroupViewByGroupId(nestedCmsData, 'page.0.slots.main')!;
    expect(view.nodes).toHaveLength(2);
    expect(getStructureEntryPositionLabel(view.nodes[0].entry)).toBe('1/2');
  });

  it('getStructureGroupLabelEntries は position 付き entry を返す', () => {
    const pageEntries = getStructureGroupLabelEntries(cmsData, 'page');
    expect(pageEntries.map((entry) => entry.path)).toEqual(['page.0', 'page.1', 'page.2']);
    expect(pageEntries[0]?.label).toBe('ヒーロー');
    expect(pageEntries[0]?.positionIndex).toBe(1);
    expect(pageEntries[0]?.positionTotal).toBe(3);

    expect(getStructureGroupLabelEntries(cmsData, null)).toEqual([]);
    expect(getStructureGroupLabelEntries(cmsData, 'missing')).toEqual([]);
  });

  it('buildStructureGroupView は移動元と同じ階層の siblings のみ返す', () => {
    const pageView = buildStructureGroupView(cmsData, 'page.1');
    expect(pageView?.groupId).toBe('page');
    expect(pageView?.nodes.map((node) => node.entry.componentId)).toEqual(['a', 'b', 'c']);

    const slotView = buildStructureGroupView(nestedCmsData, 'page.0.slots.main.0');
    expect(slotView?.groupId).toBe('page.0.slots.main');
    expect(slotView?.slotName).toBe('main');
    expect(slotView?.nodes.map((node) => node.entry.componentId)).toEqual(['child-a', 'child-b']);
    expect(slotView?.nodes.every((node) => node.slotGroups.length === 0)).toBe(true);
  });

  it('resolveStructureSortableGroupFromPath は page / スロット内 path を解決する', () => {
    expect(resolveStructureSortableGroupFromPath('page.0')).toEqual({
      groupId: 'page',
      slotName: null
    });
    expect(resolveStructureSortableGroupFromPath('page.0.slots.main.1')).toEqual({
      groupId: 'page.0.slots.main',
      slotName: 'main'
    });
    expect(resolveStructureSortableGroupFromPath('page.0.slots.main')).toBeNull();
  });
});
