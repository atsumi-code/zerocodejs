<template>
  <div class="zcode-dev-container">
    <div class="zcode-dev-header">
      <div class="zcode-dev-tabs">
        <button
          :class="{ active: activeTab === 'preview' }"
          class="zcode-dev-tab"
          @click="activeTab = 'preview'"
        >
          <Eye :size="16" />
          <span>{{ $t('studio.preview') }}</span>
        </button>
        <button
          :class="{ active: activeTab === 'parts' }"
          class="zcode-dev-tab"
          @click="activeTab = 'parts'"
        >
          <Package :size="16" />
          <span>{{ $t('studio.partsManagement') }}</span>
        </button>
        <button
          :class="{ active: activeTab === 'images' }"
          class="zcode-dev-tab"
          @click="activeTab = 'images'"
        >
          <Image :size="16" />
          <span>{{ $t('studio.imagesManagement') }}</span>
        </button>
        <button
          :class="{ active: activeTab === 'data' }"
          class="zcode-dev-tab"
          @click="activeTab = 'data'"
        >
          <Database :size="16" />
          <span>{{ $t('editor.dataViewer') }}</span>
        </button>
        <button
          class="zcode-dev-tab zcode-dev-settings-btn"
          :title="$t('toolbar.settings')"
          @click="settingsPanelOpen = true"
        >
          <Settings :size="16" />
        </button>
      </div>
    </div>

    <ZeroCodePreview
      v-if="activeTab === 'preview' && cmsData"
      :cms-data="cmsData"
      :allow-dynamic-content-interaction="true"
    />

    <PartsManagerPanel
      v-if="activeTab === 'parts' && cmsData"
      :cms-data="cmsData"
      :config="config"
      fixed-category="special"
    />
    <div
      v-if="activeTab === 'parts' && !cmsData"
      class="zcode-loading-message"
    >
      <div class="zcode-loading-message-text">
        {{ $t('editor.loading') }}
      </div>
    </div>

    <ImagesManagerPanel
      v-if="activeTab === 'images' && cmsData"
      :cms-data="cmsData"
      :config="config"
      fixed-category="special"
    />
    <div
      v-if="activeTab === 'images' && !cmsData"
      class="zcode-loading-message"
    >
      <div class="zcode-loading-message-text">
        {{ $t('editor.loading') }}
      </div>
    </div>

    <DataViewer
      v-show="activeTab === 'data' && cmsData"
      :cms-data="cmsData"
      :config="config"
    />

    <SettingsPanel
      v-show="settingsPanelOpen"
      :is-open="settingsPanelOpen"
      view-mode="manage"
      mode="dev-tabs"
      :show-save-confirm="showSaveConfirm"
      @close="settingsPanelOpen = false"
      @toggle-save-confirm="showSaveConfirm = $event"
    />

    <div class="zcode-save-controls-fixed">
      <button
        class="zcode-save-btn"
        @click="handleSaveClick"
      >
        <Save :size="16" />
        <span>{{ $t('common.save') }}</span>
      </button>
    </div>

    <div
      v-if="showSaveConfirmDialog"
      class="zcode-save-confirm-dialog-overlay"
      @click.self="cancelSave"
    >
      <div class="zcode-save-confirm-dialog">
        <div class="zcode-save-confirm-dialog-header">
          <div class="zcode-save-confirm-dialog-title">
            {{ $t('saveConfirm.title') }}
          </div>
        </div>
        <div class="zcode-save-confirm-dialog-body">
          <p>{{ $t('saveConfirm.message') }}</p>
          <ul class="zcode-save-confirm-targets">
            <li
              v-for="target in pendingSaveTargets"
              :key="target"
            >
              {{ getTargetLabel(target) }}
            </li>
          </ul>
        </div>
        <div class="zcode-save-confirm-dialog-footer">
          <button
            class="zcode-btn-secondary"
            @click="cancelSave"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="zcode-btn-primary"
            @click="confirmSave"
          >
            {{ $t('saveConfirm.saveButton') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ZeroCodePreview from './ZeroCodePreview.vue';
import PartsManagerPanel from '../features/parts-manager/components/PartsManagerPanel.vue';
import ImagesManagerPanel from '../features/images-manager/components/ImagesManagerPanel.vue';
import DataViewer from '../features/data-viewer/components/DataViewer.vue';
import SettingsPanel from '../features/editor/components/SettingsPanel.vue';
import { Eye, Package, Image, Database, Settings, Save } from 'lucide-vue-next';
import { useZeroCodeData } from '../core/composables/useZeroCodeData';
import { logger } from '../core/utils/logger';
import type { CMSConfig } from '../types';

const { t } = useI18n();

const props = defineProps<{
  locale?: string;
  page?: string;
  cssCommon?: string;
  cssIndividual?: string;
  cssSpecial?: string;
  partsCommon?: string;
  partsIndividual?: string;
  partsSpecial?: string;
  imagesCommon?: string;
  imagesIndividual?: string;
  imagesSpecial?: string;
  config?: string;
  endpoints?: string;
  backendData?: string;
}>();

const activeTab = ref<'preview' | 'parts' | 'images' | 'data'>('parts');
const settingsPanelOpen = ref(false);

const showSaveConfirmDialog = ref(false);
const pendingSaveTargets = ref<string[]>([]);

const parseConfig = (configString?: string): Partial<CMSConfig> => {
  if (!configString) return {};
  try {
    return JSON.parse(configString);
  } catch (e) {
    logger.warn('ZeroCodeStudio: Failed to parse config:', e);
    return {};
  }
};

const config = parseConfig(props.config);

const showSaveConfirm = ref(config.studio?.showSaveConfirm !== false);

const { cmsData, loadDataFromProps, getData, setData } = useZeroCodeData(props);

onMounted(() => {
  loadDataFromProps();
});

watch(
  [
    () => props.page,
    () => props.partsCommon,
    () => props.partsIndividual,
    () => props.partsSpecial,
    () => props.imagesCommon,
    () => props.imagesIndividual,
    () => props.imagesSpecial,
    () => props.cssCommon,
    () => props.cssIndividual,
    () => props.cssSpecial
  ],
  () => {
    loadDataFromProps();
  }
);

function dispatchEvent(eventName: string, detail: unknown) {
  const hostElement = document.querySelector('zcode-studio');
  if (hostElement) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    });
    hostElement.dispatchEvent(event);
    return;
  }

  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    composed: true
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }
}

