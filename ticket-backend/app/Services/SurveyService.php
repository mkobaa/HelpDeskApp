<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\Survey;
use Illuminate\Auth\Access\AuthorizationException;


class SurveyService
{
    /**
     * Called when ticket is closed.
     * Only marks the ticket as survey sent.
     * DOES NOT create a Survey row.
     */
    public function requestSurveyForTicket(Ticket $ticket): void
    {
        $ticket->is_survey_sent = true;
        $ticket->save();        
    }

    /**
     * Called when user submits the survey.
     * This is the ONLY place where Survey is created.
     */
    public function fillSurvey(Ticket $ticket, array $data, int $userId): Survey
    {
        // 1. Ticket must be closed
        if ($ticket->status !== 'closed') {
            throw new \DomainException('Ticket is not closed.');
        }

        // 2. Survey must have been requested
        if (!$ticket->is_survey_sent) {
            throw new \DomainException('No survey requested for this ticket.');
        }

        // 3. If a survey row already exists (we may have created a placeholder on close), update it
        $survey = Survey::where('ticket_id', $ticket->id)->first();

        // 4. comments is NOT nullable in your table
        // So force empty string instead of null
        $comments = $data['comments'] ?? '';

        // 5. Create or update survey
        if ($survey) {
            $survey->satisfaction_rating = (int) $data['satisfaction_rating'];
            $survey->response_time_rating = (int) $data['response_time_rating'];
            $survey->resolution_quality_rating = (int) $data['resolution_quality_rating'];
            $survey->comments = $comments;
            $ticket->save();
        } else {
            $survey = Survey::create([
                'ticket_id' => $ticket->id,
                'satisfaction_rating' => (int) $data['satisfaction_rating'],
                'response_time_rating' => (int) $data['response_time_rating'],
                'resolution_quality_rating' => (int) $data['resolution_quality_rating'],
                'comments' => $comments,
            ]);
        }

        // 6. Mark survey as completed
        $ticket->is_survey_sent = false;
        $ticket->is_survey_completed = true;
        $ticket->save();

        return $survey;
    }
}
