<?php

namespace App\Services;

use App\Models\Category;

class CategoryService
{
    public function getCategoryNameById($categoryId)
    {
        $category = Category::find($categoryId);
        return $category ? $category->name : null;
    }
}
