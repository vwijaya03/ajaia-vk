FROM node:25.9.0-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/dev.db"
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && npx tsx prisma/seed.ts && npm start"]
