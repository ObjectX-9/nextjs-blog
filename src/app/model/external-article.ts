import { ObjectId } from 'mongodb';

// 前端使用的接口，符合 FrontendDocument 约束
export interface IExternalArticle {
  _id?: string;
  title: string;
  url: string;
  categoryId: string;
  createdAt?: string; // 收录时间
  updatedAt?: string;
}

export interface IExternalArticleCategory {
  _id?: string;
  name: string;
  description?: string;
  color?: string; // 分类颜色标识
  isAdminOnly?: boolean; // 是否仅管理员可见
  order: number; // 排序
  createdAt?: string;
  updatedAt?: string;
}

// 外部文章分类统计接口
export interface ExternalArticleCountByCategory {
  _id?: string;
  categoryId: string;
  categoryName: string;
  count: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// 分页查询结果
export interface PaginatedExternalArticles {
  items: IExternalArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// 数据库接口（用于 MongoDB）
export interface IExternalArticleDB {
  _id?: ObjectId;
  title: string;
  url: string;
  categoryId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExternalArticleCategoryDB {
  _id?: ObjectId;
  name: string;
  description?: string;
  color?: string;
  isAdminOnly?: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// 外部文章状态枚举
export enum ExternalArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 查询参数接口
export interface ExternalArticleQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sortBy?: 'latest';
}
