import { ObjectId } from 'mongodb';

// API interfaces (for frontend use)
export interface IBookmark {
  _id?: ObjectId;
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
  categoryId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookmarkCategory {
  _id?: ObjectId;
  name: string;
  bookmarks: IBookmark[];
  createdAt: Date;
  updatedAt: Date;
}

// Database interfaces (for MongoDB)
export interface IBookmarkDB extends Omit<IBookmark, 'categoryId'> {
  categoryId: ObjectId;
}

export interface IBookmarkCategoryDB extends Omit<IBookmarkCategory, 'bookmarks'> {
  bookmarks: ObjectId[];
}
