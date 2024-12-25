import { ObjectId } from '../utils/objectId';

// API interfaces (for frontend use)
export interface WithTimestamps {
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IDemo extends WithTimestamps {
  _id?: string | ObjectId;
  name: string;
  description: string;
  url?: string;
  gifUrl?: string;
  categoryId: string | ObjectId;
  tags?: string[];
  views: number;
  likes: number;
  completed: boolean;
}

export interface IDemoCategory extends WithTimestamps {
  _id?: string | ObjectId;
  name: string;
  description?: string;
  order?: number;
  demos?: IDemo[];  
}

// Database interfaces (for MongoDB)
export interface IDemoDB extends Omit<IDemo, '_id'> {
  _id?: ObjectId;
}

export interface IDemoCategoryDB extends Omit<IDemoCategory, '_id'> {
  _id?: ObjectId;
}
