# ==========================================
# 1. deps: ติดตั้ง Dependencies
# ==========================================
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ==========================================
# 2. builder: Build โค้ด
# ==========================================
FROM node:24-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_BASE_URL=__NEXT_PUBLIC_BASE_URL__
ENV NEXT_PUBLIC_BASE_API_URL=__NEXT_PUBLIC_BASE_API_URL__
ENV NEXT_PUBLIC_BASE_SRIPE_URL=__NEXT_PUBLIC_BASE_SRIPE_URL__


RUN pnpm run build

# ==========================================
# 3. runner: นำไปใช้งานจริง
# ==========================================
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --chown=nextjs:nodejs entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]