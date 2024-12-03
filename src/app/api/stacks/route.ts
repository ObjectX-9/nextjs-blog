import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IStack } from "@/app/model/stack";

// Get all stacks
export async function GET() {
  try {
    const db = await getDb();
    const stacks = await db
      .collection<IStack>("stacks")
      .find()
      .toArray();

    return NextResponse.json({ success: true, stacks });
  } catch (error) {
    console.error("Error fetching stacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch stacks" },
      { status: 500 }
    );
  }
}

// Create a new stack
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    const stack = {
      title: data.title,
      description: data.description,
      link: data.link,
      iconSrc: data.iconSrc,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<IStack>("stacks")
      .insertOne(stack as IStack);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        stack: { ...stack, _id: result.insertedId },
      });
    }

    throw new Error("Failed to insert stack");
  } catch (error) {
    console.error("Error creating stack:", error);
    return NextResponse.json(
      { error: "Failed to create stack" },
      { status: 500 }
    );
  }
}

// Update a stack
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    if (!data._id) {
      return NextResponse.json(
        { error: "Stack ID is required" },
        { status: 400 }
      );
    }

    const updateData = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.link && { link: data.link }),
      ...(data.iconSrc && { iconSrc: data.iconSrc }),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<IStack>("stacks")
      .updateOne(
        { _id: new ObjectId(data._id) },
        { $set: updateData }
      );

    if (result.matchedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Stack updated successfully",
      });
    }

    return NextResponse.json(
      { error: "Stack not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error updating stack:", error);
    return NextResponse.json(
      { error: "Failed to update stack" },
      { status: 500 }
    );
  }
}

// Delete a stack
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Stack ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection<IStack>("stacks")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Stack deleted successfully",
      });
    }

    return NextResponse.json(
      { error: "Stack not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error deleting stack:", error);
    return NextResponse.json(
      { error: "Failed to delete stack" },
      { status: 500 }
    );
  }
}
