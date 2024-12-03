import { NextResponse } from 'next/server';
import { updateBookmarksFile } from '@/lib/bookmarks';
import { BookmarkCategory } from '@/config/bookmarks';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const success = await updateBookmarksFile(data.categories);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to update bookmarks' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
