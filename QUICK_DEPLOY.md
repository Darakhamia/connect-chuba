# Быстрое развертывание

## На сервере Ubuntu выполните:

```bash
cd ~/connect-chuba
bash deploy.sh
```

## Или вручную:

```bash
cd ~/connect-chuba
git pull
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run build
pm2 restart connect-chuba
pm2 logs connect-chuba --lines 50
```

## Если возникают ошибки:

1. Проверьте файл `.env` - он должен существовать и содержать все необходимые переменные
2. Убедитесь что порт 3000 свободен: `lsof -i :3000`
3. Проверьте логи: `pm2 logs connect-chuba --lines 100`
4. Перезапустите PM2: `pm2 restart connect-chuba`

## Проверка статуса:

```bash
pm2 status
curl http://localhost:3000
```
