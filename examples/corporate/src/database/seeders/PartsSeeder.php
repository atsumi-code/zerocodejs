<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PartsSeeder extends Seeder
{
    public function run(): void
    {
        $heroBody = '<section class="c-hero">'
            . '<div class="l-container">'
            . '<h1 class="c-hero__title">{$title:ページタイトル}</h1>'
            . '<p class="c-hero__lead">{$lead:リード文を入力}</p>'
            . '</div></section>';

        $textBody = '<section class="c-text-block">'
            . '<div class="l-container">'
            . '<h2 class="c-text-block__heading">{$heading:見出し}</h2>'
            . '<div class="c-text-block__body">{$body:本文を入力:rich}</div>'
            . '</div></section>';

        $ctaBody = '<section class="c-cta">'
            . '<div class="c-cta__bg"></div>'
            . '<div class="l-container">'
            . '<div class="c-cta__inner">'
            . '<div class="c-cta__title" z-tag="$tag:h2|h3|div">{$title:お問い合わせ}</div>'
            . '<div class="c-cta__text">{$text:説明文を入力:rich}</div>'
            . '<a href="{$link_btn:mailto:info@example.com}" class="c-btn c-btn--white c-btn--lg">{$btn_text:予約する}</a>'
            . '<div class="c-cta__note" z-if="show_note">{$note:※ 注釈テキスト}</div>'
            . '</div></div></section>';

        $serviceCardsBody = '<section class="c-section c-section--muted">'
            . '<div class="l-container">'
            . '<h2 class="c-section__title">{$heading:私たちのサービス}</h2>'
            . '<div class="c-cards c-cards--3">'
            . '<div class="c-card"><h3 class="c-card__title">{$card1_title:サービス1}</h3><p class="c-card__text">{$card1_text:説明文}</p>'
            . '<a href="{$card1_link:#}" class="c-card__link">{$card1_link_text:詳しく見る}</a></div>'
            . '<div class="c-card"><h3 class="c-card__title">{$card2_title:サービス2}</h3><p class="c-card__text">{$card2_text:説明文}</p>'
            . '<a href="{$card2_link:#}" class="c-card__link">{$card2_link_text:詳しく見る}</a></div>'
            . '<div class="c-card"><h3 class="c-card__title">{$card3_title:サービス3}</h3><p class="c-card__text">{$card3_text:説明文}</p>'
            . '<a href="{$card3_link:#}" class="c-card__link">{$card3_link_text:詳しく見る}</a></div>'
            . '</div></div></section>';

        $metricsBody = '<section class="c-section c-section--metrics">'
            . '<div class="l-container">'
            . '<h2 class="c-section__title">{$heading:選ばれる理由}</h2>'
            . '<div class="c-metrics">'
            . '<div class="c-metric"><div class="c-metric__value">{$metric1_value:500+}</div><div class="c-metric__label">{$metric1_label:支援プロジェクト数}</div></div>'
            . '<div class="c-metric"><div class="c-metric__value">{$metric2_value:96%}</div><div class="c-metric__label">{$metric2_label:継続取引率}</div></div>'
            . '<div class="c-metric"><div class="c-metric__value">{$metric3_value:15年}</div><div class="c-metric__label">{$metric3_label:業界経験}</div></div>'
            . '</div></div></section>';

        $newsPreviewBody = '<section class="c-section">'
            . '<div class="l-container">'
            . '<div class="c-section__head">'
            . '<h2 class="c-section__title">{$heading:お知らせ}</h2>'
            . '<a href="{$more_link:/news}" class="c-section__more">{$more_text:一覧を見る}</a>'
            . '</div>'
            . '<ul class="c-news-list">'
            . '<li class="c-news-list__item"><a href="{$item1_url:#}" class="c-news-list__link"><span class="c-news-list__date">{$item1_date:YYYY-MM-DD}</span><span class="c-news-list__title">{$item1_title:タイトル}</span></a></li>'
            . '<li class="c-news-list__item"><a href="{$item2_url:#}" class="c-news-list__link"><span class="c-news-list__date">{$item2_date:YYYY-MM-DD}</span><span class="c-news-list__title">{$item2_title:タイトル}</span></a></li>'
            . '<li class="c-news-list__item"><a href="{$item3_url:#}" class="c-news-list__link"><span class="c-news-list__date">{$item3_date:YYYY-MM-DD}</span><span class="c-news-list__title">{$item3_title:タイトル}</span></a></li>'
            . '</ul></div></section>';

        $topHeroBody = '<section class="top-hero">'
            . '<div class="top-hero__bg"><img class="top-hero__bg-image" src="{$bg_image:img-top-hero:image}" alt=""></div>'
            . '<div class="l-container top-hero__container">'
            . '<p class="top-hero__eyebrow">{$eyebrow:Corporate Partner}</p>'
            . '<h1 class="top-hero__title">{$title:企業の成長を、戦略と実行で支える。}</h1>'
            . '<div class="top-hero__lead">{$lead:事業戦略から実装支援まで、ワンチームで伴走します。:rich}</div>'
            . '<div class="top-hero__actions">'
            . '<a href="{$primary_link:/contact}" class="c-btn c-btn--primary c-btn--lg">{$primary_text:無料相談を申し込む}</a>'
            . '<a href="{$secondary_link:/services}" class="c-btn c-btn--white c-btn--lg">{$secondary_text:サービスを見る}</a>'
            . '</div></div></section>';

        $topShowcaseBody = '<section class="c-section top-showcase">'
            . '<div class="l-container">'
            . '<h2 class="c-section__title">{$heading:ソリューション事例}</h2>'
            . '<div class="top-showcase__grid">'
            . '<article class="top-showcase-card"><img class="top-showcase-card__image" src="{$card1_image:img-top-showcase-1:image}" alt=""><div class="top-showcase-card__body"><h3 class="top-showcase-card__title">{$card1_title:製造業DX支援}</h3><p class="top-showcase-card__text">{$card1_text:受発注管理を刷新し、工数を35%削減。}</p></div></article>'
            . '<article class="top-showcase-card"><img class="top-showcase-card__image" src="{$card2_image:img-top-showcase-2:image}" alt=""><div class="top-showcase-card__body"><h3 class="top-showcase-card__title">{$card2_title:営業プロセス最適化}</h3><p class="top-showcase-card__text">{$card2_text:SFA導入と運用設計で商談化率を向上。}</p></div></article>'
            . '<article class="top-showcase-card"><img class="top-showcase-card__image" src="{$card3_image:img-top-showcase-3:image}" alt=""><div class="top-showcase-card__body"><h3 class="top-showcase-card__title">{$card3_title:採用サイト改善}</h3><p class="top-showcase-card__text">{$card3_text:UI/UX再設計で応募数を2.1倍に改善。}</p></div></article>'
            . '</div></div></section>';

        $topNewsBody = '<section class="c-section top-news">'
            . '<div class="l-container">'
            . '<div class="c-section__head">'
            . '<h2 class="c-section__title">{$heading:最新トピックス}</h2>'
            . '<a href="{$more_link:/news}" class="c-section__more">{$more_text:すべて見る}</a>'
            . '</div>'
            . '<ul class="c-news-list">'
            . '<li class="c-news-list__item" z-for="item in {@latestNews}"><a href="{item.url}" class="c-news-list__link"><span class="c-news-list__date">{item.date}</span><span class="c-news-list__title">{item.title}</span></a></li>'
            . '</ul></div></section>';

        $topCtaBody = '<section class="top-cta">'
            . '<div class="l-container top-cta__inner">'
            . '<div class="top-cta__text-wrap">'
            . '<h2 class="top-cta__title">{$title:まずは課題をお聞かせください}</h2>'
            . '<div class="top-cta__text">{$text:初回ヒアリングは無料です。状況整理からご一緒します。:rich}</div>'
            . '</div>'
            . '<a href="{$link_btn:/contact}" class="c-btn c-btn--primary c-btn--lg">{$btn_text:お問い合わせ}</a>'
            . '</div></section>';

        $articleHeadingBody = '<div class="article-heading">'
            . '<h2 class="article-heading__text" z-tag="$tag:h2|h3|h4">{$heading:見出し}</h2>'
            . '</div>';

        $articleBodyBody = '<div class="article-body">'
            . '<div class="article-body__content">{$body:本文を入力:rich}</div>'
            . '</div>';

        $articleImageBody = '<figure class="article-image" z-if="image">'
            . '<img src="{$image:_:image}" alt="" class="article-image__img">'
            . '<figcaption class="article-image__caption" z-empty="caption">{$caption?:キャプション}</figcaption>'
            . '</figure>';

        $articleQuoteBody = '<blockquote class="article-quote">'
            . '<p class="article-quote__text">{$quote:引用文を入力:textarea}</p>'
            . '<footer class="article-quote__cite" z-empty="cite">{$cite?:出典}</footer>'
            . '</blockquote>';

        $articleListBody = '<ul class="article-list">'
            . '<li class="article-list__item" z-empty="item1">{$item1:項目1}</li>'
            . '<li class="article-list__item" z-empty="item2">{$item2:項目2}</li>'
            . '<li class="article-list__item" z-empty="item3">{$item3:項目3}</li>'
            . '<li class="article-list__item" z-empty="item4">{$item4:項目4}</li>'
            . '<li class="article-list__item" z-empty="item5">{$item5:項目5}</li>'
            . '</ul>';

        $articleShellBody = '<div class="l-container">'
            . '<div class="p-news-article">'
            . '<div z-slot="content"></div>'
            . '</div></div>';

        $parts = [
            [
                'id' => 'corp-part-hero',
                'type_id' => 'corp-type-hero',
                'title' => 'ヒーロー',
                'description' => 'タイトルとリード文',
                'body' => $heroBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-text',
                'type_id' => 'corp-type-text',
                'title' => 'テキスト',
                'description' => '見出しと本文',
                'body' => $textBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-service-cards',
                'type_id' => 'corp-type-service-cards',
                'title' => 'サービスカード',
                'description' => '3カラムのサービス紹介',
                'body' => $serviceCardsBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-metrics',
                'type_id' => 'corp-type-metrics',
                'title' => '実績メトリクス',
                'description' => '数値で示す実績',
                'body' => $metricsBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-news-preview',
                'type_id' => 'corp-type-news-preview',
                'title' => 'お知らせプレビュー',
                'description' => 'お知らせ一覧へのリンク付き',
                'body' => $newsPreviewBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-cta',
                'type_id' => 'corp-type-cta',
                'title' => 'cta',
                'description' => 'CTA セクション',
                'body' => $ctaBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-article-heading',
                'type_id' => 'corp-type-article-heading',
                'title' => '記事用見出し',
                'description' => '見出し（h2/h3/h4）',
                'body' => $articleHeadingBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-article-body',
                'type_id' => 'corp-type-article-body',
                'title' => '記事用本文',
                'description' => '本文（リッチテキスト）',
                'body' => $articleBodyBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-article-image',
                'type_id' => 'corp-type-article-image',
                'title' => '記事用画像',
                'description' => '画像とキャプション',
                'body' => $articleImageBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-article-quote',
                'type_id' => 'corp-type-article-quote',
                'title' => '記事用引用',
                'description' => '引用・コラム',
                'body' => $articleQuoteBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-article-list',
                'type_id' => 'corp-type-article-list',
                'title' => '記事用リスト',
                'description' => '箇条書き（最大5項目）',
                'body' => $articleListBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-article-shell',
                'type_id' => 'corp-type-article-shell',
                'title' => '記事用ラッパー',
                'description' => 'l-container・p-news-article（記事本文用）',
                'body' => $articleShellBody,
                'slot_only' => false,
                'slots' => json_encode([
                    'content' => [
                        'allowedParts' => [
                            'corp-part-article-heading',
                            'corp-part-article-body',
                            'corp-part-article-image',
                            'corp-part-article-quote',
                            'corp-part-article-list',
                        ],
                    ],
                ]),
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-top-hero',
                'type_id' => 'corp-type-top-hero',
                'title' => 'TOPヒーロー',
                'description' => 'TOP専用のビジュアルヒーロー',
                'body' => $topHeroBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
            [
                'id' => 'corp-part-top-showcase',
                'type_id' => 'corp-type-top-showcase',
                'title' => 'TOP事例カード',
                'description' => 'TOP専用の画像付きカード',
                'body' => $topShowcaseBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 1,
            ],
            [
                'id' => 'corp-part-top-news',
                'type_id' => 'corp-type-top-news',
                'title' => 'TOPお知らせ',
                'description' => 'TOP専用お知らせリスト',
                'body' => $topNewsBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 2,
            ],
            [
                'id' => 'corp-part-top-cta',
                'type_id' => 'corp-type-top-cta',
                'title' => 'TOP CTA',
                'description' => 'TOP専用CTA',
                'body' => $topCtaBody,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 3,
            ],
        ];
        foreach ($parts as $row) {
            DB::table('parts')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
