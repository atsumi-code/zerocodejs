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

        $this->seedArticle($now, 'sample-news', '新オフィス移転のお知らせ', '2026-03-01', '新オフィスへの移転が完了しました。新しい住所・アクセスをご案内いたします。', $this->getSampleNewsPageData());
        $this->seedArticle($now, 'service-renewal-2026', 'サービスリニューアルのご案内', '2026-02-15', 'ウェブサイトおよび管理画面を刷新し、より使いやすくいたしました。', $this->getServiceRenewalPageData());
        $this->seedArticle($now, 'year-end-schedule', '年末年始の営業日のお知らせ', '2025-12-20', '誠に勝手ながら、下記期間を休業とさせていただきます。', $this->getYearEndSchedulePageData());
        $this->seedArticle($now, 'recruit-2026', '2026年度採用情報を公開しました', '2026-01-10', 'エンジニア・デザイナー・営業職の募集を開始しました。', $this->getRecruitPageData());
        $this->seedArticle($now, 'seminar-march', '3月セミナー開催のご案内', '2026-02-25', '「はじめてのWeb制作」セミナーを3月20日に開催します。参加費無料。', $this->getSeminarPageData());
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
            ['id' => 'comp-news-intro-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'ご挨拶', 'tag' => 'h2'],
            ['id' => 'comp-news-intro-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>いつも当社サービスをご利用いただき、ありがとうございます。この度、新オフィスへの移転が完了いたしましたので、お知らせいたします。</p>'],
            ['id' => 'comp-news-place-heading', 'part_id' => 'corp-part-article-heading', 'heading' => '新しいオフィスについて', 'tag' => 'h2'],
            ['id' => 'comp-news-place-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>新オフィスは交通の便が良い立地にあり、打ち合わせやご来社の際にご利用いただきやすくなっております。フリーアドレス制を導入し、プロジェクトに応じた柔軟な働き方を推進しています。</p>'],
            ['id' => 'comp-news-image', 'part_id' => 'corp-part-article-image', 'image' => 'img-service-1', 'caption' => '新オフィス外観'],
            ['id' => 'comp-news-quote', 'part_id' => 'corp-part-article-quote', 'quote' => '「より良い環境で、お客様との対話を大切にしていきたいと考えています。」', 'cite' => '代表取締役'],
            ['id' => 'comp-news-detail-heading', 'part_id' => 'corp-part-article-heading', 'heading' => '移転の概要', 'tag' => 'h2'],
            ['id' => 'comp-news-list', 'part_id' => 'corp-part-article-list', 'item1' => '移転日：2026年3月1日', 'item2' => '住所：〒100-0001 東京都千代田区例町1-2-3', 'item3' => 'アクセス：〇〇駅より徒歩5分', 'item4' => '受付時間：9:00〜18:00（土日祝除く）', 'item5' => ''],
            ['id' => 'comp-news-close-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>ご不明な点がございましたら、お気軽にお問い合わせください。皆様のご来社を心よりお待ちしております。</p>'],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }

    private function getServiceRenewalPageData(): array
    {
        $content = [
            ['id' => 'comp-sr-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'リニューアルのポイント', 'tag' => 'h2'],
            ['id' => 'comp-sr-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>お客様からのご要望を反映し、管理画面の操作性を大幅に改善しました。レスポンシブ対応を強化し、スマートフォンからもストレスなくご利用いただけます。</p>'],
            ['id' => 'comp-sr-list', 'part_id' => 'corp-part-article-list', 'item1' => '管理画面のデザイン刷新', 'item2' => 'スマートフォン対応の強化', 'item3' => 'お知らせの一括編集機能', 'item4' => '画像アップロードの高速化', 'item5' => ''],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }

    private function getYearEndSchedulePageData(): array
    {
        $content = [
            ['id' => 'comp-ye-heading', 'part_id' => 'corp-part-article-heading', 'heading' => '休業期間', 'tag' => 'h2'],
            ['id' => 'comp-ye-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>年末年始は下記の期間、休業とさせていただきます。お問い合わせは休業明けより順次対応いたします。</p>'],
            ['id' => 'comp-ye-list', 'part_id' => 'corp-part-article-list', 'item1' => '休業日：2025年12月28日（土）〜2026年1月4日（日）', 'item2' => '業務開始：2026年1月5日（月）', 'item3' => '緊急のお問い合わせはメールにて受付', 'item4' => '', 'item5' => ''],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }

    private function getRecruitPageData(): array
    {
        $content = [
            ['id' => 'comp-rec-heading', 'part_id' => 'corp-part-article-heading', 'heading' => '募集職種', 'tag' => 'h2'],
            ['id' => 'comp-rec-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>私たちと一緒に、お客様のビジネスを支えるサービスを届けませんか。経験・未経験を問いません。意欲のある方のご応募をお待ちしております。</p>'],
            ['id' => 'comp-rec-quote', 'part_id' => 'corp-part-article-quote', 'quote' => '「チームで挑戦し、一緒に成長できる環境があります。」', 'cite' => '開発責任者'],
            ['id' => 'comp-rec-list', 'part_id' => 'corp-part-article-list', 'item1' => 'Webエンジニア（正社員）', 'item2' => 'UI/UXデザイナー（正社員・業務委託）', 'item3' => '営業職（正社員）', 'item4' => '応募締切：2026年3月31日', 'item5' => ''],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }

    private function getSeminarPageData(): array
    {
        $content = [
            ['id' => 'comp-sem-heading', 'part_id' => 'corp-part-article-heading', 'heading' => 'セミナー概要', 'tag' => 'h2'],
            ['id' => 'comp-sem-body', 'part_id' => 'corp-part-article-body', 'body' => '<p>初めてWeb制作を担当される方向けに、企画から公開までの流れと、よくあるご質問について解説します。参加費は無料です。お気軽にご参加ください。</p>'],
            ['id' => 'comp-sem-list', 'part_id' => 'corp-part-article-list', 'item1' => '日時：2026年3月20日（金）14:00〜16:00', 'item2' => '会場：オンライン（Zoom）', 'item3' => '定員：50名（先着順）', 'item4' => '申込期限：3月18日（水）', 'item5' => ''],
        ];
        return [['id' => 'comp-news-shell', 'part_id' => 'corp-part-article-shell', 'slots' => ['content' => $content]]];
    }
}
