<template>
  <div class="monaco-editor-wrapper">
    <div ref="editorContainer" class="monaco-editor-container" />
    <div v-if="error" class="monaco-editor-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import loader from '@monaco-editor/loader';

const props = defineProps<{
  modelValue: string;
  language?: string;
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  readOnly?: boolean;
  minimap?: boolean;
  height?: string;
  autoHeight?: boolean; // 高さを自動調整するかどうか（デフォルト: true）
  maxHeight?: number; // 最大高さ（px）。指定しない場合は制限なし
  enableSuggestions?: boolean; // 予測変換の有効/無効（デフォルト: true）
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editorContainer = ref<HTMLElement | null>(null);
const error = ref<string | null>(null);
let editor: any = null;
let monacoInstance: any = null;
let completionProviderDisposable: { dispose(): void } | null = null;
let isUpdatingFromExternal = false;
let injectedShadowStyles: HTMLElement[] = [];

function syncMonacoStylesToShadowRoot() {
  const container = editorContainer.value;
  if (!container) return;

  const rootNode = container.getRootNode();
  if (!(rootNode instanceof ShadowRoot)) return;

  const shadowRoot = rootNode;
  const headNodes = Array.from(
    document.head.querySelectorAll('style, link[rel="stylesheet"]')
  ) as HTMLElement[];

  const candidates = headNodes.filter((node) => {
    if (node.tagName === 'LINK') {
      const href = (node as HTMLLinkElement).href || '';
      return href.includes('monaco') || href.includes('/vs/') || href.includes('vs/');
    }
    const text = (node as HTMLStyleElement).textContent || '';
    return text.includes('.monaco-editor') || text.includes('.monaco-editor-background');
  });

  candidates.forEach((node) => {
    if (node.tagName === 'LINK') {
      const href = (node as HTMLLinkElement).href;
      const exists = !!shadowRoot.querySelector(`link[rel="stylesheet"][href="${href}"]`);
      if (exists) return;
    } else {
      const marker = node.getAttribute('data-name') || '';
      if (marker) {
        const exists = !!shadowRoot.querySelector(`style[data-name="${marker}"]`);
        if (exists) return;
      }
    }

    const cloned = node.cloneNode(true) as HTMLElement;
    cloned.setAttribute('data-zcode-monaco-style', 'true');
    shadowRoot.appendChild(cloned);
    injectedShadowStyles.push(cloned);
  });
}

// エディタの高さを内容に応じて調整
function updateEditorHeight() {
  if (!editor || !editorContainer.value || !monacoInstance) return;

  // autoHeightがfalseの場合は親要素の高さに合わせる（automaticLayoutが処理）
  if (props.autoHeight === false) {
    return;
  }

  try {
    const lineHeight = editor.getOption(monacoInstance.editor.EditorOption.lineHeight) || 19;
    const lineCount = editor.getModel()?.getLineCount() || 1;
    const padding = 20; // 上下のパディング
    let calculatedHeight = lineCount * lineHeight + padding;

    // maxHeightが指定されている場合は制限を適用
    if (props.maxHeight !== undefined) {
      calculatedHeight = Math.min(calculatedHeight, props.maxHeight);
    }

    editorContainer.value.style.height = `${calculatedHeight}px`;
    editor.layout();
  } catch (e) {
    // フォールバック: 固定高さ
    editorContainer.value.style.height = '200px';
  }
}

onMounted(async () => {
  if (!editorContainer.value) return;

  try {
    // Monaco Editorを動的にロード
    monacoInstance = await loader.init();
    syncMonacoStylesToShadowRoot();

    completionProviderDisposable = monacoInstance.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // 現在の位置の前の文字を確認
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: Math.max(1, position.column - 10),
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        const suggestions: any[] = [];

        // $で始まる補完（テキストフィールド系）
        if (textUntilPosition.endsWith('$') || textUntilPosition.endsWith('{$')) {
          suggestions.push(
            // テキストフィールド記法
            {
              label: '{$field:default}',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '{$${1:field}:${2:default}}',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'テキストフィールド: {$変数名:デフォルト値}',
              detail: 'テンプレート記法 - テキスト',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - (textUntilPosition.endsWith('{$') ? 2 : 1),
                endColumn: position.column
              }
            },
            // テキストエリアフィールド記法
            {
              label: '{$field:default:textarea}',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '{$${1:field}:${2:default}:textarea}',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'テキストエリアフィールド: {$変数名:デフォルト値:textarea}',
              detail: 'テンプレート記法 - テキストエリア',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - (textUntilPosition.endsWith('{$') ? 2 : 1),
                endColumn: position.column
              }
            },
            // リッチテキストフィールド記法
            {
              label: '{$field:default:rich}',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '{$${1:field}:${2:default}:rich}',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'リッチテキストフィールド: {$変数名:デフォルト値:rich}',
              detail: 'テンプレート記法 - リッチテキスト',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - (textUntilPosition.endsWith('{$') ? 2 : 1),
                endColumn: position.column
              }
            },
            // 画像フィールド記法
            {
              label: '{$field:default:image}',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '{$${1:field}:${2:default}:image}',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: '画像フィールド: {$変数名:デフォルト値:image}',
              detail: 'テンプレート記法 - 画像',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - (textUntilPosition.endsWith('{$') ? 2 : 1),
                endColumn: position.column
              }
            }
          );
        }

        // (で始まる補完（選択式系）
        if (textUntilPosition.endsWith('(') || textUntilPosition.endsWith('$(')) {
          suggestions.push(
            // ラジオボタン記法
            {
              label: '($field:option1|option2)',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '($${1:field}:${2:option1}|${3:option2})',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'ラジオボタン: ($フィールド名:選択肢1|選択肢2)',
              detail: 'テンプレート記法 - ラジオボタン',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - (textUntilPosition.endsWith('$(') ? 2 : 1),
                endColumn: position.column
              }
            },
            // チェックボックス記法
            {
              label: '($field:option1,option2)',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '($${1:field}:${2:option1},${3:option2})',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'チェックボックス: ($フィールド名:選択肢1,選択肢2)',
              detail: 'テンプレート記法 - チェックボックス',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - (textUntilPosition.endsWith('$(') ? 2 : 1),
                endColumn: position.column
              }
            },
            // セレクトボックス（単一選択）記法
            {
              label: '($field@:option1|option2)',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '($${1:field}@:${2:option1}|${3:option2})',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'セレクトボックス（単一選択）: ($フィールド名@:選択肢1|選択肢2)',
              detail: 'テンプレート記法 - セレクトボックス',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - (textUntilPosition.endsWith('$(') ? 2 : 1),
                endColumn: position.column
              }
            },
            // セレクトボックス（複数選択）記法
            {
              label: '($field@:option1,option2)',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '($${1:field}@:${2:option1},${3:option2})',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'セレクトボックス（複数選択）: ($フィールド名@:選択肢1,選択肢2)',
              detail: 'テンプレート記法 - セレクトボックス（複数）',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - (textUntilPosition.endsWith('$(') ? 2 : 1),
                endColumn: position.column
              }
            }
          );
        }

        // z-で始まる補完（属性系）
        if (textUntilPosition.endsWith('z-') || textUntilPosition.endsWith(' z-')) {
          suggestions.push(
            // z-if属性
            {
              label: 'z-if="show_xxx"',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'z-if="show_${1:field}"',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: '条件分岐: z-if属性（フィールドがtrueの場合に表示）',
              detail: 'テンプレート記法 - 条件分岐',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - 2,
                endColumn: position.column
              }
            },
            // z-slot属性
            {
              label: 'z-slot="slotName"',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'z-slot="${1:slotName}"',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'スロット: z-slot属性（子コンポーネントを挿入する位置）',
              detail: 'テンプレート記法 - スロット',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - 2,
                endColumn: position.column
              }
            }
          );
        }

        // トリガー文字が入力されていない場合も、すべての補完を表示（ただしrangeは通常通り）
        if (suggestions.length === 0) {
          suggestions.push(
            {
              label: '{$field:default}',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '{$${1:field}:${2:default}}',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'テキストフィールド: {$変数名:デフォルト値}',
              detail: 'テンプレート記法 - テキスト',
              range
            },
            {
              label: '{$field:default:rich}',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '{$${1:field}:${2:default}:rich}',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'リッチテキストフィールド: {$変数名:デフォルト値:rich}',
              detail: 'テンプレート記法 - リッチテキスト',
              range
            },
            {
              label: '{$field:default:image}',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '{$${1:field}:${2:default}:image}',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: '画像フィールド: {$変数名:デフォルト値:image}',
              detail: 'テンプレート記法 - 画像',
              range
            },
            {
              label: '($field:option1|option2)',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '($${1:field}:${2:option1}|${3:option2})',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'ラジオボタン: ($フィールド名:選択肢1|選択肢2)',
              detail: 'テンプレート記法 - ラジオボタン',
              range
            },
            {
              label: '($field:option1,option2)',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '($${1:field}:${2:option1},${3:option2})',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'チェックボックス: ($フィールド名:選択肢1,選択肢2)',
              detail: 'テンプレート記法 - チェックボックス',
              range
            },
            {
              label: '($field@:option1|option2)',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '($${1:field}@:${2:option1}|${3:option2})',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'セレクトボックス（単一選択）: ($フィールド名@:選択肢1|選択肢2)',
              detail: 'テンプレート記法 - セレクトボックス',
              range
            },
            {
              label: '($field@:option1,option2)',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: '($${1:field}@:${2:option1},${3:option2})',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'セレクトボックス（複数選択）: ($フィールド名@:選択肢1,選択肢2)',
              detail: 'テンプレート記法 - セレクトボックス（複数）',
              range
            },
            {
              label: 'z-if="show_xxx"',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'z-if="show_${1:field}"',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: '条件分岐: z-if属性（フィールドがtrueの場合に表示）',
              detail: 'テンプレート記法 - 条件分岐',
              range
            },
            {
              label: 'z-tag="$tagName:h1|h2|h3"',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'z-tag="$${1:tagName}:${2:h1|h2|h3}"',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'タグ名を動的に変更（選択肢を指定可能）',
              detail: 'テンプレート記法 - タグ名の動的変更',
              range
            },
            {
              label: 'z-empty="$fieldName"',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'z-empty="$${1:fieldName}"',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'オプショナルフィールドが空の場合、親要素を削除',
              detail: 'テンプレート記法 - 条件分岐（空の場合削除）',
              range
            },
            {
              label: 'z-slot="slotName"',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'z-slot="${1:slotName}"',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'スロット: z-slot属性（子コンポーネントを挿入する位置）',
              detail: 'テンプレート記法 - スロット',
              range
            }
          );
        }

        return { suggestions };
      },
      triggerCharacters: ['$', '(', 'z']
    });

    const suggestionsEnabled = props.enableSuggestions !== false;

    editor = monacoInstance.editor.create(editorContainer.value, {
      value: props.modelValue || '',
      language: props.language || 'html',
      theme: props.theme || 'vs-dark',
      readOnly: props.readOnly || false,
      minimap: { enabled: props.minimap === true },
      automaticLayout: true,
      fontSize: 14,
      tabSize: 2,
      wordWrap: 'off',
      scrollBeyondLastLine: false,
      formatOnPaste: true,
      formatOnType: true,
      lineNumbers: 'on',
      folding: true,
      suggestOnTriggerCharacters: suggestionsEnabled,
      quickSuggestions: suggestionsEnabled
        ? {
            other: true,
            comments: false,
            strings: true
          }
        : false,
      acceptSuggestionOnCommitCharacter: suggestionsEnabled,
      acceptSuggestionOnEnter: suggestionsEnabled ? 'on' : 'off',
      suggestSelection: 'first',
      mouseWheelScrollSensitivity: 1,
      fastScrollSensitivity: 5,
      scrollbar: {
        alwaysConsumeMouseWheel: false
      }
    });

    // 値の変更を監視
    editor.onDidChangeModelContent(() => {
      if (!isUpdatingFromExternal) {
        const value = editor.getValue();
        emit('update:modelValue', value);
        // 内容が変更されたら高さを再計算
        updateEditorHeight();
      }
    });

    // 初期高さを設定
    updateEditorHeight();
  } catch (e) {
    error.value = `Monaco Editorの読み込みに失敗しました: ${e}`;
    console.error('Monaco Editor error:', e);
  }
});

