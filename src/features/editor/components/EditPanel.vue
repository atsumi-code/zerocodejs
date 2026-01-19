<template>
  <div
    v-if="editingComponent && currentMode === 'edit'"
    class="zcode-edit-panel"
    @click.stop
  >
    <div class="zcode-edit-panel-header">
      <div
        class="zcode-panel-header-title"
        role="heading"
        aria-level="3"
      >
        {{ $t('editPanel.editing', { type: editingComponent.type }) }}
      </div>
      <button
        class="zcode-close-btn"
        :aria-label="$t('common.close')"
        @click="$emit('close')"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- 親要素選択ボタン -->
    <div
      v-if="canSelectParent"
      class="zcode-parent-selector"
    >
      <button
        class="zcode-parent-select-btn"
        @click="$emit('select-parent')"
      >
        <ChevronUp :size="16" />
        <span>{{ $t('addPanel.selectParent') }}</span>
      </button>
    </div>

    <!-- グループタブ（複数グループがある場合のみ表示） -->
    <div
      v-if="hasMultipleGroups"
      class="zcode-group-tabs"
    >
      <button
        :class="{ active: activeGroup === 'all' }"
        class="zcode-group-tab"
        @click="activeGroup = 'all'"
      >
        all
      </button>
      <button
        v-for="group in availableGroups"
        :key="group.name"
        :class="{ active: activeGroup === group.name }"
        class="zcode-group-tab"
        @click="activeGroup = group.name"
      >
        {{ group.name }}
      </button>
    </div>

    <!-- 方法2: パーツの全フィールドを表示して編集 -->
    <template v-if="filteredFields.length > 0">
      <div class="zcode-field-editor">
        <div
          v-for="field in filteredFields"
          :key="field.fieldName"
          class="zcode-field-item"
        >
          <div
            class="zcode-field-item-title"
            role="heading"
            aria-level="4"
          >
            {{ field.label }}
          </div>

          <!-- テキストフィールド（単一行） -->
          <div
            v-if="field.type === 'text'"
            class="zcode-text-editor"
          >
            <input
              type="text"
              :value="field.currentValue ?? ''"
              :placeholder="field.defaultValue"
              :maxlength="field.maxLength"
              :readonly="field.readonly"
              :disabled="field.disabled"
              :class="{ 'zcode-field-error': getFieldError(field.fieldName) }"
              class="zcode-text-input"
              @input="handleTextInput(field, $event)"
            >
            <div
              v-if="getFieldError(field.fieldName)"
              class="zcode-field-error-message"
            >
              {{ getFieldError(field.fieldName) }}
            </div>
            <div
              v-if="field.maxLength"
              class="zcode-field-counter"
            >
              {{ String(field.currentValue ?? '').length }} / {{ field.maxLength }}
            </div>
          </div>

          <!-- テキストエリアフィールド（複数行） -->
          <div
            v-if="field.type === 'textarea'"
            class="zcode-text-editor"
          >
            <textarea
              :value="field.currentValue ?? ''"
              :placeholder="field.defaultValue"
              :maxlength="field.maxLength"
              :readonly="field.readonly"
              :disabled="field.disabled"
              :class="{ 'zcode-field-error': getFieldError(field.fieldName) }"
              class="zcode-textarea"
              rows="4"
              @input="handleTextInput(field, $event)"
            />
            <div
              v-if="getFieldError(field.fieldName)"
              class="zcode-field-error-message"
            >
              {{ getFieldError(field.fieldName) }}
            </div>
            <div
              v-if="field.maxLength"
              class="zcode-field-counter"
            >
              {{ String(field.currentValue ?? '').length }} / {{ field.maxLength }}
            </div>
          </div>

          <!-- リッチテキストエディタ -->
          <div
            v-if="field.type === 'rich'"
            class="zcode-rich-text-editor-wrapper"
          >
            <RichTextEditor
              :model-value="field.currentValue ?? ''"
              :placeholder="field.defaultValue"
              @update:model-value="handleRichTextUpdate(field, $event)"
            />
            <div
              v-if="getFieldError(field.fieldName)"
              class="zcode-field-error-message"
            >
              {{ getFieldError(field.fieldName) }}
            </div>
          </div>

          <!-- ラジオボタン -->
          <div
            v-if="field.type === 'radio'"
            class="zcode-radio-editor"
          >
            <div class="zcode-radio-group">
              <label
                v-for="option in field.options"
                :key="option"
                class="zcode-radio-item"
              >
                <input
                  v-model="field.currentValue"
                  type="radio"
                  :name="field.fieldName"
                  :value="option"
                  @change="$emit('save-field', field)"
                >
                <span class="zcode-radio-item-label">{{ option }}</span>
              </label>
            </div>
          </div>

          <!-- チェックボックス -->
          <div
            v-if="field.type === 'checkbox'"
            class="zcode-checkbox-editor"
          >
            <div class="zcode-checkbox-group">
              <label
                v-for="option in field.options"
                :key="option"
                class="zcode-checkbox-item"
              >
                <input
                  v-model="field.currentValue"
                  type="checkbox"
                  :value="option"
                  @change="$emit('save-field', field)"
                >
                <span class="zcode-checkbox-item-label">{{ option }}</span>
              </label>
            </div>
          </div>

          <!-- セレクトボックス（単一選択） -->
          <div
            v-if="field.type === 'select'"
            class="zcode-select-editor"
          >
            <select
              v-model="field.currentValue"
              class="zcode-select"
              @change="$emit('save-field', field)"
            >
              <option
                v-for="option in field.options"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </div>

          <!-- セレクトボックス（複数選択） -->
          <div
            v-if="field.type === 'select-multiple'"
            class="zcode-select-editor"
          >
            <select
              v-model="field.currentValue"
              class="zcode-select"
              multiple
              :size="Math.min(field.options?.length || 3, 5)"
              @change="$emit('save-field', field)"
            >
              <option
                v-for="option in field.options"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </div>

          <!-- タグ選択フィールド -->
          <div
            v-if="field.type === 'tag'"
            class="zcode-tag-editor"
          >
            <select
              v-model="field.currentValue"
              class="zcode-select"
              @change="$emit('save-field', field)"
            >
              <option
                v-for="tag in field.options"
                :key="tag"
                :value="tag"
              >
                {{ tag }}
              </option>
            </select>
            <div class="zcode-tag-preview">
              現在のタグ: <code>&lt;{{ field.currentValue }}&gt;</code>
            </div>
          </div>

          <!-- ブール値（z-if用の単一チェックボックス） -->
          <div
            v-if="field.type === 'boolean'"
            class="zcode-boolean-editor"
          >
            <label class="zcode-checkbox-item">
              <input
                v-model="field.currentValue"
                type="checkbox"
                @change="$emit('save-field', field)"
              >
              <span class="zcode-checkbox-item-label">{{ field.label }}を表示</span>
            </label>
          </div>

          <!-- 画像フィールド -->
          <div
            v-if="field.type === 'image'"
            class="zcode-image-editor"
          >
            <div class="zcode-image-editor-buttons">
              <button
                class="zcode-image-select-btn"
                @click="openImageModal(field)"
              >
                <Image :size="16" />
                <span>{{ field.currentValue ? $t('editPanel.replaceImage') : $t('editPanel.selectImage') }}</span>
              </button>
              <button
                v-if="field.currentValue"
                class="zcode-image-clear-btn"
                :title="$t('editPanel.clearImageTitle')"
                @click="clearImage(field)"
              >
                <X :size="16" />
                <span>{{ $t('editPanel.clearImage') }}</span>
              </button>
            </div>
            <!-- プレビュー -->
            <div
              v-if="getImageUrl(field.currentValue)"
              class="zcode-image-preview"
            >
              <img
                :src="getImageUrl(field.currentValue) || ''"
                :alt="field.label"
                class="zcode-image-preview-img"
              >
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 編集可能なフィールドが無い場合の情報表示 -->
    <div
      v-else-if="!hasMultipleGroups || filteredFields.length === 0"
      class="zcode-edit-fields"
    >
      <div class="zcode-edit-fields-text">
        {{ $t('editPanel.id', { id: editingComponent.id }) }}
      </div>
      <div class="zcode-edit-fields-text">
        Type: {{ editingComponent.type }}
      </div>
    </div>

    <!-- 画像選択モーダル -->
    <ImageSelectModal
      :is-open="imageModalOpen"
      :images-common="imagesCommon"
      :images-individual="imagesIndividual"
      :images-special="imagesSpecial"
      :current-value="currentImageField?.currentValue || undefined"
      @update:model-value="handleImageSelect"
      @add-image="handleAddImage"
      @delete-image="handleDeleteImage"
      @close="closeImageModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ComponentData, ImageData } from '../../../types';
