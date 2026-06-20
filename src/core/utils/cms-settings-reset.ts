import type { CMSConfig, CMSSettings } from '../../types';
import { loadCMSSettings, loadUserSettings, replaceCMSSettings } from './storage';

export const CMS_SETTING_CODE_DEFAULTS: {
  [K in keyof CMSSettings]-?: NonNullable<CMSSettings[K]>;
} = {
  allowDynamicContentInteraction: false,
  devRightPadding: false,
  enableContextMenu: false,
  showSaveConfirm: true,
  scrollIntoViewOnPartEdit: true,
  showPartDiscoveryOutlines: true,
  showAddBetweenButtons: true,
  showReorderStructureLabels: true
};

export const TOOLBAR_CMS_SETTING_KEYS = [
  'allowDynamicContentInteraction',
  'devRightPadding',
  'enableContextMenu',
  'showPartDiscoveryOutlines',
  'scrollIntoViewOnPartEdit'
] as const satisfies readonly (keyof CMSSettings)[];

export const ADD_PANEL_CMS_SETTING_KEYS = [
  'showAddBetweenButtons'
] as const satisfies readonly (keyof CMSSettings)[];

export const REORDER_PANEL_CMS_SETTING_KEYS = [
  'showReorderStructureLabels'
] as const satisfies readonly (keyof CMSSettings)[];

export function resolveCmsSettingDefault<K extends keyof CMSSettings>(
  key: K,
  config?: Partial<CMSConfig>
): NonNullable<CMSSettings[K]> {
  const stored = loadCMSSettings();
  if (stored[key] !== undefined) {
    return stored[key] as NonNullable<CMSSettings[K]>;
  }
  const configValue = config?.cms?.[key];
  if (configValue !== undefined) {
    return configValue as NonNullable<CMSSettings[K]>;
  }
  return CMS_SETTING_CODE_DEFAULTS[key];
}

export function clearCmsSettingsKeys(keys: readonly (keyof CMSSettings)[]): void {
  const current = loadUserSettings();
  if (!current.cms) {
    return;
  }

  const nextCms = { ...current.cms };
  for (const key of keys) {
    delete nextCms[key];
  }
  replaceCMSSettings(nextCms);
}

export function resolveCmsSettingsDefaultsAfterClear(
  keys: readonly (keyof CMSSettings)[],
  config?: Partial<CMSConfig>
): Partial<CMSSettings> {
  clearCmsSettingsKeys(keys);
  const result: Partial<CMSSettings> = {};
  for (const key of keys) {
    result[key] = resolveCmsSettingDefault(key, config);
  }
  return result;
}
