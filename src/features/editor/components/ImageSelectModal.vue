<template>
  <div v-if="isOpen" class="zcode-image-modal" @click.self="close">
    <div class="zcode-image-modal-content" @click.stop>
      <div class="zcode-image-modal-header">
        <div class="zcode-image-modal-header-title" role="heading" aria-level="3">
          {{ $t('imagesManager.selectImage') }}
        </div>
        <button class="zcode-close-btn" :aria-label="$t('common.close')" @click="close">
          <X :size="18" />
        </button>
      </div>

      <!-- 現在選択中の画像 -->
      <div v-if="currentValue && getCurrentImage()" class="zcode-image-current">
        <div class="zcode-image-current-title" role="heading" aria-level="4">
          {{ $t('imagesManager.currentlySelected') }}
        </div>
        <div class="zcode-image-current-item">
          <img
            :src="getCurrentImage()?.url"
            :alt="getCurrentImage()?.name || ''"
            class="zcode-image-current-item-img"
          />
          <div class="zcode-image-current-name">
            {{ getCurrentImage()?.name }}
          </div>
        </div>
      </div>

      <!-- タブ: 共通 / 個別 / 特別 -->
      <div class="zcode-image-tabs">
        <button
          :class="{ active: activeTab === 'common' }"
          class="zcode-image-tab"
          @click="activeTab = 'common'"
        >
          {{ $t('dataViewer.common') }}
        </button>
        <button
          :class="{ active: activeTab === 'individual' }"
          class="zcode-image-tab"
          @click="activeTab = 'individual'"
        >
          {{ $t('dataViewer.individual') }}
        </button>
        <button
          :class="{ active: activeTab === 'special' }"
          class="zcode-image-tab"
          @click="activeTab = 'special'"
        >
          {{ $t('dataViewer.special') }}
        </button>
      </div>

      <!-- 特別: 画像追加（0枚でもタブから追加可能） -->
      <div v-if="activeTab === 'special'" class="zcode-image-add">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        />
        <button type="button" class="zcode-image-add-btn" @click="fileInputRef?.click()">
          <Plus :size="16" />
          <span>{{ $t('imagesManager.addImage') }}</span>
        </button>
      </div>

      <!-- 画像一覧 -->
      <div class="zcode-image-grid">
        <template v-if="activeTab === 'special'">
          <div
            v-for="image in currentImages"
            :key="image.id"
            :class="getSpecialItemClass(image)"
            @click="selectImage(image)"
          >
            <div v-if="reorderSourceImage === image.id" class="zcode-reorder-source-indicator">
              {{ $t('partsManager.source') }}
            </div>
            <img :src="image.url" :alt="image.name" class="zcode-image-item-img" />
            <div class="zcode-image-item-overlay">
              <div class="zcode-image-item-actions">
                <button
                  class="zcode-action-btn"
                  :title="$t('imagesManager.editImage')"
                  @click.stop="startEditing(image)"
                >
                  <Pencil :size="16" />
                </button>
                <button
                  class="zcode-action-btn"
                  :class="{ active: reorderSourceImage === image.id }"
                  :title="$t('partsManager.reorderPart')"
                  @click.stop="handleReorderClick(image.id)"
                >
                  <ArrowUpDown :size="16" />
                </button>
                <button
                  class="zcode-action-btn zcode-delete-btn"
                  :title="$t('partsManager.deletePartButton')"
                  @click.stop="handleDelete(image)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
            <div class="zcode-image-name">
              {{ image.name }}
            </div>
          </div>
          <div v-if="currentImages.length === 0" class="zcode-image-select-modal-empty">
            {{ $t('partsManager.noImagesRegistered') }}
          </div>
        </template>
        <template v-else>
          <div
            v-for="image in currentImages"
            :key="image.id"
            :class="{ selected: selectedImageId === image.id }"
            class="zcode-image-item"
            @click="selectImage(image)"
          >
            <img :src="image.url" :alt="image.name" class="zcode-image-item-img" />
            <div class="zcode-image-name">
              {{ image.name }}
            </div>
          </div>
        </template>
      </div>

      <!-- アクションボタン -->
      <div class="zcode-image-modal-actions">
        <button
          v-if="selectedImageId"
          class="zcode-btn-primary zcode-image-modal-actions-btn"
          @click="handleConfirm"
        >
          <Check :size="16" />
          <span>{{ $t('imagesManager.select') }}</span>
        </button>
      </div>
    </div>

    <!-- 特別画像の編集（画像管理と同様） -->
    <Teleport :to="teleportTo">
      <div
        v-if="editingImage"
        class="zcode-image-modal zcode-image-select-edit-overlay"
        @click.self="cancelEditing"
      >
        <div class="zcode-image-modal-content" data-edit-mode @click.stop>
          <div class="zcode-image-editor-header">
            <div class="zcode-image-editor-header-title" role="heading" aria-level="4">
              {{ $t('imagesManager.editImage') }}
            </div>
            <button class="zcode-close-btn" :aria-label="$t('common.close')" @click="cancelEditing">
              <X :size="18" />
            </button>
          </div>

          <div class="zcode-image-editor-form">
            <div class="zcode-image-preview-large">
              <img
                :src="editingImage.url"
                :alt="editingImage.name"
                class="zcode-image-preview-large-img"
              />
            </div>

            <div class="zcode-image-editor-replace">
              <input
                ref="replaceFileInputRef"
                type="file"
                accept="image/*"
                class="zcode-image-replace-input"
                @change="handleReplaceFile"
              />
              <button
                type="button"
                class="zcode-image-select-btn"
                @click="replaceFileInputRef?.click()"
              >
                <ImageIcon :size="16" />
                <span>{{ $t('imagesManager.replaceImage') }}</span>
              </button>
            </div>

            <div class="zcode-form-field">
              <label>{{ $t('imagesManager.imageId') }}</label>
              <input v-model="editingImage.id" type="text" class="zcode-text-input" disabled />
            </div>

            <div class="zcode-form-field">
              <label>{{ $t('imagesManager.imageName') }}</label>
              <input v-model="editingImage.name" type="text" class="zcode-text-input" />
            </div>

            <div class="zcode-image-editor-actions">
              <button class="zcode-btn-primary zcode-image-editor-actions-btn" @click="saveImage">
                <Check :size="16" />
                <span>{{ $t('common.confirm') }}</span>
              </button>
              <button
                class="zcode-btn-cancel zcode-image-editor-actions-btn"
                @click="cancelEditing"
              >
                <X :size="16" />
                <span>{{ $t('common.cancel') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useZcodeTeleportTo } from '../../../core/composables/useZcodeTeleportTo';
import type { ZeroCodeData, ImageData } from '../../../types';
import { useImagesManager } from '../../images-manager/composables/useImagesManager';
import { logger } from '../../../core/utils/logger';
import { X, Check, Plus, Pencil, ArrowUpDown, Trash2, Image as ImageIcon } from 'lucide-vue-next';

const { t } = useI18n();
const teleportTo = useZcodeTeleportTo();

const props = defineProps<{
  isOpen: boolean;
  cmsData: ZeroCodeData;
  currentValue?: string;
}>();

const emit = defineEmits<{
  'update:model-value': [imageId: string | null];
  close: [];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const replaceFileInputRef = ref<HTMLInputElement | null>(null);

const activeTab = ref<'common' | 'individual' | 'special'>('common');
const selectedImageId = ref<string | null>(props.currentValue || null);

const {
  activeCategory,
  reorderSourceImage,
  handleReorderClick,
  cancelReorder,
  editingImage,
  currentImages,
  addImage,
  deleteImage,
  startEditing,
  saveImage,
  cancelEditing,
  checkImageUsage
} = useImagesManager(props.cmsData);

watch(
  activeTab,
  (tab) => {
    activeCategory.value = tab;
    cancelReorder();
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedImageId.value = props.currentValue ?? null;
      activeTab.value = 'common';
      activeCategory.value = 'common';
      cancelEditing();
      cancelReorder();
    } else {
      cancelEditing();
      cancelReorder();
    }
  }
);

watch(
  () => props.currentValue,
  (v) => {
    if (props.isOpen) {
      selectedImageId.value = v ?? null;
    }
  }
);

const getCurrentImage = (): ImageData | null => {
  if (!props.currentValue) return null;
  const { common, individual, special } = props.cmsData.images;
  const allImages = [...common, ...individual, ...special];
  return allImages.find((img) => img.id === props.currentValue) || null;
};

const selectImage = (image: ImageData) => {
  selectedImageId.value = image.id;
};

const handleConfirm = () => {
  if (selectedImageId.value) {
    emit('update:model-value', selectedImageId.value);
    close();
  }
};

const close = () => {
  cancelEditing();
  cancelReorder();
  emit('close');
};

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    await addImage(file);
    if (input) input.value = '';
  } catch (error) {
    logger.error('画像追加エラー:', error);
    alert(t('imagesManager.addImageFailed'));
  }
}

function handleReplaceFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !editingImage.value) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target?.result as string;
    if (!base64 || !editingImage.value) return;
    editingImage.value.url = base64;
    editingImage.value.mimeType = file.type;
    editingImage.value.needsUpload = true;
  };
  reader.readAsDataURL(file);
  if (input) input.value = '';
}

function getSpecialItemClass(image: ImageData) {
  const classes = ['zcode-image-item'];
  if (selectedImageId.value === image.id) {
    classes.push('selected');
  }
  if (reorderSourceImage.value === image.id) {
    classes.push('zcode-reorder-source');
  }
  return classes.join(' ');
}

function handleDelete(image: ImageData) {
  const usages = checkImageUsage(image.id);
  if (usages.length > 0) {
    if (!confirm(t('imagesManager.deleteImageWithUsagesConfirm', { count: usages.length }))) {
      return;
    }
  } else {
    if (!confirm(t('imagesManager.deleteImageConfirm'))) {
      return;
    }
  }

  deleteImage(image.id);
  if (selectedImageId.value === image.id) {
    selectedImageId.value = null;
  }
}
</script>

<style scoped>
.zcode-image-select-edit-overlay {
  z-index: 3100;
}

.zcode-image-select-modal-empty {
  grid-column: 1 / -1;
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}
</style>