import RichTextEditor from './RichTextEditor.vue';
import ImageSelectModal from './ImageSelectModal.vue';
import { X, ChevronUp, Image } from 'lucide-vue-next';

const props = defineProps<{
  editingComponent: ComponentData | null;
  editingAvailableFields: Array<{
    type:
      | 'text'
      | 'textarea'
      | 'radio'
      | 'checkbox'
      | 'boolean'
      | 'rich'
      | 'image'
      | 'select'
      | 'select-multiple'
      | 'tag';
    fieldName: string;
    groupName?: string; // グループ名（オプション）
    label: string;
    defaultValue?: string;
    options?: string[];
    currentValue: any;
    optional?: boolean;
    required?: boolean;
    maxLength?: number;
    readonly?: boolean;
    disabled?: boolean;
  }>;
  fieldErrors?: Record<string, string>;
  currentMode: 'edit' | 'add' | 'reorder' | 'delete';
  canSelectParent: boolean;
  imagesCommon: ImageData[];
  imagesIndividual: ImageData[];
  imagesSpecial: ImageData[];
}>();

const activeGroup = ref<string | 'all' | undefined>('all');

// 利用可能なグループを計算
const availableGroups = computed(() => {
  const groups = new Map<string, number>();

  props.editingAvailableFields.forEach((field) => {
    // グループ名がない場合は "other" として扱う
    const groupName = field.groupName || 'other';
    groups.set(groupName, (groups.get(groupName) || 0) + 1);
  });

  return Array.from(groups.entries()).map(([name, count]) => ({
    name,
    count
  }));
});

