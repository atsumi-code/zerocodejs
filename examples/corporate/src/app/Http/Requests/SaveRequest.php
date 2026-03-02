<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target' => ['required', 'string', 'in:page'],
            'source' => ['required', 'string', 'in:cms,editor'],
            'page_id' => ['nullable', 'string', 'in:default,about,services'],
            'news_id' => ['nullable', 'integer', 'exists:news,id'],
            'data' => ['required', 'array'],
        ];
    }
}
