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
          v-if="imagesSpecial.length > 0"
          :class="{ active: activeTab === 'special' }"
          class="zcode-image-tab"
          @click="activeTab = 'special'"
        >
          {{ $t('dataViewer.special') }}
        </button>
      </div>

      <!-- 画像一覧 -->
      <div class="zcode-image-grid">
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
      </div>

      <!-- 画像追加ボタン -->
      <div v-if="canAddInModal" class="zcode-image-add">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        />
        <button class="zcode-image-add-btn" @click="fileInput?.click()">
          <Plus :size="16" />
          <span>{{ $t('imagesManager.addImage') }}</span>
        </button>
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
        <button
          v-if="selectedImageId && canDeleteInModal"
          class="zcode-btn-danger zcode-image-modal-actions-btn"
          @click="handleDelete"
        >
          <Trash2 :size="16" />
          <span>{{ $t('common.delete') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ImageData } from '../../../types';
import { X, Plus, Check, Trash2 } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps<{
  isOpen: boolean;
  imagesCommon: ImageData[];
  imagesIndividual: ImageData[];
  imagesSpecial: ImageData[];
  currentValue?: string;
  imageModalActions?: {
    common?: { add?: boolean; delete?: boolean };
    individual?: { add?: boolean; delete?: boolean };
    special?: { add?: boolean; delete?: boolean };
  };
}>();

const emit = defineEmits<{
  'update:model-value': [imageId: string | null];
  'add-image': [imageData: ImageData, target: 'common' | 'individual' | 'special'];
  'delete-image': [imageId: string];
  close: [];
}>();

const activeTab = ref<'common' | 'individual' | 'special'>('common');
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImageId = ref<string | null>(props.currentValue || null);

const currentImages = computed(() => {
  if (activeTab.value === 'common') {
    return props.imagesCommon;
  } else if (activeTab.value === 'individual') {
    return props.imagesIndividual;
  } else {
    return props.imagesSpecial;
  }
});

const actionsForCurrentTab = computed(() => {
  const def = { add: false, delete: false };
  const c = props.imageModalActions;
  if (!c) return def;
  if (activeTab.value === 'common') return { ...def, ...c.common };
  if (activeTab.value === 'individual') return { ...def, ...c.individual };
  return { ...def, ...c.special };
});

const canAddInModal = computed(() => actionsForCurrentTab.value.add);
const canDeleteInModal = computed(() => actionsForCurrentTab.value.delete);

const getCurrentImage = (): ImageData | null => {
  if (!props.currentValue) return null;
  const allImages = [...props.imagesCommon, ...props.imagesIndividual, ...props.imagesSpecial];
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

const handleDelete = () => {
  if (!selectedImageId.value) return;

  if (confirm(t('imagesManager.deleteImageFromModalConfirm'))) {
    emit('delete-image', selectedImageId.value);
    selectedImageId.value = null;
  }
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target?.result as string;
    const newImage: ImageData = {
      id: `img-${Date.now()}`,
      name: file.name,
      url: base64,
      mimeType: file.type,
      needsUpload: true
    };
    // 現在選択中のタブに応じて追加先を決定
    const target =
      activeTab.value === 'common'
        ? 'common'
        : activeTab.value === 'individual'
          ? 'individual'
          : 'special';
    emit('add-image', newImage, target);
    // 画像を追加したら選択状態にするが、自動的に適用はしない
    selectedImageId.value = newImage.id;
  };
  reader.readAsDataURL(file);
};

const close = () => {
  emit('close');
};
</script>
