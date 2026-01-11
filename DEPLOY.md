# 🚀 Деплой Connect Chuba на сервер

## Вариант 1: Docker (рекомендуется)

### Требования
- Docker и Docker Compose на сервере
- Минимум 1GB RAM, 1 CPU

### Шаги

1. **Скопируйте проект на сервер:**
```bash
# Через Git
git clone <ваш-репозиторий> connect-chuba
cd connect-chuba

# Или через SCP
scp -r ./connect-chuba user@your-server:/home/user/
```

2. **Создайте .env файл:**
```bash
cp .env.example .env
nano .env  # Заполните все переменные
```

3. **Измените пароль базы данных в docker-compose.yml:**
```bash
nano docker-compose.yml
# Замените your_secure_password_here на свой пароль
```

4. **Запустите контейнеры:**
```bash
docker-compose up -d --build
```

5. **Примените миграции базы данных:**
```bash
docker-compose exec app npx prisma db push
```

6. **Готово!** Приложение доступно на http://your-server-ip:3000

---

## Вариант 2: PM2 (без Docker)

### Требования
- Node.js 20+
- PostgreSQL 14+
- PM2

### Шаги

1. **Установите зависимости:**
```bash
npm install
```

2. **Настройте .env:**
```bash
cp .env.example .env
# Заполните переменные, DATABASE_URL должен указывать на вашу PostgreSQL
```

3. **Примените миграции:**
```bash
npx prisma db push
```

4. **Соберите проект:**
```bash
npm run build
```

5. **Запустите через PM2:**
```bash
pm2 start npm --name "connect-chuba" -- start
pm2 save
pm2 startup
```

---

## 🔒 Настройка HTTPS (Nginx + Certbot)

1. **Установите Nginx:**
```bash
sudo apt install nginx
```

2. **Создайте конфиг /etc/nginx/sites-available/connect-chuba:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Включите сайт:**
```bash
sudo ln -s /etc/nginx/sites-available/connect-chuba /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Установите SSL через Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ⚠️ Важно для Clerk

После деплоя обновите настройки в Clerk Dashboard:
1. Перейдите в Clerk Dashboard → Settings → Domains
2. Добавьте ваш домен в Production domains
3. Получите production ключи и замените их в .env

---

## 🔧 Полезные команды

```bash
# Просмотр логов
docker-compose logs -f app

# Перезапуск
docker-compose restart app

# Обновление после изменений
git pull
docker-compose up -d --build

# PM2 логи
pm2 logs connect-chuba
```
