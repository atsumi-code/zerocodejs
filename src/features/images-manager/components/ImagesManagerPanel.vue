<template>
  <div class="zcode-images-manager">
    <!-- 共通/個別タブ ＋ 画像追加ボタン（右上にコンパクト配置） -->
    <div class="zcode-images-category-tabs">
      <div class="zcode-images-category-tab-group">
        <button
          v-for="category in categoryTabs"
          :key="category"
          :class="{ active: activeCategory === category }"
          class="zcode-category-tab"
          @click="activeCategory = category"
        >
          {{ category === 'common' ? $t('dataViewer.common') : category === 'individual' ? $t('dataViewer.individual') : $t('dataViewer.special') }}
        </button>
        <button
          class="zcode-help-btn"
          :title="$t('dataViewer.categoryInfo.title')"
          @click="showCategoryInfoModal = true"
        >
          <HelpCircle :size="14" />
        </button>
      </div>
      <div class="zcode-images-add-wrapper">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        >
        <button
          class="zcode-btn-primary zcode-images-add-btn"
          @click="fileInput?.click()"
        >
          <Plus :size="14" />
          <span>{{ $t('imagesManager.addImage') }}</span>
        </button>
      </div>
    </div>

    <div class="zcode-images-manager-content">
      <!-- 画像一覧 -->
      <div class="zcode-images-grid">
        <div
          v-for="image in currentImages"
          :key="image.id"
          :class="getImageItemClass(image)"
          @click="startEditing(image)"
        >
          <!-- 並べ替え中の移動元インジケーター -->
          <div
            v-if="reorderSourceImage === image.id"
            class="zcode-reorder-source-indicator"
          >
            {{ $t('partsManager.source') }}
          </div>
          <img
            :src="image.url"
            :alt="image.name"
          >
          <!-- ホバー時に表示されるアクションボタン -->
          <div class="zcode-image-item-overlay">
            <div class="zcode-image-item-actions">
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
          <div class="zcode-image-item-name">
            {{ image.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 画像編集モーダル -->
    <Teleport to="body">
      <div
        v-if="editingImage"
        class="zcode-image-modal"
        @click.self="cancelEditing"
      >
        <div
          class="zcode-image-modal-content"
          data-edit-mode
          @click.stop
        >
          <div class="zcode-image-editor-header">
            <div
              class="zcode-image-editor-header-title"
              role="heading"
              aria-level="4"
            >
              {{ $t('imagesManager.editImage') }}
            </div>
            <button
              class="zcode-close-btn"
              :aria-label="$t('common.close')"
              @click="cancelEditing"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="zcode-image-editor-form">
            <div class="zcode-image-preview-large">
              <img
                :src="editingImage.url"
                :alt="editingImage.name"
                class="zcode-image-preview-large-img"
              >
            </div>

            <div class="zcode-form-field">
              <label>{{ $t('imagesManager.imageId') }}</label>
              <input
                v-model="editingImage.id"
                type="text"
                class="zcode-text-input"
                disabled
              >
            </div>

            <div class="zcode-form-field">
              <label>{{ $t('imagesManager.imageName') }}</label>
              <input
                v-model="editingImage.name"
                type="text"
                class="zcode-text-input"
              >
            </div>

            <div class="zcode-image-editor-actions">
              <button
                class="zcode-btn-primary zcode-image-editor-actions-btn"
                @click="saveImage"
              >
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

    <!-- カテゴリ情報モーダル -->
    <Teleport to="body">
      <div
        v-if="showCategoryInfoModal"
        class="zcode-help-modal-overlay"
        @click.self="showCategoryInfoModal = false"
      >
        <div
          class="zcode-help-modal"
          @click.stop
        >
          <div class="zcode-help-modal-header">
            <div
              class="zcode-help-modal-header-title"
              role="heading"
              aria-level="3"
            >
              <Info
                :size="20"
                class="zcode-css-warning-modal-title-icon"
              />
              <span>{{ $t('dataViewer.categoryInfo.title') }}</span>
            </div>
            <button
              class="zcode-close-btn"
              :aria-label="$t('common.close')"
              @click="showCategoryInfoModal = false"
            >
              <X :size="18" />
            </button>
          </div>
          <div class="zcode-help-modal-body">
            <div class="zcode-help-section">
              <div
                class="zcode-help-section-title"
                role="heading"
                aria-level="4"
              >
                {{ $t('dataViewer.categoryInfo.common.title') }}
              </div>
              <div class="zcode-help-section-item">
                {{ $t('dataViewer.categoryInfo.common.description') }}
              </div>
            </div>
            <div class="zcode-help-section">
              <div
                class="zcode-help-section-title"
                role="heading"
                aria-level="4"
              >
                {{ $t('dataViewer.categoryInfo.individual.title') }}
              </div>
              <div class="zcode-help-section-item">
                {{ $t('dataViewer.categoryInfo.individual.description') }}
              </div>
            </div>
            <div class="zcode-help-section">
              <div
                class="zcode-help-section-title"
                role="heading"
                aria-level="4"
              >
                {{ $t('dataViewer.categoryInfo.special.title') }}
              </div>
              <div class="zcode-help-section-item">
                {{ $t('dataViewer.categoryInfo.special.description') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ZeroCodeData, ImageData, CMSConfig } from '../../../types';
import { useImagesManager } from '../composables/useImagesManager';
import { Plus, Trash2, X, Check, ArrowUpDown, HelpCircle, Info } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps<{
  cmsData: ZeroCodeData;
  config?: Partial<CMSConfig>;
}>();


const fileInput = ref<HTMLInputElement | null>(null);
const showCategoryInfoModal = ref(false);

// タブの順序を制御
const categoryOrder = computed(() => 
  props.config?.categoryOrder || 'common'
);

const categoryTabs = computed(() => {
  const tabs: Array<'common' | 'individual' | 'special'> = [];
  const hasSpecial = props.cmsData.images.special.length > 0;
  
  if (categoryOrder.value === 'individual') {
    tabs.push('individual', 'common');
    if (hasSpecial) tabs.push('special');
  } else if (categoryOrder.value === 'special') {
    if (hasSpecial) tabs.push('special');
    tabs.push('common', 'individual');
  } else {
    tabs.push('common', 'individual');
    if (hasSpecial) tabs.push('special');
  }
  
  return tabs as readonly ('common' | 'individual' | 'special')[];
});

const {
  // 並べ替え
  reorderSourceImage,
  handleReorderClick,

  // 既存
  activeCategory,
  editingImage,
  currentImages,
  addImage,
  deleteImage: deleteImageInternal,
  startEditing,
  saveImage,
  cancelEditing,
  checkImageUsage
} = useImagesManager(props.cmsData);

// categoryOrderに基づいて初期値を設定
if (props.config?.categoryOrder === 'individual') {
  activeCategory.value = 'individual';
} else if (props.config?.categoryOrder === 'special') {
  activeCategory.value = 'special';
}

// activeCategoryをexpose
defineExpose({
  activeCategory
});

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    await addImage(file);
    // ファイル入力をリセット
    if (input) {
      input.value = '';
    }
  } catch (error) {
    console.error('画像追加エラー:', error);
    alert(t('imagesManager.addImageFailed'));
  }
}

// アイテムのクラスを動的に生成
function getImageItemClass(image: ImageData) {
  const classes = ['zcode-image-item'];

  // 並べ替えの移動元を強調
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

  deleteImageInternal(image.id);
}
</script>
