<template>
  <div class="zcode-data-viewer">
    <div class="zcode-data-viewer-header">
      <!-- コンテンツ切り替えタブ（左側） -->
      <div class="zcode-data-viewer-content-tabs">
        <button
          :class="{ active: internalActiveTab === 'page' }"
          class="zcode-data-viewer-content-tab"
          @click="internalActiveTab = 'page'"
        >
          {{ $t('dataViewer.page') }}
        </button>
        <button
          :class="{ active: internalActiveTab === 'parts' }"
          class="zcode-data-viewer-content-tab"
          @click="internalActiveTab = 'parts'"
        >
          {{ $t('dataViewer.parts') }}
        </button>
        <button
          :class="{ active: internalActiveTab === 'images' }"
          class="zcode-data-viewer-content-tab"
          @click="internalActiveTab = 'images'"
        >
          {{ $t('dataViewer.images') }}
        </button>
      </div>
      <!-- 表示フォーマット/カテゴリ切り替えタブ（右側） -->
      <div class="zcode-data-viewer-tabs">
        <!-- ページ用: JSON/HTML切り替え -->
        <template v-if="internalActiveTab === 'page'">
          <button
            :class="{ active: viewFormat === 'json' }"
            class="zcode-data-viewer-tab"
            @click="viewFormat = 'json'"
          >
            {{ $t('dataViewer.json') }}
          </button>
          <button
            :class="{ active: viewFormat === 'html' }"
            class="zcode-data-viewer-tab"
            @click="viewFormat = 'html'"
          >
            {{ $t('dataViewer.html') }}
          </button>
        </template>
        <!-- パーツ・画像用: 共通/個別切り替え -->
        <template v-else>
          <button
            v-for="category in categoryTabs"
            :key="category"
            :class="{ active: activeCategory === category }"
            class="zcode-data-viewer-tab"
            @click="activeCategory = category as 'common' | 'individual' | 'special'"
          >
            {{ category === 'common' ? $t('dataViewer.common') : category === 'individual' ? $t('dataViewer.individual') : $t('dataViewer.special') }}
          </button>
        </template>
      </div>
    </div>

    <!-- データ表示エリア -->
    <div class="zcode-data-viewer-content">
      <div class="zcode-data-viewer-display-wrapper">
        <pre class="zcode-data-viewer-display">{{ displayText }}</pre>
        <!-- コピーボタン（右上に絶対配置） -->
        <button
          class="zcode-data-viewer-copy-btn"
          :title="isCopied ? $t('common.copied') : $t('common.copy')"
          @click="handleCopy"
        >
          <Check
            v-if="isCopied"
            :size="18"
          />
          <Copy
            v-else
            :size="18"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Copy, Check } from 'lucide-vue-next';
import type { ZeroCodeData, CMSConfig } from '../../../types';
import { useZeroCodeRenderer } from '../../../core/composables/useZeroCodeRenderer';

const props = defineProps<{
  cmsData: ZeroCodeData;
  config?: Partial<CMSConfig>;
}>();

// 内部で管理するタブ（ページ/パーツ/画像）
const internalActiveTab = ref<'page' | 'parts' | 'images'>('page');
const viewFormat = ref<'json' | 'html'>('json');
const isCopied = ref(false);

// タブの順序を制御
const categoryOrder = computed(() => 
  props.config?.categoryOrder || 'common'
);

