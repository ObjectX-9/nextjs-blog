import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// 增加浏览量或点赞数
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = params.id;

    const { type } = await request.json();

    if (type === "view") {
      const result = await db.collection("demos").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { views: 1 } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: "Demo not found" },
          { status: 404 }
        );
      }
    } else if (type === "like") {
      const result = await db.collection("demos").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { likes: 1 } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: "Demo not found" },
          { status: 404 }
        );
      }
    }

    const updatedDemo = await db.collection("demos").findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, demo: updatedDemo });
  } catch (error) {
    console.error("Error updating demo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
