<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        DB::table('news')->where('slug', 'test')->delete();

        $this->seedArticle($now, 'sample-news', '【デモ】サンプルお知らせ 1', '2026-03-01', 'この記事はデモ用のサンプルです。内容は架空です。', $this->getSampleNewsPageData());
        $this->seedArticle($now, 'service-renewal-2026', '【デモ】サンプルお知らせ 2', '2026-02-15', 'ZeroCode.js で記事の追加・編集を試せます。記載はすべて架空です。', $this->getServiceRenewalPageData());
        $this->seedArticle($now, 'year-end-schedule', '【デモ】サンプルお知らせ 3', '2025-12-20', '日付・本文はデモ用のダミーです。実在のニュースではありません。', $this->getYearEndSchedulePageData());
        $this->seedArticle($now, 'recruit-2026', '【デモ】サンプルお知らせ 4', '2026-01-10', '管理画面から見出し・本文・画像を編集できます。', $this->getRecruitPageData());
        $this->seedArticle($now, 'seminar-march', '【デモ】サンプルお知らせ 5', '2026-02-25', 'このサイトは ZeroCode.js のデモです。実在のイベント・会社とは無関係です。', $this->getSeminarPageData());
    }

    private function seedArticle(mixed $now, string $slug, string $title, string $publishedAt, string $excerpt, array $pageData): void
    {
        $row = [
            'slug' => $slug,
            'title' => $title,
            'published_at' => $publishedAt,
            'excerpt' => $excerpt,
            'page_data' => json_encode($pageData, JSON_UNESCAPED_UNICODE),
            'created_at' => $now,
            'updated_at' => $now,
        ];
        DB::table('news')->updateOrInsert(['slug' => $slug], $row);
    }

    private function getSampleNewsPageData(): array
    {
        $content = [
            ['id' => 'comp-news-intro-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'この記事はデモ用サンプルです', 'tag' => 'h2'],
            ['id' => 'comp-news-intro-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>表示されている内容はすべて架空です。ZeroCode.js の記事編集機能の動作確認用です。実在の会社・人物・イベントとは関係ありません。</p>'],
            ['id' => 'comp-news-place-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'デモ用見出し（架空です）', 'tag' => 'h2'],
            ['id' => 'comp-news-place-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>ここには管理画面から編集できる本文が入ります。住所・日付・固有名詞はすべてサンプルであり、実在しません。</p>'],
            ['id' => 'comp-news-image', 'part_id' => 'corp-part-article-image', 'image' => 'img-service-1', 'caption' => 'デモ用画像キャプション'],
            ['id' => 'comp-news-quote', 'part_id' => 'corp-part-article-quote', 'quote' => '「この引用文もデモ用のサンプルです。」', 'cite' => '架空の出典'],
            ['id' => 'comp-news-detail-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'デモ用リスト（架空の項目）', 'tag' => 'h2'],
            ['id' => 'comp-news-list', 'part_id' => 'corp-part-article-list', 'item1' => '項目1：サンプル（架空）', 'item2' => '項目2：サンプル（架空）', 'item3' => '項目3：サンプル（架空）', 'item4' => '記載の情報は実在しません', 'item5' => ''],
            ['id' => 'comp-news-close-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>このサイトは ZeroCode.js のデモです。お問い合わせ先は実在しません。</p>'],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }

    private function getServiceRenewalPageData(): array
    {
        $content = [
            ['id' => 'comp-sr-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'デモ用サンプル見出し', 'tag' => 'h2'],
            ['id' => 'comp-sr-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>この記事はデモ用です。内容は架空であり、実在のリニューアルやサービスとは無関係です。</p>'],
            ['id' => 'comp-sr-list', 'part_id' => 'corp-part-article-list', 'item1' => 'サンプル項目 1（架空）', 'item2' => 'サンプル項目 2（架空）', 'item3' => 'サンプル項目 3（架空）', 'item4' => 'ZeroCode.js で編集できます', 'item5' => ''],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }

    private function getYearEndSchedulePageData(): array
    {
        $content = [
            ['id' => 'comp-ye-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'デモ用お知らせ（架空です）', 'tag' => 'h2'],
            ['id' => 'comp-ye-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>記載の日付・連絡先はすべてサンプルです。実在の休業案内ではありません。</p>'],
            ['id' => 'comp-ye-list', 'part_id' => 'corp-part-article-list', 'item1' => 'サンプル日付（架空）', 'item2' => 'サンプル項目（架空）', 'item3' => 'このサイトはデモです', 'item4' => '', 'item5' => ''],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }

    private function getRecruitPageData(): array
    {
        $content = [
            ['id' => 'comp-rec-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'デモ用サンプル（採用情報は架空です）', 'tag' => 'h2'],
            ['id' => 'comp-rec-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>この記事は ZeroCode.js デモのサンプルです。募集・会社は実在しません。</p>'],
            ['id' => 'comp-rec-quote', 'part_id' => 'corp-part-article-quote', 'quote' => '「この引用もデモ用のサンプルです。」', 'cite' => '架空'],
            ['id' => 'comp-rec-list', 'part_id' => 'corp-part-article-list', 'item1' => 'サンプル職種 1（架空）', 'item2' => 'サンプル職種 2（架空）', 'item3' => 'サンプル職種 3（架空）', 'item4' => '記載はすべてデモ用です', 'item5' => ''],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }

    private function getSeminarPageData(): array
    {
        $content = [
            ['id' => 'comp-sem-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'デモ用イベント案内（架空です）', 'tag' => 'h2'],
            ['id' => 'comp-sem-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>記載のイベント・日時・会場はすべてサンプルです。実在のセミナーではありません。</p>'],
            ['id' => 'comp-sem-list', 'part_id' => 'corp-part-article-list', 'item1' => 'サンプル日時（架空）', 'item2' => 'サンプル会場（架空）', 'item3' => 'このサイトは ZeroCode.js デモです', 'item4' => '申込先は実在しません', 'item5' => ''],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }
}
