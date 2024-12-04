import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface WorkspaceItemInput {
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

interface WorkspaceItemUpdateInput extends WorkspaceItemInput {
  _id?: string;
}

// Get all workspace items
export async function GET() {
  try {
    const db = await getDb();
    console.log("Connected to database for GET request");
    
    const workspaceItems = await db
      .collection("workspaceItems")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Successfully fetched workspace items:", workspaceItems.length);
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
    console.log("Received POST request with data:", data);

    const db = await getDb();
    console.log("Connected to database for POST request");

    const workspaceItem = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Attempting to insert workspace item:", workspaceItem);
    const result = await db.collection("workspaceItems").insertOne(workspaceItem);

    if (!result.acknowledged) {
      console.error("Insert operation not acknowledged");
      throw new Error("Failed to create workspace item");
    }

    console.log("Successfully created workspace item with ID:", result.insertedId);
    return NextResponse.json({ 
      success: true, 
      workspaceItem: { ...workspaceItem, _id: result.insertedId } 
    });
  } catch (error) {
    console.error("Error creating workspace item:", error);
    // 返回更详细的错误信息
    return NextResponse.json(
      { error: `Failed to create workspace item: ${error.message}` },
      { status: 500 }
    );
  }
}

// Update a workspace item
export async function PUT(request: Request) {
  try {
    const data = (await request.json()) as WorkspaceItemUpdateInput;
    console.log("Received PUT request with data:", data);

    const { _id, ...updateData } = data;
    
    if (!_id) {
      console.error("Missing workspace item ID");
      return NextResponse.json(
        { error: "Missing workspace item ID" },
        { status: 400 }
      );
    }

    const db = await getDb();
    console.log("Connected to database for PUT request");
    console.log("Attempting to update workspace item with ID:", _id);

    const result = await db.collection("workspaceItems").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      console.error("No workspace item found with ID:", _id);
      return NextResponse.json(
        { error: "Workspace item not found" },
        { status: 404 }
      );
    }

    console.log("Successfully updated workspace item");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating workspace item:", error);
    return NextResponse.json(
      { error: `Failed to update workspace item: ${error.message}` },
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
      console.error("Missing workspace item ID in DELETE request");
      return NextResponse.json(
        { error: "Missing workspace item ID" },
        { status: 400 }
      );
    }

    console.log("Attempting to delete workspace item with ID:", id);
    const db = await getDb();
    const result = await db
      .collection("workspaceItems")
      .deleteOne({ _id: new ObjectId(id) });

    if (!result.deletedCount) {
      console.error("No workspace item found with ID:", id);
      return NextResponse.json(
        { error: "Workspace item not found" },
        { status: 404 }
      );
    }

    console.log("Successfully deleted workspace item");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace item:", error);
    return NextResponse.json(
      { error: `Failed to delete workspace item: ${error.message}` },
      { status: 500 }
    );
  }
}
