<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PagesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $defaultPageData = [
            [
                'id' => 'comp-top-hero',
                'part_id' => 'corp-part-top-hero',
                'bg_image' => 'img-top-hero',
                'eyebrow' => 'ZeroCode.js デモ',
                'title' => 'このサイトはデモです。',
                'lead' => '<p>表示されている内容はすべてサンプル・架空のものです。ZeroCode.js の動作確認用デモサイトです。</p>',
                'primary_link' => '/contact',
                'primary_text' => 'お問い合わせ（デモ）',
                'secondary_link' => '/services',
                'secondary_text' => '事業内容（デモ）',
            ],
            [
                'id' => 'comp-top-showcase',
                'part_id' => 'corp-part-top-showcase',
                'heading' => 'サンプルカード（架空の実績です）',
                'card1_image' => 'img-top-showcase-1',
                'card1_title' => 'デモ用カード 1',
                'card1_text' => 'ここには ZeroCode で編集できるサンプル文言が入ります。実在の実績ではありません。',
                'card2_image' => 'img-top-showcase-2',
                'card2_title' => 'デモ用カード 2',
                'card2_text' => 'パーツの追加・編集・並べ替えを管理画面から試せます。',
                'card3_image' => 'img-top-showcase-3',
                'card3_title' => 'デモ用カード 3',
                'card3_text' => '記載の数値・固有名詞はすべて架空です。',
            ],
            [
                'id' => 'comp-top-news',
                'part_id' => 'corp-part-top-news',
                'heading' => 'デモ用お知らせ',
                'more_link' => '/news',
                'more_text' => 'すべて見る',
            ],
            [
                'id' => 'comp-top-cta',
                'part_id' => 'corp-part-top-cta',
                'title' => 'このサイトは ZeroCode.js のデモです',
                'text' => '<p>お問い合わせフォームもデモ用です。送信しても実在の窓口には届きません。</p>',
                'link_btn' => '/contact',
                'btn_text' => 'お問い合わせ（デモ）',
            ],
        ];

        $aboutPageData = [
            [
                'id' => 'comp-about-hero',
                'part_id' => 'corp-part-hero',
                'title' => '会社概要（デモ用）',
                'lead' => 'このページは ZeroCode.js デモの「会社概要」サンプルです。内容は架空です。',
            ],
            [
                'id' => 'comp-about-message',
                'part_id' => 'corp-part-text',
                'heading' => 'デモ用テキストブロック',
                'body' => '<p>ここに表示されている文章はすべてサンプルです。実在の会社・人物・実績とは関係ありません。</p><p>管理画面から見出しや本文を編集できます。ZeroCode.js の動作確認用デモサイトであることをご了承ください。</p>',
            ],
            [
                'id' => 'comp-about-metrics',
                'part_id' => 'corp-part-metrics',
                'heading' => '架空の数値（デモ用）',
                'metric1_value' => '---',
                'metric1_label' => 'サンプル指標 1',
                'metric2_value' => '---',
                'metric2_label' => 'サンプル指標 2',
                'metric3_value' => '---',
                'metric3_label' => 'サンプル指標 3',
            ],
            [
                'id' => 'comp-about-info',
                'part_id' => 'corp-part-text',
                'heading' => 'デモ用会社情報（架空です）',
                'body' => '<p><strong>サイト名</strong> ZeroCode.js デモ</p><p><strong>説明</strong> このサイトはデモ用です。記載の会社名・住所・電話番号は架空であり、実在しません。</p><p><strong>住所（架空）</strong> 〒000-0000 東京都架空区例町0-0-0</p><p><strong>電話（架空）</strong> 00-0000-0000</p>',
            ],
            [
                'id' => 'comp-about-cta',
                'part_id' => 'corp-part-cta',
                'title' => 'お問い合わせ（デモ）',
                'text' => 'フォームはデモ用です。送信しても実在の窓口には届きません。',
                'link_btn' => '/contact',
                'btn_text' => 'お問い合わせ（デモ）',
                'tag' => 'h2',
                'show_note' => false,
                'note' => '',
            ],
        ];

        $servicesPageData = [
            [
                'id' => 'comp-services-hero',
                'part_id' => 'corp-part-hero',
                'title' => '事業内容（デモ用）',
                'lead' => 'このページは ZeroCode.js デモの「事業内容」サンプルです。記載は架空です。',
            ],
            [
                'id' => 'comp-services-cards',
                'part_id' => 'corp-part-service-cards',
                'heading' => 'デモ用サービスカード（架空です）',
                'card1_title' => 'サンプルサービス 1',
                'card1_text' => 'ここには ZeroCode で編集できる説明文が入ります。実在のサービスではありません。',
                'card1_link' => '/contact',
                'card1_link_text' => 'お問い合わせ（デモ）',
                'card2_title' => 'サンプルサービス 2',
                'card2_text' => '管理画面からカードの見出し・本文を変更できます。',
                'card2_link' => '/contact',
                'card2_link_text' => 'お問い合わせ（デモ）',
                'card3_title' => 'サンプルサービス 3',
                'card3_text' => '数値・固有名詞はすべてデモ用の架空のものです。',
                'card3_link' => '/contact',
                'card3_link_text' => 'お問い合わせ（デモ）',
            ],
            [
                'id' => 'comp-services-metrics',
                'part_id' => 'corp-part-metrics',
                'heading' => '架空の実績（デモ用）',
                'metric1_value' => '---',
                'metric1_label' => 'サンプル実績 1',
                'metric2_value' => '---',
                'metric2_label' => 'サンプル実績 2',
                'metric3_value' => '---',
                'metric3_label' => 'サンプル実績 3',
            ],
            [
                'id' => 'comp-services-text',
                'part_id' => 'corp-part-text',
                'heading' => 'このサイトはデモです',
                'body' => '<p>お問い合わせ先・会社情報は実在しません。ZeroCode.js の編集体験のためのサンプルコンテンツです。</p>',
            ],
            [
                'id' => 'comp-services-cta',
                'part_id' => 'corp-part-cta',
                'title' => 'お問い合わせ（デモ）',
                'text' => 'フォーム送信はデモ用です。実在の窓口には届きません。',
                'link_btn' => '/contact',
                'btn_text' => 'お問い合わせ（デモ）',
                'tag' => 'h2',
                'show_note' => false,
                'note' => '',
            ],
        ];

        $pages = [
            [
                'id' => 'default',
                'slug' => '/',
                'title' => 'トップ（ZeroCode.js デモ）',
                'meta_description' => 'ZeroCode.js のデモサイトです。表示内容はすべてサンプル・架空のものです。',
                'sort_order' => 0,
                'page_data' => json_encode($defaultPageData),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 'about',
                'slug' => 'about',
                'title' => '会社概要（デモ）',
                'meta_description' => 'デモ用の会社概要サンプルページです。内容は架空です。',
                'sort_order' => 1,
                'page_data' => json_encode($aboutPageData),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 'services',
                'slug' => 'services',
                'title' => '事業内容（デモ）',
                'meta_description' => 'デモ用の事業内容サンプルページです。内容は架空です。',
                'sort_order' => 2,
                'page_data' => json_encode($servicesPageData),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($pages as $row) {
            $id = $row['id'];
            unset($row['id']);
            DB::table('pages')->updateOrInsert(['id' => $id], $row);
        }
    }
}
