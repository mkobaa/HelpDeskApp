<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\Survey;
use Illuminate\Auth\Access\AuthorizationException;


class SurveyService
{

    public function requestSurveyForTicket(Ticket $ticket): void
    {
        $ticket->is_survey_sent = true;
        $ticket->save();        
    }

    public function fillSurvey(Ticket $ticket, array $data, int $userId): Survey
    {
        if ($ticket->status !== 'closed') {
            throw new \DomainException('Ticket is not closed.');
        }

        if (!$ticket->is_survey_sent) {
            throw new \DomainException('No survey requested for this ticket.');
        }

        $survey = Survey::where('ticket_id', $ticket->id)->first();

        $comments = $data['comments'] ?? '';

        if ($survey) {
            $survey->satisfaction_rating = (int) $data['satisfaction_rating'];
            $survey->response_time_rating = (int) $data['response_time_rating'];
            $survey->resolution_quality_rating = (int) $data['resolution_quality_rating'];
            $survey->comments = $comments;
            $survey->save();
        } else {
            $survey = Survey::create([
                'ticket_id' => $ticket->id,
                'satisfaction_rating' => (int) $data['satisfaction_rating'],
                'response_time_rating' => (int) $data['response_time_rating'],
                'resolution_quality_rating' => (int) $data['resolution_quality_rating'],
                'comments' => $comments,
            ]);
        }

        $ticket->is_survey_sent = false;
        $ticket->is_survey_completed = true;
        $ticket->save();

        return $survey;
    }
}
