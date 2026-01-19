import type { UserSettings, CMSSettings, DevSettings } from '../../types';
import type { SupportedLocale } from '../../i18n';

const STORAGE_KEY = 'zcode-user-settings';

export function loadUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
    return {};
  } catch (e) {
    console.warn('[ZeroCode] Failed to load user settings:', e);
    return {};
  }
}

export function saveUserSettings(settings: Partial<UserSettings>): void {
  try {
    const current = loadUserSettings();
    const merged: UserSettings = {
      locale: settings.locale ?? current.locale,
      cms: settings.cms ? { ...(current.cms || {}), ...settings.cms } : current.cms,
      dev: settings.dev ? { ...(current.dev || {}), ...settings.dev } : current.dev
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('[ZeroCode] Failed to save user settings:', e);
  }
}

export function getUserSetting<K extends keyof UserSettings>(
  key: K,
  defaultValue: NonNullable<UserSettings[K]>
): NonNullable<UserSettings[K]> {
  const settings = loadUserSettings();
  return (settings[key] ?? defaultValue) as NonNullable<UserSettings[K]>;
}

// locale専用の関数（nullを許可）
export function getUserLocale(defaultValue: SupportedLocale | null = null): SupportedLocale | null {
  const settings = loadUserSettings();
  if (settings.locale !== undefined) {
    return settings.locale as SupportedLocale;
  }
  return defaultValue;
}

export function loadCMSSettings(): CMSSettings {
  const settings = loadUserSettings();
  return settings.cms || {};
}

export function saveCMSSettings(cmsSettings: Partial<CMSSettings>): void {
  const current = loadUserSettings();
  saveUserSettings({
    cms: { ...current.cms, ...cmsSettings }
  });
}

export function getCMSSetting<K extends keyof CMSSettings>(
  key: K,
  defaultValue: NonNullable<CMSSettings[K]>
): NonNullable<CMSSettings[K]> {
  const settings = loadCMSSettings();
  return (settings[key] ?? defaultValue) as NonNullable<CMSSettings[K]>;
}

export function loadDevSettings(): DevSettings {
  const settings = loadUserSettings();
  return settings.dev || {};
}

export function saveDevSettings(devSettings: Partial<DevSettings>): void {
  const current = loadUserSettings();
  saveUserSettings({
    dev: { ...current.dev, ...devSettings }
  });
}

export function getDevSetting<K extends keyof DevSettings>(
  key: K,
  defaultValue: NonNullable<DevSettings[K]>
): NonNullable<DevSettings[K]> {
  const settings = loadDevSettings();
  return (settings[key] ?? defaultValue) as NonNullable<DevSettings[K]>;
}

export function clearUserSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[ZeroCode] Failed to clear user settings:', e);
  }
}

const CSS_WARNING_SESSION_KEY = 'zcode-dont-show-css-warning-parts';

export function getCssWarningPartsSetting(): boolean {
  try {
    const stored = sessionStorage.getItem(CSS_WARNING_SESSION_KEY);
    return stored === 'true';
  } catch (e) {
    return false;
  }
}

export function setCssWarningPartsSetting(value: boolean): void {
  try {
    sessionStorage.setItem(CSS_WARNING_SESSION_KEY, String(value));
  } catch (e) {
    console.warn('[ZeroCode] Failed to save CSS warning setting:', e);
  }
}

