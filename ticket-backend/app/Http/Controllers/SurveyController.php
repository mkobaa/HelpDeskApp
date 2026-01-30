<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Survey;
use App\Models\Ticket;
use App\Services\SurveyService;

class SurveyController extends Controller
{
    public function submitSurvey(Request $request, $ticketId)
    {
        $data = $request->validate([
            'satisfaction_rating' => 'required|integer|between:1,5',
            'response_time_rating' => 'required|integer|between:1,5',
            'resolution_quality_rating' => 'required|integer|between:1,5',
            'comments' => 'nullable|string',
        ]);
        $ticket = Ticket::findOrFail($ticketId);

        try {
            $survey = app(SurveyService::class)->fillSurvey($ticket, $data, auth()->id());
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $survey
        ], 200);
    }


    public function getSurveys(Request $request)
    {
        $user = $request->user();

        if ($user->role == 'technician') {
            $surveys = Survey::whereHas('ticket', function ($query) use ($user) {
                $query->where('assigned_tech_id', $user->id);
            })->paginate(20);
        } else if ($user->role == 'supervisor') {
            $surveys = Survey::paginate(20);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $surveys
        ]);
    }

    public function getSurveyByTicket($ticketId)
    {
        $survey = Survey::where('ticket_id', $ticketId)->first();

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found for this ticket'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $survey
        ]);
    }


    public function getMySurveys()
    {
        $user = auth()->user();

        $surveys = Survey::whereHas('ticket', function ($query) use ($user) {
            $query->where('submitter_id', $user->id)->where('is_survey_completed', false);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $surveys
        ]);
    }
}
