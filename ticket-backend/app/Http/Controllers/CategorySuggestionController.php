<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategorySuggestionController extends Controller
{
    public function suggest(Request $request)
    {
        $searchTerm = trim((string) $request->query('q', $request->input('q', '')));

        if (mb_strlen($searchTerm) < 2) {
            return response()->json([
                'data' => []
            ]);
        }

        $searchWildcard = "%{$searchTerm}%";
        $prefixWildcard = "{$searchTerm}%";

        $categories = Category::where(function ($builder) use ($searchWildcard) {
                $builder->where('name', 'like', $searchWildcard)
                        ->orWhere('description', 'like', $searchWildcard);
            })
            ->orderByRaw("CASE WHEN name LIKE ? THEN 0 ELSE 1 END", [$prefixWildcard])
            ->limit(10)
            ->get(['id', 'name']);

        return response()->json([
            'data' => $categories
        ]);
    }

}
