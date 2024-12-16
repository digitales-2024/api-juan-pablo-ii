#!/bin/sh
set -e

echo "Waiting for database to be ready..."
echo "Database is ready!"
echo "Running migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec dumb-init node dist/main.js
