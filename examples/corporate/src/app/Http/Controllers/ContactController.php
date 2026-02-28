<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ContactController extends Controller
{
    public function show(): View
    {
        return view('contact');
    }

    public function submit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'email' => ['required', 'email'],
            'message' => ['required', 'string', 'max:2000'],
        ]);
        // 実際の送信処理は未実装（メール送信等は呼び出し側で実装）
        return redirect()->route('contact')->with('contact_sent', true);
    }
}
