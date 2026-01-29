<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\TicketsController;
use App\Http\Controllers\statsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CategorySuggestionController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\TicketAcceptanceController;
use App\Http\Controllers\SurveyController;

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/check', [AuthController::class, 'check'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/technicians', [UsersController::class, 'getTechnicians'])->middleware('supervisor');
    Route::get('/users/technicians/{user}', [UsersController::class, 'getTechnician'])->middleware('supervisor');
    Route::get('/tickets/my-surveys', [SurveyController::class, 'getMySurveys']);
    Route::get('/tickets/survey', [SurveyController::class, 'getSurveys']);
    Route::get('/users', [UsersController::class, 'index'])->middleware('admin');
    Route::get('/users/{user}', [UsersController::class, 'show'])->middleware('admin');
    Route::post('/users', [UsersController::class, 'store'])->middleware('admin');
    Route::put('/users/{user}', [UsersController::class, 'update'])->middleware('admin');
    Route::delete('/users/{user}', [UsersController::class, 'destroy'])->middleware('admin');
    Route::patch('/users/{user}/activate', [UsersController::class, 'activate'])->middleware('admin');
    Route::patch('/users/{user}/deactivate', [UsersController::class, 'deactivate'])->middleware('admin');
    Route::get('/users/{user}/account-status', [UsersController::class, 'getAccountStatus'])->middleware('admin');
    Route::get('/categories', [CategoriesController::class, 'index']);
    Route::get('/categories/suggest', [CategorySuggestionController::class, 'suggest']);
    Route::post('/categories', [CategoriesController::class, 'store'])->middleware('admin');
    Route::get('/categories/{category}', [CategoriesController::class, 'show']);
    Route::put('/categories/{category}', [CategoriesController::class, 'update'])->middleware('admin');
    Route::delete('/categories/{category}', [CategoriesController::class, 'destroy'])->middleware('admin');
    Route::get('/tickets/assigned-to-me', [TicketAcceptanceController::class, 'index'])->middleware('technician');
    Route::get('/tickets', [TicketsController::class, 'index']);
    Route::post('/tickets', [TicketsController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketsController::class, 'show']);
    Route::get('/stats/pending-tickets', [statsController::class, 'pendingTicketsCount'])->middleware('supervisor');
    Route::get('/stats/open-tickets', [statsController::class, 'openTicketsCount'])->middleware('supervisor');
    Route::get('/stats/closed-tickets', [statsController::class, 'closedTicketsCount'])->middleware('supervisor');
    Route::patch('/tickets/{ticket}/assign', [TicketsController::class, 'assignTechnician'])->middleware('supervisor');
    Route::patch('/tickets/{ticket}/reassign', [TicketsController::class, 'reassignTechnician'])->middleware('supervisor');
    Route::get('/technicians/workloads', [TicketsController::class, 'technicianWorkloads'])->middleware('supervisor');
    Route::get('/technicians/{id}/assigned-tickets', [TicketsController::class, 'getAssignedTickets'])->middleware('supervisor');
    Route::put('/tickets/{ticket}/status', [TicketsController::class, 'updateStatus'])->middleware('technician');
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/history/logs', [TicketsController::class, 'getHistoryLogs'])->middleware('admin');
    Route::get('/tickets/{ticket}/comments', [CommentsController::class, 'getComments']);
    Route::post('tickets/{ticket}/comments', [CommentsController::class, 'addComment']);
    Route::post('/tickets/{ticket}/acceptance', [TicketAcceptanceController::class, 'store'])->middleware('supervisor');
    Route::get('/tickets/{ticket}/acceptance/is-pending', [TicketAcceptanceController::class, 'isPending'])->middleware('supervisor');
    Route::post('/tickets/{ticket}/accept', [TicketAcceptanceController::class, 'accept'])->middleware('technician');
    Route::post('/tickets/{ticket}/reject', [TicketAcceptanceController::class, 'reject'])->middleware('technician');
    Route::post('/tickets/{ticket}/survey', [SurveyController::class, 'submitSurvey']);
    Route::get('/tickets/{ticket}/survey', [SurveyController::class, 'getSurveyByTicket'])->middleware('supervisor');
    Route::get('/reports/average-resolution-time', [ReportsController::class, 'averageResolutionTime'])->middleware('supervisor');
    Route::get('/reports/tickets-resolved', [ReportsController::class, 'ticketsResolved'])->middleware('supervisor');
    Route::get('/reports/customer-satisfaction', [ReportsController::class, 'customerSatisfaction'])->middleware('supervisor');
    Route::get('/reports/tickets-resolved-overtime', [ReportsController::class, 'ticketsResolvedOverTime'])->middleware('supervisor');
    Route::get('/reports/solution-time-trends', [ReportsController::class, 'solutionTimeTrends'])->middleware('supervisor');
    Route::get('/reports/export', [ReportsController::class, 'exportReport'])->middleware('supervisor');
    Route::get('/reports/export-pdf', [ReportsController::class, 'exportPdf'])->middleware('supervisor');
    Route::get('/stats/number-of-users', [statsController::class, 'numberOfUsers'])->middleware('admin');
    Route::get('/stats/number-of-categories', [statsController::class, 'numberOfCategories'])->middleware('admin');
    Route::get('/stats/number-of-actions', [statsController::class, 'numberOfActions'])->middleware('admin');
});
// Route::get('/sse/notifications', [NotificationController::class, 'sseNotifications']);