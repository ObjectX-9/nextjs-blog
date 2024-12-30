export interface Article {
  // MongoDB ID
  _id?: string;

  // 文章标题
  title: string;

  // 文章链接(slug)
  url?: string;

  // 文章分类
  category?: string;

  // 文章分类ID
  categoryId?: string;

  // 文章标签（可以有多个）
  tags?: string[];

  // 文章内容(Markdown格式)
  content: string;

  // OSS存储路径
  ossPath: string;

  // 文章状态(draft-草稿/published-已发布)
  status: ArticleStatus;

  // 文章摘要
  summary?: string;

  // 封面图片URL
  coverImage?: string;

  // 点赞数
  likes?: number;

  // 阅读数
  views?: number;

  // 创建时间
  createdAt: string;

  // 更新时间（可选）
  updatedAt?: string;
}

// 文章状态枚举
export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

// 文章分类接口
export interface ArticleCategory {
  _id?: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
