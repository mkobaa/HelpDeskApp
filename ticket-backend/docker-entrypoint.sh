#!/bin/bash
set -e

# Wait for the database to be reachable
host="${DB_HOST:-db}"
port="${DB_PORT:-5432}"
echo "Waiting for database ${host}:${port}..."
while ! bash -c "cat < /dev/tcp/${host}/${port}" >/dev/null 2>&1; do
  sleep 1
done
echo "Database is reachable"

# Run migrations and seed demo data (safe to run multiple times)
# Allow migrate to fail or return non-zero without stopping the script
cp .env.example .env
php artisan migrate --force || echo "php artisan migrate failed or had nothing to run; continuing"
php artisan db:seed --class=DemoTicketSeeder || true

# Exec the original command (start server)
exec php artisan serve --host=0.0.0.0 --port=8000
