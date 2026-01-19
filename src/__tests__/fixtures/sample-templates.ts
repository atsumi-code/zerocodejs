export const sampleTemplates = {
  simpleText: '<div>{$title:デフォルトタイトル}</div>',
  optionalField: '<div>{$subtitle?:サブタイトル}</div>',
  withValidation: '<div>{$title:タイトル:required:max=100}</div>',
  groupedField: '<div>{$title.header:ヘッダータイトル}</div>',
  richText: '<div>{$content:デフォルトコンテンツ:rich}</div>',
  optionalRichText: '<div>{$content?:デフォルトコンテンツ:rich}</div>',
  textarea: '<div>{$description:説明:textarea}</div>',
  image: '<div><img src="{$imageUrl:default.jpg:image}" alt="画像"></div>',
  radio: '<div>($category:option1|option2|option3)</div>',
  checkbox: '<div>($tags:tag1,tag2,tag3)</div>',
  select: '<div>($category@:option1|option2|option3)</div>',
  selectMultiple: '<div>($tags@:tag1,tag2,tag3)</div>',
  zIf: '<div z-if="showContent">コンテンツ</div>',
  zEmpty: '<div z-empty="$subtitle">サブタイトル: {$subtitle:デフォルト}</div>',
  zTag: '<h2 z-tag="$headingTag:h1|h2|h3">見出し</h2>',
  zFor: '<div z-for="item in {@items}">{$item.name:アイテム}</div>',
  zSlot: '<div z-slot="content">スロットコンテンツ</div>',
  backendData: '<div>{@user.name}</div>',
  nestedBackendData: '<div>{@user.profile.city}</div>',
  arrayBackendData: '<div>{@items[0].name}</div>',
  urlPlaceholder: '<a href="/shop/{shop_id}/products">商品一覧</a>',
  complex: `
    <div>
      <h2 z-tag="$headingTag:h1|h2|h3" z-if="showTitle">{$title:タイトル}</h2>
      <div z-empty="$subtitle">{$subtitle?:サブタイトル}</div>
      <div>{$content:コンテンツ:rich}</div>
      <div z-for="item in {@items}">
        <div>{$item.name:アイテム名}</div>
      </div>
    </div>
  `
};
