<?php

use Illuminate\Support\Facades\Route;

// Web routes (if needed)
Route::get('/', function () {
    return response()->json(['message' => 'Help Desk API']);
});