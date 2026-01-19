<template>
  <div
    v-if="reorderSourcePath && currentMode === 'reorder'"
    class="zcode-reorder-panel"
    @click.stop
  >
    <div class="zcode-reorder-panel-header">
      <div
        class="zcode-panel-header-title"
        role="heading"
        aria-level="3"
      >
        {{ $t('reorderPanel.title') }}
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
        <span>{{ $t('reorderPanel.selectParent') }}</span>
      </button>
    </div>

    <div class="zcode-reorder-panel-content">
      <div class="zcode-reorder-panel-content-text">
        {{ $t('reorderPanel.instruction') }}
      </div>
      <div class="zcode-reorder-source">
        {{ $t('reorderPanel.source', { path: reorderSourcePath }) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, ChevronUp } from 'lucide-vue-next';

defineProps<{
  reorderSourcePath: string;
  currentMode: 'edit' | 'add' | 'reorder' | 'delete';
  canSelectParent: boolean;
}>();

defineEmits<{
  cancel: [];
  'select-parent': [];
}>();
</script>
