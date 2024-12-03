import { ObjectId } from 'mongodb';

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
  bookmarks: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