// 外部からの値の変更を監視
watch(
  () => props.modelValue,
  async (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      isUpdatingFromExternal = true;
      await nextTick();
      editor.setValue(newValue || '');
      isUpdatingFromExternal = false;
      // 内容が変更されたら高さを再計算
      updateEditorHeight();
    }
  }
);

// 予測変換の有効/無効を動的に切り替え
watch(
  () => props.enableSuggestions,
  (newValue) => {
    if (editor && monacoInstance) {
      const suggestionsEnabled = newValue !== false;
      editor.updateOptions({
        suggestOnTriggerCharacters: suggestionsEnabled,
        quickSuggestions: suggestionsEnabled
          ? {
              other: true,
              comments: false,
              strings: true
            }
          : false,
        acceptSuggestionOnCommitCharacter: suggestionsEnabled,
        acceptSuggestionOnEnter: suggestionsEnabled ? 'on' : 'off'
      });
    }
  }
);

onUnmounted(() => {
  completionProviderDisposable?.dispose();
  completionProviderDisposable = null;

  if (editor) {
    editor.dispose();
    editor = null;
  }

  injectedShadowStyles.forEach((node) => node.remove());
  injectedShadowStyles = [];
});
</script>

<style>
@import '../../../styles/monaco-editor.css';
</style>
