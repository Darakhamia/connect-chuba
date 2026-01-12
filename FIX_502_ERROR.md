# 🚨 Как починить ошибку 502 Bad Gateway

## Быстрое решение (5 минут)

### Шаг 1: Подключитесь к серверу

```bash
ssh root@192.168.1.107
```

### Шаг 2: Перейдите в папку проекта

```bash
cd ~/connect-chuba
```

### Шаг 3: Выберите один из вариантов:

#### Вариант А: Быстрый фикс (если код уже обновлён)

```bash
chmod +x quick-fix.sh
./quick-fix.sh
```

#### Вариант Б: Полный деплой (рекомендуется)

```bash
chmod +x deploy.sh
./deploy.sh
```

#### Вариант В: Одной командой

```bash
git pull && npm i --legacy-peer-deps && npx prisma generate && npx prisma db push && npm run build && pm2 restart connect-chuba
```

### Шаг 4: Проверьте что работает

Откройте в браузере: **https://chat.airecho.net**

---

## Что делают скрипты?

### `quick-fix.sh` - Быстрая перезагрузка
- Перезапускает PM2
- Проверяет что приложение отвечает
- Показывает логи

### `deploy.sh` - Полный деплой
- Скачивает последние изменения с GitHub
- Устанавливает зависимости
- Обновляет базу данных
- Собирает проект
- Перезапускает приложение

---

## Проблемы и решения

### ❌ "Command not found: pm2"

```bash
npm install -g pm2
```

### ❌ "Permission denied: ./deploy.sh"

```bash
chmod +x deploy.sh
chmod +x quick-fix.sh
```

### ❌ "Error: Cannot find module..."

```bash
rm -rf node_modules .next
npm install --legacy-peer-deps
npm run build
pm2 restart connect-chuba
```

### ❌ "Database error" или "Column does not exist"

```bash
npx prisma generate
npx prisma db push --accept-data-loss
npm run build
pm2 restart connect-chuba
```

### ❌ Всё ещё 502 после всех шагов

1. Проверьте логи:
```bash
pm2 logs connect-chuba --lines 50
```

2. Проверьте порт 3000:
```bash
netstat -tlnp | grep 3000
```

3. Перезапустите всё:
```bash
pm2 delete connect-chuba
pm2 start npm --name "connect-chuba" -- start
pm2 save
sudo systemctl restart nginx
sudo systemctl restart cloudflared
```

---

## Полезные команды

### Посмотреть логи в реальном времени
```bash
pm2 logs connect-chuba
```

### Проверить статус PM2
```bash
pm2 status
```

### Проверить что приложение отвечает
```bash
curl http://localhost:3000
```

### Перезапустить Nginx
```bash
sudo systemctl restart nginx
```

### Перезапустить Cloudflare Tunnel
```bash
sudo systemctl restart cloudflared
```

---

## Контакты

Если ничего не помогло:
1. Проверьте логи: `pm2 logs connect-chuba`
2. Проверьте `.env` файл: `cat ~/connect-chuba/.env`
3. Проверьте что БД доступна: `npx prisma db push`

---

**После успешного деплоя сайт должен открыться по адресу: https://chat.airecho.net** ✅
