<template>
  <div
    v-if="isVisible"
    class="zcode-context-menu"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    @click.stop
  >
    <button
      class="zcode-context-menu-item"
      :class="{ active: currentMode === 'edit' }"
      @click="handleModeSelect('edit')"
    >
      <Pencil :size="16" />
      <span>{{ $t('contextMenu.edit') }}</span>
    </button>
    <button
      class="zcode-context-menu-item"
      :class="{ active: currentMode === 'add' }"
      @click="handleModeSelect('add')"
    >
      <Plus :size="16" />
      <span>{{ $t('contextMenu.add') }}</span>
    </button>
    <button
      class="zcode-context-menu-item"
      :class="{ active: currentMode === 'reorder' }"
      @click="handleModeSelect('reorder')"
    >
      <ArrowUpDown :size="16" />
      <span>{{ $t('contextMenu.reorder') }}</span>
    </button>
    <button
      class="zcode-context-menu-item"
      :class="{ active: currentMode === 'delete' }"
      @click="handleModeSelect('delete')"
    >
      <Trash2 :size="16" />
      <span>{{ $t('contextMenu.delete') }}</span>
    </button>
    <div class="zcode-context-menu-divider" />
    <button
      class="zcode-context-menu-item"
      @click="handleClose"
    >
      <X :size="16" />
      <span>{{ $t('contextMenu.close') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Plus, ArrowUpDown, Trash2, X } from 'lucide-vue-next';
import type { EditorMode } from '../composables/useEditorMode';

defineProps<{
  isVisible: boolean;
  position: { x: number; y: number };
  currentMode: EditorMode;
}>();

const emit = defineEmits<{
  'select-mode': [mode: EditorMode];
  'close': [];
}>();

function handleModeSelect(mode: EditorMode) {
  emit('select-mode', mode);
  emit('close');
}

function handleClose() {
  emit('close');
}
</script>

