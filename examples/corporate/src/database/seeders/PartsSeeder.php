<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PartsSeeder extends Seeder
{
    public function run(): void
    {
        $body = '<section class="cta">'
            . '<div class="cta__bg"></div>'
            . '<div class="container">'
            . '<div class="cta__inner">'
            . '<div class="cta__title" z-tag="$tag:h2|h3|div">{$title:お問い合わせ}</div>'
            . '<div class="cta__text">{$text:説明文を入力:textarea}</div>'
            . '<a href="{$link_btn:mailto:info@example.com}" class="btn btn--white btn--lg">{$btn_text:予約する}</a>'
            . '<div class="cta__note" z-if="show_note">{$note:※ 注釈テキスト}</div>'
            . '</div></div></section>';

        DB::table('parts')->insert([
            [
                'id' => 'corp-part-cta',
                'type_id' => 'corp-type-cta',
                'title' => 'cta',
                'description' => 'CTA セクション',
                'body' => $body,
                'slot_only' => false,
                'slots' => null,
                'sort_order' => 0,
            ],
        ]);
    }
}
