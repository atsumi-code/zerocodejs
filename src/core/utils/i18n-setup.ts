import type { App } from 'vue';
import type { SupportedLocale } from '../../i18n';
import { createZeroCodeI18n } from '../../i18n';
import { getUserLocale } from '../utils/storage';

/**
 * vue-i18nのDevToolsエラーメッセージのパターン
 * Web Component環境で発生するエラーを識別するため
 */
const I18N_DEVTOOLS_ERROR_PATTERNS = {
  UNDEFINED_PROPERTIES: 'Cannot read properties of undefined',
  APP_REFERENCE: 'app'
} as const;

/**
 * vue-i18nのDevToolsエラーを抑制するグローバルエラーハンドラーを設定
 * Web Component環境でのエラーを回避するため
 */
export function setupI18nErrorHandler(): void {
  if (typeof window === 'undefined') return;

  type WindowWithZCodeI18n = Window & {
    __zcodeI18nErrorHandlerSetup?: boolean;
  };
  const w = window as WindowWithZCodeI18n;

  // 既に設定されている場合はスキップ
  if (w.__zcodeI18nErrorHandlerSetup) return;

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
      const message = String(event.reason.message);
      if (
        message.includes(I18N_DEVTOOLS_ERROR_PATTERNS.UNDEFINED_PROPERTIES) &&
        message.includes(I18N_DEVTOOLS_ERROR_PATTERNS.APP_REFERENCE)
      ) {
        event.preventDefault();
        // エラーを静かに抑制（警告メッセージは表示しない）
        return;
      }
    }
  });

  w.__zcodeI18nErrorHandlerSetup = true;
}

/**
 * vue-i18nのDevToolsを無効化
 * 環境変数が設定されていない場合のフォールバック
 */
export function disableI18nDevTools(): void {
  if (typeof window === 'undefined') return;

  type WindowWithI18nDevToolsFlags = Window & {
    __VUE_I18N_FULL_INSTALL__?: boolean;
    __INTLIFY_PROD_DEVTOOLS__?: boolean;
    __VUE_I18N_PROD_DEVTOOLS__?: boolean;
  };

  const w = window as WindowWithI18nDevToolsFlags;
  w.__VUE_I18N_FULL_INSTALL__ = false;
  w.__INTLIFY_PROD_DEVTOOLS__ = false;
  w.__VUE_I18N_PROD_DEVTOOLS__ = false;
}

/**
 * 言語を決定する（優先順位: localStorage > HTML属性 > デフォルト）
 * @param element - Web Component要素
 * @param defaultLocale - デフォルト言語
 * @returns 決定された言語
 */
export function determineLocale(
  element: HTMLElement,
  defaultLocale: SupportedLocale = 'ja'
): SupportedLocale {
  // ユーザーが設定パネルで変更した言語を最優先
  const savedLocale = getUserLocale(null);
  if (savedLocale) {
    return savedLocale;
  }

  // HTML属性のlocale（初期設定用）
  const attrLocale = element.getAttribute('locale');
  if (attrLocale === 'ja' || attrLocale === 'en') {
    return attrLocale as SupportedLocale;
  }

  // デフォルト
  return defaultLocale;
}

/**
 * i18nインスタンスを初期化してVueアプリに適用
 * @param app - Vueアプリインスタンス
 * @param locale - 言語
 */
export function setupI18n(app: App, locale: SupportedLocale): void {
  // DevToolsを無効化
  disableI18nDevTools();

  // i18nの初期化
  const i18n = createZeroCodeI18n(locale);

  // i18nプラグインの適用（エラーハンドリング付き）
  try {
    app.use(i18n);
  } catch (e) {
    console.warn('[ZeroCode] Failed to setup i18n:', e);
  }
}
