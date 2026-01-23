<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;

class LoadTestSeeder extends Seeder
{
    /**
     * Seed the application's database for load testing.
     * Creates test users and ensures categories exist.
     */
    public function run(): void
    {
        $this->command->info('Starting Load Test Data Seeding...');

        // Create test users
        $this->createTestUsers();

        // Ensure categories exist
        $this->ensureCategories();

        $this->command->info('Load Test Data Seeding Complete!');
    }

    /**
     * Create test users for load testing
     */
    private function createTestUsers(): void
    {
        $this->command->info('Creating 100 test users...');

        $departments = ['IT', 'HR', 'Finance', 'Operations', 'Support'];
        
        for ($i = 1; $i <= 100; $i++) {
            // Distribute roles: 70 users, 20 technicians, 10 supervisors
            $role = 'user';
            if ($i <= 20) {
                $role = 'technician';
            } elseif ($i <= 30) {
                $role = 'supervisor';
            }

            User::firstOrCreate(
                ['email' => "user{$i}@example.com"],
                [
                    'username' => "testuser{$i}",
                    'password' => Hash::make('password123'),
                    'role' => $role,
                    'department' => $departments[($i - 1) % count($departments)],
                ]
            );
        }

        $this->command->info('✓ Created 100 test users');
        $this->command->info('  - 70 users (user31-user100)');
        $this->command->info('  - 20 technicians (user1-user20)');
        $this->command->info('  - 10 supervisors (user21-user30)');
    }

    /**
     * Ensure required categories exist
     */
    private function ensureCategories(): void
    {
        $this->command->info('Ensuring categories exist...');

        $categories = [
            ['id' => 1, 'name' => 'Technical Support', 'description' => 'Technical issues and troubleshooting'],
            ['id' => 2, 'name' => 'Account Management', 'description' => 'Account-related requests'],
            ['id' => 3, 'name' => 'Feature Request', 'description' => 'New feature suggestions'],
            ['id' => 4, 'name' => 'Bug Report', 'description' => 'Software bugs and errors'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['id' => $category['id']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                ]
            );
        }

        $this->command->info('✓ Ensured 4 categories exist');
    }
}
