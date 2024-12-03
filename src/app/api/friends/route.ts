import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IFriend } from "@/app/model/friend";

// Create a new friend
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    const friend = {
      ...data,
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<IFriend>("friends").insertOne(friend);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        friend: { ...friend, _id: result.insertedId },
      });
    }

    throw new Error("Failed to insert friend");
  } catch (error) {
    console.error("Error creating friend:", error);
    return NextResponse.json(
      { error: "Failed to create friend" },
      { status: 500 }
    );
  }
}

// Get all friends
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isApproved = searchParams.get("approved");

    const db = await getDb();
    let query = {};

    if (isApproved !== null) {
      query = { isApproved: isApproved === "true" };
    }

    const friends = await db
      .collection<IFriend>("friends")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

// Update a friend
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { _id, ...updateData } = data;

    const db = await getDb();
    const result = await db.collection<IFriend>("friends").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    const updatedFriend = await db
      .collection<IFriend>("friends")
      .findOne({ _id: new ObjectId(_id) });

    return NextResponse.json({
      success: true,
      friend: updatedFriend,
    });
  } catch (error) {
    console.error("Error updating friend:", error);
    return NextResponse.json(
      { error: "Failed to update friend" },
      { status: 500 }
    );
  }
}

// Delete a friend
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection<IFriend>("friends")
      .deleteOne({ _id: new ObjectId(id) });

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Friend deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting friend:", error);
    return NextResponse.json(
      { error: "Failed to delete friend" },
      { status: 500 }
    );
  }
}
