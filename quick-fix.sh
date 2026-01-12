#!/bin/bash

echo "🔧 Quick Fix for Echo - Running..."

# Check if PM2 is running
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed!"
    echo "Install it with: npm install -g pm2"
    exit 1
fi

# Check current status
echo "Current PM2 status:"
pm2 status

# Restart the app
echo ""
echo "Restarting application..."
pm2 restart connect-chuba 2>/dev/null || {
    echo "App not found in PM2, starting fresh..."
    pm2 start npm --name "connect-chuba" -- start
}

# Wait a bit for startup
sleep 3

# Check if it's running
echo ""
echo "New status:"
pm2 status

# Test if app responds
echo ""
echo "Testing if app responds on port 3000..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "✅ App is responding!"
else
    echo "⚠️ App might not be responding correctly"
    echo "Check logs with: pm2 logs connect-chuba"
fi

echo ""
echo "📝 Last 20 log lines:"
pm2 logs connect-chuba --lines 20 --nostream

echo ""
echo "🌐 Try accessing: https://chat.airecho.net"
