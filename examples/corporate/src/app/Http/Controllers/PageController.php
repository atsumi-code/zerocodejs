<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\View\View;

class PageController extends Controller
{
    public function home(): View
    {
        $page = Page::find('default');
        if (!$page) {
            abort(404);
        }
        return view('page', ['page' => $page, 'isHome' => true]);
    }

    public function show(string $id): View
    {
        $page = Page::find($id);
        if (!$page) {
            abort(404);
        }
        return view('page', ['page' => $page, 'isHome' => false]);
    }
}
