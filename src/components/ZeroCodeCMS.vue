<template>
  <div
    ref="containerRef"
    class="zcode-cms-container"
    :class="{ 'zcode-dev-padding': devRightPadding && isPanelVisible }"
  >
    <!-- ツールバー（固定） -->
    <Toolbar
      :current-mode="currentMode"
      :view-mode="viewMode"
      :allow-dynamic-content-interaction="allowDynamicContentInteraction"
      @switch-mode="switchMode"
      @switch-view-mode="(mode) => (viewMode = mode)"
      @open-settings="settingsPanelOpen = true"
    />

    <div
      v-if="saveErrorBanner.visible"
      class="zcode-save-banner zcode-save-banner--error"
      role="alert"
    >
      <div class="zcode-save-banner-text">
        {{ saveErrorBanner.message }}
      </div>
      <button
        class="zcode-save-banner-close"
        :aria-label="$t('common.close')"
        @click="saveErrorBanner.visible = false"
      >
        ×
      </button>
    </div>

    <!-- 保存ボタン（左下固定、管理モードの時のみ表示） -->
    <div v-if="viewMode === 'manage'" class="zcode-save-controls-fixed">
      <button class="zcode-save-btn" @click="handleSave">
        <Save :size="16" />
        <span>{{ $t('common.save') }}</span>
      </button>
    </div>

    <!-- 表示モード: プレビューのみ（表示専用、動的コンテンツは常に有効） -->
    <ZeroCodePreview
      v-if="viewMode === 'preview'"
      :cms-data="cmsData"
      :allow-dynamic-content-interaction="true"
    />

    <!-- 管理モード: 既存の編集機能 -->
    <template v-if="viewMode === 'manage'">
      <!-- プレビューエリア（編集機能あり） -->
      <PreviewArea
        ref="previewAreaRef"
        :cms-data="cmsData"
        :full-page-html="fullPageHtml"
        :on-add-click="handleAddClick"
        :allow-dynamic-content-interaction="allowDynamicContentInteraction"
      />

      <!-- 編集パネル -->
      <EditPanel
        :editing-component="editingComponent"
        :editing-available-fields="editingAvailableFields"
        :field-errors="fieldErrors"
        :current-mode="currentMode"
        :can-select-parent="canSelectParent"
        :images-common="cmsData.images.common"
        :images-individual="cmsData.images.individual"
        :images-special="cmsData.images.special"
        :image-modal-actions="imageModalActions"
        @close="closeEditPanel"
        @select-parent="selectParentElement"
        @save-field="handleSaveFieldEdit"
        @add-image="handleAddImage"
        @delete-image="handleDeleteImage"
      />

      <!-- 削除確認パネル -->
      <DeletePanel
        :delete-confirm-component="deleteConfirmComponent"
        :current-mode="currentMode"
        :can-select-parent="canSelectParent"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
        @select-parent="selectParentElement"
      />

      <!-- 並べ替えパネル -->
      <ReorderPanel
        :reorder-source-path="reorderSourcePath"
        :current-mode="currentMode"
        :can-select-parent="canSelectParent"
        @cancel="cancelReorder"
        @select-parent="selectParentElement"
      />

      <!-- パーツ選択パネル -->
      <AddPanel
        :add-target-path="addTargetPath"
        :add-part-category="addPartCategory"
        :add-type-tab="addTypeTab"
        :add-selected-part="addSelectedPart"
        :add-selected-type="addSelectedType"
        :has-special-parts="hasSpecialParts"
        :clicked-component="clickedComponent"
        :available-part-types="availablePartTypes"
        :config="config"
        :grouped-parts-by-type="groupedPartsByType"
        :can-select-parent="canSelectParent"
        :get-part-preview-html="getPartPreviewHtml"
        :get-clicked-component-preview-html="getClickedComponentPreviewHtml"
        :keep-adding="keepAdding"
        @cancel="cancelAdd"
        @select-parent="selectParentElement"
        @category-tab-click="handleCategoryTabClick"
        @type-tab-click="handleTypeTabClick"
        @select-part="selectPart"
        @confirm-add="confirmAddPart"
        @update-keep-adding="keepAdding = $event"
      />
    </template>

    <!-- 設定パネル -->
    <SettingsPanel
      :is-open="settingsPanelOpen"
      :view-mode="viewMode"
      mode="toolbar"
      :allow-dynamic-content-interaction="allowDynamicContentInteraction"
      :dev-right-padding="devRightPaddingValue"
      :enable-context-menu="enableContextMenu"
      :show-save-confirm="showSaveConfirm"
      @close="settingsPanelOpen = false"
      @toggle-dynamic-content="allowDynamicContentInteraction = $event"
      @toggle-dev-padding="devRightPadding = $event"
      @toggle-context-menu="enableContextMenu = $event"
      @toggle-save-confirm="showSaveConfirm = $event"
    />

    <!-- コンテキストメニュー -->
    <ContextMenu
      :is-visible="contextMenuVisible"
      :position="contextMenuPosition"
      :current-mode="currentMode"
      @select-mode="handleContextMenuModeSelect"
      @close="closeContextMenu"
    />

    <!-- 保存確認ダイアログ -->
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
          <p>{{ $t('saveConfirm.simpleMessage') }}</p>
        </div>
        <div class="zcode-save-confirm-dialog-footer">
          <button class="zcode-btn-secondary" @click="cancelSave">
            {{ $t('common.cancel') }}
          </button>
          <button class="zcode-btn-primary" @click="confirmSave">
            {{ $t('saveConfirm.saveButton') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, getCurrentInstance } from 'vue';
import { Save } from 'lucide-vue-next';
import ZeroCodePreview from './ZeroCodePreview.vue';
import PreviewArea from '../features/preview/PreviewArea.vue';
import Toolbar from '../features/editor/components/Toolbar.vue';
import SettingsPanel from '../features/editor/components/SettingsPanel.vue';
import EditPanel from '../features/editor/components/EditPanel.vue';
import DeletePanel from '../features/delete/components/DeletePanel.vue';
import ReorderPanel from '../features/reorder/components/ReorderPanel.vue';
import AddPanel from '../features/add/components/AddPanel.vue';
import ContextMenu from '../features/editor/components/ContextMenu.vue';
import { useZeroCodeData } from '../core/composables/useZeroCodeData';
import { useZeroCodeRenderer } from '../core/composables/useZeroCodeRenderer';
import { useEditorMode } from '../features/editor/composables/useEditorMode';
import { useEditMode } from '../features/editor/composables/useEditMode';
import { useAddMode } from '../features/add/composables/useAddMode';
import { useDeleteMode } from '../features/delete/composables/useDeleteMode';
import { useReorderMode } from '../features/reorder/composables/useReorderMode';
import { useParentSelector } from '../features/parent-selector/composables/useParentSelector';
import { useClickHandlers } from '../features/editor/composables/useClickHandlers';
import { useModeSwitcher } from '../features/editor/composables/useModeSwitcher';
import { useContextMenu } from '../features/editor/composables/useContextMenu';
import { validateData as validateDataUtil } from '../core/utils/validation';
import { findImageReferences } from '../core/utils/image-utils';
import { saveCMSSettings, loadCMSSettings } from '../core/utils/storage';
import { useI18n } from 'vue-i18n';
import type { ImageData, CMSConfig, CMSSettings } from '../types';

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

const viewMode = ref<'preview' | 'manage'>('manage');
const settingsPanelOpen = ref(false);

// configをパース
const parseConfig = (configString?: string): Partial<CMSConfig> => {
  if (!configString) return {};
  try {
    return JSON.parse(configString);
  } catch (e) {
    console.warn('[ZeroCodeCMS] Failed to parse config:', e);
    return {};
  }
};

const config = parseConfig(props.config);

const imageModalActions = computed(() => {
  const def = {
    common: { add: false, delete: false },
    individual: { add: false, delete: false },
    special: { add: false, delete: false }
  };
  const c = config.cms?.imageModalActions;
  if (!c) return def;
  return {
    common: { ...def.common, ...c.common },
    individual: { ...def.individual, ...c.individual },
    special: { ...def.special, ...c.special }
  };
});

// 初期値の読み込みロジック（優先順位: localStorage > config.cms > デフォルト値）
const getInitialCMSValue = <K extends keyof CMSSettings>(
  key: K,
  defaultValue: NonNullable<CMSSettings[K]>,
  configValue?: boolean
): NonNullable<CMSSettings[K]> => {
  const stored = loadCMSSettings();
  // localStorageに値があればそれを使用（ユーザーが変更した値）
  if (stored[key] !== undefined) {
    return stored[key] as NonNullable<CMSSettings[K]>;
  }
  // localStorageに値がなければ、config.cmsの値を使用（初期設定）
  if (configValue !== undefined) {
    return configValue as NonNullable<CMSSettings[K]>;
  }
  // それもなければデフォルト値
  return defaultValue;
};

// 設定の初期化（デフォルト値は全てfalse、showSaveConfirmのみtrue）
const devRightPadding = ref(
  getInitialCMSValue('devRightPadding', false, config.cms?.devRightPadding)
);
const enableContextMenu = ref(
  getInitialCMSValue('enableContextMenu', false, config.cms?.enableContextMenu)
);
const showSaveConfirm = ref(
  getInitialCMSValue('showSaveConfirm', true, config.cms?.showSaveConfirm)
);
const devRightPaddingValue = computed(() => devRightPadding.value);

// 保存確認ダイアログの状態
const showSaveConfirmDialog = ref(false);

const { cmsData, loadDataFromProps, getData: getDataBase, setData } = useZeroCodeData(props);
const { fullPageHtml, renderComponentToHtml } = useZeroCodeRenderer(cmsData, true);

function getData(path?: string) {
  if (path === 'css') {
    return undefined;
  }

  if (!path) {
    return getDataBase();
  }

  return getDataBase(path);
}

const containerRef = ref<HTMLElement | null>(null);
const previewAreaRef = ref<InstanceType<typeof PreviewArea> | null>(null);
const previewArea = computed(() => previewAreaRef.value?.previewArea || null);

const {
  currentMode,
  switchMode: switchModeBase,
  allowDynamicContentInteraction: allowDynamicContentInteractionBase
} = useEditorMode();

// localStorageからallowDynamicContentInteractionを読み込み（デフォルトはfalse）
const savedAllowDynamicContentInteraction = getInitialCMSValue(
  'allowDynamicContentInteraction',
  false,
  config.cms?.allowDynamicContentInteraction
);
const allowDynamicContentInteraction = ref(savedAllowDynamicContentInteraction);
allowDynamicContentInteractionBase.value = savedAllowDynamicContentInteraction;

let savedAllowDynamicContentInteractionForPreview = false;

watch(viewMode, (newMode, oldMode) => {
  if (newMode === 'preview') {
    savedAllowDynamicContentInteractionForPreview = allowDynamicContentInteraction.value;
    allowDynamicContentInteraction.value = true;
    allowDynamicContentInteractionBase.value = true;
    // Shadow DOM内の値を更新
    nextTick(() => {
      updateShadowDOMAllowDynamicContentInteraction();
    });
  } else if (oldMode === 'preview') {
    allowDynamicContentInteraction.value = savedAllowDynamicContentInteractionForPreview;
    allowDynamicContentInteractionBase.value = savedAllowDynamicContentInteractionForPreview;
    // Shadow DOM内の値を更新
    nextTick(() => {
      updateShadowDOMAllowDynamicContentInteraction();
    });
  }

  // 表示モード変更イベントを発火
  dispatchEvent('view-mode-changed', {
    mode: newMode,
    previousMode: oldMode
  });
});

const {
  editingComponent,
  editingComponentPath,
  editingAvailableFields,
  handleEditClick,
  saveFieldEdit,
  closeEditPanel
} = useEditMode(cmsData, previewArea);

const fieldErrors = ref<Record<string, string>>({});

type SaveResultError = { path?: string; field?: string; message?: string; code?: string };
const lastSaveResultErrors = ref<SaveResultError[]>([]);
const saveErrorBanner = ref<{
  visible: boolean;
  message: string;
  requestId?: string;
  target?: string;
}>({
  visible: false,
  message: ''
});

type EditableField = Parameters<typeof saveFieldEdit>[0];

function handleSaveFieldEdit(field: EditableField) {
  if (field?.fieldName && fieldErrors.value[field.fieldName]) {
    const next = { ...fieldErrors.value };
    delete next[field.fieldName];
    fieldErrors.value = next;
  }
  saveFieldEdit(field);
}

const {
  addTargetPath,
  addSelectedType,
  addSelectedPart,
  clickedComponent,
  addPartCategory,
  addTypeTab,
  keepAdding,
  availablePartTypes,
  groupedPartsByType,
  hasSpecialParts,
  handleAddClick,
  handleCategoryTabClick,
  handleTypeTabClick,
  selectPart,
  getPartPreviewHtml,
  getClickedComponentPreviewHtml,
  confirmAddPart,
  cancelAdd
} = useAddMode(cmsData, previewArea, renderComponentToHtml, config);

const { reorderSourcePath, handleReorderClick, canReorderWith, cancelReorder } = useReorderMode(
  cmsData,
  previewArea
);

const {
  deleteConfirmComponent,
  deleteConfirmPath,
  handleDeleteClick,
  confirmDelete,
  cancelDelete
} = useDeleteMode(cmsData, previewArea, switchModeBase, nextTick);

const { switchMode } = useModeSwitcher(
  previewArea,
  currentMode,
  switchModeBase,
  editingComponentPath,
  addTargetPath,
  reorderSourcePath,
  deleteConfirmPath,
  editingComponent,
  addSelectedType,
  addSelectedPart,
  addPartCategory,
  addTypeTab,
  cancelDelete
);

// 親要素選択機能
const currentSelectedPath = computed(() => {
  if (currentMode.value === 'edit' && editingComponentPath.value) {
    return editingComponentPath.value;
  }
  if (currentMode.value === 'add' && addTargetPath.value) {
    return addTargetPath.value;
  }
  if (currentMode.value === 'reorder' && reorderSourcePath.value) {
    return reorderSourcePath.value;
  }
  if (currentMode.value === 'delete' && deleteConfirmPath.value) {
    return deleteConfirmPath.value;
  }
  return null;
});

const { canSelectParent, selectParentElement } = useParentSelector(
  cmsData,
  previewArea,
  currentMode,
  currentSelectedPath,
  handleEditClick,
  handleAddClick,
  handleReorderClick,
  handleDeleteClick,
  reorderSourcePath
);

// パネル表示有無（編集／追加／並べ替え／削除のいずれかがアクティブ）
const isPanelVisible = computed(() => {
  return !!(
    editingComponent.value ||
    addTargetPath.value ||
    reorderSourcePath.value ||
    deleteConfirmComponent.value
  );
});

const updateShadowDOMAllowDynamicContentInteraction = () => {
  if (previewArea.value) {
    const rootNode = previewArea.value.getRootNode();
    if (rootNode instanceof ShadowRoot) {
      type ShadowRootWithZCMS = ShadowRoot & {
        __zcmsSetAllowDynamicContentInteraction?: (value: boolean) => void;
      };
      const maxRetries = 30;
      const retryIntervalMs = 50;
      let tries = 0;

      const apply = () => {
        tries++;
        const zcmsRoot = rootNode as ShadowRootWithZCMS;
        if (typeof zcmsRoot.__zcmsSetAllowDynamicContentInteraction === 'function') {
          zcmsRoot.__zcmsSetAllowDynamicContentInteraction(allowDynamicContentInteraction.value);
          return;
        }
        if (tries < maxRetries) {
          setTimeout(apply, retryIntervalMs);
        }
      };

      apply();
    }
  }
};

// クリックハンドラー
const { setupClickHandlers, cleanupEventListeners } = useClickHandlers(
  cmsData,
  previewArea,
  currentMode,
  editingComponentPath,
  addTargetPath,
  reorderSourcePath,
  deleteConfirmPath,
  handleEditClick,
  handleAddClick,
  handleReorderClick,
  handleDeleteClick,
  canReorderWith,
  switchMode,
  allowDynamicContentInteraction
);

// コンテキストメニュー
const {
  isVisible: contextMenuVisible,
  position: contextMenuPosition,
  handleModeSelect: handleContextMenuModeSelect,
  closeMenu: closeContextMenu,
  setupContextMenu,
  cleanupContextMenu
} = useContextMenu(previewArea, enableContextMenu, switchMode);

function dispatchEvent(eventName: string, detail: unknown) {
  const hostElement = getHostElement();
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

function getHostElement(): HTMLElement | null {
  // コンテナ要素から取得を試みる
  if (containerRef.value) {
    const root = containerRef.value.getRootNode();
    if (root instanceof ShadowRoot && root.host) {
      return root.host as HTMLElement;
    }
    // Light DOM の場合
    const host =
      containerRef.value.closest?.('zcode-cms') || containerRef.value.closest?.('zcode-editor');
    if (host) {
      return host as HTMLElement;
    }
  }

  // フォールバック: getCurrentInstance から取得
  const instance = getCurrentInstance();
  if (instance) {
    const el = instance.vnode.el;

    if (el instanceof HTMLElement) {
      const root = el.getRootNode();
      if (root instanceof ShadowRoot && root.host) {
        return root.host as HTMLElement;
      }
      const host = el.closest?.('zcode-cms') || el.closest?.('zcode-editor');
      if (host) {
        return host as HTMLElement;
      }
      return null;
    }

    if (el instanceof Node) {
      const root = el.getRootNode();
      if (root instanceof ShadowRoot && root.host) {
        return root.host as HTMLElement;
      }
    }
  }

  return null;
}

type SaveResultDetail = {
  requestId?: string;
  target?: string;
  ok?: boolean;
  errors?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseSaveResultErrors(input: unknown): SaveResultError[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((e): e is Record<string, unknown> => isObject(e))
    .map((e) => ({
      path: typeof e.path === 'string' ? e.path : undefined,
      field: typeof e.field === 'string' ? e.field : undefined,
      message: typeof e.message === 'string' ? e.message : undefined,
      code: typeof e.code === 'string' ? e.code : undefined
    }));
}

function applyFieldErrorsForPath(path: string | null) {
  if (!path) {
    fieldErrors.value = {};
    return;
  }
  const next: Record<string, string> = {};
  for (const err of lastSaveResultErrors.value) {
    const errPath = typeof err?.path === 'string' ? err.path : null;
    const field = typeof err?.field === 'string' ? err.field : null;
    const message = typeof err?.message === 'string' ? err.message : null;
    if (!field || !message) continue;
    if (errPath && errPath !== path) continue;
    next[field] = message;
  }
  fieldErrors.value = next;
}

const handleAddImage = (imageData: ImageData, target: 'common' | 'individual' | 'special') => {
  if (target === 'common') {
    cmsData.images.common.push(imageData);
  } else if (target === 'individual') {
    cmsData.images.individual.push(imageData);
  } else {
    cmsData.images.special.push(imageData);
  }
};

const handleDeleteImage = (imageId: string) => {
  const references = findImageReferences(imageId, cmsData.page);

  references.forEach((ref) => {
    Object.keys(ref.component).forEach((key) => {
      if (key.includes('image') && ref.component[key] === imageId) {
        ref.component[key] = '';
      }
    });
  });

  const commonIndex = cmsData.images.common.findIndex((img: ImageData) => img.id === imageId);
  if (commonIndex !== -1) {
    cmsData.images.common.splice(commonIndex, 1);
  }

  const individualIndex = cmsData.images.individual.findIndex(
    (img: ImageData) => img.id === imageId
  );
  if (individualIndex !== -1) {
    cmsData.images.individual.splice(individualIndex, 1);
  }

  const specialIndex = cmsData.images.special.findIndex((img: ImageData) => img.id === imageId);
  if (specialIndex !== -1) {
    cmsData.images.special.splice(specialIndex, 1);
  }
};

function handleSaveResult(e: Event) {
  const detail = (e as CustomEvent<unknown>).detail;
  if (!isObject(detail)) return;

  const d = detail as SaveResultDetail;

  if (d.ok === true) {
    saveErrorBanner.value.visible = false;
    saveErrorBanner.value.message = '';
    lastSaveResultErrors.value = [];
    fieldErrors.value = {};
    return;
  }

  if (d.ok !== false) {
    return;
  }

  const errors = parseSaveResultErrors(d.errors);
  lastSaveResultErrors.value = errors;

  const count = errors.length;
  const firstMessage =
    typeof errors[0]?.message === 'string' && errors[0].message ? errors[0].message : null;

  saveErrorBanner.value.visible = true;
  saveErrorBanner.value.requestId = typeof d.requestId === 'string' ? d.requestId : undefined;
  saveErrorBanner.value.target = typeof d.target === 'string' ? d.target : undefined;
  saveErrorBanner.value.message = firstMessage
    ? t('editor.saveFailedWithMessage', { count, message: firstMessage })
    : t('editor.saveFailedWithCount', { count });

  applyFieldErrorsForPath(editingComponentPath.value || null);
}

onMounted(() => {
  loadDataFromProps();

  nextTick(() => {
    setupClickHandlers();
    if (enableContextMenu.value) {
      setupContextMenu();
    }
    // Shadow DOM内の値を初期化
    updateShadowDOMAllowDynamicContentInteraction();
    dispatchEvent('zcode-dom-updated', {});
  });

  const host = getHostElement();
  if (host) {
    host.addEventListener('save-result', handleSaveResult);
  }
});

onUnmounted(() => {
  cleanupEventListeners();
  cleanupContextMenu();
  const host = getHostElement();
  if (host) {
    host.removeEventListener('save-result', handleSaveResult);
  }
});

watch(
  () => editingComponentPath.value,
  (path) => {
    applyFieldErrorsForPath(path || null);
  }
);

watch(
  [
    () => props.page,
    () => props.cssCommon,
    () => props.cssIndividual,
    () => props.cssSpecial,
    () => props.partsCommon,
    () => props.partsIndividual,
    () => props.partsSpecial,
    () => props.imagesCommon,
    () => props.imagesIndividual,
    () => props.imagesSpecial
  ],
  () => {
    loadDataFromProps();
  }
);

watch(
  cmsData,
  () => {
    nextTick(() => {
      setupClickHandlers();
      dispatchEvent('zcode-dom-updated', {});
    });
  },
  { deep: true }
);

watch([viewMode, previewArea], ([newViewMode, newPreviewArea]) => {
  if (newViewMode === 'manage' && newPreviewArea) {
    nextTick(() => {
      setupClickHandlers();
      if (enableContextMenu.value) {
        setupContextMenu();
      }
      // Shadow DOM内の値を更新（previewAreaが利用可能になった時）
      updateShadowDOMAllowDynamicContentInteraction();
      dispatchEvent('zcode-dom-updated', {});
    });
  } else {
    cleanupContextMenu();
  }
});

watch(currentMode, () => {
  nextTick(() => {
    dispatchEvent('zcode-dom-updated', {});
  });
});

// devRightPaddingの変更をlocalStorageに保存
watch(devRightPadding, (newValue) => {
  saveCMSSettings({ devRightPadding: newValue });
});

watch(allowDynamicContentInteraction, (newValue) => {
  // manageモードの時のみlocalStorageに保存（previewモードでは保存しない）
  if (viewMode.value === 'manage') {
    saveCMSSettings({ allowDynamicContentInteraction: newValue });
  }
  // useEditorMode()の値と同期
  allowDynamicContentInteractionBase.value = newValue;
  nextTick(() => {
    setupClickHandlers();
    // Shadow DOM内の値を更新
    updateShadowDOMAllowDynamicContentInteraction();
    dispatchEvent('zcode-dom-updated', {});
  });
});

watch(enableContextMenu, (newValue) => {
  saveCMSSettings({ enableContextMenu: newValue });
  if (newValue) {
    nextTick(() => {
      setupContextMenu();
    });
  } else {
    cleanupContextMenu();
  }
});

watch(showSaveConfirm, (newValue) => {
  saveCMSSettings({ showSaveConfirm: newValue });
});

// 保存ボタンクリック時の処理
function handleSave() {
  // 設定を確認
  if (!showSaveConfirm.value) {
    // 確認をスキップして直接保存
    executeSave();
    return;
  }

  // 確認ダイアログを表示
  showSaveConfirmDialog.value = true;
}

// 保存を実行する関数
function executeSave() {
  const requestId = createRequestId();
  dispatchEvent('save-request', {
    requestId,
    source: 'cms',
    targets: ['page', 'images-common', 'images-individual'],
    timestamp: Date.now()
  });
}

// 保存確認ダイアログで保存を確認した場合
function confirmSave() {
  showSaveConfirmDialog.value = false;
  executeSave();
}

// 保存確認ダイアログでキャンセルした場合
function cancelSave() {
  showSaveConfirmDialog.value = false;
}

defineExpose({
  getData,
  setData,
  validateData: validateDataUtil,
  cmsData,
  currentMode,
  switchMode,
  allowDynamicContentInteraction,
  devRightPadding,
  devRightPaddingValue,
  settingsPanelOpen
});
</script>
