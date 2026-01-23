<?php

// Usage:
//  - Create default set: php scripts/create_admin.php
//  - Customize counts: php scripts/create_admin.php users=20 technicians=15 supervisors=10 admins=5 password=secret

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Defaults inspired by DemoTicketSeeder
$counts = [
	'users' => 20,
	'technicians' => 15,
	'supervisors' => 10,
	'admins' => 5,
];

$password = 'password123';

// Parse simple arg form key=val
foreach (array_slice($argv, 1) as $arg) {
	if (strpos($arg, '=') !== false) {
		[$k, $v] = explode('=', $arg, 2);
		if ($k === 'password') { $password = $v; }
		elseif (isset($counts[$k])) { $counts[$k] = (int)$v; }
	}
}

$departments = ['IT', 'Support', 'HR', 'Finance', 'Ops'];

$created = 0;

$makeUser = function ($email, $username, $role, $department) use ($password, &$created) {
	$user = User::firstOrNew(['email' => $email]);
	$user->username = $username;
	$user->password = Hash::make($password);
	$user->role = $role;
	$user->department = $department;
	$user->save();
	$created++;
};

// Create admins
for ($i = 1; $i <= $counts['admins']; $i++) {
	$email = "admin{$i}@example.com";
	$username = "admin{$i}";
	$dept = $departments[($i - 1) % count($departments)];
	$makeUser($email, $username, 'admin', $dept);
}

// Create supervisors
for ($i = 1; $i <= $counts['supervisors']; $i++) {
	$email = "supervisor{$i}@example.com";
	$username = "supervisor{$i}";
	$dept = $departments[($i - 1) % count($departments)];
	$makeUser($email, $username, 'supervisor', $dept);
}

// Create technicians
for ($i = 1; $i <= $counts['technicians']; $i++) {
	$email = "tech{$i}@example.com";
	$username = "technician{$i}";
	$dept = $departments[($i - 1) % count($departments)];
	$makeUser($email, $username, 'technician', $dept);
}

// Create regular users
for ($i = 1; $i <= $counts['users']; $i++) {
	$email = "user{$i}@example.com";
	$username = "user{$i}";
	$dept = $departments[($i - 1) % count($departments)];
	$makeUser($email, $username, 'user', $dept);
}

echo "Created/updated {$created} users (password: {$password}).\n";
