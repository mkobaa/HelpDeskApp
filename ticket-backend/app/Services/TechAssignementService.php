<?php

namespace App\Services;

use App\Models\User;
use App\Models\Ticket;
use App\Models\TicketAcceptance;
use App\Notifications\TicketAssigned;

class TechAssignementService
{
    public function assignTechnician(array $data, User $user, Ticket $ticket): TicketAcceptance
    {
        $technician = User::findOrFail($data['technician_id']);

        if ($this->checkAlreadyPendingAssignment($ticket)) {
            throw new \DomainException(
                'There is already a pending assignment for this ticket.'
            );
        }

        $acceptance = $this->createAssignmentRecord(
            $data,
            $user,
            $ticket
        );

        // generic history
        $this->logHistory(
            $ticket,
            'assignment_requested',
            $user,
            "Assignment requested for technician ID {$technician->id}"
        );

        // generic notification
        $this->notifyUser(
            $technician,
            new TicketAssigned($ticket)
        );

        return $acceptance;
    }


    public function reassignTechnician(array $data, User $user, Ticket $ticket): TicketAcceptance
    {
        $technician = User::findOrFail($data['technician_id']);

        if ($this->checkAlreadyPendingAssignment($ticket)) {
            throw new \DomainException(
                'There is already a pending assignment for this ticket.'
            );
        }

        $acceptance = $this->createAssignmentRecord(
            $data,
            $user,
            $ticket
        );

        // generic history
        $this->logHistory(
            $ticket,
            'reassignment_requested',
            $user,
            "Reassignment requested for technician ID {$technician->id}"
        );

        // generic notification
        $this->notifyUser(
            $technician,
            new TicketAssigned($ticket)
        );

        return $acceptance;
    }


    protected function checkAlreadyPendingAssignment(Ticket $ticket): bool
    {
        return TicketAcceptance::where('ticket_id', $ticket->id)
            ->where('is_accepted', 'pending')
            ->exists();
    }

    protected function createAssignmentRecord(
        array $data,
        User $user,
        Ticket $ticket
    ): TicketAcceptance {
        return TicketAcceptance::create([
            'ticket_id'     => $ticket->id,
            'supervisor_id' => $user->id,
            'technician_id' => $data['technician_id'],
            'is_accepted'   => 'pending',
        ]);
    }

    protected function logHistory(
        Ticket $ticket,
        string $action,
        User $actor,
        string $message
    ): void {
        TicketHistoryService::log(
            $ticket->id,
            $action,
            $actor->id,
            $message
        );
    }

    protected function notifyUser(User $user, $notification): void
    {
        $user->notify($notification);
    }
}
