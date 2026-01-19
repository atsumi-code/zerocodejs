import { createI18n } from 'vue-i18n';
import ja from './locales/ja';
import en from './locales/en';

export type SupportedLocale = 'ja' | 'en';

export function createZeroCodeI18n(locale: SupportedLocale = 'ja') {
  return createI18n({
    locale,
    fallbackLocale: 'ja',
    messages: {
      ja,
      en
    },
    legacy: false,
    globalInjection: true,
    // DevToolsプラグインを無効化（Web Component環境でのエラーを回避）
    devtools: false
  });
}
