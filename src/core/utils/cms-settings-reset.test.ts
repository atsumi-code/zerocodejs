import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ADD_PANEL_CMS_SETTING_KEYS,
  REORDER_PANEL_CMS_SETTING_KEYS,
  TOOLBAR_CMS_SETTING_KEYS,
  clearCmsSettingsKeys,
  resolveCmsSettingDefault,
  resolveCmsSettingsDefaultsAfterClear
} from './cms-settings-reset';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('cms-settings-reset', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('uses code defaults when storage and config are empty', () => {
    expect(resolveCmsSettingDefault('devRightPadding')).toBe(false);
    expect(resolveCmsSettingDefault('showPartDiscoveryOutlines')).toBe(true);
  });

  it('prefers stored values over config and code defaults', () => {
    localStorageMock.setItem(
      'zcode-user-settings',
      JSON.stringify({ cms: { devRightPadding: true } })
    );
    expect(resolveCmsSettingDefault('devRightPadding', { cms: { devRightPadding: false } })).toBe(
      true
    );
  });

  it('uses config when storage key is missing', () => {
    expect(
      resolveCmsSettingDefault('enableContextMenu', { cms: { enableContextMenu: true } })
    ).toBe(true);
  });

  it('clears only requested CMS keys from storage', () => {
    localStorageMock.setItem(
      'zcode-user-settings',
      JSON.stringify({
        cms: {
          devRightPadding: true,
          showAddBetweenButtons: false,
          showReorderStructureLabels: false
        }
      })
    );

    clearCmsSettingsKeys(TOOLBAR_CMS_SETTING_KEYS);

    const stored = JSON.parse(localStorageMock.getItem('zcode-user-settings')!);
    expect(stored.cms.devRightPadding).toBeUndefined();
    expect(stored.cms.showAddBetweenButtons).toBe(false);
    expect(stored.cms.showReorderStructureLabels).toBe(false);
  });

  it('returns defaults after clearing keys', () => {
    localStorageMock.setItem(
      'zcode-user-settings',
      JSON.stringify({ cms: { showAddBetweenButtons: false } })
    );

    const defaults = resolveCmsSettingsDefaultsAfterClear(ADD_PANEL_CMS_SETTING_KEYS, {
      cms: { showAddBetweenButtons: false }
    });

    expect(defaults.showAddBetweenButtons).toBe(false);

    localStorageMock.clear();
    const codeDefaults = resolveCmsSettingsDefaultsAfterClear(REORDER_PANEL_CMS_SETTING_KEYS);
    expect(codeDefaults.showReorderStructureLabels).toBe(true);
  });
});
