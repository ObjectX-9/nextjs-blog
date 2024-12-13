import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface WorkspaceItemInput {
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

interface WorkspaceItemUpdateInput extends Partial<WorkspaceItemInput> {
  _id: string;
}

interface PaginationQuery {
  page?: number;
  limit?: number;
}

// Get all workspace items with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    const db = await getDb();
    const collection = db.collection("workspaceItems");

    const [workspaceItems, total] = await Promise.all([
      collection
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments()
    ]);

    return NextResponse.json({
      success: true,
      workspaceItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching workspace items:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace items" },
      { status: 500 }
    );
  }
}

// Create a new workspace item
export async function POST(request: Request) {
  try {
    const data = (await request.json()) as WorkspaceItemInput;
    const db = await getDb();

    const workspaceItem = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("workspaceItems")
      .insertOne(workspaceItem);

    if (!result.acknowledged) {
      throw new Error("Failed to create workspace item");
    }

    return NextResponse.json({
      success: true,
      workspaceItem: { ...workspaceItem, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating workspace item:", error);
    return NextResponse.json(
      { error: "Failed to create workspace item" },
      { status: 500 }
    );
  }
}

// Update a workspace item
export async function PUT(request: Request) {
  try {
    const data = (await request.json()) as WorkspaceItemUpdateInput;
    const db = await getDb();

    if (!data._id) {
      return NextResponse.json(
        { error: "Workspace item ID is required" },
        { status: 400 }
      );
    }

    const updateData = {
      ...(data.product !== undefined && { product: data.product }),
      ...(data.specs !== undefined && { specs: data.specs }),
      ...(data.buyAddress !== undefined && { buyAddress: data.buyAddress }),
      ...(data.buyLink !== undefined && { buyLink: data.buyLink }),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("workspaceItems")
      .updateOne(
        { _id: new ObjectId(data._id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Workspace item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Workspace item updated successfully",
    });
  } catch (error) {
    console.error("Error updating workspace item:", error);
    return NextResponse.json(
      { error: "Failed to update workspace item" },
      { status: 500 }
    );
  }
}

// Delete a workspace item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Workspace item ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection("workspaceItems")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Workspace item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Workspace item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workspace item:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace item" },
      { status: 500 }
    );
  }
}
