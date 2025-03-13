# 1. 使用官方 Node.js 作为基础镜像
FROM node:18-alpine AS builder

# 2. 设置工作目录
WORKDIR /app

# 3. 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 4. 安装 pnpm 并安装依赖（使用 pnpm）
RUN corepack enable && pnpm install --frozen-lockfile

# 5. 复制所有文件
COPY . .

# 6. 构建 Next.js 应用
RUN pnpm build

# 7. 创建生产环境的镜像
FROM node:18-alpine AS runner

# 8. 设置工作目录
WORKDIR /app

# 9. 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 10. 运行应用
CMD ["node_modules/.bin/next", "start"]