// 複数グループがあるかチェック（グループが2つ以上ある場合のみタブを表示）
const hasMultipleGroups = computed(() => availableGroups.value.length > 1);

// アクティブなグループのフィールドをフィルタリング
const filteredFields = computed(() => {
  // グループ化の記述がない場合（全てのフィールドにgroupNameがない）は全て表示
  if (!hasMultipleGroups.value) {
    return props.editingAvailableFields;
  }

  // 「all」が選択されている場合は全てのフィールドを表示
  if (activeGroup.value === 'all') {
    return props.editingAvailableFields;
  }

  // グループ化されている場合は、アクティブなグループのフィールドのみ表示
  return props.editingAvailableFields.filter((field) => {
    const fieldGroup = field.groupName || 'other';
    return fieldGroup === activeGroup.value;
  });
});

// 初期化：複数グループがある場合は「all」を選択
watch(
  () => hasMultipleGroups.value,
  (hasMultiple) => {
    if (hasMultiple) {
      activeGroup.value = 'all';
    } else {
      activeGroup.value = undefined;
    }
  },
  { immediate: true }
);

// editingAvailableFieldsが変更されたときに、アクティブなグループを再設定
watch(
  () => props.editingAvailableFields,
  () => {
    if (hasMultipleGroups.value) {
      // 「all」が選択されている場合はそのまま
      if (activeGroup.value === 'all') {
        return;
      }
      // 現在のアクティブグループが存在するか確認
      const currentGroupExists = availableGroups.value.some((g) => g.name === activeGroup.value);
      if (!currentGroupExists) {
        activeGroup.value = 'all';
      }
    }
  },
  { deep: true }
);

const emit = defineEmits<{
  close: [];
  'select-parent': [];
  'save-field': [field: any];
  'add-image': [imageData: ImageData, target: 'common' | 'individual' | 'special'];
  'delete-image': [imageId: string];
}>();

const localFieldErrors = ref<Record<string, string>>({});

function validateField(field: any) {
  const label = field.label || field.fieldName;

  const raw = field.currentValue;
  const value =
    field.type === 'rich' && typeof raw === 'string' && raw.trim() === '<p></p>' ? '' : raw ?? '';

  if (field.required) {
    if (value === '' || value === undefined || value === null) {
      return `${label}は必須です`;
    }
  }

  if (typeof field.maxLength === 'number' && field.maxLength > 0) {
    const len = String(value).length;
    if (len > field.maxLength) {
      return `${label}は${field.maxLength}文字以内で入力してください`;
    }
  }

  return null;
}

function setLocalFieldError(fieldName: string, message: string | null) {
  if (message) {
    localFieldErrors.value[fieldName] = message;
  } else {
    delete localFieldErrors.value[fieldName];
  }
}

function getFieldError(fieldName: string) {
  return localFieldErrors.value[fieldName] || props.fieldErrors?.[fieldName] || null;
}

const imageModalOpen = ref(false);
const currentImageField = ref<any>(null);

const openImageModal = (field: any) => {
  currentImageField.value = field;
  imageModalOpen.value = true;
};

const closeImageModal = () => {
  imageModalOpen.value = false;
  currentImageField.value = null;
};

const clearImage = (field: any) => {
  field.currentValue = '';
  emit('save-field', field);
};

const handleImageSelect = (imageId: string | null) => {
  if (currentImageField.value) {
    currentImageField.value.currentValue = imageId || '';
    emit('save-field', currentImageField.value);
  }
};

const handleAddImage = (imageData: ImageData, target: 'common' | 'individual' | 'special') => {
  emit('add-image', imageData, target);
  // 画像を追加しただけでは適用しない（選択ボタンを押したタイミングで適用）
};

const handleDeleteImage = (imageId: string) => {
  emit('delete-image', imageId);
  if (currentImageField.value?.currentValue === imageId) {
    currentImageField.value.currentValue = '';
    emit('save-field', currentImageField.value);
  }
};

const getImageUrl = (imageId: string | null | undefined): string | null => {
  if (!imageId) return null;
  const allImages = [...props.imagesCommon, ...props.imagesIndividual, ...props.imagesSpecial];
  const image = allImages.find((img) => img.id === imageId);
  return image?.url || null;
};

const handleTextInput = (field: any, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  field.currentValue = target.value;
  setLocalFieldError(field.fieldName, validateField(field));
  emit('save-field', field);
};

const handleRichTextUpdate = (field: any, value: string) => {
  // オプショナルフィールドで空文字列の場合はundefinedに変換
  if (field.optional && value === '') {
    field.currentValue = undefined;
  } else {
    field.currentValue = value;
  }
  setLocalFieldError(field.fieldName, validateField(field));
  emit('save-field', field);
};
</script>
