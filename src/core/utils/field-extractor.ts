import { getDOMParser } from './dom-utils';
import { TEMPLATE_REGEX, type FieldInfo } from './template-regex';

export function parseValidationFromTokens(tokens: string[]) {
  const parsed: Pick<FieldInfo, 'required' | 'maxLength' | 'readonly' | 'disabled'> = {};
  for (const token of tokens) {
    if (token === 'required') {
      parsed.required = true;
      continue;
    }
    if (token === 'readonly') {
      parsed.readonly = true;
      continue;
    }
    if (token === 'disabled') {
      parsed.disabled = true;
      continue;
    }
    if (token.startsWith('max=')) {
      const n = Number(token.slice(4));
      if (Number.isFinite(n)) {
        parsed.maxLength = n;
      }
    }
  }
  return parsed;
}

export function splitDefaultAndValidation(raw: string) {
  const tokens = raw.split(':');
  const validationTokens: string[] = [];
  const isValidationToken = (t: string) =>
    t === 'required' || t === 'readonly' || t === 'disabled' || /^max=\d+$/.test(t);

  while (tokens.length > 0 && isValidationToken(tokens[tokens.length - 1])) {
    validationTokens.unshift(tokens.pop() as string);
  }

  return {
    defaultValue: tokens.join(':'),
    validation: parseValidationFromTokens(validationTokens)
  };
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
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';

      // オプショナルフィールドを先にチェック（グループ付きリッチテキスト）
      const richTextWithGroupOptionalRegex = /\{\$(\w+)\.(\w+)\?:(.+?):rich(?::[^}]+)?\}/g;
      const richTextWithGroupOptionalMatches = Array.from(
        text.matchAll(richTextWithGroupOptionalRegex)
      );
      richTextWithGroupOptionalMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3]) {
          const fieldName = match[1];
          const groupName = match[2];
          if (!seenFields.has(fieldName)) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
            fields.push({
              fieldName: fieldName,
              groupName: groupName,
              type: 'rich',
              defaultValue,
              optional: true,
              ...validation
            });
            seenFields.add(fieldName);
          }
        }
      });

      // オプショナルフィールドを先にチェック（リッチテキスト）
      const richTextOptionalRegex = /\{\$(\w+)\?:(.+?):rich(?::[^}]+)?\}/g;
      const richTextOptionalMatches = Array.from(text.matchAll(richTextOptionalRegex));
      richTextOptionalMatches.forEach((match) => {
        if (match && match[1] && match[2]) {
          const fieldName = match[1];
          if (!seenFields.has(fieldName)) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
            fields.push({
              fieldName: fieldName,
              type: 'rich',
              defaultValue,
              optional: true,
              ...validation
            });
            seenFields.add(fieldName);
          }
        }
      });

      const richTextWithGroupRegex = new RegExp(
        TEMPLATE_REGEX.RICH_TEXT_FIELD_WITH_GROUP.source,
        TEMPLATE_REGEX.RICH_TEXT_FIELD_WITH_GROUP.flags
      );
      const richTextWithGroupMatches = Array.from(text.matchAll(richTextWithGroupRegex));
      richTextWithGroupMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3]) {
          const fieldName = match[1];
          const groupName = match[2];
          if (!seenFields.has(fieldName)) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
            fields.push({
              fieldName: fieldName,
              groupName: groupName,
              type: 'rich',
              defaultValue,
              ...validation
            });
            seenFields.add(fieldName);
          }
        }
      });

      const richTextRegex = new RegExp(
        TEMPLATE_REGEX.RICH_TEXT_FIELD.source,
        TEMPLATE_REGEX.RICH_TEXT_FIELD.flags
      );
      const richTextMatches = Array.from(text.matchAll(richTextRegex));
      richTextMatches.forEach((match) => {
        if (match && match[1] && match[2]) {
          const fieldName = match[1];
          if (!seenFields.has(fieldName)) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
            fields.push({
              fieldName: fieldName,
              type: 'rich',
              defaultValue,
              ...validation
            });
            seenFields.add(fieldName);
          }
        }
      });

      // オプショナルフィールドを先にチェック（グループ付きテキストエリア）
      const textareaWithGroupOptionalRegex = /\{\$(\w+)\.(\w+)\?:(.+?):textarea(?::[^}]+)?\}/g;
      const textareaWithGroupOptionalMatches = Array.from(
        text.matchAll(textareaWithGroupOptionalRegex)
      );
      textareaWithGroupOptionalMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
          fields.push({
            fieldName: match[1],
            groupName: match[2],
            type: 'textarea',
            defaultValue,
            optional: true,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      // オプショナルフィールドを先にチェック（テキストエリア）
      const textareaOptionalRegex = /\{\$(\w+)\?:(.+?):textarea(?::[^}]+)?\}/g;
      const textareaOptionalMatches = Array.from(text.matchAll(textareaOptionalRegex));
      textareaOptionalMatches.forEach((match) => {
        if (match && match[1] && match[2] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
          fields.push({
            fieldName: match[1],
            type: 'textarea',
            defaultValue,
            optional: true,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      const textareaWithGroupRegex = new RegExp(
        TEMPLATE_REGEX.TEXTAREA_FIELD_WITH_GROUP.source,
        TEMPLATE_REGEX.TEXTAREA_FIELD_WITH_GROUP.flags
      );
      const textareaWithGroupMatches = Array.from(text.matchAll(textareaWithGroupRegex));
      textareaWithGroupMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
          fields.push({
            fieldName: match[1],
            groupName: match[2],
            type: 'textarea',
            defaultValue,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      const textareaRegex = new RegExp(
        TEMPLATE_REGEX.TEXTAREA_FIELD.source,
        TEMPLATE_REGEX.TEXTAREA_FIELD.flags
      );
      const textareaMatches = Array.from(text.matchAll(textareaRegex));
      textareaMatches.forEach((match) => {
        if (match && match[1] && match[2] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
          fields.push({
            fieldName: match[1],
            type: 'textarea',
            defaultValue,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      // オプショナルフィールドを先にチェック（グループ付き画像）
      const imageWithGroupOptionalRegex = /\{\$(\w+)\.(\w+)\?:(.+?):image(?::[^}]+)?\}/g;
      const imageWithGroupOptionalMatches = Array.from(text.matchAll(imageWithGroupOptionalRegex));
      imageWithGroupOptionalMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
          fields.push({
            fieldName: match[1],
            groupName: match[2],
            type: 'image',
            defaultValue,
            optional: true,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      // オプショナルフィールドを先にチェック（画像）
      const imageOptionalRegex = /\{\$(\w+)\?:(.+?):image(?::[^}]+)?\}/g;
      const imageOptionalMatches = Array.from(text.matchAll(imageOptionalRegex));
      imageOptionalMatches.forEach((match) => {
        if (match && match[1] && match[2] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
          fields.push({
            fieldName: match[1],
            type: 'image',
            defaultValue,
            optional: true,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      const imageWithGroupRegex = new RegExp(
        TEMPLATE_REGEX.IMAGE_FIELD_WITH_GROUP.source,
        TEMPLATE_REGEX.IMAGE_FIELD_WITH_GROUP.flags
      );
      const imageWithGroupMatches = Array.from(text.matchAll(imageWithGroupRegex));
      imageWithGroupMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
          fields.push({
            fieldName: match[1],
            groupName: match[2],
            type: 'image',
            defaultValue,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      const imageRegex = new RegExp(
        TEMPLATE_REGEX.IMAGE_FIELD.source,
        TEMPLATE_REGEX.IMAGE_FIELD.flags
      );
      const imageMatches = Array.from(text.matchAll(imageRegex));
      imageMatches.forEach((match) => {
        if (match && match[1] && match[2] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
          fields.push({
            fieldName: match[1],
            type: 'image',
            defaultValue,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      // オプショナルフィールドを先にチェック（グループ付きテキスト）
      const textWithGroupOptionalRegex = /\{\$(\w+)\.(\w+)\?:([^}]+)\}/g;
      const textWithGroupOptionalMatches = Array.from(text.matchAll(textWithGroupOptionalRegex));
      textWithGroupOptionalMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
          fields.push({
            fieldName: match[1],
            groupName: match[2],
            type: 'text',
            defaultValue,
            optional: true,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      // オプショナルフィールドを先にチェック（テキスト）
      const textOptionalRegex = /\{\$(\w+)\?:([^}]+)\}/g;
      const textOptionalMatches = Array.from(text.matchAll(textOptionalRegex));
      textOptionalMatches.forEach((match) => {
        if (
          match &&
          match[0] &&
          !/:rich(?::[^}]*)?\}$/.test(match[0]) &&
          !/:image(?::[^}]*)?\}$/.test(match[0]) &&
          !/:textarea(?::[^}]*)?\}$/.test(match[0]) &&
          !match[0].includes('.')
        ) {
          if (match[1] && match[2] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
            fields.push({
              fieldName: match[1],
              type: 'text',
              defaultValue,
              optional: true,
              ...validation
            });
            seenFields.add(match[1]);
          }
        }
      });

      // グループ付きテキストフィールド（先にチェック）
      const textWithGroupRegex = new RegExp(
        TEMPLATE_REGEX.TEXT_FIELD_WITH_GROUP.source,
        TEMPLATE_REGEX.TEXT_FIELD_WITH_GROUP.flags
      );
      const textWithGroupMatches = Array.from(text.matchAll(textWithGroupRegex));
      textWithGroupMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
          const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
          fields.push({
            fieldName: match[1],
            groupName: match[2],
            type: 'text',
            defaultValue,
            ...validation
          });
          seenFields.add(match[1]);
        }
      });

      const textRegex = new RegExp(
        TEMPLATE_REGEX.TEXT_FIELD.source,
        TEMPLATE_REGEX.TEXT_FIELD.flags
      );
      const textMatches = Array.from(text.matchAll(textRegex));
      textMatches.forEach((match) => {
        if (
          match &&
          match[0] &&
          !/:rich(?::[^}]*)?\}$/.test(match[0]) &&
          !/:image(?::[^}]*)?\}$/.test(match[0]) &&
          !/:textarea(?::[^}]*)?\}$/.test(match[0]) &&
          !match[0].includes('.')
        ) {
          if (match[1] && match[2] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
            fields.push({
              fieldName: match[1],
              type: 'text',
              defaultValue,
              ...validation
            });
            seenFields.add(match[1]);
          }
        }
      });

      const selectWithGroupRegex = new RegExp(
        TEMPLATE_REGEX.SELECT_FIELD_WITH_GROUP.source,
        TEMPLATE_REGEX.SELECT_FIELD_WITH_GROUP.flags
      );
      const selectWithGroupMatches = Array.from(text.matchAll(selectWithGroupRegex));
      selectWithGroupMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
          const fieldName = match[1];
          const groupName = match[2];
          const optionsStr = match[3];

          // 区切り文字で判定: | = 単一選択、, = 複数選択
          if (optionsStr.includes('|')) {
            fields.push({
              fieldName: fieldName,
              groupName: groupName,
              type: 'select',
              options: optionsStr.split('|')
            });
          } else if (optionsStr.includes(',')) {
            fields.push({
              fieldName: fieldName,
              groupName: groupName,
              type: 'select-multiple',
              options: optionsStr.split(',')
            });
          }
          seenFields.add(fieldName);
        }
      });

      // セレクトボックス（グループなし）
      const selectMatches = text.match(TEMPLATE_REGEX.SELECT_FIELD) || [];
      selectMatches.forEach((match) => {
        const m = match.match(/\(\$(\w+)@:([^)]+)\)/);
        if (m && !seenFields.has(m[1])) {
          const fieldName = m[1];
          const optionsStr = m[2];

          // 区切り文字で判定: | = 単一選択、, = 複数選択
          if (optionsStr.includes('|')) {
            fields.push({
              fieldName: fieldName,
              type: 'select',
              options: optionsStr.split('|')
            });
          } else if (optionsStr.includes(',')) {
            fields.push({
              fieldName: fieldName,
              type: 'select-multiple',
              options: optionsStr.split(',')
            });
          }
          seenFields.add(fieldName);
        }
      });

      // グループ付きラジオボタン/チェックボックス（先にチェック）
      const radioCheckboxWithGroupRegex = new RegExp(
        TEMPLATE_REGEX.RADIO_CHECKBOX_FIELD_WITH_GROUP.source,
        TEMPLATE_REGEX.RADIO_CHECKBOX_FIELD_WITH_GROUP.flags
      );
      const radioCheckboxWithGroupMatches = Array.from(text.matchAll(radioCheckboxWithGroupRegex));
      radioCheckboxWithGroupMatches.forEach((match) => {
        if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
          const fieldName = match[1];
          const groupName = match[2];
          const optionsStr = match[3];

          // 区切り文字で判定: | = ラジオボタン、, = チェックボックス
          if (optionsStr.includes('|')) {
            fields.push({
              fieldName: fieldName,
              groupName: groupName,
              type: 'radio',
              options: optionsStr.split('|')
            });
          } else if (optionsStr.includes(',')) {
            fields.push({
              fieldName: fieldName,
              groupName: groupName,
              type: 'checkbox',
              options: optionsStr.split(',')
            });
          }
          seenFields.add(fieldName);
        }
      });

      // ラジオボタン/チェックボックス（グループなし）
      const selectionMatches = text.match(TEMPLATE_REGEX.RADIO_FIELD) || [];
      selectionMatches.forEach((match) => {
        const m = match.match(/\(\$(\w+):([^)]+)\)/);
        if (m && !seenFields.has(m[1])) {
          const fieldName = m[1];
          const optionsStr = m[2];

          // 区切り文字で判定: | = ラジオボタン、, = チェックボックス
          if (optionsStr.includes('|')) {
            fields.push({
              fieldName: fieldName,
              type: 'radio',
              options: optionsStr.split('|')
            });
          } else if (optionsStr.includes(',')) {
            fields.push({
              fieldName: fieldName,
              type: 'checkbox',
              options: optionsStr.split(',')
            });
          }
          seenFields.add(fieldName);
        }
      });
      // TEXT_NODEには子ノードがないので、ここで終了
      return;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;

      // z-if属性をチェック
      const zIfValue = element.getAttribute('z-if');
      if (zIfValue && !seenFields.has(zIfValue)) {
        fields.push({
          fieldName: zIfValue,
          type: 'boolean',
          defaultValue: 'true'
        });
        seenFields.add(zIfValue);
      }

      // z-tag属性をチェック
      const zTagValue = element.getAttribute('z-tag');
      if (zTagValue) {
        // $tagName:h1|h2|h3 の形式を解析
        const tagMatch = zTagValue.match(/^\$(\w+)(?::(.+))?$/);
        if (tagMatch) {
          const fieldName = tagMatch[1];
          const optionsString = tagMatch[2]; // "h1|h2|h3" または undefined

          if (!seenFields.has(fieldName)) {
            // 選択肢が指定されている場合はパース
            const options = optionsString
              ? optionsString.split('|').map((opt) => opt.trim())
              : undefined;

            // デフォルト値はテンプレートで書いたタグ名
            const currentTagName = element.tagName.toLowerCase();
            let defaultValue = currentTagName;

            // 選択肢が指定されている場合、現在のタグ名が選択肢に含まれているかチェック
            if (options && !options.includes(currentTagName)) {
              // 含まれていない場合は警告を出して、最初の選択肢を使用
              if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
                console.warn(
                  `[ZeroCode] z-tag="${zTagValue}": 現在のタグ名 "${currentTagName}" が選択肢に含まれていません。` +
                    `デフォルト値として "${options[0]}" を使用します。`
                );
              }
              defaultValue = options[0];
            }

            fields.push({
              fieldName: fieldName,
              type: 'tag',
              defaultValue: defaultValue,
              options: options,
              optional: false
            });
            seenFields.add(fieldName);
          }
        }
      }

      // 属性内のフィールドもチェック
      Array.from(element.attributes).forEach((attr) => {
        const value = attr.value;

        // オプショナルフィールドを先にチェック（属性内、グループ付きリッチテキスト）
        const richTextWithGroupOptionalRegex = /\{\$(\w+)\.(\w+)\?:(.+?):rich(?::[^}]+)?\}/g;
        const richTextWithGroupOptionalMatches = Array.from(
          value.matchAll(richTextWithGroupOptionalRegex)
        );
        richTextWithGroupOptionalMatches.forEach((match) => {
          if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
            fields.push({
              fieldName: match[1],
              groupName: match[2],
              type: 'rich',
              defaultValue,
              optional: true,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // オプショナルフィールドを先にチェック（属性内、リッチテキスト）
        const richTextOptionalRegex = /\{\$(\w+)\?:(.+?):rich(?::[^}]+)?\}/g;
        const richTextOptionalMatches = Array.from(value.matchAll(richTextOptionalRegex));
        richTextOptionalMatches.forEach((match) => {
          if (match && match[1] && match[2] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
            fields.push({
              fieldName: match[1],
              type: 'rich',
              defaultValue,
              optional: true,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // グループ付きリッチテキストフィールド（先にチェック）
        const richTextWithGroupRegex = new RegExp(
          TEMPLATE_REGEX.RICH_TEXT_FIELD_WITH_GROUP.source,
          TEMPLATE_REGEX.RICH_TEXT_FIELD_WITH_GROUP.flags
        );
        const richTextWithGroupMatches = Array.from(value.matchAll(richTextWithGroupRegex));
        richTextWithGroupMatches.forEach((match) => {
          if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
            fields.push({
              fieldName: match[1],
              groupName: match[2],
              type: 'rich',
              defaultValue,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // リッチテキストフィールド（グループなし）
        const richTextRegex = new RegExp(
          TEMPLATE_REGEX.RICH_TEXT_FIELD.source,
          TEMPLATE_REGEX.RICH_TEXT_FIELD.flags
        );
        const richTextMatches = Array.from(value.matchAll(richTextRegex));
        richTextMatches.forEach((match) => {
          if (match && match[1] && match[2] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
            fields.push({
              fieldName: match[1],
              type: 'rich',
              defaultValue,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // オプショナルフィールドを先にチェック（属性内、グループ付き画像）
        const imageWithGroupOptionalRegex = /\{\$(\w+)\.(\w+)\?:(.+?):image(?::[^}]+)?\}/g;
        const imageWithGroupOptionalMatches = Array.from(
          value.matchAll(imageWithGroupOptionalRegex)
        );
        imageWithGroupOptionalMatches.forEach((match) => {
          if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
            fields.push({
              fieldName: match[1],
              groupName: match[2],
              type: 'image',
              defaultValue,
              optional: true,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // オプショナルフィールドを先にチェック（属性内、画像）
        const imageOptionalRegex = /\{\$(\w+)\?:(.+?):image(?::[^}]+)?\}/g;
        const imageOptionalMatches = Array.from(value.matchAll(imageOptionalRegex));
        imageOptionalMatches.forEach((match) => {
          if (match && match[1] && match[2] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
            fields.push({
              fieldName: match[1],
              type: 'image',
              defaultValue,
              optional: true,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // グループ付き画像フィールド（先にチェック）
        const imageWithGroupRegex = new RegExp(
          TEMPLATE_REGEX.IMAGE_FIELD_WITH_GROUP.source,
          TEMPLATE_REGEX.IMAGE_FIELD_WITH_GROUP.flags
        );
        const imageWithGroupMatches = Array.from(value.matchAll(imageWithGroupRegex));
        imageWithGroupMatches.forEach((match) => {
          if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
            fields.push({
              fieldName: match[1],
              groupName: match[2],
              type: 'image',
              defaultValue,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // 画像フィールド（グループなし）
        const imageRegex = new RegExp(
          TEMPLATE_REGEX.IMAGE_FIELD.source,
          TEMPLATE_REGEX.IMAGE_FIELD.flags
        );
        const imageMatches = Array.from(value.matchAll(imageRegex));
        imageMatches.forEach((match) => {
          if (match && match[1] && match[2] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
            fields.push({
              fieldName: match[1],
              type: 'image',
              defaultValue,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // オプショナルフィールドを先にチェック（属性内、グループ付きテキスト）
        const textWithGroupOptionalRegex = /\{\$(\w+)\.(\w+)\?:([^}]+)\}/g;
        const textWithGroupOptionalMatches = Array.from(value.matchAll(textWithGroupOptionalRegex));
        textWithGroupOptionalMatches.forEach((match) => {
          if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
            fields.push({
              fieldName: match[1],
              groupName: match[2],
              type: 'text',
              defaultValue,
              optional: true,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // オプショナルフィールドを先にチェック（属性内、テキスト）
        const textOptionalRegex = /\{\$(\w+)\?:([^}]+)\}/g;
        const textOptionalMatches = Array.from(value.matchAll(textOptionalRegex));
        textOptionalMatches.forEach((match) => {
          if (
            match &&
            match[0] &&
            !/:rich(?::[^}]*)?\}$/.test(match[0]) &&
            !/:image(?::[^}]*)?\}$/.test(match[0]) &&
            !/:textarea(?::[^}]*)?\}$/.test(match[0]) &&
            !match[0].includes('.')
          ) {
            if (match[1] && match[2] && !seenFields.has(match[1])) {
              const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
              fields.push({
                fieldName: match[1],
                type: 'text',
                defaultValue,
                optional: true,
                ...validation
              });
              seenFields.add(match[1]);
            }
          }
        });

        // グループ付きテキストフィールド（先にチェック）
        const textWithGroupRegex = new RegExp(
          TEMPLATE_REGEX.TEXT_FIELD_WITH_GROUP.source,
          TEMPLATE_REGEX.TEXT_FIELD_WITH_GROUP.flags
        );
        const textWithGroupMatches = Array.from(value.matchAll(textWithGroupRegex));
        textWithGroupMatches.forEach((match) => {
          if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
            const { defaultValue, validation } = splitDefaultAndValidation(match[3]);
            fields.push({
              fieldName: match[1],
              groupName: match[2],
              type: 'text',
              defaultValue,
              ...validation
            });
            seenFields.add(match[1]);
          }
        });

        // 通常テキストフィールド（グループなし）
        const textRegex = new RegExp(
          TEMPLATE_REGEX.TEXT_FIELD.source,
          TEMPLATE_REGEX.TEXT_FIELD.flags
        );
        const textMatches = Array.from(value.matchAll(textRegex));
        textMatches.forEach((match) => {
          if (
            match &&
            match[0] &&
            !/:rich(?::[^}]*)?\}$/.test(match[0]) &&
            !/:image(?::[^}]*)?\}$/.test(match[0]) &&
            !/:textarea(?::[^}]*)?\}$/.test(match[0]) &&
            !match[0].includes('.')
          ) {
            if (match[1] && match[2] && !seenFields.has(match[1])) {
              const { defaultValue, validation } = splitDefaultAndValidation(match[2]);
              fields.push({
                fieldName: match[1],
                type: 'text',
                defaultValue,
                ...validation
              });
              seenFields.add(match[1]);
            }
          }
        });

        // グループ付きセレクトボックス（属性内、先にチェック）
        const selectWithGroupRegex = new RegExp(
          TEMPLATE_REGEX.SELECT_FIELD_WITH_GROUP.source,
          TEMPLATE_REGEX.SELECT_FIELD_WITH_GROUP.flags
        );
        const selectWithGroupMatches = Array.from(value.matchAll(selectWithGroupRegex));
        selectWithGroupMatches.forEach((match) => {
          if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
            const fieldName = match[1];
            const groupName = match[2];
            const optionsStr = match[3];

            // 区切り文字で判定: | = 単一選択、, = 複数選択
            if (optionsStr.includes('|')) {
              fields.push({
                fieldName: fieldName,
                groupName: groupName,
                type: 'select',
                options: optionsStr.split('|')
              });
            } else if (optionsStr.includes(',')) {
              fields.push({
                fieldName: fieldName,
                groupName: groupName,
                type: 'select-multiple',
                options: optionsStr.split(',')
              });
            }
            seenFields.add(fieldName);
          }
        });

        // セレクトボックス（属性内、グループなし）
        const selectMatches = value.match(TEMPLATE_REGEX.SELECT_FIELD) || [];
        selectMatches.forEach((match) => {
          const m = match.match(/\(\$(\w+)@:([^)]+)\)/);
          if (m && !seenFields.has(m[1])) {
            const fieldName = m[1];
            const optionsStr = m[2];

            // 区切り文字で判定: | = 単一選択、, = 複数選択
            if (optionsStr.includes('|')) {
              fields.push({
                fieldName: fieldName,
                type: 'select',
                options: optionsStr.split('|')
              });
            } else if (optionsStr.includes(',')) {
              fields.push({
                fieldName: fieldName,
                type: 'select-multiple',
                options: optionsStr.split(',')
              });
            }
            seenFields.add(fieldName);
          }
        });

        // グループ付きラジオボタン/チェックボックス（属性内、先にチェック）
        const radioCheckboxWithGroupRegex = new RegExp(
          TEMPLATE_REGEX.RADIO_CHECKBOX_FIELD_WITH_GROUP.source,
          TEMPLATE_REGEX.RADIO_CHECKBOX_FIELD_WITH_GROUP.flags
        );
        const radioCheckboxWithGroupMatches = Array.from(
          value.matchAll(radioCheckboxWithGroupRegex)
        );
        radioCheckboxWithGroupMatches.forEach((match) => {
          if (match && match[1] && match[2] && match[3] && !seenFields.has(match[1])) {
            const fieldName = match[1];
            const groupName = match[2];
            const optionsStr = match[3];

            // 区切り文字で判定: | = ラジオボタン、, = チェックボックス
            if (optionsStr.includes('|')) {
              fields.push({
                fieldName: fieldName,
                groupName: groupName,
                type: 'radio',
                options: optionsStr.split('|')
              });
            } else if (optionsStr.includes(',')) {
              fields.push({
                fieldName: fieldName,
                groupName: groupName,
                type: 'checkbox',
                options: optionsStr.split(',')
              });
            }
            seenFields.add(fieldName);
          }
        });

        // ラジオボタン/チェックボックス（属性内、グループなし）
        const selectionMatches = value.match(TEMPLATE_REGEX.RADIO_FIELD) || [];
        selectionMatches.forEach((match) => {
          const m = match.match(/\(\$(\w+):([^)]+)\)/);
          if (m && !seenFields.has(m[1])) {
            const fieldName = m[1];
            const optionsStr = m[2];

            // 区切り文字で判定: | = ラジオボタン、, = チェックボックス
            if (optionsStr.includes('|')) {
              fields.push({
                fieldName: fieldName,
                type: 'radio',
                options: optionsStr.split('|')
              });
            } else if (optionsStr.includes(',')) {
              fields.push({
                fieldName: fieldName,
                type: 'checkbox',
                options: optionsStr.split(',')
              });
            }
            seenFields.add(fieldName);
          }
        });
      });

      // ELEMENT_NODEの子ノードを処理（配列にコピーしてから処理）
      const childNodes = Array.from(node.childNodes);
      childNodes.forEach((child) => processNode(child));
      return;
    } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // DocumentFragmentの子ノードを処理（配列にコピーしてから処理）
      const childNodes = Array.from(node.childNodes);
      childNodes.forEach((child) => processNode(child));
      return;
    }
    // その他のノードタイプは処理しない
  };

  // templateEl.contentはDocumentFragmentなので、その子ノードを直接処理
  const childNodes = Array.from(templateEl.content.childNodes);
  childNodes.forEach((child) => processNode(child));

  return fields;
}
