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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ImageData } from '../../../types';
import { X, Check } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  imagesCommon: ImageData[];
  imagesIndividual: ImageData[];
  imagesSpecial: ImageData[];
  currentValue?: string;
}>();

const emit = defineEmits<{
  'update:model-value': [imageId: string | null];
  close: [];
}>();

const activeTab = ref<'common' | 'individual' | 'special'>('common');
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

const close = () => {
  emit('close');
};
</script>
