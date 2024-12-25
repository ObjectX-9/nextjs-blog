import { ObjectId } from '../utils/objectId';

// API interfaces (for frontend use)
export interface IDemo {
  _id?: ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  likes: number;
  views: number;
  gifUrl: string;
  description: string;
  tags: string[];
  categoryId: ObjectId;  // 修改为引用分类ID
}

export interface IDemoCategory {
  _id?: ObjectId;
  name: string;
  description?: string;
  demos: IDemo[];
  createdAt: Date;
  updatedAt: Date;
}

// Database interfaces (for MongoDB)
export interface IDemoDB extends Omit<IDemo, '_id'> {
  _id?: ObjectId;
}

export interface IDemoCategoryDB extends Omit<IDemoCategory, '_id' | 'demos'> {
  _id?: ObjectId;
  demos: ObjectId[];  // 存储Demo的ID引用
}
