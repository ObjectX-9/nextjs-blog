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

    return NextResponse.json({ success: true, categories: categoriesWithBookmarks });
  } catch (error) {
    console.error("Get bookmark categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new bookmark category
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    if (!data.name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const category: Omit<IBookmarkCategory, "_id"> = {
      name: data.name,
      bookmarks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<IBookmarkCategory>("bookmarkCategories")
      .insertOne(category as IBookmarkCategory);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        category: { ...category, _id: result.insertedId },
      });
    } else {
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Create bookmark category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a bookmark category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // First delete all bookmarks in this category
    await db.collection("bookmarks").deleteMany({
      categoryId: new ObjectId(id),
    });

    // Then delete the category
    const result = await db
      .collection<IBookmarkCategory>("bookmarkCategories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Delete bookmark category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
