<template>
  <div
    v-if="addTargetPath"
    class="zcode-add-panel"
    @click.stop
  >
    <div class="zcode-add-panel-header">
      <div
        class="zcode-panel-header-title"
        role="heading"
        aria-level="3"
      >
        {{ $t('addPanel.title') }}
      </div>
      <button
        class="zcode-close-btn"
        :aria-label="$t('common.close')"
        @click="$emit('cancel')"
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

    <!-- 共通/個別/動的タブ -->
    <div class="zcode-part-category-tabs">
      <button
        v-for="category in categoryTabs"
        :key="category"
        :class="{ active: addPartCategory === category && addTypeTab !== 'selected' }"
        class="zcode-category-tab"
        @click="$emit('category-tab-click', category as 'common' | 'individual' | 'special')"
      >
        {{ category === 'common' ? $t('addPanel.category.common') : category === 'individual' ? $t('addPanel.category.individual') : $t('dataViewer.special') }}
      </button>
      <button
        :class="{ active: addTypeTab === 'selected' }"
        class="zcode-category-tab"
        @click="$emit('type-tab-click', 'selected')"
      >
        {{ $t('addPanel.category.selected') }}
      </button>
    </div>

    <!-- Typeタブ（選択したパーツタブがアクティブでない場合のみ表示） -->
    <div
      v-if="availablePartTypes.length > 0 && addTypeTab !== 'selected'"
      class="zcode-type-tabs"
    >
      <button
        :class="{ active: addTypeTab === 'all' }"
        class="zcode-type-tab"
        @click="$emit('type-tab-click', 'all')"
      >
        all
      </button>
      <button
        v-for="type in availablePartTypes"
        :key="type"
        :class="{ active: addTypeTab === type }"
        class="zcode-type-tab"
        @click="$emit('type-tab-click', type)"
      >
        {{ type }}
      </button>
    </div>

    <div class="zcode-add-panel-content">
      <!-- パーツ一覧（typeをセクション、partをボタンとして表示） -->
      <div class="zcode-part-list">
        <!-- 選択したパーツタブがアクティブな場合のみ表示 -->
        <div
          v-show="addTypeTab === 'selected'"
          class="zcode-part-type-section"
        >
          <div
            class="zcode-type-section-title"
            role="heading"
            aria-level="3"
          >
            {{ $t('addPanel.activeParts') }}
          </div>
          <div class="zcode-type-section-description">
            {{ $t('addPanel.activePartsDescription') }}
          </div>
          <div
            v-if="clickedComponent && addSelectedPart && addSelectedType"
            class="zcode-module-buttons"
          >
            <div
              :class="{ active: true }"
              class="zcode-module-preview"
            >
              <div class="zcode-module-preview-header">
                <div class="zcode-module-preview-label zcode-module-preview-label-header">
                  {{ $t('addPanel.activeParts') }}
                </div>
                <button
                  type="button"
                  class="zcode-module-preview-icon-btn"
                  :aria-label="$t('common.preview')"
                  @click.stop="openPreviewModalForActiveParts()"
                >
                  <ZoomIn :size="14" />
                </button>
              </div>
              <div
                class="zcode-module-preview-content"
                v-html="getClickedComponentPreviewHtml()"
              />
            </div>
          </div>
          <div
            v-else
            class="zcode-empty-parts"
          >
            <div class="zcode-empty-parts-text">
              {{ $t('addPanel.clickPartInPreview') }}
            </div>
          </div>
        </div>
        <div v-show="addTypeTab !== 'selected'">
          <div
            v-for="typeGroup in groupedPartsByType"
            :key="typeGroup.type"
            class="zcode-part-type-section"
          >
            <div
              class="zcode-type-section-title"
              role="heading"
              aria-level="3"
            >
              {{ typeGroup.type }}
            </div>
            <div
              v-if="typeGroup.description"
              class="zcode-type-section-description"
            >
              {{ typeGroup.description }}
            </div>
            <div class="zcode-module-buttons">
              <div
                v-for="part in typeGroup.parts"
                :key="part.title"
                :class="{
                  active:
                    addTypeTab === 'selected' &&
                    clickedComponent?.part_id === part.id &&
                    clickedComponent?.id
                      ? true
                      : addTypeTab !== 'selected' && addSelectedPart?.id === part.id
                }"
                class="zcode-module-preview"
                @click="$emit('select-part', typeGroup.typeData, part)"
              >
                <div class="zcode-module-preview-header">
                  <div class="zcode-module-preview-label zcode-module-preview-label-header">
                    {{ part.title }}
                  </div>
                  <button
                    type="button"
                    class="zcode-module-preview-icon-btn"
                    :aria-label="$t('common.preview')"
                    @click.stop="openPreviewModal(typeGroup.typeData, part)"
                  >
                    <ZoomIn :size="14" />
                  </button>
                </div>
                <div
                  class="zcode-module-preview-content"
                  v-html="getPartPreviewHtml(typeGroup.typeData, part)"
                />
              </div>
            </div>
          </div>
          <div
            v-if="groupedPartsByType.length === 0 && !addSelectedPart"
            class="zcode-empty-parts"
          >
            <div class="zcode-empty-parts-text">
              {{ $t('addPanel.noPartsAvailable') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 追加位置選択（パーツ選択後に表示） -->
    <div
      v-if="addSelectedPart"
      class="zcode-insert-position"
    >
      <div class="zcode-insert-header">
        <div
          class="zcode-insert-position-title"
          role="heading"
          aria-level="4"
        >
          追加位置を選択
        </div>
        <label class="zcode-keep-adding-label zcode-keep-adding-label-position">
          <input
            type="checkbox"
            :checked="keepAdding"
            class="zcode-keep-adding-checkbox"
            @change="$emit('update-keep-adding', ($event.target as HTMLInputElement).checked)"
          >
          <span>{{ $t('addPanel.continueAdding') }}</span>
        </label>
      </div>
      <div class="zcode-insert-buttons">
        <button
          class="zcode-insert-btn zcode-insert-before"
          @click="$emit('confirm-add', 'before')"
        >
          {{ $t('addPanel.addBefore') }}
        </button>
        <button
          class="zcode-insert-btn zcode-insert-after"
          @click="$emit('confirm-add', 'after')"
        >
          {{ $t('addPanel.addAfter') }}
        </button>
      </div>
    </div>

    <!-- パーツ拡大プレビューモーダル（追加パネル用） -->
    <Teleport to="body">
      <div
        v-if="showPreviewModal && previewTarget"
        class="zcode-preview-modal"
        @click="closePreviewModal"
      >
        <div
          class="zcode-preview-modal-content"
          @click.stop
        >
          <div class="zcode-preview-modal-header">
            <div
              class="zcode-preview-modal-header-title"
              role="heading"
              aria-level="4"
            >
              {{ $t('common.preview') }}:
              {{ previewTarget.isActiveParts ? $t('addPanel.activeParts') : previewTarget.part.title }}
            </div>
            <button
              class="zcode-close-btn"
              @click="closePreviewModal"
            >
              <X :size="18" />
            </button>
          </div>
          <div
            class="zcode-preview-modal-body"
            v-html="
              previewTarget.isActiveParts
                ? getClickedComponentPreviewHtml()
                : getPartPreviewHtml(previewTarget.type, previewTarget.part)
            "
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TypeData, PartData, ComponentData, CMSConfig } from '../../../types';
import { X, ChevronUp, ZoomIn } from 'lucide-vue-next';

const props = defineProps<{
  addTargetPath: string | null;
  addPartCategory: 'common' | 'individual' | 'special';
  addTypeTab: string | 'all' | 'selected' | null;
  addSelectedPart: PartData | null;
  addSelectedType: TypeData | null;
  clickedComponent: ComponentData | null;
  availablePartTypes: string[];
  groupedPartsByType: Array<{
    type: string;
    description?: string;
    typeData: TypeData;
    parts: PartData[];
  }>;
  canSelectParent: boolean;
  getPartPreviewHtml: (type: TypeData, part: PartData) => string;
  getClickedComponentPreviewHtml: () => string;
  keepAdding: boolean;
  hasSpecialParts: boolean;
  config?: Partial<CMSConfig>;
}>();

// タブの順序を制御
const categoryOrder = computed(() => 
  props.config?.categoryOrder || 'common'
);

const categoryTabs = computed(() => {
  const tabs: Array<'common' | 'individual' | 'special'> = [];
  
  if (categoryOrder.value === 'individual') {
    tabs.push('individual', 'common');
    if (props.hasSpecialParts) tabs.push('special');
  } else if (categoryOrder.value === 'special') {
    if (props.hasSpecialParts) tabs.push('special');
    tabs.push('common', 'individual');
  } else {
    tabs.push('common', 'individual');
    if (props.hasSpecialParts) tabs.push('special');
  }
  return tabs as readonly ('common' | 'individual' | 'special')[];
});

defineEmits<{
  cancel: [];
  'select-parent': [];
  'category-tab-click': [category: 'common' | 'individual' | 'special'];
  'type-tab-click': [type: string | 'all' | 'selected'];
  'select-part': [type: TypeData, part: PartData];
  'confirm-add': [position: 'before' | 'after'];
  'update-keep-adding': [value: boolean];
}>();

const showPreviewModal = ref(false);
const previewTarget = ref<{ type: TypeData; part: PartData; isActiveParts?: boolean } | null>(null);

function openPreviewModal(type: TypeData, part: PartData) {
  previewTarget.value = { type, part, isActiveParts: false };
  showPreviewModal.value = true;
}

function openPreviewModalForActiveParts() {
  if (props.addSelectedType && props.addSelectedPart) {
    previewTarget.value = {
      type: props.addSelectedType,
      part: props.addSelectedPart,
      isActiveParts: true
    };
    showPreviewModal.value = true;
  }
}

function closePreviewModal() {
  showPreviewModal.value = false;
  previewTarget.value = null;
}
</script>
