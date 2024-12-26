import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { InspirationDocument } from "@/app/model/inspiration";

// 获取单个灵感笔记
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const collection = db.collection<InspirationDocument>("inspirations");

    const inspiration = await collection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!inspiration) {
      return NextResponse.json(
        { error: "Inspiration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inspiration);
  } catch (error) {
    console.error("Error fetching inspiration:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspiration" },
      { status: 500 }
    );
  }
}

// 更新灵感笔记
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const db = await getDb();
    const collection = db.collection<InspirationDocument>("inspirations");

    const now = new Date();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Inspiration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating inspiration:", error);
    return NextResponse.json(
      { error: "Failed to update inspiration" },
      { status: 500 }
    );
  }
}

// 删除灵感笔记
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const collection = db.collection<InspirationDocument>("inspirations");

    const result = await collection.findOneAndDelete({
      _id: new ObjectId(params.id),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Inspiration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Inspiration deleted successfully" });
  } catch (error) {
    console.error("Error deleting inspiration:", error);
    return NextResponse.json(
      { error: "Failed to delete inspiration" },
      { status: 500 }
    );
  }
}
