#!/bin/bash

echo "Starting deployment..."

# Check environment
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production file not found!"
    echo "Create it with the required environment variables."
    exit 1
fi

# Stop old containers
echo "Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Build and start containers
echo "Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

echo "Deployment complete!"
echo "Application is running at https://your-domain.com"

# Show container status
docker-compose -f docker-compose.prod.yml ps
