import type { FieldInfo } from './template-regex';

/**
 * フィールド記法の単一トークナイザ。
 *
 * 値フィールド: {$name(.group)?(?)?:body}
 *   body は「default(:型)?(:validationトークン)*」。default は : を含み得る。
 *   型トークン（rich/textarea/image）より後ろのセグメントは無視される（従来仕様）。
 * 選択肢: ($name(.group)?(@)?:options)
 *   options は | 区切り（単一選択）または , 区切り（複数選択）。
 *
 * field-extractor（抽出）と template-processor（展開）の両方がこのトークンを消費する。
 * 両者で扱いが異なる入力（例: default に . を含む text、{$f::rich}）があるため、
 * トークナイザは判定材料（raw / fieldType / defaultValue）を提供するだけで、
 * スキップ判断は各消費側で行う。
 */

export type FieldValidation = Pick<FieldInfo, 'required' | 'maxLength' | 'readonly' | 'disabled'>;

export function parseValidationFromTokens(tokens: string[]): FieldValidation {
  const parsed: FieldValidation = {};
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

export type ValueFieldType = 'text' | 'textarea' | 'rich' | 'image';

interface FieldTokenBase {
  raw: string;
  start: number;
  end: number;
  fieldName: string;
  groupName?: string;
}

export interface ValueFieldToken extends FieldTokenBase {
  kind: 'value';
  fieldType: ValueFieldType;
  optional: boolean;
  /** validation トークンを取り除いたデフォルト値 */
  defaultValue: string;
  /** 型トークン直前までの未加工デフォルト（型なしの場合は body 全体）。従来実装の一部分岐はこちらを使う */
  rawDefault: string;
  /** {$name(...)?:body} の body 部分の生文字列 */
  body: string;
  validation: FieldValidation;
}

export interface ChoiceFieldToken extends FieldTokenBase {
  kind: 'choice';
  select: boolean;
  delimiter: '|' | ',' | null;
  rawOptions: string;
}

export type FieldToken = ValueFieldToken | ChoiceFieldToken;

const VALUE_FIELD_REGEX = /\{\$(\w+)(?:\.(\w+))?(\?)?:([^}]+)\}/g;
const CHOICE_FIELD_REGEX = /\(\$(\w+)(?:\.(\w+))?(@)?:([^)]+)\)/g;

// 優先順位順（body に複数の型トークンがある場合、rich が最優先。従来の分岐順を踏襲）
const TYPE_TOKENS: readonly ValueFieldType[] = ['rich', 'textarea', 'image'];

function classifyBody(body: string): {
  fieldType: ValueFieldType;
  defaultValue: string;
  rawDefault: string;
  validation: FieldValidation;
} {
  const segments = body.split(':');
  for (const type of TYPE_TOKENS) {
    for (let i = 1; i < segments.length; i++) {
      if (segments[i] !== type) continue;
      const head = segments.slice(0, i).join(':');
      // 型トークンの前が空（例: {$f::rich}）の場合は型付きとみなさない（従来仕様）
      if (head === '') continue;
      const { defaultValue, validation } = splitDefaultAndValidation(head);
      return { fieldType: type, defaultValue, rawDefault: head, validation };
    }
  }
  const { defaultValue, validation } = splitDefaultAndValidation(body);
  return { fieldType: 'text', defaultValue, rawDefault: body, validation };
}

export function scanFieldTokens(text: string): FieldToken[] {
  const tokens: FieldToken[] = [];

  for (const match of text.matchAll(VALUE_FIELD_REGEX)) {
    const body = match[4];
    const { fieldType, defaultValue, rawDefault, validation } = classifyBody(body);
    tokens.push({
      kind: 'value',
      raw: match[0],
      start: match.index,
      end: match.index + match[0].length,
      fieldName: match[1],
      groupName: match[2] || undefined,
      optional: match[3] === '?',
      fieldType,
      defaultValue,
      rawDefault,
      body,
      validation
    });
  }

  for (const match of text.matchAll(CHOICE_FIELD_REGEX)) {
    const rawOptions = match[4];
    const delimiter = rawOptions.includes('|') ? '|' : rawOptions.includes(',') ? ',' : null;
    tokens.push({
      kind: 'choice',
      raw: match[0],
      start: match.index,
      end: match.index + match[0].length,
      fieldName: match[1],
      groupName: match[2] || undefined,
      select: match[3] === '@',
      delimiter,
      rawOptions
    });
  }

  tokens.sort((a, b) => a.start - b.start);
  return tokens;
}
