<template>
  <div class="zcode-rich-text-editor">
    <div
      v-if="editor"
      class="zcode-rich-text-toolbar"
    >
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('bold') }"
        class="zcode-toolbar-btn"
        title="太字"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold :size="16" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('italic') }"
        class="zcode-toolbar-btn"
        title="斜体"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic :size="16" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('strike') }"
        class="zcode-toolbar-btn"
        title="取り消し線"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <Strikethrough :size="16" />
      </button>
      <div class="zcode-toolbar-divider" />
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="zcode-toolbar-btn"
        title="箇条書き"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <List :size="16" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="zcode-toolbar-btn"
        title="番号付きリスト"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered :size="16" />
      </button>
      <div class="zcode-toolbar-divider" />
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('link') }"
        class="zcode-toolbar-btn"
        title="リンク"
        @click="setLink"
      >
        <Link :size="16" />
      </button>
    </div>
    <EditorContent
      :editor="editor"
      class="zcode-rich-text-editor-content"
    />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import BoldExtension from '@tiptap/extension-bold';
import ItalicExtension from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import HardBreak from '@tiptap/extension-hard-break';
import LinkExtension from '@tiptap/extension-link';
import { Bold, Italic, Strikethrough, List, ListOrdered, Link } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    BoldExtension,
    ItalicExtension,
    Strike,
    BulletList,
    OrderedList,
    ListItem,
    HardBreak,
    LinkExtension.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'zcode-link'
      }
    })
    // 見出し（Heading）と画像（Image）は含めない
  ],
  content: props.modelValue || '',
  editorProps: {
    attributes: {
      class: 'zcode-tiptap-editor',
      'data-placeholder': props.placeholder || 'テキストを入力...'
    }
  },
  onUpdate: ({ editor: editorInstance }) => {
    const html = editorInstance.getHTML();
    emit('update:modelValue', html);
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      editor.value.commands.setContent(newValue || '');
    }
  }
);

const setLink = () => {
  if (!editor.value) return;

  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('URLを入力してください', previousUrl);

  if (url === null) {
    return;
  }

  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>
