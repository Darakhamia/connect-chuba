#!/bin/bash
set -e

echo "=== Connect Chuba - Production Deployment ==="

# Check environment
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Copy .env.example to .env and fill in your values:"
    echo "  cp .env.example .env"
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
echo "[1/6] Stopping old containers..."
$DC down 2>/dev/null || true

# Pull latest changes
echo ""
echo "[2/6] Pulling latest changes..."
git pull origin main || echo "WARNING: git pull failed, continuing with current code..."

# Clean Docker build cache to avoid stale hashes
echo ""
echo "[3/6] Pruning Docker build cache..."
docker builder prune -af 2>/dev/null || true

# Build and start containers (no cache to avoid hash mismatches)
echo ""
echo "[4/6] Building and starting containers..."
$DC up -d --build --no-cache

# Wait for PostgreSQL to be ready
echo ""
echo "[5/6] Waiting for PostgreSQL to be healthy..."
for i in {1..30}; do
    if $DC exec -T db pg_isready -U chuba_user -d connect_chuba &>/dev/null; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "  Waiting... ($i/30)"
    sleep 2
done

# Run database migrations
echo ""
echo "[6/6] Running database migrations..."
docker run --rm \
    --network connect-chuba_internal \
    -v "$(pwd)/prisma:/app/prisma" \
    -e 'DATABASE_URL=postgresql://chuba_user:Ch8b4_Pr0d_2026!@db:5432/connect_chuba' \
    -w /app \
    node:20-alpine sh -c "npx prisma@6 db push --skip-generate" \
    || echo "WARNING: Migration failed - you may need to run it manually"

echo ""
echo "=== Deployment complete! ==="
echo ""

# Show container status
$DC ps

echo ""
echo "Check the site at: https://chat.airecho.net"
