#!/bin/bash
set -e

echo "=== LifeCost Render Start ==="
echo "DATABASE_URL=$DATABASE_URL"
echo "NODE_ENV=$NODE_ENV"
echo "CWD=$(pwd)"
echo "ls server/data/:"
ls -la server/data/ 2>/dev/null || echo "(data dir not found or empty)"

cd server

echo "=== Checking prisma binary ==="
ls -la node_modules/.bin/prisma 2>/dev/null || echo "prisma binary NOT FOUND"

echo "=== Running prisma db push ==="
./node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>&1

echo "=== Checking database after push ==="
ls -la data/ 2>/dev/null || echo "(data dir not found)"

echo "=== Starting server ==="
node dist/index.js
