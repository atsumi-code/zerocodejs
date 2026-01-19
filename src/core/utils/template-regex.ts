// 正規表現パターン（テンプレート構文用）
export const TEMPLATE_REGEX = {
  // グループ付きテキストフィールド: {$field.group:default}
  TEXT_FIELD_WITH_GROUP: /\{\$(\w+)\.(\w+):([^}]+)\}/g,
  // テキストフィールド: {$field:default}
  TEXT_FIELD: /\{\$(\w+):([^}]+)\}/g,
  // グループ付きリッチテキストフィールド: {$field.group:default:rich(:required:max=100...)}
  RICH_TEXT_FIELD_WITH_GROUP: /\{\$(\w+)\.(\w+):(.+?):rich(?::[^}]+)?\}/g,
  // リッチテキストフィールド: {$field:default:rich(:required:max=100...)}
  RICH_TEXT_FIELD: /\{\$(\w+):(.+?):rich(?::[^}]+)?\}/g,
  // グループ付きテキストエリアフィールド: {$field.group:default:textarea(:required:max=100...)}
  TEXTAREA_FIELD_WITH_GROUP: /\{\$(\w+)\.(\w+):(.+?):textarea(?::[^}]+)?\}/g,
  // テキストエリアフィールド: {$field:default:textarea(:required:max=100...)}
  TEXTAREA_FIELD: /\{\$(\w+):(.+?):textarea(?::[^}]+)?\}/g,
  // グループ付き画像フィールド: {$field.group:default:image(:required:max=100...)}
  IMAGE_FIELD_WITH_GROUP: /\{\$(\w+)\.(\w+):(.+?):image(?::[^}]+)?\}/g,
  // 画像フィールド: {$field:default:image(:required:max=100...)}
  IMAGE_FIELD: /\{\$(\w+):(.+?):image(?::[^}]+)?\}/g,
  // グループ付きセレクトボックス: ($field.group@:option1|option2) または ($field.group@:option1,option2)
  SELECT_FIELD_WITH_GROUP: /\(\$(\w+)\.(\w+)@:([^)]+)\)/g,
  // セレクトボックス: ($field@:option1|option2) または ($field@:option1,option2)
  SELECT_FIELD: /\(\$(\w+)@:([^)]+)\)/g,
  // グループ付きラジオボタン/チェックボックス: ($field.group:option1|option2) または ($field.group:option1,option2)
  RADIO_CHECKBOX_FIELD_WITH_GROUP: /\(\$(\w+)\.(\w+):([^)]+)\)/g,
  // ラジオボタン: ($field:option1|option2)
  RADIO_FIELD: /\(\$(\w+):([^)]+)\)/g,
  // チェックボックス: ($field:option1,option2)
  CHECKBOX_FIELD: /\(\$(\w+):([^)]+)\)/g,
  // バックエンドデータ参照: {@fieldName}, {@items[0]}, {@items[0].name}
  BACKEND_DATA: /\{@([\w.[\]]+)\}/g
} as const;

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
  options?: string[];
  optional?: boolean; // オプショナルフィールド（空入力時はundefined）
  required?: boolean;
  maxLength?: number;
  readonly?: boolean;
  disabled?: boolean;
}
