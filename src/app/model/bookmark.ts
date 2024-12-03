import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
  categoryId: mongoose.Types.ObjectId;
}

export interface IBookmarkCategory extends Document {
  name: string;
  bookmarks: mongoose.Types.ObjectId[];
}

const bookmarkSchema = new Schema<IBookmark>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'BookmarkCategory', required: true }
}, {
  timestamps: true
});

const bookmarkCategorySchema = new Schema<IBookmarkCategory>({
  name: { type: String, required: true },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Bookmark' }]
}, {
  timestamps: true
});

export const Bookmark = mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
export const BookmarkCategory = mongoose.models.BookmarkCategory || mongoose.model<IBookmarkCategory>('BookmarkCategory', bookmarkCategorySchema);
