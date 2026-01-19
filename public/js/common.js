/**
 * ZeroCode.js - 共通JavaScript
 * サンプルデータとセッションストレージ管理
 */

// セッションストレージのキー
const STORAGE_KEYS = {
  PAGE: 'zcode-page',
  CSS_COMMON: 'zcode-css-common',
  CSS_INDIVIDUAL: 'zcode-css-individual',
  CSS_SPECIAL: 'zcode-css-special',
  PARTS_COMMON: 'zcode-parts-common',
  PARTS_INDIVIDUAL: 'zcode-parts-individual',
  PARTS_SPECIAL: 'zcode-parts-special',
  IMAGES_COMMON: 'zcode-images-common',
  IMAGES_INDIVIDUAL: 'zcode-images-individual',
  IMAGES_SPECIAL: 'zcode-images-special'
};

// サンプルデータ（index.htmlから抽出）
const SAMPLE_DATA = {
  cssCommon: '',
  cssIndividual: '',
  cssSpecial: `
.banner {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid var(--c-color-gray-2);
  border-radius: var(--c-radius);
  background: var(--c-color-white);
  box-shadow: var(--c-shadow);
}

.banner img {
  width: 100%;
  height: auto;
  display: block;
}

.banner__text {
  margin-top: 12px;
  color: var(--c-color-gray);
  font-size: 14px;
  line-height: 1.75;
  text-align: center;
}
`,
  page: [
    {
      id: 'kv-1',
      part_id: 'zcode-part-layout-kv',
      hero_image: 'img-sample-1',
      hero_image_alt: '店舗キービジュアル'
    },
    {
      id: 'section-message-1',
      part_id: 'zcode-part-layout-section',
      title: 'メッセージ',
      subtitle: 'Message',
      show_subtitle: true,
      slots: {
        contents: [
          {
            id: 'message-1',
            part_id: 'zcode-part-message',
            text: '<p>私たちは、地域に根ざしたサービスで、お客様の体験をより良くします。</p><p>店舗ごとの強みや最新情報を、わかりやすく発信します。</p>'
          }
        ]
      }
    },
    {
      id: 'section-features-1',
      part_id: 'zcode-part-layout-section',
      title: 'サービスの特徴',
      subtitle: 'Features',
      show_subtitle: true,
      slots: {
        contents: [
          {
            id: 'numbered-1',
            part_id: 'zcode-part-numbered',
            slots: {
              items: [
                {
                  id: 'feature-1',
                  part_id: 'zcode-part-numbered-item',
                  title: '品揃えが豊富',
                  text: '<p>定番から最新トレンドまで、幅広いラインナップをご用意しています。季節に合わせた商品の入れ替えも迅速で、常に新鮮な選択肢をお届けします。お客様の様々なニーズにお応えできるよう、多様なカテゴリーから厳選したアイテムを取り揃えています。</p>'
                },
                {
                  id: 'feature-2',
                  part_id: 'zcode-part-numbered-item',
                  title: '充実のサポート',
                  text: '<p>はじめての方でも、スタッフが丁寧にご案内します。お客様一人ひとりに寄り添ったサービスを心がけており、ご質問やご相談にも迅速に対応いたします。専門知識を持ったスタッフが、最適なソリューションをご提案させていただきます。</p>'
                },
                {
                  id: 'feature-3',
                  part_id: 'zcode-part-numbered-item',
                  title: 'アクセス良好',
                  text: '<p>駅から近く、来店しやすい立地です。主要な交通機関から徒歩圏内にあり、お車でのご来店も可能です。駐車場も完備しており、お買い物やご相談の際にも安心してお越しいただけます。周辺には商業施設も充実しており、お立ち寄りの際にも便利です。</p>'
                }
              ]
            }
          }
        ]
      }
    },
    {
      id: 'section-events-1',
      part_id: 'zcode-part-layout-section',
      title: 'イベント情報',
      subtitle: 'Events',
      show_subtitle: true,
      slots: {
        contents: [
          {
            id: 'event-1',
            part_id: 'zcode-part-event',
            slots: {
              items: [
                {
                  id: 'event-item-1',
                  part_id: 'zcode-part-event-item',
                  date: '2026.01.15',
                  title: 'シーズンキャンペーン',
                  text: '<p>期間限定の特典をご用意しています。この機会にぜひご利用ください。新規のお客様には特別な割引も適用され、お得にお買い物をお楽しみいただけます。キャンペーン期間中は、通常のサービスに加えて追加の特典もご用意しております。詳細については、店舗スタッフまでお気軽にお問い合わせください。</p>',
                  tags: true,
                  slots: {
                    tags: [
                      {
                        id: 'tag-1',
                        part_id: 'zcode-part-tag',
                        text: 'フェア'
                      }
                    ]
                  }
                },
                {
                  id: 'event-item-2',
                  part_id: 'zcode-part-event-item',
                  date: '2026.02.01',
                  title: 'ご相談会',
                  text: '<p>ご希望やお悩みをヒアリングして最適な提案をします。専門スタッフがお客様の状況を詳しくお聞きし、一人ひとりに合わせたプランをご提案いたします。事前予約制となっており、ゆっくりとご相談いただけます。お気軽にご参加ください。当日はお飲み物もご用意しておりますので、リラックスしてお話しいただけます。</p>',
                  tags: true,
                  slots: {
                    tags: [
                      {
                        id: 'tag-2',
                        part_id: 'zcode-part-tag',
                        text: '相談会'
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      id: 'section-info-1',
      part_id: 'zcode-part-layout-section',
      title: '店舗情報',
      subtitle: 'Store Information',
      show_subtitle: true,
      slots: {
        contents: [
          {
            id: 'info-1',
            part_id: 'zcode-part-info',
            slots: {
              items: [
                {
                  id: 'info-item-1',
                  part_id: 'zcode-part-info-item',
                  label: '住所',
                  value: '東京都〇〇区〇〇 1-2-3'
                },
                {
                  id: 'info-item-2',
                  part_id: 'zcode-part-info-item',
                  label: '営業時間',
                  value: '10:00〜19:00'
                },
                {
                  id: 'info-item-3',
                  part_id: 'zcode-part-info-item',
                  label: '定休日',
                  value: '水曜'
                },
                {
                  id: 'info-item-4',
                  part_id: 'zcode-part-info-item',
                  label: '電話',
                  value: '03-0000-0000'
                },
                {
                  id: 'info-item-5',
                  part_id: 'zcode-part-info-item',
                  label: 'アクセス',
                  value: '〇〇駅 徒歩5分'
                }
              ]
            }
          }
        ]
      }
    },
    {
      id: 'section-faq-1',
      part_id: 'zcode-part-layout-section',
      title: 'よくある質問',
      subtitle: 'FAQ',
      show_subtitle: true,
      slots: {
        contents: [
          {
            id: 'faq-1',
            part_id: 'zcode-part-faq',
            slots: {
              items: [
                {
                  id: 'faq-item-1',
                  part_id: 'zcode-part-faq-item',
                  question: '予約は必要ですか？',
                  answer:
                    '<p>基本的には予約なしでもご利用いただけますが、混雑状況によってはお待ちいただく場合があります。確実にご案内するため、事前予約をおすすめします。</p>'
                },
                {
                  id: 'faq-item-2',
                  part_id: 'zcode-part-faq-item',
                  question: '支払い方法は何がありますか？',
                  answer:
                    '<p>現金・主要クレジットカード・各種QR決済に対応しています。法人のお客様向けに請求書払いのご相談も可能です。</p>'
                },
                {
                  id: 'faq-item-3',
                  part_id: 'zcode-part-faq-item',
                  question: '当日の持ち物はありますか？',
                  answer:
                    '<p>特別な持ち物は不要です。必要に応じて、本人確認書類やご希望内容が分かるメモがあるとスムーズです。</p>'
                }
              ]
            }
          }
        ]
      }
    }
  ],
  typesCommon: [
    {
      id: 'zcode-common-heading',
      type: 'heading',
      description: '見出し',
      parts: [
        {
          id: 'zcode-part-heading-h1',
          title: 'heading_h1',
          description: '見出し（H1）',
          body: `<div class="c-heading c-heading--h1">
  <h1 class="c-heading__title" z-tag="$tag:h1|h2|h3|h4|h5|h6">{$text:見出し}</h1>
</div>`
        },
        {
          id: 'zcode-part-heading-h2',
          title: 'heading_h2',
          description: '見出し（H2）',
          body: `<div class="c-heading c-heading--h2">
  <h2 class="c-heading__title" z-tag="$tag:h1|h2|h3|h4|h5|h6">{$text:見出し}</h2>
</div>`
        },
        {
          id: 'zcode-part-heading-h3',
          title: 'heading_h3',
          description: '見出し（H3）',
          body: `<div class="c-heading c-heading--h3">
  <h3 class="c-heading__title" z-tag="$tag:h1|h2|h3|h4|h5|h6">{$text:見出し}</h3>
</div>`
        },
        {
          id: 'zcode-part-heading-h4',
          title: 'heading_h4',
          description: '見出し（H4）',
          body: `<div class="c-heading c-heading--h4">
  <h4 class="c-heading__title" z-tag="$tag:h1|h2|h3|h4|h5|h6">{$text:見出し}</h4>
</div>`
        },
        {
          id: 'zcode-part-heading-h5',
          title: 'heading_h5',
          description: '見出し（H5）',
          body: `<div class="c-heading c-heading--h5">
  <h5 class="c-heading__title" z-tag="$tag:h1|h2|h3|h4|h5|h6">{$text:見出し}</h5>
</div>`
        },
        {
          id: 'zcode-part-heading-h6',
          title: 'heading_h6',
          description: '見出し（H6）',
          body: `<div class="c-heading c-heading--h6">
  <h6 class="c-heading__title" z-tag="$tag:h1|h2|h3|h4|h5|h6">{$text:見出し}</h6>
</div>`
        }
      ]
    },
    {
      id: 'zcode-common-text',
      type: 'text',
      description: '文章',
      parts: [
        {
          id: 'zcode-part-text',
          title: 'text',
          description: '文章（リッチテキスト）',
          body: `<div class="c-text">{$text:本文を入力してください:rich}</div>`
        }
      ]
    },
    {
      id: 'zcode-common-box',
      type: 'box',
      description: 'ボックス',
      parts: [
        {
          id: 'zcode-part-box',
          title: 'box',
          description: 'ボックス（見出し＋文章）',
          body: `<div class="c-box c-box--tone-($tone.style:neutral|primary|accent)">
  <div class="c-box__inner">
    <div class="c-box__heading">{$heading.content:ボックス見出し}</div>
    <div class="c-box__body">{$text.content:ボックス本文:rich}</div>
  </div>
</div>`
        }
      ]
    },
    {
      id: 'zcode-common-media',
      type: 'media',
      description: 'メディア（画像＋コンテンツ）',
      parts: [
        {
          id: 'zcode-part-media',
          title: 'media',
          description: '画像とコンテンツの横並び',
          body: `<div class="c-media c-media--dir-($dir.layout:normal|reverse) c-media--valign-($valign.layout:top|center|bottom)">
  <div class="c-media__image">
    <img class="c-media__img" src="{$image.image:img-default:image}" alt="{$alt.image:画像の説明}">
  </div>
  <div class="c-media__content">
    <div class="c-media__heading">{$heading.content:見出し}</div>
    <div class="c-media__text">{$text.content:本文:rich}</div>
    <div class="c-media__actions">
      <a class="c-button c-button--style-($style.action:primary|secondary|text)" href="{$href.action:#}">{$label.action:詳しく見る}</a>
    </div>
  </div>
</div>`
        }
      ]
    },
    {
      id: 'zcode-common-image',
      type: 'image',
      description: '画像',
      parts: [
        {
          id: 'zcode-part-image',
          title: 'image',
          description: '画像',
          body: `<div class="c-image c-image--align-($align.layout:left|center|right)">
  <div class="c-image__media">
    <img class="c-image__img" src="{$image.image:img-default:image}" alt="{$alt.image:画像の説明}">
  </div>
  <div class="c-image__caption">{$caption.caption:キャプション}</div>
</div>`
        }
      ]
    },
    {
      id: 'zcode-common-table',
      type: 'table',
      description: '表組',
      parts: [
        {
          id: 'zcode-part-table',
          title: 'table',
          description: '表（ヘッダー/行はスロット）',
          slots: {
            header_cells: { allowedParts: ['zcode-part-table-header-cell'] },
            rows: { allowedParts: ['zcode-part-table-row'] }
          },
          body: `<div class="c-table c-table--style-($style.style:plain|striped|bordered)" role="table">
  <div class="c-table__caption">{$caption.info:表の説明}</div>
  <div class="c-table__header" role="rowgroup">
    <div class="c-table__row" role="row" z-slot="header_cells"></div>
  </div>
  <div class="c-table__body" role="rowgroup" z-slot="rows"></div>
</div>`
        },
        {
          id: 'zcode-part-table-header-cell',
          title: 'table_header_cell',
          description: 'ヘッダーセル',
          slotOnly: true,
          body: `<div class="c-table__cell c-table__cell--head c-table__cell--align-($align.layout:left|center|right)" role="columnheader">{$text.content:見出し}</div>`
        },
        {
          id: 'zcode-part-table-row',
          title: 'table_row',
          description: '行',
          slotOnly: true,
          slots: {
            cells: { allowedParts: ['zcode-part-table-cell'] }
          },
          body: `<div class="c-table__row" role="row" z-slot="cells"></div>`
        },
        {
          id: 'zcode-part-table-cell',
          title: 'table_cell',
          description: 'セル',
          slotOnly: true,
          body: `<div class="c-table__cell c-table__cell--align-($align.layout:left|center|right)" role="cell">{$text.content:セル}</div>`
        }
      ]
    },
    {
      id: 'zcode-common-actions',
      type: 'actions',
      description: 'リンク/ボタン',
      parts: [
        {
          id: 'zcode-part-button',
          title: 'button',
          description: 'ボタン',
          body: `<div class="c-actions c-actions--align-($align.style:left|center|right)">
  <a class="c-button c-button--style-($style.style:primary|secondary|text)" href="{$href.action:#}">{$label.action:ボタン}</a>
</div>`
        },
        {
          id: 'zcode-part-link',
          title: 'link',
          description: 'テキストリンク',
          body: `<a class="c-link" href="{$href:#}">{$text:リンク}</a>`
        }
      ]
    }
  ],
  typesIndividual: [
    {
      id: 'zcode-individual-layout',
      type: 'layout',
      description: 'レイアウト（店舗ページ向け）',
      parts: [
        {
          id: 'zcode-part-layout-kv',
          title: 'layout_store_kv',
          description: 'キービジュアルセクション（店舗）',
          body: `<div class="kv">
  <div class="kv__image">
    <img class="kv__img" src="{$hero_image.image:img-sample-1:image}" alt="{$hero_image_alt.image:キービジュアル}">
  </div>
</div>`
        },
        {
          id: 'zcode-part-layout-section',
          title: 'layout_section',
          description: '共通セクション（見出し + コンテンツ）',
          slots: {
            contents: {
              allowedParts: [
                'zcode-part-message',
                'zcode-part-numbered',
                'zcode-part-event',
                'zcode-part-info',
                'zcode-part-faq'
              ]
            }
          },
          body: `<div class="section">
  <div class="section__head">
    <div class="section__title" role="heading" aria-level="2">{$title.header:セクションタイトル}</div>
    <div class="section__subtitle" z-if="show_subtitle">{$subtitle.header:Subtitle}</div>
  </div>
  <div class="section__contents">
    <div class="section__items" z-slot="contents"></div>
  </div>
</div>`
        }
      ]
    },
    {
      id: 'zcode-individual-message',
      type: 'message',
      description: 'メッセージ',
      parts: [
        {
          id: 'zcode-part-message',
          slotOnly: true,
          body: `<div class="message__text">{$text:メッセージ文:rich}</div>`
        }
      ]
    },
    {
      id: 'zcode-individual-numbered',
      type: 'numbered',
      description: '数字付きアイテム',
      parts: [
        {
          id: 'zcode-part-numbered',
          title: 'numbered',
          description: '数字付きアイテムリスト',
          slotOnly: true,
          slots: {
            items: { allowedParts: ['zcode-part-numbered-item'] }
          },
          body: `<div class="numbered">
  <div class="numbered__items" z-slot="items"></div>
</div>`
        },
        {
          id: 'zcode-part-numbered-item',
          title: 'numbered_item',
          description: '数字付きアイテム',
          slotOnly: true,
          body: `<div class="numbered-item">
  <div class="numbered-item__number"></div>
  <div class="numbered-item__title" role="heading" aria-level="3">{$title.content:タイトル}</div>
  <div class="numbered-item__text">{$text.content:説明:rich}</div>
</div>`
        }
      ]
    },
    {
      id: 'zcode-individual-event',
      type: 'event',
      description: 'イベント',
      parts: [
        {
          id: 'zcode-part-event',
          title: 'event',
          description: 'イベントリスト',
          slotOnly: true,
          slots: {
            items: { allowedParts: ['zcode-part-event-item'] }
          },
          body: `<div class="event">
  <div class="event__items" z-slot="items"></div>
</div>`
        },
        {
          id: 'zcode-part-event-item',
          title: 'event_item',
          description: 'イベントアイテム（タグ付き）',
          slotOnly: true,
          slots: {
            tags: { allowedParts: ['zcode-part-tag'] }
          },
          body: `<div class="event-item" role="listitem">
  <div class="event-item__meta">
    <div class="event-item__date" z-if="show_date">{$date.meta:2026.01.01}</div>
    <div class="event-item__tags" z-if="show_tags" z-slot="tags"></div>
  </div>
  <div class="event-item__title" role="heading" aria-level="3">{$title.content:タイトル}</div>
  <div class="event-item__text">{$text.content:説明:rich}</div>
  <div class="event-item__actions" z-if="show_href">
    <a class="c-link" href="{$href.action:#}">{$label.action:詳細}</a>
  </div>
</div>`
        },
        {
          id: 'zcode-part-tag',
          title: 'tag',
          description: 'タグ',
          slotOnly: true,
          body: `<div class="tag">{$text:タグ}</div>`
        }
      ]
    },
    {
      id: 'zcode-individual-info',
      type: 'info',
      description: '情報リスト',
      parts: [
        {
          id: 'zcode-part-info',
          title: 'info',
          description: '情報リスト',
          slotOnly: true,
          slots: {
            items: { allowedParts: ['zcode-part-info-item'] }
          },
          body: `<div class="info">
  <div class="info__items" z-slot="items"></div>
</div>`
        },
        {
          id: 'zcode-part-info-item',
          title: 'info_item',
          description: '情報行アイテム',
          slotOnly: true,
          body: `<div class="info-item" role="listitem">
  <div class="info-item__label">{$label.info:ラベル}</div>
  <div class="info-item__value">{$value.info:値}</div>
</div>`
        }
      ]
    },
    {
      id: 'zcode-individual-faq',
      type: 'faq',
      description: 'よくある質問',
      parts: [
        {
          id: 'zcode-part-faq',
          title: 'faq',
          description: 'よくある質問（アコーディオン）',
          slotOnly: true,
          slots: {
            items: { allowedParts: ['zcode-part-faq-item'] }
          },
          body: `<div class="faq">
  <div class="faq__items" z-slot="items"></div>
</div>`
        },
        {
          id: 'zcode-part-faq-item',
          title: 'faq_item',
          description: 'FAQアイテム（Q&A）',
          slotOnly: true,
          body: `<div class="faq-item js_toggleArea s_close" role="listitem">
  <button class="faq-item__q js_toggleBtn" type="button" aria-expanded="false">
    {$question.content:質問}
  </button>
  <div class="faq-item__a js_toggleContents" style="display:none">
    {$answer.content:回答:rich}
  </div>
</div>`
        }
      ]
    }
  ],
  imagesCommon: [
    {
      id: 'img-default',
      name: 'Default',
      url: './images/default.jpg',
      mimeType: 'image/jpeg',
      needsUpload: false
    },
    {
      id: 'img-hero-bg',
      name: 'Hero BG',
      url: './images/hero-bg.jpg',
      mimeType: 'image/jpeg',
      needsUpload: false
    },
    {
      id: 'img-sample-2',
      name: 'Sample 2',
      url: './images/sample-2.jpg',
      mimeType: 'image/jpeg',
      needsUpload: false
    },
    {
      id: 'img-sample-3',
      name: 'Sample 3',
      url: './images/sample-3.jpg',
      mimeType: 'image/jpeg',
      needsUpload: false
    },
    {
      id: 'img-page-specific-hero',
      name: 'Page Specific Hero',
      url: './images/page-specific-hero.jpg',
      mimeType: 'image/jpeg',
      needsUpload: false
    },
    {
      id: 'img-customer-avatar',
      name: 'Customer Avatar',
      url: './images/customer-avatar.jpg',
      mimeType: 'image/jpeg',
      needsUpload: false
    },
    {
      id: 'img-default-avatar',
      name: 'Default Avatar',
      url: './images/default-avatar.jpg',
      mimeType: 'image/jpeg',
      needsUpload: false
    }
  ],
  typesSpecial: [
    {
      id: 'zcode-special-banner',
      type: 'banner',
      description: 'バナー（特別ページ向け）',
      parts: [
        {
          id: 'zcode-part-special-banner',
          title: 'special_banner',
          description: '特別バナー（店舗ごとなど）',
          body: `<div class="banner">
  <img src="{$banner_image.image:img-special-banner:image}" alt="{$banner_alt.image:バナー}">
  <div class="banner__text">{$banner_text.content:バナーテキスト}</div>
</div>`
        }
      ]
    }
  ],
  imagesIndividual: [
    {
      id: 'img-sample-1',
      name: 'Sample 1',
      url: './images/kv_image.jpg',
      mimeType: 'image/jpeg',
      needsUpload: false
    }
  ],
  imagesSpecial: [
    {
      id: 'img-special-banner',
      name: 'Special Banner',
      url: './images/zcode_top_01.png',
      mimeType: 'image/png',
      needsUpload: false
    }
  ]
};

// インスタンスIDを取得または生成
function getInstanceId(component) {
  // id属性を優先
  if (component.id) {
    return component.id;
  }

  // data-instance-id属性があれば使用
  const dataInstanceId = component.getAttribute('data-instance-id');
  if (dataInstanceId) {
    return dataInstanceId;
  }

  // 自動生成して属性に設定
  const instanceId = `zcode-instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  component.setAttribute('data-instance-id', instanceId);
  return instanceId;
}

// ストレージキーを生成
function getStorageKey(instanceId, key) {
  return `zcode-${instanceId}-${key}`;
}

// セッションストレージ管理ユーティリティ
const StorageManager = {
  normalizeImageUrl(url) {
    if (typeof url !== 'string') return url;
    if (url.startsWith('/images/')) {
      return `./images/${url.slice('/images/'.length)}`;
    }
    return url;
  },

  normalizeImages(images) {
    if (!Array.isArray(images)) return images;
    return images.map((img) => {
      if (!img || typeof img !== 'object') return img;
      if (typeof img.url !== 'string') return img;
      const normalized = this.normalizeImageUrl(img.url);
      if (normalized === img.url) return img;
      return { ...img, url: normalized };
    });
  },

  // データをローカルストレージに保存（インスタンスID対応）
  save(instanceId, key, data) {
    try {
      const storageKey = getStorageKey(instanceId, key);
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
      return false;
    }
  },

  // ローカルストレージからデータを取得（インスタンスID対応）
  load(instanceId, key, defaultValue = null) {
    try {
      const storageKey = getStorageKey(instanceId, key);
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Failed to load ${key}:`, e);
      return defaultValue;
    }
  },

  // ローカルストレージからデータを削除（インスタンスID対応）
  remove(instanceId, key) {
    try {
      const storageKey = getStorageKey(instanceId, key);
      localStorage.removeItem(storageKey);
      return true;
    } catch (e) {
      console.error(`Failed to remove ${key}:`, e);
      return false;
    }
  },

  // すべてのデータをクリア（インスタンスID対応）
  clear(instanceId) {
    const keys = [
      'page',
      'css-common',
      'css-individual',
      'css-special',
      'parts-common',
      'parts-individual',
      'parts-special',
      'images-common',
      'images-individual',
      'images-special'
    ];
    keys.forEach((key) => {
      this.remove(instanceId, key);
    });
  },

  // サンプルデータをセッションストレージに保存（インスタンスID対応）
  saveSampleData(instanceIdOrComponentId) {
    // コンポーネントIDが渡された場合はインスタンスIDを取得
    let instanceId = instanceIdOrComponentId;
    if (instanceIdOrComponentId) {
      const component = document.getElementById(instanceIdOrComponentId);
      if (component) {
        instanceId = getInstanceId(component);
      } else {
        // コンポーネントが見つからない場合は、そのままインスタンスIDとして使用
        instanceId = instanceIdOrComponentId;
      }
    } else {
      // インスタンスIDが指定されていない場合はデフォルトを使用
      instanceId = 'default';
    }

    this.save(instanceId, 'page', SAMPLE_DATA.page);
    this.save(instanceId, 'css-common', SAMPLE_DATA.cssCommon || '');
    this.save(instanceId, 'css-individual', SAMPLE_DATA.cssIndividual || '');
    this.save(instanceId, 'css-special', SAMPLE_DATA.cssSpecial || '');
    this.save(instanceId, 'parts-common', SAMPLE_DATA.typesCommon);
    this.save(instanceId, 'parts-individual', SAMPLE_DATA.typesIndividual);
    this.save(instanceId, 'parts-special', SAMPLE_DATA.typesSpecial || []);
    this.save(instanceId, 'images-common', SAMPLE_DATA.imagesCommon);
    this.save(instanceId, 'images-individual', SAMPLE_DATA.imagesIndividual);
    this.save(instanceId, 'images-special', SAMPLE_DATA.imagesSpecial || []);
    return true;
  },

  // セッションストレージからデータを読み込み（インスタンスID対応）
  loadData(instanceIdOrComponentId) {
    // コンポーネントIDが渡された場合はインスタンスIDを取得
    let instanceId = instanceIdOrComponentId;
    if (instanceIdOrComponentId) {
      const component = document.getElementById(instanceIdOrComponentId);
      if (component) {
        instanceId = getInstanceId(component);
      } else {
        // コンポーネントが見つからない場合は、そのままインスタンスIDとして使用
        instanceId = instanceIdOrComponentId;
      }
    } else {
      // インスタンスIDが指定されていない場合はデフォルトを使用
      instanceId = 'default';
    }

    const data = {
      page: this.load(instanceId, 'page', []),
      cssCommon: this.load(instanceId, 'css-common', ''),
      cssIndividual: this.load(instanceId, 'css-individual', ''),
      cssSpecial: this.load(instanceId, 'css-special', ''),
      typesCommon: this.load(instanceId, 'parts-common', []),
      typesIndividual: this.load(instanceId, 'parts-individual', []),
      typesSpecial: this.load(instanceId, 'parts-special', []),
      imagesCommon: this.load(instanceId, 'images-common', []),
      imagesIndividual: this.load(instanceId, 'images-individual', []),
      imagesSpecial: this.load(instanceId, 'images-special', [])
    };

    const normalizedCommon = this.normalizeImages(data.imagesCommon);
    const normalizedIndividual = this.normalizeImages(data.imagesIndividual);
    const normalizedSpecial = this.normalizeImages(data.imagesSpecial);

    const changed =
      JSON.stringify(normalizedCommon) !== JSON.stringify(data.imagesCommon) ||
      JSON.stringify(normalizedIndividual) !== JSON.stringify(data.imagesIndividual) ||
      JSON.stringify(normalizedSpecial) !== JSON.stringify(data.imagesSpecial);

    if (changed) {
      data.imagesCommon = normalizedCommon;
      data.imagesIndividual = normalizedIndividual;
      data.imagesSpecial = normalizedSpecial;
      this.save(instanceId, 'images-common', data.imagesCommon);
      this.save(instanceId, 'images-individual', data.imagesIndividual);
      this.save(instanceId, 'images-special', data.imagesSpecial || []);
    }

    return data;
  },

  // Webコンポーネントにデータを適用（インスタンスID対応）
  applyToComponent(componentId) {
    const component = document.getElementById(componentId);
    if (!component) {
      console.error(`Component not found: ${componentId}`);
      return false;
    }

    const instanceId = getInstanceId(component);
    const data = this.loadData(instanceId);

    component.setAttribute('page', JSON.stringify(data.page));
    if (data.cssCommon) {
      component.setAttribute('css-common', data.cssCommon);
    }
    if (data.cssIndividual) {
      component.setAttribute('css-individual', data.cssIndividual);
    }
    if (data.cssSpecial) {
      component.setAttribute('css-special', data.cssSpecial);
    }
    component.setAttribute('parts-common', JSON.stringify(data.typesCommon));
    component.setAttribute('parts-individual', JSON.stringify(data.typesIndividual));
    component.setAttribute('parts-special', JSON.stringify(data.typesSpecial || []));
    component.setAttribute('images-common', JSON.stringify(data.imagesCommon));
    component.setAttribute('images-individual', JSON.stringify(data.imagesIndividual));
    component.setAttribute('images-special', JSON.stringify(data.imagesSpecial || []));

    return true;
  }
};

// 保存/リセットイベントリスナーを設定
function setupSaveResetListeners() {
  // zcode-cmsとzcode-editorの両方に対応
  const components = document.querySelectorAll('zcode-cms, zcode-editor');

  components.forEach((component) => {
    // インスタンスIDを取得
    const instanceId = getInstanceId(component);

    // 保存リクエスト
    component.addEventListener('save-request', (e) => {
      const { source } = e.detail;
      const targets = Array.isArray(e.detail.targets)
        ? e.detail.targets
        : typeof e.detail.target === 'string'
          ? [e.detail.target]
          : [];
      const requestId =
        typeof e.detail.requestId === 'string'
          ? e.detail.requestId
          : `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      console.debug('[ZeroCodeCommon] save-request received:', { source, targets, requestId });

      if (targets.length === 0) {
        console.warn('[ZeroCode] No targets specified');
        return;
      }

      // ⚠️ 注意: これは補助的な検証です
      // 完全なセキュリティ保証のためには、サーバー側での検証が必須です
      if (
        source === 'cms' &&
        (targets.includes('parts-common') || targets.includes('parts-individual'))
      ) {
        console.warn('[ZeroCode] CMSからはパーツデータの保存はできません');
        return;
      }

      const data = component.getData();

      if (!data) {
        console.warn('[ZeroCode] No data available to save');
        return;
      }

      let allSaved = true;
      for (const target of targets) {
        let key;
        let dataToSave;
        let ok = true;
        let errors = [];

        switch (target) {
          case 'page':
            key = 'page';
            dataToSave = data.page;
            break;
          case 'parts-common-css':
            key = 'parts-common-css';
            dataToSave = typeof data.css?.common === 'string' ? data.css.common : '';
            break;
          case 'parts-individual-css':
            key = 'parts-individual-css';
            dataToSave = typeof data.css?.individual === 'string' ? data.css.individual : '';
            break;
          case 'parts-special-css':
            key = 'parts-special-css';
            dataToSave = typeof data.css?.special === 'string' ? data.css.special : '';
            break;
          case 'parts-common':
            key = 'parts-common';
            dataToSave = data.parts?.common || [];
            break;
          case 'parts-individual':
            key = 'parts-individual';
            dataToSave = data.parts?.individual || [];
            break;
          case 'images-common':
            key = 'images-common';
            dataToSave = data.images?.common || [];
            break;
          case 'images-individual':
            key = 'images-individual';
            dataToSave = data.images?.individual || [];
            break;
          case 'images-special':
            key = 'images-special';
            dataToSave = data.images?.special || [];
            break;
          default:
            console.warn(`[ZeroCode] Unknown save target: ${target}`);
            allSaved = false;
            ok = false;
            errors = [{ message: `Unknown save target: ${target}`, code: 'UNKNOWN_TARGET' }];
            continue;
        }

        if (!StorageManager.save(instanceId, key, dataToSave)) {
          console.error(`[ZeroCode] Failed to save ${target}`);
          allSaved = false;
          ok = false;
          errors = [{ message: `Failed to save ${target}`, code: 'SAVE_FAILED' }];
        }

        // 保存結果を通知（呼び出し側のバックエンド検証でも同じイベント形式を推奨）
        console.debug('[ZeroCodeCommon] dispatching save-result:', { requestId, target, ok, errors });
        const resultEvent = new CustomEvent('save-result', {
          detail: {
            requestId,
            target,
            ok,
            errors
          },
          bubbles: true,
          composed: true
        });
        component.dispatchEvent(resultEvent);
      }

      if (allSaved) {
        const savedEvent = new CustomEvent('zcode-saved', {
          detail: { targets, instanceId },
          bubbles: true,
          composed: true
        });
        component.dispatchEvent(savedEvent);
      }
    });
  });
}

// DOMContentLoaded時にイベントリスナーを設定
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSaveResetListeners);
} else {
  setupSaveResetListeners();
}

// グローバルに公開
window.ZeroCodeCommon = {
  STORAGE_KEYS,
  SAMPLE_DATA,
  StorageManager,
  setupSaveResetListeners,
  getInstanceId,
  getStorageKey
};
