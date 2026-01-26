import type { ComponentData, PartData, SlotConfig } from '../../types';
import { getDOMParser } from './dom-utils';
import { sanitizeRichText, escapeAttributeValue, sanitizeUrl } from './sanitize';
import { TEMPLATE_REGEX } from './template-regex';
import { splitDefaultAndValidation } from './field-extractor';
import { processImageField, resolveBackendDataPath, expandUrlPlaceholders } from './template-utils';


export interface ProcessTemplateOptions {
  translations?: {
    addSlotButton?: string;
  };
}

// DOMパーサーベースの変数展開・条件処理
export function processTemplateWithDOM(
  html: string,
  component: ComponentData,
  path: string,
  _findPart: (partId: string) => PartData | null,
  renderComponentToHtml: (component: ComponentData, path: string) => string,
  enableEditorAttributes: boolean = true,
  imagesCommon: Array<{ id: string; url: string }> = [],
  imagesIndividual: Array<{ id: string; url: string }> = [],
  imagesSpecial: Array<{ id: string; url: string }> = [],
  backendData?: Record<string, unknown>,
  options?: ProcessTemplateOptions
): string {
  const DOMParser = getDOMParser();
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<template>${html}</template>`, 'text/html');
  const template = doc.querySelector('template');

  if (!template || !template.content) {
    console.error('Failed to parse template HTML');
    return html;
  }

  // 1. テキストノードの変数展開 {$variable:default}
  const processTextNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent || '';

      // バックエンドデータの展開（先に処理）
      if (backendData) {
        text = text.replace(TEMPLATE_REGEX.BACKEND_DATA, (_match, dataPath) => {
          return resolveBackendDataPath(backendData, dataPath);
        });
      }

      // オプショナルリッチテキストフィールドの展開（先に処理）
      const richTextOptionalWithGroupRegex = /\{\$(\w+)\.(\w+)\?:(.+?):rich(?::[^}]+)?\}/;
      let richTextOptionalMatch = richTextOptionalWithGroupRegex.exec(text);
      let isOptionalGrouped = false;
      if (richTextOptionalMatch && node.parentNode) {
        isOptionalGrouped = true;
      } else {
        const richTextOptionalRegex = /\{\$(\w+)\?:(.+?):rich(?::[^}]+)?\}/;
        richTextOptionalMatch = richTextOptionalRegex.exec(text);
      }
      if (richTextOptionalMatch && node.parentNode) {
        const varName = richTextOptionalMatch[1];
        const defaultValueRaw = isOptionalGrouped
          ? richTextOptionalMatch[3]
          : richTextOptionalMatch[2];
        const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
        const rawValue = component[varName];
        // boolean型の値は表示しない（z-ifで制御するため）
        if (typeof rawValue === 'boolean') {
          const parent = node.parentNode as Element;
          const matchIndex = richTextOptionalMatch.index || 0;
          const beforeText = text.substring(0, matchIndex);
          const afterText = text.substring(matchIndex + richTextOptionalMatch[0].length);

          if (beforeText) {
            parent.insertBefore(doc.createTextNode(beforeText), node);
          }
          if (afterText) {
            parent.insertBefore(doc.createTextNode(afterText), node);
          }

          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
          return;
        }
        let richTextValue: string = rawValue === undefined ? '' : (typeof rawValue === 'string' ? rawValue : String(rawValue || defaultValue));

        if (!enableEditorAttributes) {
          richTextValue = sanitizeRichText(richTextValue);
        }

        const parent = node.parentNode as Element;
        const matchIndex = richTextOptionalMatch.index || 0;
        const beforeText = text.substring(0, matchIndex);
        const afterText = text.substring(matchIndex + richTextOptionalMatch[0].length);

        if (!richTextValue) {
          richTextValue = '';
        } else if (!richTextValue.trim().startsWith('<p')) {
          richTextValue = `<p>${richTextValue}</p>`;
        }

        const tempDiv = doc.createElement('div');
        tempDiv.innerHTML = richTextValue;

        if (beforeText) {
          parent.insertBefore(doc.createTextNode(beforeText), node);
        }

        Array.from(tempDiv.childNodes).forEach((child) => {
          parent.insertBefore(child.cloneNode(true), node);
        });

        if (afterText) {
          parent.insertBefore(doc.createTextNode(afterText), node);
        }

        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        return;
      }

      // グループ付きリッチテキストフィールドの展開（先に処理）
      // gフラグ付きの正規表現ではmatch()でindexが取得できないため、exec()を使用
      const richTextWithGroupRegex = new RegExp(
        TEMPLATE_REGEX.RICH_TEXT_FIELD_WITH_GROUP.source,
        TEMPLATE_REGEX.RICH_TEXT_FIELD_WITH_GROUP.flags
      );
      let richTextMatch = richTextWithGroupRegex.exec(text);
      let isGrouped = false;
      if (richTextMatch && node.parentNode) {
        isGrouped = true;
      } else {
        // グループなしリッチテキストフィールドの展開
        const richTextRegex = new RegExp(
          TEMPLATE_REGEX.RICH_TEXT_FIELD.source,
          TEMPLATE_REGEX.RICH_TEXT_FIELD.flags
        );
        richTextMatch = richTextRegex.exec(text);
      }
      if (richTextMatch && node.parentNode) {
        const varName = richTextMatch[1];
        const defaultValue = isGrouped ? richTextMatch[3] : richTextMatch[2];
        const rawValue = component[varName];
        let richTextValue: string = rawValue === undefined ? '' : (typeof rawValue === 'string' ? rawValue : String(rawValue || defaultValue));

        if (!enableEditorAttributes) {
          richTextValue = sanitizeRichText(richTextValue);
        }

        // リッチテキストの場合はHTMLとして挿入
        // 空の場合や<p>タグで始まっていない場合は<p>タグで囲む
        const parent = node.parentNode as Element;
        const matchIndex = richTextMatch.index || 0;
        const beforeText = text.substring(0, matchIndex);
        const afterText = text.substring(matchIndex + richTextMatch[0].length);

        // リッチテキストのHTMLをパース
        // 空の場合は<p></p>を生成
        // 値があるが<p>タグで始まっていない場合は<p>タグで囲む
        if (!richTextValue) {
          richTextValue = '<p></p>';
        } else if (!richTextValue.trim().startsWith('<p')) {
          // <p>タグで始まっていない場合は<p>タグで囲む
          richTextValue = `<p>${richTextValue}</p>`;
        }

        const tempDiv = doc.createElement('div');
        tempDiv.innerHTML = richTextValue;

        // 前のテキストがある場合は追加
        if (beforeText) {
          parent.insertBefore(doc.createTextNode(beforeText), node);
        }

        // リッチテキストのHTMLを追加（クローンして追加）
        Array.from(tempDiv.childNodes).forEach((child) => {
          parent.insertBefore(child.cloneNode(true), node);
        });

        // 後のテキストがある場合は追加
        if (afterText) {
          parent.insertBefore(doc.createTextNode(afterText), node);
        }

        // 元のテキストノードを削除
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        return;
      }

      // オプショナルテキストエリアフィールドの展開（先に処理）
      const textareaWithGroupOptionalRegex = /\{\$(\w+)\.(\w+)\?:(.+?):textarea(?::[^}]+)?\}/;
      let textareaOptionalMatch = textareaWithGroupOptionalRegex.exec(text);
      let isTextareaOptionalGrouped = false;
      if (textareaOptionalMatch && node.parentNode) {
        isTextareaOptionalGrouped = true;
      } else {
        const textareaOptionalRegex = /\{\$(\w+)\?:(.+?):textarea(?::[^}]+)?\}/;
        textareaOptionalMatch = textareaOptionalRegex.exec(text);
      }
      if (textareaOptionalMatch && node.parentNode) {
        const varName = textareaOptionalMatch[1] as string;
        const defaultValueRaw = isTextareaOptionalGrouped
          ? (textareaOptionalMatch[3] as string)
          : (textareaOptionalMatch[2] as string);
        const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
        const raw = component[varName];
        const str = raw === undefined ? '' : String(raw || defaultValue);

        const parent = node.parentNode as Element;
        const matchIndex = textareaOptionalMatch.index || 0;
        const beforeText = text.substring(0, matchIndex);
        const afterText = text.substring(matchIndex + textareaOptionalMatch[0].length);

        // 前のテキストがある場合はテキストノードとして追加
        if (beforeText) {
          parent.insertBefore(doc.createTextNode(beforeText), node);
        }

        // テキストエリアの内容を改行で分割し、<br>要素を挟みながら追加
        const lines = str.split('\n');
        lines.forEach((line, index) => {
          if (line) {
            parent.insertBefore(doc.createTextNode(line), node);
          }
          // 最後の行以外は必ず<br>を挿入（空行の場合も含む）
          if (index < lines.length - 1) {
            parent.insertBefore(doc.createElement('br'), node);
          }
        });

        // 後ろのテキストがある場合は新しいテキストノードを作成し再帰処理
        if (afterText) {
          const afterNode = doc.createTextNode(afterText);
          parent.insertBefore(afterNode, node);
          processTextNodes(afterNode);
        }

        // 元のテキストノードを削除
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        return;
      }

      // グループ付きテキストエリアフィールドの展開（先に処理）
      // gフラグ付きの正規表現ではmatch()でindexが取得できないため、exec()を使用
      const textareaWithGroupRegex = new RegExp(
        TEMPLATE_REGEX.TEXTAREA_FIELD_WITH_GROUP.source,
        TEMPLATE_REGEX.TEXTAREA_FIELD_WITH_GROUP.flags
      );
      let textareaMatch = textareaWithGroupRegex.exec(text);
      let isTextareaGrouped = false;
      if (textareaMatch && node.parentNode) {
        isTextareaGrouped = true;
      } else {
        // グループなしテキストエリアフィールドの展開
        const textareaRegex = new RegExp(
          TEMPLATE_REGEX.TEXTAREA_FIELD.source,
          TEMPLATE_REGEX.TEXTAREA_FIELD.flags
        );
        textareaMatch = textareaRegex.exec(text);
      }
      if (textareaMatch && node.parentNode) {
        const varName = textareaMatch[1] as string;
        const defaultValue = isTextareaGrouped
          ? (textareaMatch[3] as string)
          : (textareaMatch[2] as string);
        const raw = component[varName] ?? defaultValue ?? '';
        const str = String(raw);

        const parent = node.parentNode as Element;
        const matchIndex = textareaMatch.index || 0;
        const beforeText = text.substring(0, matchIndex);
        const afterText = text.substring(matchIndex + textareaMatch[0].length);

        // 前のテキストがある場合はテキストノードとして追加
        if (beforeText) {
          parent.insertBefore(doc.createTextNode(beforeText), node);
        }

        // テキストエリアの内容を改行で分割し、<br>要素を挟みながら追加
        const lines = str.split('\n');
        lines.forEach((line, index) => {
          if (line) {
            parent.insertBefore(doc.createTextNode(line), node);
          }
          // 最後の行以外は必ず<br>を挿入（空行の場合も含む）
          if (index < lines.length - 1) {
            parent.insertBefore(doc.createElement('br'), node);
          }
        });

        // 後ろのテキストがある場合は新しいテキストノードを作成し再帰処理
        if (afterText) {
          const afterNode = doc.createTextNode(afterText);
          parent.insertBefore(afterNode, node);
          processTextNodes(afterNode);
        }

        // 元のテキストノードを削除
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        return;
      }

      // オプショナルフィールドの展開（先に処理、textareaは除く）
      text = text.replace(/\{\$(\w+)\?:([^}]+)\}/g, (_match, varName, defaultValueRaw) => {
        // textareaの場合はスキップ（既に処理済み）
        if (/:textarea(?::[^}]*)?$/.test(_match)) {
          return _match;
        }
        const rawValue = component[varName];
        if (rawValue === undefined) {
          return '';
        }
        // boolean型の値は表示しない（z-ifで制御するため）
        if (typeof rawValue === 'boolean') {
          return '';
        }
        const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
        return String(rawValue || defaultValue);
      });

      text = text.replace(
        /\{\$(\w+)\.(\w+)\?:([^}]+)\}/g,
        (_match, varName, _groupName, defaultValueRaw) => {
          // textareaの場合はスキップ（既に処理済み）
          if (/:textarea(?::[^}]*)?$/.test(_match)) {
            return _match;
          }
          const rawValue = component[varName];
          if (rawValue === undefined) {
            return '';
          }
          // boolean型の値は表示しない（z-ifで制御するため）
          if (typeof rawValue === 'boolean') {
            return '';
          }
          const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
          return String(rawValue || defaultValue);
        }
      );

      // グループ付きテキストフィールドの展開（先に処理）
      text = text.replace(
        TEMPLATE_REGEX.TEXT_FIELD_WITH_GROUP,
        (_match, varName, _groupName, defaultValueRaw) => {
          const rawValue = component[varName];
          if (rawValue === undefined) {
            return '';
          }
          const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
          return String(rawValue || defaultValue);
        }
      );

      // 通常テキストフィールドの展開
      text = text.replace(TEMPLATE_REGEX.TEXT_FIELD, (_match, varName, defaultValueRaw) => {
        const rawValue = component[varName];
        if (rawValue === undefined) {
          return '';
        }
        const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
        return String(rawValue || defaultValue);
      });

      node.textContent = text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 属性内の変数展開
      const element = node as Element;
      const attributesToRemove: string[] = [];

      Array.from(element.attributes).forEach((attr) => {
        const originalValue = attr.value;
        let value = attr.value;
        const attrName = attr.name.toLowerCase();

        // 特殊属性は削除しない（z-forは後で処理するため、ここではスキップ）
        if (
          attrName === 'z-if' ||
          attrName === 'z-for' ||
          attrName === 'z-slot' ||
          attrName === 'z-empty' ||
          attrName === 'z-tag' ||
          attrName.startsWith('data-zcode-')
        ) {
          // 既存の処理を続行（属性は削除しない）
          return;
        }

        // 元の属性値がオプショナルフィールドのみかチェック
        // パターン: {$field?:default} または {$field?:default:type} または {$field.group?:default:type}
        const isOptionalOnly = /^\{\$[\w.]+?\?:[^}]+\}(?::(rich|image|textarea))?$/.test(
          originalValue.trim()
        );

        // バックエンドデータの展開（先に処理）
        if (backendData) {
          // URL内のプレースホルダー展開
          if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
            value = expandUrlPlaceholders(value, backendData);
          }

          // {@fieldName}形式の展開
          value = value.replace(TEMPLATE_REGEX.BACKEND_DATA, (_match, dataPath) => {
            const resolvedValue = resolveBackendDataPath(backendData, dataPath);
            if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
              return sanitizeUrl(resolvedValue);
            }
            return escapeAttributeValue(resolvedValue);
          });
        }

        // オプショナルフィールドの展開（先に処理、リッチテキスト）
        value = value.replace(
          /\{\$(\w+)\?:(.+?):rich(?::[^}]+)?\}/g,
          (_match, varName, defaultValueRaw) => {
            const rawValue = component[varName];
            if (rawValue === undefined) {
              return '';
            }
            // boolean型の値は表示しない（z-ifで制御するため）
            if (typeof rawValue === 'boolean') {
              return '';
            }
            const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
            return escapeAttributeValue(String(rawValue || defaultValue));
          }
        );

        value = value.replace(
          /\{\$(\w+)\.(\w+)\?:(.+?):rich(?::[^}]+)?\}/g,
          (_match, varName, _groupName, defaultValueRaw) => {
            const rawValue = component[varName];
            if (rawValue === undefined) {
              return '';
            }
            // boolean型の値は表示しない（z-ifで制御するため）
            if (typeof rawValue === 'boolean') {
              return '';
            }
            const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
            return escapeAttributeValue(String(rawValue || defaultValue));
          }
        );

        // オプショナルフィールドの展開（先に処理、画像）
        value = value.replace(
          /\{\$(\w+)\?:(.+?):image(?::[^}]+)?\}/g,
          (_match, varName, defaultValueRaw) => {
            const imageId = component[varName];
            if (imageId === undefined) {
              return '';
            }
            const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
            const imageIdValue = typeof imageId === 'string' ? imageId : String(imageId || defaultValue);
            const imageUrl = processImageField(
              imageIdValue,
              defaultValue,
              imagesCommon,
              imagesIndividual,
              imagesSpecial
            );
            const imageUrlString = typeof imageUrl === 'string' ? imageUrl : String(imageUrl || defaultValue);
            if (attrName === 'href' || attrName === 'src') {
              return sanitizeUrl(imageUrlString);
            }
            return escapeAttributeValue(imageUrlString);
          }
        );

        value = value.replace(
          /\{\$(\w+)\.(\w+)\?:(.+?):image(?::[^}]+)?\}/g,
          (_match, varName, _groupName, defaultValueRaw) => {
            const imageId = component[varName];
            if (imageId === undefined) {
              return '';
            }
            const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
            const imageIdValue = typeof imageId === 'string' ? imageId : String(imageId || defaultValue);
            const imageUrl = processImageField(
              imageIdValue,
              defaultValue,
              imagesCommon,
              imagesIndividual,
              imagesSpecial
            );
            const imageUrlString = typeof imageUrl === 'string' ? imageUrl : String(imageUrl || defaultValue);
            if (attrName === 'href' || attrName === 'src') {
              return sanitizeUrl(imageUrlString);
            }
            return escapeAttributeValue(imageUrlString);
          }
        );

        // グループ付きリッチテキストフィールドの展開（先に処理）
        value = value.replace(
          TEMPLATE_REGEX.RICH_TEXT_FIELD_WITH_GROUP,
          (_match, varName, _groupName, defaultValue) => {
            const rawValue = component[varName];
            if (rawValue === undefined) {
              return '';
            }
            return escapeAttributeValue(String(rawValue || defaultValue));
          }
        );

        // リッチテキストフィールドの展開
        value = value.replace(TEMPLATE_REGEX.RICH_TEXT_FIELD, (_match, varName, defaultValue) => {
          const rawValue = component[varName];
          if (rawValue === undefined) {
            return '';
          }
          return escapeAttributeValue(String(rawValue || defaultValue));
        });

        // グループ付き画像フィールドの展開（先に処理）
        value = value.replace(
          TEMPLATE_REGEX.IMAGE_FIELD_WITH_GROUP,
          (_match, varName, _groupName, defaultValue) => {
            const imageId = component[varName];
            if (imageId === undefined) {
              return '';
            }
            const imageUrl = processImageField(
              imageId || defaultValue,
              defaultValue,
              imagesCommon,
              imagesIndividual,
              imagesSpecial
            );
            if (attrName === 'href' || attrName === 'src') {
              return sanitizeUrl(imageUrl || defaultValue);
            }
            return escapeAttributeValue(imageUrl || defaultValue);
          }
        );

        // 画像フィールドの展開
        value = value.replace(TEMPLATE_REGEX.IMAGE_FIELD, (_match, varName, defaultValue) => {
          const imageId = component[varName];
          if (imageId === undefined) {
            return '';
          }
          const imageUrl = processImageField(
            imageId || defaultValue,
            defaultValue,
            imagesCommon,
            imagesIndividual,
            imagesSpecial
          );
          if (attrName === 'href' || attrName === 'src') {
            return sanitizeUrl(imageUrl || defaultValue);
          }
          return escapeAttributeValue(imageUrl || defaultValue);
        });

        // オプショナルフィールドの展開（先に処理）
        value = value.replace(/\{\$(\w+)\?:([^}]+)\}/g, (_match, varName, defaultValueRaw) => {
          const rawValue = component[varName];
          if (rawValue === undefined) {
            return '';
          }
          // boolean型の値は表示しない（z-ifで制御するため）
          if (typeof rawValue === 'boolean') {
            return '';
          }
          const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
          const stringValue = String(rawValue || defaultValue);
          if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
            return sanitizeUrl(stringValue);
          }
          return escapeAttributeValue(stringValue);
        });

        value = value.replace(
          /\{\$(\w+)\.(\w+)\?:([^}]+)\}/g,
          (_match, varName, _groupName, defaultValueRaw) => {
            const rawValue = component[varName];
            if (rawValue === undefined) {
              return '';
            }
            // boolean型の値は表示しない（z-ifで制御するため）
            if (typeof rawValue === 'boolean') {
              return '';
            }
            const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
            const stringValue = String(rawValue || defaultValue);
            if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
              return sanitizeUrl(stringValue);
            }
            return escapeAttributeValue(stringValue);
          }
        );

        // グループ付きテキストフィールドの展開（先に処理）
        value = value.replace(
          TEMPLATE_REGEX.TEXT_FIELD_WITH_GROUP,
          (_match, varName, _groupName, defaultValueRaw) => {
            const rawValue = component[varName];
            if (rawValue === undefined) {
              return '';
            }
            const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
            const stringValue = String(rawValue || defaultValue);
            if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
              return sanitizeUrl(stringValue);
            }
            return escapeAttributeValue(stringValue);
          }
        );

        // 通常テキストフィールドの展開
        value = value.replace(TEMPLATE_REGEX.TEXT_FIELD, (_match, varName, defaultValueRaw) => {
          const rawValue = component[varName];
          if (rawValue === undefined) {
            return '';
          }
          const { defaultValue } = splitDefaultAndValidation(defaultValueRaw);
          const stringValue = String(rawValue || defaultValue);
          if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
            return sanitizeUrl(stringValue);
          }
          return escapeAttributeValue(stringValue);
        });

        // 属性値が空文字列で、元の属性値がオプショナルフィールドのみの場合、属性を削除
        if (isOptionalOnly && value.trim() === '') {
          attributesToRemove.push(attr.name);
        } else {
          attr.value = value;
        }
      });

      // 属性を削除（forEach中に削除すると問題が起きるため、後で削除）
      attributesToRemove.forEach((attrName) => {
        element.removeAttribute(attrName);
      });
    }

    Array.from(node.childNodes).forEach((child) => processTextNodes(child));
  };

  processTextNodes(template.content);

  // 2. 選択式・複数選択式の処理 ($field:opt1|opt2) と ($field@:opt1|opt2)
  const processSelectionSyntax = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent || '';

      // グループ付きセレクトボックス（先に処理）
      text = text.replace(
        TEMPLATE_REGEX.SELECT_FIELD_WITH_GROUP,
        (_match, fieldName, _groupName, options) => {
          // 区切り文字で判定: | = 単一選択、, = 複数選択
          if (options.includes('|')) {
            // セレクトボックス（単一選択）
            return component[fieldName] || options.split('|')[0];
          } else if (options.includes(',')) {
            // セレクトボックス（複数選択）
            const selectedValues = component[fieldName];
            const valuesArray = Array.isArray(selectedValues) ? selectedValues : [];
            const optionList = options.split(',');
            return valuesArray.filter((val: unknown) => typeof val === 'string' && optionList.includes(val)).join(' ');
          }
          return component[fieldName] || options;
        }
      );

      // セレクトボックス（先に処理）
      text = text.replace(TEMPLATE_REGEX.SELECT_FIELD, (_match, fieldName, options) => {
        // 区切り文字で判定: | = 単一選択、, = 複数選択
        if (options.includes('|')) {
          // セレクトボックス（単一選択）
          const value = component[fieldName];
          return typeof value === 'string' ? value : options.split('|')[0];
        } else if (options.includes(',')) {
          // セレクトボックス（複数選択）
          const selectedValues = component[fieldName];
          const valuesArray = Array.isArray(selectedValues) ? selectedValues : [];
          const optionList = options.split(',');
          return valuesArray.filter((val: unknown) => typeof val === 'string' && optionList.includes(val)).join(' ');
        }
        const value = component[fieldName];
        return typeof value === 'string' ? value : options;
      });

      // グループ付きラジオボタン/チェックボックス（先に処理）
      text = text.replace(
        TEMPLATE_REGEX.RADIO_CHECKBOX_FIELD_WITH_GROUP,
        (_match, fieldName, _groupName, options) => {
          // 区切り文字で判定: | = ラジオボタン（単一選択）、, = チェックボックス（複数選択）
          if (options.includes('|')) {
            // ラジオボタン: 単一選択
            const value = component[fieldName];
            return typeof value === 'string' ? value : options.split('|')[0];
          } else if (options.includes(',')) {
            // チェックボックス: 複数選択
            const selectedValues = component[fieldName];
            const valuesArray = Array.isArray(selectedValues) ? selectedValues : [];
            const optionList = options.split(',');
            return valuesArray.filter((val: unknown) => typeof val === 'string' && optionList.includes(val)).join(' ');
          }
          const value = component[fieldName];
          return typeof value === 'string' ? value : options;
        }
      );

      // ラジオボタン/チェックボックス（区切り文字で判定）
      text = text.replace(TEMPLATE_REGEX.RADIO_FIELD, (_match, fieldName, options) => {
        // 区切り文字で判定: | = ラジオボタン（単一選択）、, = チェックボックス（複数選択）
        if (options.includes('|')) {
          // ラジオボタン: 単一選択
          const value = component[fieldName];
          return typeof value === 'string' ? value : options.split('|')[0];
        } else if (options.includes(',')) {
          // チェックボックス: 複数選択
          const selectedValues = component[fieldName];
          const valuesArray = Array.isArray(selectedValues) ? selectedValues : [];
          const optionList = options.split(',');
          return valuesArray.filter((val: unknown) => typeof val === 'string' && optionList.includes(val)).join(' ');
        }
        const value = component[fieldName];
        return typeof value === 'string' ? value : options;
      });

      node.textContent = text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 属性内の選択式処理
      const element = node as Element;
      Array.from(element.attributes).forEach((attr) => {
        let value = attr.value;
        const attrName = attr.name.toLowerCase();

        // グループ付きセレクトボックス（先に処理）
        value = value.replace(
          TEMPLATE_REGEX.SELECT_FIELD_WITH_GROUP,
          (_match, fieldName, _groupName, options) => {
            let result: string;
            // 区切り文字で判定: | = 単一選択、, = 複数選択
            if (options.includes('|')) {
              // セレクトボックス（単一選択）
              result = component[fieldName] || options.split('|')[0];
            } else if (options.includes(',')) {
              // セレクトボックス（複数選択）
              const selectedValues = component[fieldName];
              const valuesArray = Array.isArray(selectedValues) ? selectedValues : [];
              const optionList = options.split(',');
              result = valuesArray.filter((val: unknown) => typeof val === 'string' && optionList.includes(val)).join(' ');
            } else {
              const value = component[fieldName];
              result = typeof value === 'string' ? value : options;
            }
            if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
              return sanitizeUrl(String(result));
            }
            return escapeAttributeValue(String(result));
          }
        );

        // セレクトボックス（先に処理）
        value = value.replace(TEMPLATE_REGEX.SELECT_FIELD, (_match, fieldName, options) => {
          let result: string;
          // 区切り文字で判定: | = 単一選択、, = 複数選択
          if (options.includes('|')) {
            // セレクトボックス（単一選択）
            result = component[fieldName] || options.split('|')[0];
          } else if (options.includes(',')) {
            // セレクトボックス（複数選択）
            const selectedValues = component[fieldName];
            const valuesArray = Array.isArray(selectedValues) ? selectedValues : [];
            const optionList = options.split(',');
            result = valuesArray.filter((val: unknown) => typeof val === 'string' && optionList.includes(val)).join(' ');
          } else {
            const value = component[fieldName];
            result = typeof value === 'string' ? value : options;
          }
          if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
            return sanitizeUrl(String(result));
          }
          return escapeAttributeValue(String(result));
        });

        // グループ付きラジオボタン/チェックボックス（先に処理）
        value = value.replace(
          TEMPLATE_REGEX.RADIO_CHECKBOX_FIELD_WITH_GROUP,
          (_match, fieldName, _groupName, options) => {
            let result: string;
            // 区切り文字で判定: | = ラジオボタン（単一選択）、, = チェックボックス（複数選択）
            if (options.includes('|')) {
              // ラジオボタン: 単一選択
              result = component[fieldName] || options.split('|')[0];
            } else if (options.includes(',')) {
              // チェックボックス: 複数選択
              const selectedValues = component[fieldName];
              const valuesArray = Array.isArray(selectedValues) ? selectedValues : [];
              const optionList = options.split(',');
              result = valuesArray.filter((val: unknown) => typeof val === 'string' && optionList.includes(val)).join(' ');
            } else {
              const value = component[fieldName];
              result = typeof value === 'string' ? value : options;
            }
            if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
              return sanitizeUrl(String(result));
            }
            return escapeAttributeValue(String(result));
          }
        );

        // ラジオボタン/チェックボックス
        value = value.replace(TEMPLATE_REGEX.RADIO_FIELD, (_match, fieldName, options) => {
          let result: string;
          // 区切り文字で判定: | = ラジオボタン（単一選択）、, = チェックボックス（複数選択）
          if (options.includes('|')) {
            // ラジオボタン: 単一選択
            result = component[fieldName] || options.split('|')[0];
          } else if (options.includes(',')) {
            // チェックボックス: 複数選択
            const selectedValues = component[fieldName];
            const valuesArray = Array.isArray(selectedValues) ? selectedValues : [];
            const optionList = options.split(',');
            result = valuesArray.filter((val: unknown) => typeof val === 'string' && optionList.includes(val)).join(' ');
          } else {
            const value = component[fieldName];
            result = typeof value === 'string' ? value : options;
          }
          if (attrName === 'href' || attrName === 'src' || attrName === 'action') {
            return sanitizeUrl(String(result));
          }
          return escapeAttributeValue(String(result));
        });
        attr.value = value;
      });
    }

    node.childNodes.forEach((child) => processSelectionSyntax(child));
  };

  processSelectionSyntax(template.content);

  // 3. z-if 条件分岐処理
  const conditionalElements = template.content.querySelectorAll('[z-if]');
  conditionalElements.forEach((el) => {
    const condition = el.getAttribute('z-if');
    if (condition) {
      // 値が存在しない場合はtrue（表示）として扱う（デフォルトは表示）
      const conditionValue = component[condition] !== undefined ? component[condition] : true;
      if (!conditionValue) {
        el.remove();
      } else {
        el.removeAttribute('z-if');
      }
    } else {
      el.removeAttribute('z-if');
    }
  });

  // 3.3. z-tag タグ名の動的変更処理
  // タグ名を動的に変更する
  // 使用例: <h2 z-tag="$headingTag:h1|h2|h3">{$title:タイトル}</h2>
  const tagElements = template.content.querySelectorAll('[z-tag]');
  tagElements.forEach((el) => {
    const zTagValue = el.getAttribute('z-tag');
    if (zTagValue) {
      // $tagName:h1|h2|h3 の形式から fieldName を抽出（選択肢は無視）
      const tagMatch = zTagValue.match(/^\$(\w+)(?::(.+))?$/);
      if (tagMatch) {
        const fieldName = tagMatch[1];
        const tagValue = component[fieldName];
        const tagName = typeof tagValue === 'string' ? tagValue : el.tagName.toLowerCase();

        // 有効なタグ名かチェック（セキュリティ対策）
        const validTags = [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'div',
          'p',
          'span',
          'li',
          'ul',
          'ol',
          'section',
          'article',
          'aside',
          'nav',
          'header',
          'footer',
          'main',
          'figure',
          'figcaption',
          'blockquote',
          'pre',
          'code',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td'
        ];

        const normalizedTagName = typeof tagName === 'string' ? tagName.toLowerCase() : tagName;
        if (typeof normalizedTagName === 'string' && validTags.includes(normalizedTagName)) {
          // 新しいタグ名で要素を作成
          const newElement = doc.createElement(normalizedTagName);

          // 既存の属性をコピー（z-tag以外）
          Array.from(el.attributes).forEach((attr) => {
            if (attr.name !== 'z-tag') {
              newElement.setAttribute(attr.name, attr.value);
            }
          });

          // 子ノードをコピー
          Array.from(el.childNodes).forEach((child) => {
            newElement.appendChild(child.cloneNode(true));
          });

          // 古い要素を新しい要素に置き換え
          el.parentNode?.replaceChild(newElement, el);
        }
      }
    }
  });

  // 3.5. z-empty 条件分岐処理
  // オプショナルフィールドが空（undefined/null/空文字列/実質的に空のrichテキスト）の場合、要素を削除
  // 使用例: <div z-empty="$subtitle"><p>{$subtitle?:サブタイトル}</p></div>
  const emptyFieldElements = template.content.querySelectorAll('[z-empty]');
  emptyFieldElements.forEach((el) => {
    const condition = el.getAttribute('z-empty');
    if (condition) {
      // $fieldName の形式から fieldName を抽出
      const fieldNameMatch = condition.match(/^\$(\w+)$/);
      if (fieldNameMatch) {
        const fieldName = fieldNameMatch[1];
        const fieldValue = component[fieldName];

        // 空かどうかを判定する関数
        const isEmpty = (value: unknown): boolean => {
          if (value === undefined || value === null || value === '') {
            return true;
          }
          // richテキストが実質的に空の場合（<p></p>、<p> </p>など）
          if (typeof value === 'string') {
            const trimmed = value.trim();
            // <p></p>、<p> </p>、<p><br></p>などのパターンをチェック
            if (
              trimmed === '' ||
              trimmed === '<p></p>' ||
              trimmed === '<p> </p>' ||
              /^<p>\s*<\/p>$/i.test(trimmed) ||
              /^<p>\s*<br\s*\/?>\s*<\/p>$/i.test(trimmed)
            ) {
              return true;
            }
          }
          return false;
        };

        // 空の場合は要素を削除
        if (isEmpty(fieldValue)) {
          el.remove();
        } else {
          el.removeAttribute('z-empty');
        }
      } else {
        // 形式が正しくない場合は属性を削除
        el.removeAttribute('z-empty');
      }
    } else {
      el.removeAttribute('z-empty');
    }
  });

  // 4. z-for ループ処理（シンプル版: バックエンドデータのみ）
  const processLoops = () => {
    const loopElements = Array.from(template.content.querySelectorAll('[z-for]'));

    loopElements.forEach((loopEl) => {
      const zForValue = loopEl.getAttribute('z-for');
      if (!zForValue) {
        loopEl.removeAttribute('z-for');
        return;
      }

      // ループ式をパース: "item in {@items}"
      const match = zForValue.match(/^(\w+)\s+in\s+(.+)$/);
      if (!match) {
        console.warn(`[ZeroCode] Invalid z-for syntax: ${zForValue}`);
        loopEl.removeAttribute('z-for');
        return;
      }

      const [, itemVar, dataSourceExpr] = match;
      // dataSourceExpr = "{@items}"

      // バックエンドデータのみ対応
      if (!dataSourceExpr.startsWith('{@') || !dataSourceExpr.endsWith('}')) {
        console.warn(`[ZeroCode] z-for only supports backend data: ${dataSourceExpr}`);
        loopEl.removeAttribute('z-for');
        return;
      }

      // データソースのパスを取得
      const dataPath = dataSourceExpr.slice(2, -1); // "items"

      // バックエンドデータから配列を取得
      if (!backendData) {
        loopEl.remove();
        return;
      }

      let dataSource: unknown;
      try {
        // resolveBackendDataPathは文字列を返すので、配列の場合は直接アクセス
        const parts = dataPath.split('.');
        let current: unknown = backendData;

        for (const part of parts) {
          if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[part];
          } else {
            current = null;
            break;
          }
        }

        dataSource = current;
      } catch (error) {
        console.warn(`[ZeroCode] Failed to resolve data source: ${dataPath}`, error);
        loopEl.remove();
        return;
      }

      // 配列でない、または空の場合は削除
      if (!Array.isArray(dataSource) || dataSource.length === 0) {
        loopEl.remove();
        return;
      }

      // 各イテレーションでテンプレートを複製
      const fragment = document.createDocumentFragment();

      (dataSource as unknown[]).forEach((item) => {
        // 子要素をクローン
        const cloned = loopEl.cloneNode(true) as Element;
        cloned.removeAttribute('z-for');

        // ループ変数を展開
        expandLoopVariables(cloned, itemVar, item, component, backendData, parser);

        fragment.appendChild(cloned);
      });

      // 元の要素を置き換え
      if (loopEl.parentNode) {
        loopEl.parentNode.replaceChild(fragment, loopEl);
      }
    });
  };

  // ループ変数を展開する関数
  const expandLoopVariables = (
    element: Element,
    itemVar: string,
    item: unknown,
    component: ComponentData,
    backendData: Record<string, unknown> | undefined,
    _parser: DOMParser
  ) => {
    // テキストノード内のループ変数を展開
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent || '';

        // {item.name} のような参照を展開
        const loopVarRegex = new RegExp(`\\{${itemVar}\\.([\\w\\.\\[\\]]+)\\}`, 'g');
        text = text.replace(loopVarRegex, (_match, propPath) => {
          try {
            const parts = propPath.split(/[.[\]]/).filter((p: string) => p);
            let current: unknown = item;

            for (const part of parts) {
              if (part.match(/^\d+$/)) {
                const index = parseInt(part, 10);
                if (Array.isArray(current) && index >= 0 && index < current.length) {
                  current = current[index];
                } else {
                  return '';
                }
              } else {
                if (
                  current &&
                  typeof current === 'object' &&
                  part in (current as Record<string, unknown>)
                ) {
                  current = (current as Record<string, unknown>)[part];
                } else {
                  return '';
                }
              }
            }

            return current === null || current === undefined ? '' : String(current);
          } catch (error) {
            return '';
          }
        });

        // {item} のような直接参照も展開
        text = text.replace(new RegExp(`\\{${itemVar}\\}`, 'g'), () => {
          if (typeof item === 'object' && item !== null) {
            return JSON.stringify(item);
          }
          return String(item);
        });

        node.textContent = text;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;

        // 属性内のループ変数を展開
        Array.from(el.attributes).forEach((attr) => {
          let value = attr.value;

          // {item.name} のような参照を展開
          const loopVarRegex = new RegExp(`\\{${itemVar}\\.([\\w\\.\\[\\]]+)\\}`, 'g');
          value = value.replace(loopVarRegex, (_match, propPath) => {
            try {
              const parts = propPath.split(/[.[\]]/).filter((p: string) => p);
              let current: unknown = item;

              for (const part of parts) {
                if (part.match(/^\d+$/)) {
                  const index = parseInt(part, 10);
                  if (Array.isArray(current) && index >= 0 && index < current.length) {
                    current = current[index];
                  } else {
                    return '';
                  }
                } else {
                  if (
                    current &&
                    typeof current === 'object' &&
                    part in (current as Record<string, unknown>)
                  ) {
                    current = (current as Record<string, unknown>)[part];
                  } else {
                    return '';
                  }
                }
              }

              const result = current === null || current === undefined ? '' : String(current);

              // URL属性の場合はサニタイズ
              if (attr.name === 'href' || attr.name === 'src' || attr.name === 'action') {
                return sanitizeUrl(result);
              }
              return escapeAttributeValue(result);
            } catch (error) {
              return '';
            }
          });

          // {item} のような直接参照も展開
          value = value.replace(new RegExp(`\\{${itemVar}\\}`, 'g'), () => {
            const result =
              typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item);
            if (attr.name === 'href' || attr.name === 'src' || attr.name === 'action') {
              return sanitizeUrl(result);
            }
            return escapeAttributeValue(result);
          });

          attr.value = value;
        });

        // 子ノードを再帰的に処理
        Array.from(el.childNodes).forEach((child) => processNode(child));
      }
    };

    // 子ノードを処理
    Array.from(element.childNodes).forEach((child) => processNode(child));

    // 再帰的にprocessTemplateWithDOMを呼び出して、ループ内の他のテンプレート構文も処理
    // ただし、z-forは再帰的に処理しない（ネストループは非対応）
    const tempHtml = element.innerHTML;
    if (tempHtml) {
      // ループ変数を一時的にbackendDataに追加して、{@item.name}として参照可能にする
      // ただし、これは複雑になるので、{item.name}の形式のみサポートする
      // 既に展開済みなので、ここでは他のテンプレート構文（{$field}など）のみ処理
      const processedHtml = processTemplateWithDOM(
        tempHtml,
        component,
        path,
        _findPart,
        renderComponentToHtml,
        enableEditorAttributes,
        imagesCommon,
        imagesIndividual,
        imagesSpecial,
        backendData
      );
      element.innerHTML = processedHtml;
    }
  };

  processLoops();

  // 5. z-slot 処理
  const processSlots = (slotElements: Element[]) => {
    slotElements.forEach((slotEl) => {
      const slotName = slotEl.getAttribute('z-slot') || 'default';
      const slotData = component.slots?.[slotName];

      // SlotConfigの場合はchildrenプロパティを使用、そうでなければ配列として扱う
      let children: ComponentData[] = [];
      if (Array.isArray(slotData)) {
        children = slotData;
      } else if (slotData && typeof slotData === 'object' && (slotData as SlotConfig).children) {
        children = (slotData as SlotConfig).children || [];
      }

      if (children.length === 0) {
        // 空のスロットの場合は追加ボタンを表示（編集用属性が有効な場合のみ）
        slotEl.removeAttribute('z-slot');
        if (enableEditorAttributes) {
          slotEl.setAttribute('data-zcode-empty-slot', slotName);
          slotEl.setAttribute(
            'data-zcode-slot-path',
            path ? `${path}.slots.${slotName}` : `slots.${slotName}`
          );
          const addSlotButtonText = options?.translations?.addSlotButton ?? '+ Add Part';
          slotEl.innerHTML = `<div class="zcode-empty-slot" data-zcode-empty-slot-content>
            <button class="zcode-add-slot-btn" data-zcode-add-slot>${addSlotButtonText}</button>
          </div>`;
        } else {
          // 公開用の場合は空のスロットをそのまま表示（追加ボタンなし）
          slotEl.innerHTML = '';
        }
        return;
      }

      // 子コンポーネントをレンダリング
      // renderComponentToHtmlは既に属性を注入しているので、追加の処理は不要
      const childrenHtml = children
        .map((child: ComponentData, childIndex: number) => {
          const childPath = path
            ? `${path}.slots.${slotName}.${childIndex}`
            : `slots.${slotName}.${childIndex}`;
          // renderComponentToHtmlが既に属性を注入している
          return renderComponentToHtml(child, childPath);
        })
        .join('');

      // z-slot属性を削除してから子要素を挿入
      slotEl.removeAttribute('z-slot');

      // すべての要素をタグに依存しない方法で挿入
      // HTMLをパースしてDOM要素として挿入することで、属性が確実に保持される
      const tempDoc = parser.parseFromString(`<template>${childrenHtml}</template>`, 'text/html');
      const tempTemplate = tempDoc.querySelector('template');
      if (tempTemplate && tempTemplate.content) {
        // 既存の子要素を削除
        slotEl.innerHTML = '';
        // テンプレート内の要素を移動（クローンではなく移動）
        while (tempTemplate.content.firstChild) {
          slotEl.appendChild(tempTemplate.content.firstChild);
        }
      } else {
        // フォールバック: 通常のinnerHTML設定
        slotEl.innerHTML = childrenHtml;
      }
    });
  };

  // 名前付きスロットとデフォルトスロットを処理
  // querySelectorAllの結果を配列にコピーしてから処理（DOM変更による影響を防ぐ）
  const namedSlots = Array.from(template.content.querySelectorAll('[z-slot]'));
  processSlots(namedSlots);

  return template.innerHTML;
}
