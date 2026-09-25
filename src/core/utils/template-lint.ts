import { scanFieldTokens, type ValueFieldToken } from './field-syntax';

export type TemplateSyntaxWarningCode =
  | 'unrecognized'
  | 'default-contains-dot'
  | 'empty-default-before-type'
  | 'validation-after-type';

export interface TemplateSyntaxWarning {
  code: TemplateSyntaxWarningCode;
  /** 問題のある記法の原文 */
  raw: string;
  /** 型の後ろに書かれて無視される validation トークン（validation-after-type のみ） */
  ignored?: string[];
}

const VALUE_FIELD_CANDIDATE = /\{\$[^}]*\}/g;
const TYPE_TOKENS = ['rich', 'textarea', 'image'];
// field-extractor.ts の TYPE_SUFFIX_GUARD と同じ判定（型の前のデフォルト値が空で、型として認識されないケース）
const TYPE_SUFFIX_GUARD = /(?::rich|:image|:textarea)(?::[^}]*)?\}$/;

const isValidationToken = (t: string) =>
  t === 'required' || t === 'readonly' || t === 'disabled' || /^max=\d+$/.test(t);

function ignoredValidationAfterType(token: ValueFieldToken): string[] {
  const segments = token.body.split(':');
  const typeIndex = segments.findIndex((s, i) => i > 0 && s === token.fieldType);
  return segments.slice(typeIndex + 1).filter(isValidationToken);
}

/**
 * パーツテンプレートのフィールド記法のうち、編集パネルに出ない・設定が無視されるなど、
 * 作者の意図どおりに動かない書き方を検出する。
 */
export function lintTemplateSyntax(template: string): TemplateSyntaxWarning[] {
  const warnings: TemplateSyntaxWarning[] = [];
  const valueTokens = scanFieldTokens(template).filter(
    (t): t is ValueFieldToken => t.kind === 'value'
  );
  const tokenStarts = new Set(valueTokens.map((t) => t.start));

  for (const match of template.matchAll(VALUE_FIELD_CANDIDATE)) {
    if (!tokenStarts.has(match.index)) {
      warnings.push({ code: 'unrecognized', raw: match[0] });
    }
  }

  for (const token of valueTokens) {
    if (token.fieldType === 'text' && !token.groupName) {
      if (TYPE_SUFFIX_GUARD.test(token.raw)) {
        warnings.push({ code: 'empty-default-before-type', raw: token.raw });
        continue;
      }
      if (token.raw.includes('.')) {
        warnings.push({ code: 'default-contains-dot', raw: token.raw });
        continue;
      }
    }
    if (TYPE_TOKENS.includes(token.fieldType)) {
      const ignored = ignoredValidationAfterType(token);
      if (ignored.length > 0) {
        warnings.push({ code: 'validation-after-type', raw: token.raw, ignored });
      }
    }
  }

  return warnings;
}
