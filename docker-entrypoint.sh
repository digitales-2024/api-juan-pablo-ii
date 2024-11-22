#!/bin/sh
set -e

echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRIES=0

until node -e "
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
client.connect();
" 2>/dev/null || [ $RETRIES -eq $MAX_RETRIES ]; do
  >&2 echo "Postgres is unavailable - sleeping"
  RETRIES=$((RETRIES + 1))
  sleep 1
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
  echo "Database connection attempts exceeded"
  exit 1
fi

echo "Database is ready!"
echo "Running migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec dumb-init node dist/main.js
