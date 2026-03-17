<template>
  <div class="zcode-toolbar">
    <button
      :class="{ active: viewMode === 'preview' }"
      class="zcode-view-mode-btn zcode-view-mode-preview"
      @click="$emit('switch-view-mode', viewMode === 'preview' ? 'manage' : 'preview')"
    >
      <Eye :size="16" />
      <span>{{ $t('toolbar.viewMode') }}</span>
    </button>
    <button
      v-if="!availableModes || availableModes.includes('edit')"
      :class="{ active: currentMode === 'edit' && viewMode === 'manage' }"
      class="zcode-mode-btn zcode-mode-edit"
      @click="handleModeClick('edit')"
    >
      <Pencil :size="16" />
      <span>{{ $t('toolbar.editMode') }}</span>
    </button>
    <button
      v-if="!availableModes || availableModes.includes('add')"
      :class="{ active: currentMode === 'add' && viewMode === 'manage' }"
      class="zcode-mode-btn zcode-mode-add"
      @click="handleModeClick('add')"
    >
      <Plus :size="16" />
      <span>{{ $t('toolbar.addMode') }}</span>
    </button>
    <button
      v-if="!availableModes || availableModes.includes('reorder')"
      :class="{ active: currentMode === 'reorder' && viewMode === 'manage' }"
      class="zcode-mode-btn zcode-mode-reorder"
      @click="handleModeClick('reorder')"
    >
      <ArrowUpDown :size="16" />
      <span>{{ $t('toolbar.reorderMode') }}</span>
    </button>
    <button
      v-if="!availableModes || availableModes.includes('delete')"
      :class="{ active: currentMode === 'delete' && viewMode === 'manage' }"
      class="zcode-mode-btn zcode-mode-delete"
      @click="handleModeClick('delete')"
    >
      <Trash2 :size="16" />
      <span>{{ $t('toolbar.deleteMode') }}</span>
    </button>
    <button
      v-if="enableManagePanel"
      :class="{ active: managePanelOpen }"
      class="zcode-mode-btn zcode-mode-manage"
      @click="$emit('open-manage-panel')"
    >
      <Package :size="16" />
      <span>{{ $t('toolbar.manageMode') }}</span>
    </button>
    <button
      class="zcode-settings-btn"
      :title="$t('toolbar.settings')"
      @click="$emit('open-settings')"
    >
      <Settings :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import { Pencil, Plus, ArrowUpDown, Trash2, Eye, Settings, Package } from 'lucide-vue-next';

type ModeType = 'edit' | 'add' | 'reorder' | 'delete';
type ViewModeType = 'preview' | 'manage';

const props = defineProps<{
  currentMode: ModeType;
  viewMode: ViewModeType;
  availableModes?: ModeType[];
  allowDynamicContentInteraction: boolean;
  enableManagePanel?: boolean;
  managePanelOpen?: boolean;
}>();

const emit = defineEmits<{
  'switch-mode': [mode: ModeType];
  'switch-view-mode': [mode: ViewModeType];
  'open-settings': [];
  'open-manage-panel': [];
  'toggle-dynamic-content': [enabled: boolean];
}>();

const handleModeClick = (mode: ModeType) => {
  if (props.viewMode === 'preview') {
    emit('switch-view-mode', 'manage');
    nextTick(() => {
      emit('switch-mode', mode);
    });
  } else {
    emit('switch-mode', mode);
  }
};
</script>
