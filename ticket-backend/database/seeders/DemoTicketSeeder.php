<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Ticket;
use App\Models\Category;

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

        for ($i = 1; $i <= 50; $i++) {
            $submitterId = $userIdsByRole['user'][array_rand($userIdsByRole['user'])];
            $ticket = Ticket::create([
                'title' => "Demo Ticket #$i",
                'description' => "This is a description for demo ticket #$i.",
                'status' => $statuses[array_rand($statuses)],
                'priority' => $priorities[array_rand($priorities)],
                'category_id' => rand(1, 3),
                'submitter_id' => $submitterId,
            ]);
        }
    }
}
