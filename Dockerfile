# 使用BuildKit语法
# syntax=docker/dockerfile:1.4

# 1. 使用官方 Node.js 作为基础镜像
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && pnpm install

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ARG JWT_SECRET
ARG ADMIN_PASSWORD
ARG ADMIN_USERNAME
ARG OSS_BUCKET
ARG OSS_ACCESS_KEY_SECRET
ARG OSS_ACCESS_KEY_ID
ARG OSS_REGION
ARG MONGODB_URI

RUN echo "MONGODB_URI=${MONGODB_URI}" > /app/.env.local && \
    echo "JWT_SECRET=${JWT_SECRET}" >> /app/.env.local && \
    echo "ADMIN_PASSWORD=${ADMIN_PASSWORD}" >> /app/.env.local && \
    echo "ADMIN_USERNAME=${ADMIN_USERNAME}" >> /app/.env.local && \
    echo "OSS_BUCKET=${OSS_BUCKET}" >> /app/.env.local && \
    echo "OSS_ACCESS_KEY_SECRET=${OSS_ACCESS_KEY_SECRET}" >> /app/.env.local && \
    echo "OSS_ACCESS_KEY_ID=${OSS_ACCESS_KEY_ID}" >> /app/.env.local && \
    echo "OSS_REGION=${OSS_REGION}" >> /app/.env.local && \
    pnpm build && \
    rm -f /app/.env.local

# 生产环境镜像
FROM node:18-alpine AS runner

# ✅ 安装 perl（解决 EXIF 报错）
RUN apk add --no-cache perl

RUN addgroup --system nodejs \
    && adduser --system --ingroup nodejs nextjs

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
