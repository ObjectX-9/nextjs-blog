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

// Get all workspace items
export async function GET() {
  try {
    const db = await getDb();
    const workspaceItems = await db
      .collection("workspaceItems")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, workspaceItems });
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

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        workspaceItem: { ...workspaceItem, _id: result.insertedId },
      });
    }

    throw new Error("Failed to create workspace item");
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
      ...(data.product && { product: data.product }),
      ...(data.specs && { specs: data.specs }),
      ...(data.buyAddress && { buyAddress: data.buyAddress }),
      ...(data.buyLink && { buyLink: data.buyLink }),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("workspaceItems")
      .updateOne({ _id: new ObjectId(data._id) }, { $set: updateData });

    if (result.matchedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Workspace item updated successfully",
      });
    }

    return NextResponse.json(
      { error: "Workspace item not found" },
      { status: 404 }
    );
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

    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Workspace item deleted successfully",
      });
    }

    return NextResponse.json(
      { error: "Workspace item not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error deleting workspace item:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace item" },
      { status: 500 }
    );
  }
}
