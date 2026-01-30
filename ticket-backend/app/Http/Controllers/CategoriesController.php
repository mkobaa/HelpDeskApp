<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Database\QueryException;
use App\Models\Category;

class CategoriesController extends Controller
{
    public function index()
    {
        $categories = Category::with('parent')->get();
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'parent_category_id' => 'nullable|exists:categories,id',
        ]);
        try {
            $category = Category::create($data);
        } catch (QueryException $e) {
            if (isset($e->errorInfo[0]) && $e->errorInfo[0] === '23505') {
                return response()->json([
                    'success' => false,
                    'message' => 'Category with this name already exists',
                ], 409);
            }
            throw $e;
        }
        return response()->json([
            'success' => true,
            'data' => $category
        ])->setStatusCode(201);
    }

    public function show(Category $category)
    {
        return response()->json(
            $category->load('parent')
        );
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => ['sometimes','string','max:255', Rule::unique('categories', 'name')->ignore($category->id)],
            'description' => 'nullable|string',
            'parent_category_id' => 'nullable|exists:categories,id',
        ]);

        try {
            $category->update($data);
        } catch (QueryException $e) {
            if (isset($e->errorInfo[0]) && $e->errorInfo[0] === '23505') {
                return response()->json([
                    'success' => false,
                    'message' => 'Category with this name already exists',
                ], 409);
            }
            throw $e;
        }

        return response()->json([
            'success' => true,
            'data' => $category->load('parent'),
        ]);
    }

    public function destroy($category)
    {
        $category = Category::find($category);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        if ($category->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with subcategories. Please reassign or delete subcategories first.',
            ], 400);
        }

        if ($category->tickets()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category assigned to tickets. Please reassign or delete tickets first.',
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}
