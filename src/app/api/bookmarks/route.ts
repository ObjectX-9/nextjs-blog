import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IBookmark, IBookmarkDB, IBookmarkCategoryDB } from "@/app/model/bookmark";

interface BookmarkInput {
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
  categoryId: string;
}

interface BookmarkUpdateInput extends Partial<BookmarkInput> {
  _id: string;
}

// Create a new bookmark
export async function POST(request: Request) {
  try {
    const data = (await request.json()) as BookmarkInput;
    const db = await getDb();

    const bookmark: Omit<IBookmarkDB, "_id"> = {
      title: data.title,
      url: data.url,
      description: data.description,
      imageUrl: data.imageUrl,
      categoryId: new ObjectId(data.categoryId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<IBookmarkDB>("bookmarks")
      .insertOne(bookmark as IBookmarkDB);

    if (result.acknowledged) {
      await db
        .collection<IBookmarkCategoryDB>("bookmarkCategories")
        .updateOne(
          { _id: new ObjectId(data.categoryId) },
          { $push: { bookmarks: result.insertedId } }
        );

      return NextResponse.json({
        success: true,
        bookmark: { ...bookmark, _id: result.insertedId },
      });
    } else {
      return NextResponse.json(
        { error: "Failed to create bookmark" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Create bookmark error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all bookmarks or filter by category
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const db = await getDb();

    const query = categoryId ? { categoryId: new ObjectId(categoryId) } : {};
    const bookmarks = await db
      .collection<IBookmarkDB>("bookmarks")
      .find(query)
      .toArray();

    return NextResponse.json({ success: true, bookmarks });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a bookmark
export async function PUT(request: Request) {
  try {
    const data = (await request.json()) as BookmarkUpdateInput;
    const db = await getDb();

    const updateData: Partial<IBookmarkDB> & { updatedAt: Date } = {
      ...(data.title && { title: data.title }),
      ...(data.url && { url: data.url }),
      ...(data.description && { description: data.description }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      updatedAt: new Date(),
    };

    if (data.categoryId) {
      // If category is changing, we need to update both old and new categories
      const oldBookmark = await db.collection<IBookmarkDB>("bookmarks").findOne({
        _id: new ObjectId(data._id),
      });

      if (oldBookmark && oldBookmark.categoryId.toString() !== data.categoryId) {
        // Remove from old category
        await db
          .collection<IBookmarkCategoryDB>("bookmarkCategories")
          .updateOne(
            { _id: oldBookmark.categoryId },
            { $pull: { bookmarks: new ObjectId(data._id) } }
          );
        // Add to new category
        await db
          .collection<IBookmarkCategoryDB>("bookmarkCategories")
          .updateOne(
            { _id: new ObjectId(data.categoryId) },
            { $push: { bookmarks: new ObjectId(data._id) } }
          );
        updateData.categoryId = new ObjectId(data.categoryId);
      }
    }

    const result = await db
      .collection<IBookmarkDB>("bookmarks")
      .updateOne({ _id: new ObjectId(data._id) }, { $set: updateData });

    if (result.matchedCount > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Update bookmark error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a bookmark
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Bookmark ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // First get the bookmark to know its category
    const bookmark = await db.collection<IBookmarkDB>("bookmarks").findOne({
      _id: new ObjectId(id),
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Remove the bookmark from its category
    await db
      .collection<IBookmarkCategoryDB>("bookmarkCategories")
      .updateOne(
        { _id: bookmark.categoryId },
        { $pull: { bookmarks: new ObjectId(id) } }
      );

    // Delete the bookmark
    const result = await db.collection<IBookmarkDB>("bookmarks").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to delete bookmark" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
