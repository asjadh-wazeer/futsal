#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx prisma migrate deploy

echo "🌱 Running seed..."
npx prisma db seed

echo "🚀 Starting server..."
exec npm run start:dev
