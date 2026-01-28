<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Category;

class CategorySuggestionController extends Controller
{
    public function suggest(Request $request)
    {
        $searchTerm = trim((string) $request->query('q', $request->input('q', '')));
        // If no meaningful search term, return empty result (frontend will call full list when needed)
        if (mb_strlen($searchTerm) < 2) {
            return response()->json(['data' => []]);
        }

        $driver = DB::getDriverName();

        // Use PostgreSQL full-text search when available for better relevance
        if ($driver === 'pgsql') {
            // Use a simple text search configuration and rank by ts_rank
            $tsVector = "to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,''))";
            $tsQuery = "plainto_tsquery('simple', ? )";

            $categories = Category::whereRaw("{$tsVector} @@ {$tsQuery}", [$searchTerm])
                ->select(['id', 'name'])
                ->orderByRaw("CASE WHEN name ILIKE ? THEN 0 ELSE 1 END", ["{$searchTerm}%"])
                ->orderByRaw("ts_rank_cd({$tsVector}, {$tsQuery}) DESC", [$searchTerm])
                ->limit(50)
                ->get();

            return response()->json(['data' => $categories]);
        }

        // Fallback: tokenized ILIKE (works with MySQL, SQLite)
        $tokens = preg_split('/\s+/', $searchTerm, -1, PREG_SPLIT_NO_EMPTY);

        $query = Category::query();
        $query->where(function ($q) use ($tokens) {
            foreach ($tokens as $token) {
                $like = '%' . str_replace('%', '\\%', $token) . '%';
                $q->where(function ($sub) use ($like) {
                    $sub->where('name', 'ILIKE', $like)
                        ->orWhere('description', 'ILIKE', $like);
                });
            }
        });

        // Prefer prefix matches on name
        $query->orderByRaw("CASE WHEN name ILIKE ? THEN 0 ELSE 1 END", ["{$searchTerm}%"]);

        $categories = $query->limit(50)->get(['id', 'name']);

        return response()->json(['data' => $categories]);
    }

}
