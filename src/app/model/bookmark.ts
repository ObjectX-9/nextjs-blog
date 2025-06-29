import { ObjectId } from 'mongodb';

// 前端使用的接口，符合 FrontendDocument 约束
export interface IBookmark {
  _id?: string;
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBookmarkCategory {
  _id?: string;
  name: string;
  bookmarks: IBookmark[];
  createdAt?: string;
  updatedAt?: string;
}

// 收藏夹分类统计接口
export interface BookmarkCountByCategory {
  _id?: string;
  categoryId: string;
  categoryName: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

// 数据库接口（用于 MongoDB）
export interface IBookmarkDB {
  _id?: ObjectId;
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
  categoryId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookmarkCategoryDB {
  _id?: ObjectId;
  name: string;
  bookmarks: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
