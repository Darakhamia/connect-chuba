#!/bin/bash
set -e

echo "=== Connect Chuba - Production Deployment ==="

# Check environment
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production file not found!"
    echo "Copy .env.example to .env.production and fill in your values:"
    echo "  cp .env.example .env.production"
    exit 1
fi

# Detect docker compose command
if docker compose version &>/dev/null; then
    DC="docker compose"
elif command -v docker-compose &>/dev/null; then
    DC="docker-compose"
else
    echo "ERROR: Neither 'docker compose' nor 'docker-compose' found!"
    exit 1
fi

echo "Using: $DC"

# Stop old containers
echo ""
echo "[1/5] Stopping old containers..."
$DC -f docker-compose.prod.yml down 2>/dev/null || true

# Pull latest changes
echo ""
echo "[2/5] Pulling latest changes..."
git pull origin main || echo "WARNING: git pull failed, continuing with current code..."

# Build and start containers
echo ""
echo "[3/5] Building and starting containers..."
$DC -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for PostgreSQL to be ready
echo ""
echo "[4/5] Waiting for PostgreSQL to be healthy..."
for i in {1..30}; do
    if $DC -f docker-compose.prod.yml exec -T postgres pg_isready -U chuba_user -d connectchuba &>/dev/null; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "  Waiting... ($i/30)"
    sleep 2
done

# Run database migrations
echo ""
echo "[5/5] Running database migrations..."
$DC -f docker-compose.prod.yml exec -T app npx prisma migrate deploy || echo "WARNING: Migration failed - you may need to run it manually"

echo ""
echo "=== Deployment complete! ==="
echo ""

# Show container status
$DC -f docker-compose.prod.yml ps
