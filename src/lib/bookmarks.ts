import fs from 'fs';
import path from 'path';
import { BookmarkCategory } from '@/config/bookmarks';

const BOOKMARKS_FILE_PATH = path.join(process.cwd(), 'src/config/bookmarks.ts');

export async function updateBookmarksFile(categories: BookmarkCategory[]) {
  const fileContent = `export interface Bookmark {
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
}

export interface BookmarkCategory {
  name: string;
  count: number;
  bookmarks: Bookmark[];
}

export const bookmarkData: BookmarkCategory[] = ${JSON.stringify(categories, null, 2)};
`;

  try {
    await fs.promises.writeFile(BOOKMARKS_FILE_PATH, fileContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error updating bookmarks file:', error);
    return false;
  }
}
