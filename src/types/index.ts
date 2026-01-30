// データ型定義
export interface ZeroCodeData {
  page: ComponentData[];
  css: {
    common?: string; // 共通パーツ用CSS
    individual?: string; // 個別パーツ用CSS
    special?: string; // 特別パーツ用CSS
  };
  parts: {
    common: TypeData[];
    individual: TypeData[];
    special: TypeData[];
  };
  images: {
    common: ImageData[];
    individual: ImageData[];
    special: ImageData[];
  };
  backendData?: Record<string, unknown>; // バックエンドデータ
}

export interface ComponentData {
  id: string;
  part_id: string; // パーツID（タイトル変更時も紐付けが維持される）
  [key: string]: unknown;
  slots?: Record<string, ComponentData[] | SlotConfig>;
}

export interface SlotConfig {
  allowedParts?: string[]; // 許可されるパーツID
  children?: ComponentData[]; // 子コンポーネント（既存の形式との互換性）
}

export interface TypeData {
  id: string; // タイプID（タイプ変更時も紐付けが維持される）
  type: string;
  description: string;
  parts: PartData[];
}

export interface PartData {
  id: string; // パーツID（タイトル変更時も紐付けが維持される）
  title: string;
  description: string;
  body: string;
  slots?: Record<string, { allowedParts?: string[] }>; // allowedPartsはパーツIDの配列
  slotOnly?: boolean; // スロット専用パーツ（通常の追加パネルには表示しない）
}

export interface ImageData {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  needsUpload?: boolean;
}

export interface ImageModalActionsCategory {
  add?: boolean;
  delete?: boolean;
}

export interface ImageModalActionsConfig {
  common?: ImageModalActionsCategory;
  individual?: ImageModalActionsCategory;
  special?: ImageModalActionsCategory;
}

export interface CMSSettings {
  allowDynamicContentInteraction?: boolean;
  devRightPadding?: boolean;
  enableContextMenu?: boolean;
  showSaveConfirm?: boolean; // 保存時の確認ダイアログを表示する（デフォルト: true）
  imageModalActions?: ImageModalActionsConfig;
}

export interface DevSettings {
  showDataViewer?: boolean;
  enableTemplateSuggestions?: boolean;
  dontShowCssWarningAgainCommon?: boolean;
  showSaveConfirm?: boolean; // 保存時の確認ダイアログを表示する（デフォルト: true）
}

export interface UserSettings {
  locale?: 'ja' | 'en';
  cms?: CMSSettings;
  dev?: DevSettings;
}

export interface CMSConfig {
  cms?: CMSSettings;
  dev?: DevSettings;
  categoryOrder?: 'common' | 'individual' | 'special';
}

export interface CMSEndpoints {
  save?: string;
  upload?: string;
  preview?: string;
}

// ZeroCodeDataのprops型定義
export interface ZeroCodeDataProps {
  locale?: string;
  page?: string;
  cssCommon?: string;
  cssIndividual?: string;
  cssSpecial?: string;
  partsCommon?: string;
  partsIndividual?: string;
  partsSpecial?: string;
  imagesCommon?: string;
  imagesIndividual?: string;
  imagesSpecial?: string;
  config?: string;
  endpoints?: string;
  backendData?: string;
}