const categoryTabs = computed(() => {
  const tabs: Array<'common' | 'individual' | 'special'> = [];
  
  // 内部タブに応じてspecialの有無をチェック
  const hasSpecial = internalActiveTab.value === 'parts' 
    ? props.cmsData.parts.special.length > 0
    : props.cmsData.images.special.length > 0;
  
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

// activeCategoryの初期値をcategoryOrderに基づいて設定
const activeCategory = ref<'common' | 'individual' | 'special'>(
  props.config?.categoryOrder === 'individual' ? 'individual' : props.config?.categoryOrder === 'special' ? 'special' : 'common'
);

// ページ全体のHTML（編集モード属性なし）
const { fullPageHtml } = useZeroCodeRenderer(props.cmsData, false);

// 現在表示するデータを取得
const currentData = computed(() => {
  switch (internalActiveTab.value) {
    case 'page':
      return props.cmsData.page;
    case 'parts':
      if (activeCategory.value === 'common') {
        return props.cmsData.parts.common;
      } else if (activeCategory.value === 'individual') {
        return props.cmsData.parts.individual;
      } else {
        return props.cmsData.parts.special;
      }
    case 'images':
      if (activeCategory.value === 'common') {
        return props.cmsData.images.common;
      } else if (activeCategory.value === 'individual') {
        return props.cmsData.images.individual;
      } else {
        return props.cmsData.images.special;
      }
    default:
      return null;
  }
});

// JSON文字列をフォーマット（表示モード用）
const formattedJson = ref('');
let lastFormattedJsonString = '';

function updateFormattedJson() {
  try {
    const data = currentData.value;
    const jsonString = JSON.stringify(data, null, 2);

    // JSON文字列が変更されていない場合は再計算しない（パフォーマンス最適化）
    if (jsonString === lastFormattedJsonString) {
      return;
    }

    formattedJson.value = jsonString;
    lastFormattedJsonString = jsonString;
  } catch (e) {
    formattedJson.value = String(currentData.value);
    lastFormattedJsonString = formattedJson.value;
  }
}

// JSON文字列を表示用に変換（エスケープシーケンスを実際の文字に変換、HTMLタグはエスケープ解除）
function formatJsonForDisplay(text: string): string {
  // JSON文字列内のエスケープシーケンスを実際の文字に変換
  // 順序が重要：\\ を先に処理してから、その他のエスケープシーケンスを処理
  let result = text
    .replace(/\\\\/g, '\u0000') // \\ を一時的なマーカーに（後で \ に戻す）
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) // \uXXXX をUnicode文字に
    .replace(/\\n/g, '\n') // \n を改行に
    .replace(/\\t/g, '\t') // \t をタブに
    .replace(/\\r/g, '\r') // \r を復帰に
    .replace(/\\"/g, '"') // \" を " に
    .replace(/\\b/g, '\b') // \b をバックスペースに
    .replace(/\\f/g, '\f') // \f をフォームフィードに
    .replace(/\\\//g, '/') // \/ をスラッシュに（オプション）
    // eslint-disable-next-line no-control-regex
    .replace(/\u0000/g, '\\'); // 一時的なマーカーを \ に戻す

  // <pre>タグ内ではHTMLタグは描画されないので、エスケープを解除して表示
  // &amp; を & に戻す（ただし、&lt; や &gt; の前に処理する必要がある）
  result = result
    .replace(/&lt;/g, '<') // &lt; を < に
    .replace(/&gt;/g, '>') // &gt; を > に
    .replace(/&amp;/g, '&'); // &amp; を & に（最後に処理）

  return result;
}

// HTML文字列を整形（簡易インデント）
function formatHtmlForDisplay(html: string): string {
  if (!html) return '';

  const normalized = html.replace(/>\s+</g, '><').replace(/></g, '>\n<');
  const lines = normalized.split('\n');
  const resultLines: string[] = [];
  let indent = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isClosingTag = /^<\/[^>]+>/.test(line);
    const isSelfClosing = /\/>$/.test(line) || /^<!/.test(line);
    const isOpeningTag = /^<[^/!][^>]*>$/.test(line) && !isSelfClosing;

    if (isClosingTag) {
      indent = Math.max(indent - 1, 0);
    }

    resultLines.push('  '.repeat(indent) + line);

    if (isOpeningTag) {
      indent++;
    }
  }

  return resultLines.join('\n');
}

// 表示用テキスト
const displayText = computed(() => {
  // ページの表示モード: JSON/HTMLを切り替え
  if (internalActiveTab.value === 'page') {
    if (viewFormat.value === 'html') {
      return formatHtmlForDisplay(fullPageHtml.value);
    }
    return formatJsonForDisplay(formattedJson.value);
  }

  // パーツ・画像では従来通りJSONのみ
  return formatJsonForDisplay(formattedJson.value);
});

// currentDataが変更されたら表示用JSONを更新
watch(
  currentData,
  () => {
    updateFormattedJson();
  },
  { deep: true, immediate: false }
);

// cmsDataの深い変更を監視（編集パネル、パーツ管理、画像管理などでの変更を検知）
watch(
  () => props.cmsData,
  () => {
    updateFormattedJson();
  },
  { deep: true }
);

// 内部アクティブタブに応じて、該当するデータを個別に監視
watch(
  () => {
    switch (internalActiveTab.value) {
      case 'page':
        return props.cmsData.page;
      case 'parts':
        return activeCategory.value === 'common'
          ? props.cmsData.parts.common
          : props.cmsData.parts.individual;
      case 'images':
        return activeCategory.value === 'common'
          ? props.cmsData.images.common
          : props.cmsData.images.individual;
      default:
        return null;
    }
  },
  () => {
    updateFormattedJson();
  },
  { deep: true }
);

// カテゴリ変更時に表示用JSONを更新
watch(activeCategory, () => {
  updateFormattedJson();
});

// 内部アクティブタブ変更時にリセット
watch(internalActiveTab, () => {
  activeCategory.value = props.config?.categoryOrder === 'individual' ? 'individual' : 'common';
  updateFormattedJson();
});

// コピー機能
const handleCopy = async () => {
  const textToCopy = displayText.value;

  try {
    await navigator.clipboard.writeText(textToCopy);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('コピーに失敗しました:', err);
    // フォールバック: 古い方法でコピー
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (e) {
      console.error('コピーに失敗しました:', e);
    }
    document.body.removeChild(textArea);
  }
};

// 初期化時に表示用JSONを更新
updateFormattedJson();

// 親コンポーネントからアクセス可能にする
defineExpose({
  internalActiveTab,
  activeCategory
});
</script>
