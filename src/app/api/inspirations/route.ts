import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { IInspirationCreate, IInspirationUpdate, InspirationDocument } from "@/app/model/inspiration";

// 获取灵感笔记列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") as "draft" | "published" | null;
    const tag = searchParams.get("tag");

    const db = await getDb();
    const collection = db.collection<InspirationDocument>("inspirations");

    // 构建查询条件
    const query: any = {};
    if (status) query.status = status;
    if (tag) query.tags = tag;

    // 计算总数
    const total = await collection.countDocuments(query);

    // 获取分页数据
    const inspirations = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      data: inspirations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inspirations:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspirations" },
      { status: 500 }
    );
  }
}

// 创建新的灵感笔记
export async function POST(request: NextRequest) {
  try {
    const data: IInspirationCreate = await request.json();
    const db = await getDb();
    const collection = db.collection<InspirationDocument>("inspirations");

    const now = new Date();
    const inspiration: Omit<InspirationDocument, '_id'> = {
      ...data,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      views: 0,
      images: data.images || [],
    };

    const result = await collection.insertOne(inspiration as InspirationDocument);

    return NextResponse.json({
      _id: result.insertedId,
      ...inspiration,
    });
  } catch (error) {
    console.error("Error creating inspiration:", error);
    return NextResponse.json(
      { error: "Failed to create inspiration" },
      { status: 500 }
    );
  }
}

// 更新灵感笔记
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Inspiration ID is required" },
        { status: 400 }
      );
    }

    const data: IInspirationUpdate = await request.json();
    const db = await getDb();
    const collection = db.collection<InspirationDocument>("inspirations");

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
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
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Inspiration ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<InspirationDocument>("inspirations");

    const result = await collection.findOneAndDelete({
      _id: new ObjectId(id),
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
