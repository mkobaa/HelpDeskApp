<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Ticket;
use App\Models\Category;
use App\Models\TimeTracking;
use App\Models\Survey;
use Carbon\Carbon;

class DemoTicketSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['id' => 1, 'name' => 'General', 'description' => 'General inquiries'],
            ['id' => 2, 'name' => 'Technical', 'description' => 'Technical issues'],
            ['id' => 3, 'name' => 'Billing', 'description' => 'Billing and payments'],
        ];
        foreach ($categories as $cat) {
            Category::firstOrCreate(['id' => $cat['id']], $cat);
        }

        $departments = ['IT', 'Support', 'HR', 'Finance', 'Ops'];
        $roles = [
            'user' => 20,
            'technician' => 15,
            'supervisor' => 10,
            'admin' => 5,
        ];
        $userIdsByRole = [
            'user' => [],
            'technician' => [],
            'supervisor' => [],
            'admin' => [],
        ];
        $userIndex = 1;
        foreach ($roles as $role => $count) {
            for ($i = 1; $i <= $count; $i++, $userIndex++) {
                $prefix = $role === 'user' ? 'user' : $role;
                $username = $prefix . $i;
                $email = $prefix . $i . '@example.com';
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'username' => $username,
                        'password' => Hash::make('password123'),
                        'role' => $role,
                        'department' => $departments[($userIndex - 1) % count($departments)],
                    ]
                );
                $userIdsByRole[$role][] = $user->id;
            }
        }

        $statuses = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
        $priorities = ['low', 'medium', 'high', 'critical'];

        // Generate a larger set of demo tickets across the last 30 days
        // Requirements: all tickets closed; resolution between 0 and 8 hours; surveys filled by submitters
        $total = 1000;
        for ($i = 1; $i <= $total; $i++) {
            $submitterId = $userIdsByRole['user'][array_rand($userIdsByRole['user'])];

            // Created_at random within last 30 days
            $createdAt = Carbon::now()->subDays(rand(0, 29))->subHours(rand(0, 23))->subMinutes(rand(0, 59))->subSeconds(rand(0,59));

            // Make every ticket closed
            $status = 'closed';

            // Assign a random technician (if available)
            $assignedTech = null;
            if (count($userIdsByRole['technician'])) {
                $assignedTech = $userIdsByRole['technician'][array_rand($userIdsByRole['technician'])];
            }

            $ticket = Ticket::create([
                'title' => "Demo Ticket #$i",
                'description' => "This is a description for demo ticket #$i.",
                'status' => $status,
                'priority' => $priorities[array_rand($priorities)],
                'category_id' => rand(1, 3),
                'submitter_id' => $submitterId,
                'assigned_tech_id' => $assignedTech,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
                'is_survey_sent' => false,
                'is_survey_completed' => false,
            ]);

            // resolution between 0 and 8 hours (0 to 480 minutes)
            $minutesToResolve = rand(0, 480);
            $resolvedAt = (clone $createdAt)->addMinutes($minutesToResolve);
            if ($resolvedAt->gt(Carbon::now())) {
                $resolvedAt = Carbon::now();
                $minutesToResolve = $createdAt->diffInMinutes($resolvedAt);
            }

            TimeTracking::create([
                'ticket_id' => $ticket->id,
                'technician_id' => $assignedTech,
                'start_time' => $createdAt,
                'end_time' => $resolvedAt,
                'total_time_minutes' => (int) round($minutesToResolve),
                'created_at' => $resolvedAt,
                'updated_at' => $resolvedAt,
            ]);

            // Create a survey filled by the submitter with random ratings
            Survey::create([
                'ticket_id' => $ticket->id,
                'satisfaction_rating' => rand(1,5),
                'response_time_rating' => rand(1,5),
                'resolution_quality_rating' => rand(1,5),
                'comments' => '',
                'created_at' => $resolvedAt,
                'updated_at' => $resolvedAt,
            ]);

            // Mark ticket as survey completed and set updated_at to resolved time
            $ticket->is_survey_sent = false;
            $ticket->is_survey_completed = true;
            $ticket->updated_at = $resolvedAt;
            $ticket->save();
        }
    }
}
