# --- Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Кэшируем зависимости отдельно от исходников
COPY package*.json ./
RUN npm ci --omit=dev=false

COPY . .
RUN npx prisma generate
RUN npm run build

# Убираем dev-зависимости для финального образа
RUN npm prune --omit=dev

# --- Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Минимальные системные пакеты
RUN apk add --no-cache openssl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Копируем только нужное
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
