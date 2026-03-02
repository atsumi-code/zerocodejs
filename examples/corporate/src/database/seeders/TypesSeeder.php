<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypesSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['id' => 'corp-type-hero', 'category' => 'common', 'type' => 'hero', 'description' => 'ヒーロー（タイトル・リード）', 'sort_order' => 0],
            ['id' => 'corp-type-text', 'category' => 'common', 'type' => 'text', 'description' => 'テキストブロック', 'sort_order' => 1],
            ['id' => 'corp-type-service-cards', 'category' => 'common', 'type' => 'service-cards', 'description' => 'サービス紹介（3カード）', 'sort_order' => 2],
            ['id' => 'corp-type-metrics', 'category' => 'common', 'type' => 'metrics', 'description' => '実績メトリクス', 'sort_order' => 3],
            ['id' => 'corp-type-news-preview', 'category' => 'common', 'type' => 'news-preview', 'description' => 'お知らせプレビュー', 'sort_order' => 4],
            ['id' => 'corp-type-cta', 'category' => 'common', 'type' => 'cta', 'description' => 'CTA（お問い合わせ誘導）', 'sort_order' => 5],
            ['id' => 'corp-type-article-heading', 'category' => 'common', 'type' => 'article-heading', 'description' => '記事用見出し', 'sort_order' => 6],
            ['id' => 'corp-type-article-body', 'category' => 'common', 'type' => 'article-body', 'description' => '記事用本文', 'sort_order' => 7],
            ['id' => 'corp-type-article-image', 'category' => 'common', 'type' => 'article-image', 'description' => '記事用画像', 'sort_order' => 8],
            ['id' => 'corp-type-article-quote', 'category' => 'common', 'type' => 'article-quote', 'description' => '記事用引用', 'sort_order' => 9],
            ['id' => 'corp-type-article-list', 'category' => 'common', 'type' => 'article-list', 'description' => '記事用リスト', 'sort_order' => 10],
            ['id' => 'corp-type-article-shell', 'category' => 'common', 'type' => 'article-shell', 'description' => '記事用ラッパー（l-container・p-news-article）', 'sort_order' => 11],
            ['id' => 'corp-type-top-hero', 'category' => 'individual', 'type' => 'top-hero', 'description' => 'TOP専用ヒーロー', 'sort_order' => 0],
            ['id' => 'corp-type-top-showcase', 'category' => 'individual', 'type' => 'top-showcase', 'description' => 'TOP専用事例カード', 'sort_order' => 1],
            ['id' => 'corp-type-top-news', 'category' => 'individual', 'type' => 'top-news', 'description' => 'TOP専用お知らせ', 'sort_order' => 2],
            ['id' => 'corp-type-top-cta', 'category' => 'individual', 'type' => 'top-cta', 'description' => 'TOP専用CTA', 'sort_order' => 3],
        ];
        foreach ($types as $row) {
            DB::table('types')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
