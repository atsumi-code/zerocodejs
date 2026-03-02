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
                'eyebrow' => 'B2B Growth Partner',
                'title' => '事業成長を、戦略から実装まで一気通貫で。',
                'lead' => '<p>サンプル株式会社は、経営戦略・業務設計・システム実装までをワンチームで支援します。</p>',
                'primary_link' => '/contact',
                'primary_text' => '無料相談を申し込む',
                'secondary_link' => '/services',
                'secondary_text' => 'サービスを見る',
            ],
            [
                'id' => 'comp-top-showcase',
                'part_id' => 'corp-part-top-showcase',
                'heading' => '支援実績ピックアップ',
                'card1_image' => 'img-top-showcase-1',
                'card1_title' => '製造業の業務改革',
                'card1_text' => '基幹業務の可視化とワークフロー再設計により、月間作業時間を35%削減。',
                'card2_image' => 'img-top-showcase-2',
                'card2_title' => '営業プロセス再構築',
                'card2_text' => '営業管理基盤の再設計で、商談化率を1.6倍へ改善。',
                'card3_image' => 'img-top-showcase-3',
                'card3_title' => '採用ブランディング',
                'card3_text' => '採用サイト刷新とコンテンツ設計により、応募数が前年比2.1倍。',
            ],
            [
                'id' => 'comp-top-news',
                'part_id' => 'corp-part-top-news',
                'heading' => '最新トピックス',
                'more_link' => '/news',
                'more_text' => 'すべて見る',
            ],
            [
                'id' => 'comp-top-cta',
                'part_id' => 'corp-part-top-cta',
                'title' => '課題の整理から、気軽にご相談ください',
                'text' => '<p>初回ヒアリングは無料です。現状の課題と目標を伺い、最適な進め方をご提案します。</p>',
                'link_btn' => '/contact',
                'btn_text' => 'お問い合わせ',
            ],
        ];

        $aboutPageData = [
            [
                'id' => 'comp-about-hero',
                'part_id' => 'corp-part-hero',
                'title' => '会社概要',
                'lead' => '私たちの想いと歩みをご紹介します。',
            ],
            [
                'id' => 'comp-about-message',
                'part_id' => 'corp-part-text',
                'heading' => '代表挨拶',
                'body' => '<p>私たちは「ビジネスの課題を、シンプルに解決する」をモットーに、お客様の成長を支援しています。</p><p>創業以来、お客様の声を大切にし、コンサルティング・システム開発・デザインの各分野で実績を積み重ねてまいりました。これからも信頼されるパートナーであり続けます。</p>',
            ],
            [
                'id' => 'comp-about-metrics',
                'part_id' => 'corp-part-metrics',
                'heading' => 'これまでの実績',
                'metric1_value' => '120社',
                'metric1_label' => '取引企業数',
                'metric2_value' => '98%',
                'metric2_label' => '納期遵守率',
                'metric3_value' => '24h',
                'metric3_label' => '初回返信目安',
            ],
            [
                'id' => 'comp-about-info',
                'part_id' => 'corp-part-text',
                'heading' => '会社情報',
                'body' => '<p><strong>会社名</strong> サンプル株式会社</p><p><strong>設立</strong> 20XX年X月</p><p><strong>所在地</strong> 〒100-0001 東京都千代田区例町1-2-3</p><p><strong>電話</strong> 03-1234-5678</p><p><strong>営業時間</strong> 9:00〜18:00（土日祝除く）</p>',
            ],
            [
                'id' => 'comp-about-cta',
                'part_id' => 'corp-part-cta',
                'title' => 'お問い合わせ',
                'text' => 'ご不明な点がございましたら、お気軽にご連絡ください。',
                'link_btn' => '/contact',
                'btn_text' => 'お問い合わせする',
                'tag' => 'h2',
                'show_note' => false,
                'note' => '',
            ],
        ];

        $servicesPageData = [
            [
                'id' => 'comp-services-hero',
                'part_id' => 'corp-part-hero',
                'title' => '事業内容',
                'lead' => '私たちが提供するサービスをご紹介します。',
            ],
            [
                'id' => 'comp-services-cards',
                'part_id' => 'corp-part-service-cards',
                'heading' => 'サービス一覧',
                'card1_title' => 'コンサルティング',
                'card1_text' => '経営戦略の策定、業務プロセスの見直し、組織・人事のコンサルティングを提供。お客様の課題に寄り添い、実行可能な施策をご提案します。',
                'card1_link' => '/contact',
                'card1_link_text' => 'お問い合わせ',
                'card2_title' => 'システム開発',
                'card2_text' => 'Webアプリケーション、業務システムの設計・開発・保守。要件定義からリリース後運用まで一貫してサポートし、持続可能なシステムを構築します。',
                'card2_link' => '/contact',
                'card2_link_text' => 'お問い合わせ',
                'card3_title' => 'デザイン制作',
                'card3_text' => '企業ロゴ・ブランディング、Webサイト・UIデザイン、広告・販促物のデザイン。ビジュアルでブランド価値を高め、伝わりやすい表現を実現します。',
                'card3_link' => '/contact',
                'card3_link_text' => 'お問い合わせ',
            ],
            [
                'id' => 'comp-services-metrics',
                'part_id' => 'corp-part-metrics',
                'heading' => 'サービス提供実績',
                'metric1_value' => '300+',
                'metric1_label' => '導入支援件数',
                'metric2_value' => '4.8/5',
                'metric2_label' => '顧客満足度',
                'metric3_value' => '99.9%',
                'metric3_label' => '稼働率実績',
            ],
            [
                'id' => 'comp-services-text',
                'part_id' => 'corp-part-text',
                'heading' => 'ご相談からスタート',
                'body' => '<p>まずはお気軽にご相談ください。お客様の課題やご予算に合わせて、最適なプランをご提案いたします。</p>',
            ],
            [
                'id' => 'comp-services-cta',
                'part_id' => 'corp-part-cta',
                'title' => 'ご相談はこちら',
                'text' => 'サービスに関するお問い合わせは下記よりどうぞ。',
                'link_btn' => '/contact',
                'btn_text' => 'お問い合わせ',
                'tag' => 'h2',
                'show_note' => false,
                'note' => '',
            ],
        ];

        $pages = [
            [
                'id' => 'default',
                'slug' => '/',
                'title' => 'トップ',
                'meta_description' => null,
                'sort_order' => 0,
                'page_data' => json_encode($defaultPageData),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 'about',
                'slug' => 'about',
                'title' => '会社概要',
                'meta_description' => null,
                'sort_order' => 1,
                'page_data' => json_encode($aboutPageData),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 'services',
                'slug' => 'services',
                'title' => '事業内容',
                'meta_description' => null,
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
