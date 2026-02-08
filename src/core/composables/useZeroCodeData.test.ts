import { describe, it, expect } from 'vitest';
import { useZeroCodeData } from './useZeroCodeData';
import { sampleZeroCodeData } from '../../__tests__/fixtures/sample-data';

describe('useZeroCodeData', () => {
  it('should load data from props', () => {
    const props = {
      page: JSON.stringify(sampleZeroCodeData.page),
      partsCommon: JSON.stringify(sampleZeroCodeData.parts.common),
      partsIndividual: JSON.stringify(sampleZeroCodeData.parts.individual),
      partsSpecial: JSON.stringify(sampleZeroCodeData.parts.special),
      imagesCommon: JSON.stringify(sampleZeroCodeData.images.common),
      imagesIndividual: JSON.stringify(sampleZeroCodeData.images.individual),
      imagesSpecial: JSON.stringify(sampleZeroCodeData.images.special),
      backendData: JSON.stringify(sampleZeroCodeData.backendData)
    };

    const { cmsData, loadDataFromProps, getData } = useZeroCodeData(props);
    loadDataFromProps();

    expect(cmsData.page).toHaveLength(1);
    expect(cmsData.page[0].id).toBe('comp-1');
    expect(cmsData.page[0].part_id).toBe('part-1');
    expect(getData('page.0')).toBeDefined();
    expect((getData('page.0') as { id: string }).id).toBe('comp-1');
  });

  it('should return full data when getData is called without path', () => {
    const props = {
      page: JSON.stringify(sampleZeroCodeData.page)
    };

    const { loadDataFromProps, getData } = useZeroCodeData(props);
    loadDataFromProps();

    const data = getData() as { page: unknown[] };
    expect(data).toBeDefined();
    expect(data.page).toHaveLength(1);
  });

  it('should return undefined for invalid path', () => {
    const props = {
      page: JSON.stringify(sampleZeroCodeData.page)
    };

    const { loadDataFromProps, getData } = useZeroCodeData(props);
    loadDataFromProps();

    expect(getData('page.999')).toBeUndefined();
    expect(getData('invalid.path')).toBeUndefined();
  });

  it('should set data by path', () => {
    const props = {
      page: JSON.stringify(sampleZeroCodeData.page)
    };

    const { loadDataFromProps, getData, setData } = useZeroCodeData(props);
    loadDataFromProps();

    setData('page.0.title', 'Updated Title');
    expect((getData('page.0') as { title: string }).title).toBe('Updated Title');
  });

  it('should handle empty props', () => {
    const props = {};

    const { cmsData, loadDataFromProps } = useZeroCodeData(props);
    loadDataFromProps();

    expect(cmsData.page).toEqual([]);
    expect(cmsData.parts.common).toEqual([]);
    expect(cmsData.images.common).toEqual([]);
  });

  it('should handle invalid JSON gracefully', () => {
    const props = {
      page: 'invalid json'
    };

    const { cmsData, loadDataFromProps } = useZeroCodeData(props);
    loadDataFromProps();

    expect(cmsData.page).toEqual([]);
  });
});
