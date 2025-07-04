# 1. 使用官方 Node.js 作为基础镜像
FROM node:18-alpine AS builder

# 2. 设置工作目录
WORKDIR /app

# 3. 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 4. 安装 pnpm 并安装依赖（使用 pnpm）
RUN corepack enable && pnpm install --force

# 5. 复制所有文件（排除 .dockerignore 中指定的文件）
COPY . .

# 6. 定义构建参数
ARG JWT_SECRET
ARG ADMIN_PASSWORD
ARG ADMIN_USERNAME
ARG OSS_BUCKET
ARG OSS_ACCESS_KEY_SECRET
ARG OSS_ACCESS_KEY_ID
ARG OSS_REGION
ARG MONGODB_URI

# 6.1. 设置构建时的环境变量
ENV JWT_SECRET=$JWT_SECRET
ENV ADMIN_PASSWORD=$ADMIN_PASSWORD
ENV ADMIN_USERNAME=$ADMIN_USERNAME
ENV OSS_BUCKET=$OSS_BUCKET
ENV OSS_ACCESS_KEY_SECRET=$OSS_ACCESS_KEY_SECRET
ENV OSS_ACCESS_KEY_ID=$OSS_ACCESS_KEY_ID
ENV OSS_REGION=$OSS_REGION
ENV MONGODB_URI=$MONGODB_URI
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 6.2. 构建 Next.js 应用
RUN pnpm build

# 7. 创建生产环境的镜像
FROM node:18-alpine AS runner

# 8. 设置工作目录
WORKDIR /app

# 9. 复制构建产物（只复制必要的文件）
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# 10. 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# 11. 运行应用
CMD ["node_modules/.bin/next", "start"]
