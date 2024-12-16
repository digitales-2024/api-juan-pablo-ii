#!/bin/sh
set -e

echo "Waiting for database to be ready..."
while ! nc -z db-juan-pablo-ii 5432; do
  echo "Database is not ready... waiting"
  sleep 2
done

echo "Database is ready!"
echo "Running migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec dumb-init node dist/main.js
