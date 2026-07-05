import { getDOMParser, DOM_NODE_TYPE_ELEMENT, DOM_NODE_TYPE_TEXT } from './dom-utils';
import type { FieldInfo } from './template-regex';
import { mapRawChoices } from './choice-options';
import { logger } from './logger';
import {
  scanFieldTokens,
  splitDefaultAndValidation,
  parseValidationFromTokens,
  type FieldToken
} from './field-syntax';

export { splitDefaultAndValidation, parseValidationFromTokens };

/**
 * 従来実装の分岐評価順（型 → optional/group バリアント → 選択肢）を再現するためのランク。
 * 抽出結果の並び順は編集パネルの表示順に直結するため、トークンの出現位置順ではなく
 * このランク順（同ランク内は出現位置順）で登録する。
 */
function legacyExtractionRank(token: FieldToken): number {
  if (token.kind === 'value') {
    const typeRank = { rich: 0, textarea: 1, image: 2, text: 3 }[token.fieldType];
    const variantRank = token.optional ? (token.groupName ? 0 : 1) : token.groupName ? 2 : 3;
    return typeRank * 4 + variantRank;
  }
  return token.select ? (token.groupName ? 16 : 17) : token.groupName ? 18 : 19;
}

// 従来の text 汎用パターンの除外ガード:
// 型サフィックス付き（{$f::rich} 等の型判定不成立ケース）と、raw に . を含むものは抽出しない
const TYPE_SUFFIX_GUARD = /(?::rich|:image|:textarea)(?::[^}]*)?\}$/;

function shouldSkipValueToken(
  token: Extract<FieldToken, { kind: 'value' }>,
  context: 'text' | 'attr'
): boolean {
  if (context === 'attr' && token.fieldType === 'textarea') {
    // 属性内では textarea を抽出しない（従来仕様）
    return true;
  }
  if (
    token.fieldType === 'text' &&
    !token.groupName &&
    (TYPE_SUFFIX_GUARD.test(token.raw) || token.raw.includes('.'))
  ) {
    return true;
  }
  return false;
}

function collectFieldsFromString(
  text: string,
  context: 'text' | 'attr',
  fields: FieldInfo[],
  seenFields: Set<string>
): void {
  const ranked = scanFieldTokens(text)
    .map((token, index) => ({ token, index }))
    .sort(
      (a, b) => legacyExtractionRank(a.token) - legacyExtractionRank(b.token) || a.index - b.index
    );

  for (const { token } of ranked) {
    if (seenFields.has(token.fieldName)) continue;

    if (token.kind === 'value') {
      if (shouldSkipValueToken(token, context)) continue;
      fields.push({
        fieldName: token.fieldName,
        ...(token.groupName ? { groupName: token.groupName } : {}),
        type: token.fieldType,
        defaultValue: token.defaultValue,
        ...(token.optional ? { optional: true } : {}),
        ...token.validation
      });
      seenFields.add(token.fieldName);
      continue;
    }

    if (token.delimiter === null) {
      // 区切り文字なし（選択肢が1つ）は登録しない（従来仕様。seen にだけ追加）
      seenFields.add(token.fieldName);
      continue;
    }
    const single = token.delimiter === '|';
    const type = token.select
      ? single
        ? 'select'
        : 'select-multiple'
      : single
        ? 'radio'
        : 'checkbox';
    fields.push({
      fieldName: token.fieldName,
      ...(token.groupName ? { groupName: token.groupName } : {}),
      type,
      options: mapRawChoices(token.rawOptions, token.delimiter)
    });
    seenFields.add(token.fieldName);
  }
}

export function extractFieldsFromTemplate(template: string): FieldInfo[] {
  const fields: FieldInfo[] = [];
  const seenFields = new Set<string>();

  const DOMParser = getDOMParser();
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<template>${template}</template>`, 'text/html');
  const templateEl = doc.querySelector('template');

  if (!templateEl) return fields;

  const processNode = (node: Node) => {
    if (node.nodeType === DOM_NODE_TYPE_TEXT) {
      collectFieldsFromString(node.textContent || '', 'text', fields, seenFields);
      return;
    }

    if (node.nodeType === DOM_NODE_TYPE_ELEMENT) {
      const element = node as Element;

      const zIfValue = element.getAttribute('z-if');
      if (zIfValue && !seenFields.has(zIfValue)) {
        fields.push({
          fieldName: zIfValue,
          type: 'boolean',
          defaultValue: 'true'
        });
        seenFields.add(zIfValue);
      }

      const zTagValue = element.getAttribute('z-tag');
      if (zTagValue) {
        // $tagName:h1|h2|h3 の形式を解析
        const tagMatch = zTagValue.match(/^\$(\w+)(?::(.+))?$/);
        if (tagMatch) {
          const fieldName = tagMatch[1];
          const optionsString = tagMatch[2];

          if (!seenFields.has(fieldName)) {
            const parsedOptions = optionsString ? mapRawChoices(optionsString, '|') : undefined;
            const values = parsedOptions?.map((o) => o.value);

            // デフォルト値はテンプレートで書いたタグ名
            const currentTagName = element.tagName.toLowerCase();
            let defaultValue = currentTagName;

            // 選択肢が指定されている場合、現在のタグ名が選択肢に含まれているかチェック
            if (values && !values.includes(currentTagName)) {
              if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
                logger.warn(
                  `z-tag="${zTagValue}": 現在のタグ名 "${currentTagName}" が選択肢に含まれていません。` +
                    `デフォルト値として "${values[0]}" を使用します。`
                );
              }
              defaultValue = values[0];
            }

            fields.push({
              fieldName: fieldName,
              type: 'tag',
              defaultValue: defaultValue,
              options: parsedOptions,
              optional: false
            });
            seenFields.add(fieldName);
          }
        }
      }

      Array.from(element.attributes).forEach((attr) => {
        collectFieldsFromString(attr.value, 'attr', fields, seenFields);
      });

      const childNodes = Array.from(node.childNodes);
      childNodes.forEach((child) => processNode(child));
      return;
    }

    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      const childNodes = Array.from(node.childNodes);
      childNodes.forEach((child) => processNode(child));
      return;
    }
  };

  const childNodes = Array.from(templateEl.content.childNodes);
  childNodes.forEach((child) => processNode(child));

  return fields;
}
