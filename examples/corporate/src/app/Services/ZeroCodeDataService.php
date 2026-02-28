<?php

namespace App\Services;

use App\Models\News;
use App\Models\Page;
use Illuminate\Support\Facades\DB;

class ZeroCodeDataService
{
    public function getDataForPage(string $pageId): array
    {
        $page = Page::find($pageId);
        $pageData = $page ? ($page->page_data ?? []) : [];
        return $this->buildZeroCodeData($pageData);
    }

    public function getDataForNews(string $slug): array
    {
        $news = News::where('slug', $slug)->first();
        $pageData = $news ? ($news->page_data ?? []) : [];
        return $this->buildZeroCodeData($pageData);
    }

    private function buildZeroCodeData(array $pageData): array
    {
        return [
            'page' => $pageData,
            'css' => $this->getCss(),
            'parts' => $this->getParts(),
            'images' => $this->getImages(),
        ];
    }

    private function getCss(): array
    {
        $rows = DB::table('css')->get();
        $out = ['common' => '', 'individual' => '', 'special' => ''];
        foreach ($rows as $row) {
            if (isset($out[$row->category])) {
                $out[$row->category] = $row->content ?? '';
            }
        }
        return $out;
    }

    private function getParts(): array
    {
        $types = DB::table('types')->orderBy('sort_order')->get();
        $partsRows = DB::table('parts')->orderBy('sort_order')->get()->groupBy('type_id');
        $byCategory = ['common' => [], 'individual' => [], 'special' => []];
        foreach ($types as $type) {
            $partList = collect($partsRows->get($type->id, []))->map(function ($p) {
                $part = [
                    'id' => $p->id,
                    'title' => $p->title,
                    'description' => $p->description ?? '',
                    'body' => $p->body,
                ];
                if ($p->slots !== null) {
                    $part['slots'] = is_string($p->slots) ? json_decode($p->slots, true) : $p->slots;
                }
                if ($p->slot_only) {
                    $part['slotOnly'] = true;
                }
                return $part;
            })->values()->all();
            $category = $type->category;
            if (isset($byCategory[$category])) {
                $byCategory[$category][] = [
                    'id' => $type->id,
                    'type' => $type->type,
                    'description' => $type->description ?? '',
                    'parts' => $partList,
                ];
            }
        }
        return $byCategory;
    }

    private function getImages(): array
    {
        $rows = DB::table('images')->get();
        $byCategory = ['common' => [], 'individual' => [], 'special' => []];
        foreach ($rows as $row) {
            $category = $row->category;
            if (isset($byCategory[$category])) {
                $img = [
                    'id' => $row->id,
                    'name' => $row->name,
                    'url' => $row->url,
                ];
                if ($row->mime_type !== null) {
                    $img['mimeType'] = $row->mime_type;
                }
                if (!empty($row->needs_upload)) {
                    $img['needsUpload'] = true;
                }
                $byCategory[$category][] = $img;
            }
        }
        return $byCategory;
    }
}
