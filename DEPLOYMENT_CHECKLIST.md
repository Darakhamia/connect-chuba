# 🚀 Deployment Checklist для Echo

## Проблема: 502 Bad Gateway

Это означает, что PM2/приложение не запущено или упало. Следуйте этому чеклисту:

### 1. SSH на сервер

```bash
ssh root@192.168.1.107
# или
ssh your_user@your_server
```

### 2. Проверить статус PM2

```bash
cd ~/connect-chuba
pm2 status
pm2 logs connect-chuba --lines 50
```

Если приложение crashed или не запущено, продолжайте:

### 3. Pull последние изменения

```bash
git pull origin main
```

### 4. Установить зависимости

```bash
npm install --legacy-peer-deps
```

### 5. Обновить БД (ВАЖНО для Music System!)

```bash
npx prisma generate
npx prisma db push
```

Эта команда создаст новые таблицы:
- `music_sessions`
- `tracks`
- `queue_items`
- `music_permissions`

### 6. Проверить .env

Убедитесь что `.env` на сервере содержит ВСЕ необходимые переменные:

```bash
cat .env
```

Должно быть:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL="postgresql://..."

# UploadThing
UPLOADTHING_TOKEN=...

# LiveKit
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
NEXT_PUBLIC_LIVEKIT_URL=wss://...

# Music System
YOUTUBE_API_KEY=AIzaSyD3Rctc0BFEgEs9tS_QrQFH-KngPNGdBKM
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
```

**ВАЖНО**: Удалите комментарий "# Добавить в .env:" если он есть!

### 7. Build приложения

```bash
npm run build
```

Если build падает с ошибками:
- Проверьте логи выше
- Убедитесь что все .env переменные заполнены
- Попробуйте `rm -rf .next && npm run build`

### 8. Restart PM2

```bash
pm2 restart connect-chuba
pm2 logs connect-chuba --lines 50
```

### 9. Проверить что работает

```bash
# Должен отвечать без ошибок
curl http://localhost:3000

# Проверить через браузер
# https://chat.airecho.net
```

## Troubleshooting

### Ошибка: "Column does not exist"

Это означает что БД не обновлена:

```bash
npx prisma db push --accept-data-loss
```

### Ошибка: "Cannot find module"

```bash
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps
npm run build
pm2 restart connect-chuba
```

### PM2 не запускается

```bash
pm2 delete connect-chuba
pm2 start npm --name "connect-chuba" -- start
pm2 save
```

### Prisma Client errors

```bash
npx prisma generate
npm run build
pm2 restart connect-chuba
```

### 502 после всего выше

1. Проверить порты:
```bash
netstat -tlnp | grep 3000
```

2. Проверить логи nginx:
```bash
sudo journalctl -u nginx -n 50
```

3. Проверить Cloudflare Tunnel:
```bash
ps aux | grep cloudflared
sudo systemctl status cloudflared
```

4. Restart всего:
```bash
pm2 restart connect-chuba
sudo systemctl restart nginx
sudo systemctl restart cloudflared
```

## Quick Fix Script

Создайте файл `quick-deploy.sh`:

```bash
#!/bin/bash
echo "🚀 Quick Deploy Script"
cd ~/connect-chuba

echo "📥 Pulling changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🗄️ Updating database..."
npx prisma generate
npx prisma db push

echo "🔨 Building..."
npm run build

echo "♻️ Restarting PM2..."
pm2 restart connect-chuba

echo "📊 PM2 Status:"
pm2 status

echo "✅ Done! Check logs:"
echo "pm2 logs connect-chuba"
```

Сделайте исполняемым и запустите:

```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## Контакты для помощи

Если ничего не помогает, проверьте:
1. PM2 логи: `pm2 logs connect-chuba`
2. Системные логи: `journalctl -xe`
3. Nginx логи: `/var/log/nginx/error.log`
4. Cloudflare Tunnel статус

---

**Быстрый деплой в одну команду:**

```bash
cd ~/connect-chuba && git pull && npm i --legacy-peer-deps && npx prisma db push && npm run build && pm2 restart connect-chuba && pm2 logs connect-chuba --lines 20
```
