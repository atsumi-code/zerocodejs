// 正規表現パターン（テンプレート構文用）
// フィールド記法・選択肢記法のパースは field-syntax.ts の scanFieldTokens に一元化済み。
// ここに残るのはバックエンドデータ参照のみ。
export const TEMPLATE_REGEX = {
  // バックエンドデータ参照（デフォルト付き）: {@fieldName:default}, {@items[0].name:名称未設定}
  BACKEND_DATA_WITH_DEFAULT: /\{@([\w.[\]]+):([^}]+)\}/g,
  // バックエンドデータ参照: {@fieldName}, {@items[0]}, {@items[0].name}
  BACKEND_DATA: /\{@([\w.[\]]+)\}/g
} as const;

export interface FieldChoiceOption {
  label: string;
  value: string;
}

// テンプレートからフィールド情報を抽出する共通関数
export interface FieldInfo {
  fieldName: string;
  groupName?: string; // グループ名（オプション）
  type:
    | 'text'
    | 'textarea'
    | 'radio'
    | 'checkbox'
    | 'boolean'
    | 'rich'
    | 'image'
    | 'select'
    | 'select-multiple'
    | 'tag';
  defaultValue?: string;
  options?: FieldChoiceOption[];
  optional?: boolean; // オプショナルフィールド（空入力時はundefined）
  required?: boolean;
  maxLength?: number;
  readonly?: boolean;
  disabled?: boolean;
}
