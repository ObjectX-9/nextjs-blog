import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { InspirationDocument } from "@/app/model/inspiration";

// 更新点赞数
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    if (!["like", "view"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'like' or 'view'" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<InspirationDocument>("inspirations");

    const updateField = action === "like" ? "likes" : "views";
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $inc: { [updateField]: 1 } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Inspiration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      [updateField]: result[updateField],
    });
  } catch (error) {
    console.error(`Error updating inspiration ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update inspiration stats" },
      { status: 500 }
    );
  }
}
