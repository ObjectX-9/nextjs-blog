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

# 6. 设置构建时的基础环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 6.1. 构建时的环境变量通过 --build-arg 传入
# 这些变量只在构建阶段可用，不会保留到最终镜像中
ARG JWT_SECRET
ARG ADMIN_PASSWORD
ARG ADMIN_USERNAME
ARG OSS_BUCKET
ARG OSS_ACCESS_KEY_SECRET
ARG OSS_ACCESS_KEY_ID
ARG OSS_REGION
ARG MONGODB_URI

# 6.2. 使用ARG构建时变量创建临时的.env.production文件
# 这个文件会在构建后被删除，不会保留在最终镜像中
RUN echo "JWT_SECRET=${JWT_SECRET}" > .env.production && \
    echo "ADMIN_PASSWORD=${ADMIN_PASSWORD}" >> .env.production && \
    echo "ADMIN_USERNAME=${ADMIN_USERNAME}" >> .env.production && \
    echo "OSS_BUCKET=${OSS_BUCKET}" >> .env.production && \
    echo "OSS_ACCESS_KEY_SECRET=${OSS_ACCESS_KEY_SECRET}" >> .env.production && \
    echo "OSS_ACCESS_KEY_ID=${OSS_ACCESS_KEY_ID}" >> .env.production && \
    echo "OSS_REGION=${OSS_REGION}" >> .env.production && \
    echo "MONGODB_URI=${MONGODB_URI}" >> .env.production

# 6.3. 使用环境文件构建
RUN pnpm build

# 6.4. 删除临时环境文件，确保不会包含在最终镜像中
RUN rm -f .env.production

# 7. 创建生产环境的镜像（不包含敏感环境变量）
FROM node:18-alpine AS runner

# 8. 创建非root用户
RUN addgroup --system nodejs \
    && adduser --system --ingroup nodejs nextjs

# 9. 设置工作目录
WORKDIR /app

# 10. 复制构建产物（只复制必要的文件）
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# 11. 切换到非root用户
USER nextjs

# 12. 设置运行时基础环境变量（仅非敏感变量）
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# 13. 运行应用
CMD ["node_modules/.bin/next", "start"]
