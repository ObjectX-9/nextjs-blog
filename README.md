# Next.js 博客项目

这是一个基于 Next.js 14 构建的现代化博客平台，结合了丰富的功能和优雅的用户界面。

## 📚 功能特点

- 💻 **响应式设计**：完全适配桌面和移动端，提供流畅的用户体验
- ✍️ **富文本编辑器**：
  - 基于 Plate 和 Toast UI 的强大编辑器
  - 支持 Markdown、代码高亮、表格、图片插入等
  - 自动保存和历史记录功能
- 📷 **相册和图片管理**：
  - EXIF 数据提取和展示
  - 图片压缩和优化
  - 瀑布流图片展示
  - 灯箱效果预览
- 🔖 **书签收藏系统**：
  - 分类管理
  - 标签系统
  - RSS 订阅支持
  - 快速搜索和过滤
- ⚡ **项目和工作经历展示**：
  - 时间线视图
  - 详细的项目描述和技术栈展示
  - 可自定义的工作经历和教育经历模块
- 🔄 **时间线和动态更新**：
  - 支持多种内容类型（文章、项目、推文等）
  - 自动聚合和排序
  - 支持嵌入 Twitter 内容
- 📊 **数据统计和可视化**：
  - 网站访问和运行状态监控
  - 文章阅读量和点赞统计
  - 基于 Chart.js 的数据图表
- 🔒 **用户认证与权限管理**：
  - 基于 JWT 的安全认证
  - 管理员与普通用户权限区分
  - 安全的密码处理
- 🎨 **现代 UI 设计**：
  - 基于 Tailwind CSS 和 Shadcn UI
  - 支持亮色/暗色模式
  - 自定义组件和动画效果

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14（App Router）
- **语言**: TypeScript
- **样式**: 
  - Tailwind CSS（实用工具类优先）
  - Shadcn UI（无样式组件库）
  - CSS 模块
- **编辑器**: 
  - Plate Editor（基于 Slate.js）
  - Toast UI Editor（Markdown）
- **状态管理**: Zustand
- **UI组件**:
  - Radix UI（无障碍性组件）
  - Ant Design
  - Framer Motion（动画）
- **数据可视化**: Chart.js / React-Chartjs-2

### 后端
- **API**: Next.js API Routes / App Router Handlers
- **数据库**: MongoDB / Mongoose
- **认证**: JWT (使用 jose)
- **存储**: 支持阿里云 OSS（ali-oss）
- **媒体处理**: 
  - Sharp（图像处理）
  - Exiftool-vendored（元数据提取）

### 内容处理
- **Markdown**: 
  - MDX
  - Rehype 插件系统
  - Remark 插件系统
  - 代码高亮（Prism.js、Shiki）
- **RSS**: RSS 生成器

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PNPM 8+
- MongoDB（可本地或远程）

### 安装依赖

```bash
# 使用 PNPM 安装依赖
pnpm install
```

### 环境变量配置

创建 `.env.local` 文件并添加以下变量（根据需要调整）：

```
# 基础配置
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 数据库连接
MONGODB_URI=mongodb://localhost:27017/blog

# JWT 密钥
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 阿里云 OSS 配置（可选）
OSS_REGION=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=
```

### 开发环境

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 🐳 Docker 支持

项目包含 Dockerfile，可以轻松构建和部署容器化应用。

```bash
# 构建Docker镜像
docker build -t nextjs-blog .

# 运行容器
docker run -p 3000:3000 -e MONGODB_URI=your_mongodb_connection_string nextjs-blog
```

可以通过 Docker Compose 进一步简化部署：

```yaml
# docker-compose.yml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/blog
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongo
  
  mongo:
    image: mongo
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

## 🧩 项目结构

```
src/
├── app/                # Next.js 应用目录
│   ├── api/            # API 路由
│   │   ├── articles/   # 文章相关 API
│   │   ├── auth/       # 认证相关 API
│   │   ├── rss/        # RSS 生成 API
│   │   └── ...
│   ├── articles/       # 文章页面
│   ├── album/          # 相册页面
│   ├── bookmarks/      # 书签页面
│   ├── admin/          # 管理后台
│   └── ...
├── components/         # React 组件
│   ├── HomePage/       # 首页相关组件
│   ├── customMdRender/ # 自定义 Markdown 渲染器
│   ├── icons/          # 图标组件
│   ├── ui/             # UI 基础组件
│   └── ...
├── lib/                # 工具库
│   ├── auth/           # 认证相关功能
│   ├── db/             # 数据库连接和操作
│   └── ...
├── utils/              # 实用工具函数
│   ├── time.ts         # 时间处理
│   ├── format.ts       # 格式化
│   └── ...
├── hooks/              # 自定义 React Hooks
├── styles/             # 样式文件
├── store/              # 状态管理
├── types/              # TypeScript 类型定义
├── config/             # 配置文件
└── docs/               # 文档
```

## 📄 许可证

本项目使用 MIT 许可证，详情请查看 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- Next.js 团队提供的出色框架
- MongoDB 提供的数据库解决方案
- 所有为本项目做出贡献的开发者