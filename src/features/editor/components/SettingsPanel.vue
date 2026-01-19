<template>
  <div
    v-if="isOpen"
    class="zcode-settings-panel-overlay"
    @click.self="$emit('close')"
  >
    <div
      class="zcode-settings-panel"
      @click.stop
    >
      <div class="zcode-settings-panel-header">
        <div
          class="zcode-settings-panel-header-title"
          role="heading"
          aria-level="3"
        >
          {{ $t('settings.title') }}
        </div>
        <div class="zcode-settings-panel-header-actions">
          <select
            :value="currentLocale"
            class="zcode-language-select"
            :aria-label="$t('settings.language.label')"
            @change="handleLocaleChange"
          >
            <option value="ja">
              {{ $t('settings.language.ja') }}
            </option>
            <option value="en">
              {{ $t('settings.language.en') }}
            </option>
          </select>
          <button
            class="zcode-close-btn"
            aria-label="$t('common.close')"
            @click="$emit('close')"
          >
            <X :size="18" />
          </button>
        </div>
      </div>

      <div class="zcode-settings-panel-content">
        <div v-if="viewMode === 'manage'">
          <div
            v-if="props.mode === 'toolbar' || props.mode === undefined"
            class="zcode-setting-item"
          >
            <label class="zcode-setting-label">
              <input
                type="checkbox"
                :checked="props.allowDynamicContentInteraction ?? false"
                class="zcode-setting-checkbox"
                @change="
                  $emit('toggle-dynamic-content', ($event.target as HTMLInputElement).checked)
                "
              >
              <span>{{ $t('settings.enableDynamicContent') }}</span>
              <button
                class="zcode-info-btn"
                type="button"
                :title="$t('common.select')"
                @click.stop="showDynamicContentInfo = !showDynamicContentInfo"
              >
                <HelpCircle :size="16" />
              </button>
            </label>
            <div
              v-if="showDynamicContentInfo"
              class="zcode-setting-description"
            >
              {{ $t('settings.enableDynamicContentDescription') }}
            </div>
          </div>


          <div
            v-if="props.mode === 'toolbar' || props.mode === undefined"
            class="zcode-setting-item"
          >
            <label class="zcode-setting-label">
              <input
                type="checkbox"
                :checked="devRightPaddingValue"
                class="zcode-setting-checkbox"
                @change="$emit('toggle-dev-padding', ($event.target as HTMLInputElement).checked)"
              >
              <span>{{ $t('settings.devRightPadding') }}</span>
              <button
                class="zcode-info-btn"
                type="button"
                :title="$t('common.select')"
                @click.stop="showDevPaddingInfo = !showDevPaddingInfo"
              >
                <HelpCircle :size="16" />
              </button>
            </label>
            <div
              v-if="showDevPaddingInfo"
              class="zcode-setting-description"
            >
              {{ $t('settings.devRightPaddingDescription') }}
            </div>
          </div>

          <div
            v-if="props.mode === 'toolbar' || props.mode === undefined"
            class="zcode-setting-item"
          >
            <label class="zcode-setting-label">
              <input
                type="checkbox"
                :checked="props.enableContextMenu ?? false"
                class="zcode-setting-checkbox"
                @change="
                  $emit('toggle-context-menu', ($event.target as HTMLInputElement).checked)
                "
              >
              <span>{{ $t('settings.enableContextMenu') }}</span>
              <button
                class="zcode-info-btn"
                type="button"
                :title="$t('common.select')"
                @click.stop="showContextMenuInfo = !showContextMenuInfo"
              >
                <HelpCircle :size="16" />
              </button>
            </label>
            <div
              v-if="showContextMenuInfo"
              class="zcode-setting-description"
            >
              {{ $t('settings.enableContextMenuDescription') }}
            </div>
          </div>

          <div
            v-if="props.mode === 'dev-tabs'"
            class="zcode-setting-item"
          >
            <label class="zcode-setting-label">
              <input
                type="checkbox"
                :checked="props.showSaveConfirm ?? true"
                class="zcode-setting-checkbox"
                @change="
                  $emit('toggle-save-confirm', ($event.target as HTMLInputElement).checked)
                "
              >
              <span>{{ $t('settings.showSaveConfirm') }}</span>
              <button
                class="zcode-info-btn"
                type="button"
                :title="$t('common.select')"
                @click.stop="showSaveConfirmInfo = !showSaveConfirmInfo"
              >
                <HelpCircle :size="16" />
              </button>
            </label>
            <div
              v-if="showSaveConfirmInfo"
              class="zcode-setting-description"
            >
              {{ $t('settings.showSaveConfirmDescription') }}
            </div>
          </div>
        </div>

        <div
          v-else
          class="zcode-setting-item"
        >
          <div class="zcode-setting-info">
            {{ $t('settings.previewModeInfo') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { X, HelpCircle } from 'lucide-vue-next';
import { saveUserSettings } from '../../../core/utils/storage';
import type { SupportedLocale } from '../../../i18n';

type ViewModeType = 'preview' | 'manage';

const props = defineProps<{
  isOpen: boolean;
  viewMode: ViewModeType;
  mode?: 'toolbar' | 'dev-tabs';
  allowDynamicContentInteraction?: boolean;
  devRightPadding?: boolean;
  enableContextMenu?: boolean;
  showSaveConfirm?: boolean;
}>();

defineEmits<{
  close: [];
  'toggle-dynamic-content': [enabled: boolean];
  'toggle-dev-padding': [enabled: boolean];
  'toggle-context-menu': [enabled: boolean];
  'toggle-save-confirm': [enabled: boolean];
}>();

const { locale } = useI18n();

const currentLocale = computed(() => {
  return (locale.value as SupportedLocale) || 'ja';
});

function handleLocaleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const newLocale = target.value as SupportedLocale;
  // locale.valueを変更すると、Vueアプリ全体に反映される（legacy: falseモード）
  locale.value = newLocale;
  saveUserSettings({ locale: newLocale });
}

const showDynamicContentInfo = ref(false);
const showDevPaddingInfo = ref(false);
const showContextMenuInfo = ref(false);
const showSaveConfirmInfo = ref(false);

const devRightPaddingValue = computed(() => {
  // デフォルトは余白なし（false）
  return props.devRightPadding !== undefined ? props.devRightPadding : false;
});
</script>
