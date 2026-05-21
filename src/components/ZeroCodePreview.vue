<template>
  <PreviewArea
    ref="previewAreaRef"
    :cms-data="cmsData"
    :full-page-html="fullPageHtml"
    :allow-dynamic-content-interaction="allowDynamicContentInteraction"
  />
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import PreviewArea from '../features/preview/PreviewArea.vue';
import { useZeroCodeRenderer } from '../core/composables/useZeroCodeRenderer';
import type { ZeroCodeData } from '../types';

const props = defineProps<{
  cmsData: ZeroCodeData;
  allowDynamicContentInteraction?: boolean;
}>();

// 表示専用なので常に編集用属性を無効化（props の依存を明示）
const { fullPageHtml } = useZeroCodeRenderer(toRef(props, 'cmsData'), false);

// PreviewAreaの参照
const previewAreaRef = ref<InstanceType<typeof PreviewArea> | null>(null);

// PreviewAreaのpreviewAreaを公開（ZeroCodeCMSで使用）
const previewArea = computed(() => previewAreaRef.value?.previewArea || null);

defineExpose({
  previewArea
});
</script>
