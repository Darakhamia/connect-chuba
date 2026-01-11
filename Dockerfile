# Используем Node.js 20 Alpine для минимального размера
FROM node:20-alpine AS base

# Устанавливаем зависимости
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci

# Собираем приложение
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Запускаем production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создаём пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Автоматически используем standalone output если включён
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
