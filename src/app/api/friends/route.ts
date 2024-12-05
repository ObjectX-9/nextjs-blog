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
        friend: { ...friend, _id: String(result.insertedId) },
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

    // 确保每个文档的 _id 字段是字符串形式
    const friendsWithStringId = friends.map((friend) => ({
      ...friend,
      _id: String(friend._id),
    }));

    return NextResponse.json({ success: true, friends: friendsWithStringId });
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
      { _id: new ObjectId(_id) as any },
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
      .findOne({ _id: new ObjectId(_id) as any });

    return NextResponse.json({
      success: true,
      friend: {
        ...updatedFriend,
        _id: String(updatedFriend?._id),
      },
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
      .deleteOne({ _id: new ObjectId(id) as any });

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
