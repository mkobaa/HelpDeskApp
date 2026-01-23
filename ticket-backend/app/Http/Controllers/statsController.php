<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;

class statsController extends Controller
{
   public function pendingTicketsCount(Request $request)
   {
        $user = $request->user();

        $pendingTicketsCount = Ticket::where('status', 'pending')->count();

        return response()->json([
            'success' => true,
            'data' => [
            'pending_tickets_count' => $pendingTicketsCount
            ]
        ]);
   }


   public function openTicketsCount(Request $request)
   {
        $user = $request->user();

        $openTicketsCount = Ticket::where('status', 'open')->count();

        return response()->json([
            'success' => true,
            'data' => [
            'open_tickets_count' => $openTicketsCount
            ]
        ]);
   }

    public function closedTicketsCount(Request $request)
    {
          $user = $request->user();
    
          $closedTicketsCount = Ticket::where('status', 'closed')->count();
    
          return response()->json([
                'success' => true,
                'data' => [
                'closed_tickets_count' => $closedTicketsCount
                ]
          ]);
    }

}
