#!/bin/bash

echo "🚀 Deploying Echo..."

# Stop on errors
set -e

# Pull latest changes
echo "📥 Pulling changes from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database changes
echo "🗄️ Updating database schema..."
npx prisma db push --accept-data-loss

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "♻️ Restarting application..."
pm2 restart connect-chuba || pm2 start npm --name "connect-chuba" -- start

# Save PM2 config
pm2 save

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs connect-chuba --lines 10 --nostream

echo ""
echo "🌐 Your app should be running at: https://chat.airecho.net"
echo ""
echo "To view live logs: pm2 logs connect-chuba"
