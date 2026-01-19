import { reactive } from 'vue';
import type { ZeroCodeData, ZeroCodeDataProps } from '../../types';
import { initializeAllComponentFields } from '../utils/component-initializer';

export function useZeroCodeData(props: ZeroCodeDataProps) {
  const cmsData = reactive<ZeroCodeData>({
    page: [],
    css: { common: undefined, individual: undefined, special: undefined },
    parts: { common: [], individual: [], special: [] },
    images: { common: [], individual: [], special: [] },
    backendData: undefined
  });

  function loadDataFromProps() {
    try {
      const pageData = props.page ? JSON.parse(props.page) : [];
      const typesCommon = props.partsCommon ? JSON.parse(props.partsCommon) : [];
      const typesIndividual = props.partsIndividual ? JSON.parse(props.partsIndividual) : [];
      const typesSpecial = props.partsSpecial ? JSON.parse(props.partsSpecial) : [];
      const imagesCommon = props.imagesCommon ? JSON.parse(props.imagesCommon) : [];
      const imagesIndividual = props.imagesIndividual ? JSON.parse(props.imagesIndividual) : [];
      const imagesSpecial = props.imagesSpecial ? JSON.parse(props.imagesSpecial) : [];
      // CSSは文字列なので、JSON.parseは不要
      const cssCommon = props.cssCommon !== undefined ? props.cssCommon : undefined;
      const cssIndividual = props.cssIndividual !== undefined ? props.cssIndividual : undefined;
      const cssSpecial = props.cssSpecial !== undefined ? props.cssSpecial : undefined;
      // backendDataのパース
      const backendData = props.backendData ? JSON.parse(props.backendData) : undefined;

      Object.assign(cmsData, {
        page: pageData,
        css: {
          common: cssCommon,
          individual: cssIndividual,
          special: cssSpecial
        },
        parts: {
          common: typesCommon,
          individual: typesIndividual,
          special: typesSpecial
        },
        images: {
          common: imagesCommon,
          individual: imagesIndividual,
          special: imagesSpecial
        },
        backendData: backendData
      });

      // データ読み込み後に、不足しているフィールドを初期化
      initializeAllComponentFields(cmsData);
    } catch (e) {
      console.error('Failed to parse props:', e);
    }
  }

  function getData(path?: string): unknown {
    if (!path) return cmsData;

    const keys = path.split('.');
    let result: unknown = cmsData;

    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return undefined;
      }
      result = (result as Record<string, unknown>)[key];
      if (result === undefined) return undefined;
    }

    return result;
  }

  function setData(pathOrData: string | Partial<ZeroCodeData>, value?: unknown): void {
    if (typeof pathOrData === 'string') {
      // パス指定での更新（リアクティブを維持）
      const keys = pathOrData.split('.');
      let target: Record<string, unknown> = cmsData as unknown as Record<string, unknown>;

      for (let i = 0; i < keys.length - 1; i++) {
        const next = target[keys[i]];
        if (next === null || next === undefined || typeof next !== 'object') {
          return;
        }
        target = next as Record<string, unknown>;
      }

      target[keys[keys.length - 1]] = value;
    } else {
      // 全体更新（Object.assignでリアクティブを維持）
      Object.assign(cmsData, pathOrData);
    }
  }

  return {
    cmsData,
    loadDataFromProps,
    getData,
    setData
  };
}
