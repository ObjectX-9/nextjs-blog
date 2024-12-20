import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IBookmarkCategory, IBookmark } from "@/app/model/bookmark";

// Get all bookmark categories with their bookmarks
export async function GET(request: Request) {
  try {
    const db = await getDb();
    
    // First get all categories
    const categories = await db
      .collection<IBookmarkCategory>("bookmarkCategories")
      .find()
      .toArray();

    // Then get all bookmarks
    const bookmarks = await db
      .collection<IBookmark>("bookmarks")
      .find()
      .toArray();

    // Create a map of bookmarks by category
    const bookmarksByCategory = bookmarks.reduce((acc, bookmark) => {
      const categoryId = bookmark.categoryId.toString();
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(bookmark);
      return acc;
    }, {} as Record<string, IBookmark[]>);

    // Combine categories with their bookmarks
    const categoriesWithBookmarks = categories.map(category => ({
      ...category,
      bookmarks: bookmarksByCategory[category._id.toString()] || []
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithBookmarks
    });
  } catch (error) {
    console.error("Get bookmark categories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
