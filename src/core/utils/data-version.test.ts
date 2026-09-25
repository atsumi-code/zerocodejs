import { describe, it, expect, vi, afterEach } from 'vitest';
import { migrateZeroCodeData, ZERO_CODE_DATA_VERSION } from './data-version';
import { useZeroCodeData } from '../composables/useZeroCodeData';
import { renderToHtml } from '../renderer/renderer';
import type { ZeroCodeData } from '../../types';

function sampleData(): ZeroCodeData {
  return {
    page: [{ id: 'c1', part_id: 'p1', title: 'こんにちは' }],
    css: {},
    parts: {
      common: [
        {
          id: 't1',
          type: 't',
          description: '',
          parts: [{ id: 'p1', title: '', description: '', body: '<h2>{$title:見出し}</h2>' }]
        }
      ],
      individual: [],
      special: []
    },
    images: { common: [], individual: [], special: [] }
  };
}

describe('migrateZeroCodeData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('version が無いデータは現在のバージョンとして扱い、内容は変えない', () => {
    const data = sampleData();
    const migrated = migrateZeroCodeData(data);
    expect(migrated.version).toBe(ZERO_CODE_DATA_VERSION);
    expect({ ...migrated, version: undefined }).toEqual({ ...data, version: undefined });
    expect(data.version).toBeUndefined();
  });

  it('現在のバージョンのデータはそのまま受け付ける', () => {
    const data = { ...sampleData(), version: ZERO_CODE_DATA_VERSION };
    expect(migrateZeroCodeData(data)).toEqual(data);
  });

  it('ライブラリより新しいバージョンのデータは警告を出してそのまま返す', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = { ...sampleData(), version: ZERO_CODE_DATA_VERSION + 1 };
    expect(migrateZeroCodeData(data)).toBe(data);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('一部のキーだけのデータ（setData の部分更新）も扱える', () => {
    expect(migrateZeroCodeData({ page: [] })).toEqual({
      page: [],
      version: ZERO_CODE_DATA_VERSION
    });
  });
});

describe('データ形式バージョンの受け渡し', () => {
  it('getData() の結果に version が含まれる', () => {
    const { getData } = useZeroCodeData({});
    expect((getData() as ZeroCodeData).version).toBe(ZERO_CODE_DATA_VERSION);
  });

  it('setData() に version の無いデータを渡しても現在のバージョンになる', () => {
    const { getData, setData } = useZeroCodeData({});
    setData(sampleData());
    const data = getData() as ZeroCodeData;
    expect(data.version).toBe(ZERO_CODE_DATA_VERSION);
    expect(data.page[0].title).toBe('こんにちは');
  });

  it('renderToHtml は version の有無にかかわらず同じ結果を返す', () => {
    const withoutVersion = renderToHtml(sampleData());
    const withVersion = renderToHtml({ ...sampleData(), version: ZERO_CODE_DATA_VERSION });
    expect(withoutVersion).toBe(withVersion);
    expect(withoutVersion).toContain('こんにちは');
  });
});
