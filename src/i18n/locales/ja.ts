export default {
  common: {
    close: '閉じる',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    add: '追加',
    reorder: '並べ替え',
    preview: 'プレビュー',
    settings: '設定',
    manage: '管理',
    view: '表示',
    confirm: '確定',
    clear: 'クリア',
    select: '選択',
    replace: '差し替え',
    copy: 'コピー',
    copied: 'コピーしました'
  },
  toolbar: {
    editMode: '編集',
    addMode: '追加',
    reorderMode: '並べ替え',
    deleteMode: '削除',
    viewMode: '表示',
    settings: '設定'
  },
  settings: {
    title: '設定',
    language: {
      label: '言語',
      ja: '日本語',
      en: 'English'
    },
    enableDynamicContent: 'ページの動作を有効にする',
    enableDynamicContentDescription: 'アコーディオン、タブ、モーダル、リンクなどの動的コンテンツの動作を有効にします。',
    devRightPadding: '編集パネル分の余白をつける',
    devRightPaddingDescription: '編集パネル表示時にコンテンツの右側に余白を追加します。',
    enableContextMenu: '右クリックメニューを有効にする',
    enableContextMenuDescription: 'コンテンツ上で右クリックすると、編集・追加・並べ替え・削除のモードを切り替えるメニューが表示されます。',
    showSaveConfirm: '保存時の確認ダイアログを表示する',
    showSaveConfirmDescription: '保存ボタンをクリックした際に、保存対象を確認するダイアログを表示します。',
    previewModeInfo: '表示モードでは動的コンテンツ（アコーディオン、タブ、モーダル、リンクなど）は常に有効です。',
    noSettings: '設定項目はありません。'
  },
  addPanel: {
    title: '追加',
    selectParent: '親要素を選択',
    category: {
      common: '共通',
      individual: '個別',
      selected: '選択したパーツ'
    },
    typeAll: 'all',
    activeParts: 'active parts',
    activePartsDescription: 'プレビューエリアでクリックしたパーツを、現在のデータを含む状態で追加できます。',
    clickPartInPreview: 'プレビューエリアでパーツをクリックしてください',
    noPartsAvailable: '利用可能なパーツがありません',
    addBefore: '前に追加',
    addAfter: '後に追加',
    continueAdding: 'パーツ追加を続ける'
  },
  editPanel: {
    title: '編集中',
    editing: '編集中: {type}',
    id: 'ID: {id}',
    selectImage: '画像を選択',
    replaceImage: '差し替え',
    clearImage: 'クリア',
    clearImageTitle: '画像をクリア',
    noFields: '編集可能なフィールドがありません'
  },
  deletePanel: {
    title: '削除確認',
    confirmMessage: 'このパーツを削除しますか？',
    selectParent: '親要素を選択'
  },
  reorderPanel: {
    title: '並べ替え: 移動元を選択中',
    instruction: '移動先の要素をクリックしてください',
    source: '移動元: {path}',
    selectParent: '親要素を選択'
  },
  saveConfirm: {
    title: '保存の確認',
    message: '以下のデータを保存しますか？',
    simpleMessage: '保存しますか？',
    targets: {
      page: 'ページデータ',
      'parts-common': 'パーツ（共通）',
      'parts-individual': 'パーツ（個別）',
      'parts-special': 'パーツ（特別）',
      'parts-common-css': 'CSS（共通）',
      'parts-individual-css': 'CSS（個別）',
      'parts-special-css': 'CSS（特別）',
      'images-common': '画像（共通）',
      'images-individual': '画像（個別）',
      'images-special': '画像（特別）'
    },
    saveButton: '保存する'
  },
  partsManager: {
    createType: '新規タイプ作成',
    editType: 'タイプ編集',
    typeName: 'タイプ名',
    typeDescription: '説明',
    typeNamePlaceholder: '例: hero, features',
    typeDescriptionPlaceholder: 'タイプの説明',
    editPart: 'パーツ編集: {title}',
    partTitle: 'タイトル',
    partDescription: '説明',
    partDescriptionPlaceholder: 'パーツの説明',
    deletePartConfirm: 'パーツ {number} を削除しますか？\n（タイプには他のパーツが残ります）',
    deleteTypeConfirm: 'このタイプを削除しますか？',
    deleteTypeWithUsagesConfirm: 'タイプ「{type}」は{count}箇所で使用されています。削除しますか？',
    deleteSlotConfirm: 'スロット「{slotName}」を削除しますか？',
    selectImage: '画像選択',
    addPart: 'パーツを追加',
    editTypeButton: 'タイプ全体を編集',
    reorderType: 'タイプを並べ替え',
    deleteTypeButton: 'このタイプを削除（全パーツ含む）',
    editPartButton: 'パーツを編集',
    reorderPart: '並べ替え',
    deletePartButton: '削除',
    source: '移動元',
    noDescription: '説明なし',
    partNumber: 'パーツ {current} / {total}',
    allowedParts: '許可されるパーツ',
    searchParts: 'パーツを検索...',
    addSlot: 'スロットを追加',
    selectSlot: 'スロットを選択...',
    defaultSlot: 'デフォルトスロット',
    codeEdit: 'コード編集',
    cssEditInfo: 'CSS編集について',
    templateSuggestions: '予測変換',
    preview: 'プレビュー:',
    cssEditWarning: 'CSS編集について',
    cssEditWarningMessageCommon: 'ここで編集したCSSは、すべてのページに適用される想定です。既存のCSSファイル（common.cssなど）がある場合、それらを上書きする可能性があります。',
    cssEditWarningMessageIndividual: 'ここで編集したCSSは、ページタイプごとに適用される想定です。既存のCSSファイル（page.cssなど）がある場合、それらを上書きする可能性があります。',
    cssEditWarningMessageSpecial: 'ここで編集したCSSは、動的ページごとに適用される想定です。既存のCSSファイル（shop111.cssなど）がある場合、それらを上書きする可能性があります。',
    understood: '了解しました',
    dontShowAgain: '次回から表示しない',
    templateHelp: {
      textField: 'テキストフィールド',
      richText: 'リッチテキスト',
      textarea: '複数行テキスト',
      image: '画像選択',
      radio: 'ラジオボタン',
      checkbox: 'チェックボックス',
      selectSingle: 'セレクトボックス（単一選択）',
      selectMultiple: 'セレクトボックス（複数選択）',
      conditional: '条件分岐（表示/非表示）',
      slot: 'スロット（子要素挿入）',
      note: '補足',
      suggestionNote: '予測変換を有効にすると、<code>$</code>、<code>(</code>、<code>z</code>を入力時に自動補完が表示されます',
      fieldNameNote: 'フィールド名は英数字とアンダースコアが使用できます',
      defaultValueNote: 'デフォルト値は省略可能です（空文字になります）'
    },
    validationError: 'エラー:',
    dangerousTagWarning: '<{tag}> タグが含まれています。',
    dangerousAttrWarning: '{attr} 属性が含まれています。',
    slotSettings: 'スロット設定',
    slot: 'スロット',
    templateHelpButton: 'テンプレート記法のヘルプ',
    clickToEnlarge: 'クリックで拡大'
  },
  imagesManager: {
    addImage: '画像追加',
    editImage: '画像編集',
    imageId: '画像ID',
    imageName: '画像名',
    altText: 'Alt属性',
    deleteImageConfirm: 'この画像を削除しますか？',
    deleteImageWithUsagesConfirm: 'この画像は{count}箇所で使用されています。削除しますか？',
    deleteImageFromModalConfirm: 'この画像を削除しますか？',
    addImageFailed: '画像の追加に失敗しました',
    selectImage: '画像を選択',
    currentlySelected: '現在選択中',
    select: '選択'
  },
  dataViewer: {
    page: 'ページ',
    parts: 'パーツ',
    images: '画像',
    common: '共通',
    individual: '個別',
    special: '特別',
    json: 'JSON',
    html: 'HTML',
    categoryInfo: {
      title: 'カテゴリの役割について',
      common: {
        title: '共通',
        description: 'サイト全体で共有されるパーツ・画像を想定しています。すべてのページで使用できる想定です。'
      },
      individual: {
        title: '個別',
        description: 'ページタイプごとに共有されるパーツ・画像を想定しています。同じページタイプのすべてのページで使用できる想定です。'
      },
      special: {
        title: '特別',
        description: '動的ページ（例：店舗ごと、商品ごと）や特定の条件で使用されるパーツ・画像を想定しています。ルートモデルバインディングなどで動的に生成されるページで使用できる想定です。'
      }
    }
  },
  contextMenu: {
    edit: '編集',
    add: '追加',
    reorder: '並べ替え',
    delete: '削除',
    close: '閉じる'
  },
  editor: {
    pageManagement: 'ページ管理',
    partsManagement: 'パーツ管理',
    imagesManagement: '画像管理',
    dataViewer: 'データビューアー',
    loading: 'データを読み込み中...'
  }
};