function createRequestId() {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function calculateSaveTargets(): string[] {
  if (activeTab.value === 'parts') {
    return ['parts-special', 'parts-special-css'];
  } else if (activeTab.value === 'images') {
    return ['images-special'];
  }
  return ['parts-special', 'parts-special-css', 'images-special'];
}

function handleSaveClick() {
  if (!showSaveConfirm.value) {
    executeSave();
    return;
  }

  const targets = calculateSaveTargets();
  pendingSaveTargets.value = targets;
  showSaveConfirmDialog.value = true;
}

function executeSave() {
  const targets = calculateSaveTargets();
  if (targets.length === 0) return;

  dispatchEvent('save-request', {
    requestId: createRequestId(),
    source: 'studio',
    targets,
    timestamp: Date.now()
  });
}

function confirmSave() {
  showSaveConfirmDialog.value = false;
  executeSave();
}

function cancelSave() {
  showSaveConfirmDialog.value = false;
  pendingSaveTargets.value = [];
}

function getTargetLabel(target: string): string {
  const labels: Record<string, string> = {
    'parts-special': t('saveConfirm.targets.parts-special'),
    'images-special': t('saveConfirm.targets.images-special'),
    'parts-special-css': t('saveConfirm.targets.parts-special-css')
  };
  return labels[target] || target;
}

defineExpose({
  getData,
  setData
});
</script>
