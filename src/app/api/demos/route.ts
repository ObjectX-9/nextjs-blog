import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IServerDemo } from "@/app/model/server-types";

interface DemoInput {
  name: string;
  completed: boolean;
  gifUrl: string;
  url?: string;
  description: string;
  tags: string[];
  categoryId: string;
}

interface DemoUpdateInput extends Partial<DemoInput> {
  _id: string;
}

// 创建新的 demo
export async function POST(request: Request) {
  try {
    const data = (await request.json()) as DemoInput;
    const db = await getDb();

    const demo: Omit<IServerDemo, "_id"> = {
      name: data.name,
      completed: data.completed,
      likes: 0,
      views: 0,
      gifUrl: data.gifUrl,
      url: data.url,
      description: data.description,
      tags: data.tags,
      categoryId: new ObjectId(data.categoryId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<IServerDemo>("demos")
      .insertOne(demo);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        demo: { ...demo, _id: result.insertedId },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to create demo" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 获取所有 demos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const tag = searchParams.get("tag");
    
    const db = await getDb();
    let query: { categoryId?: ObjectId; tags?: string } = {};
    
    if (categoryId) {
      query = { ...query, categoryId: new ObjectId(categoryId) };
    }
    if (tag) {
      query = { ...query, tags: tag };
    }

    const demos = await db
      .collection<IServerDemo>("demos")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, demos });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 更新 demo
export async function PUT(request: Request) {
  try {
    const data = (await request.json()) as DemoUpdateInput;
    const db = await getDb();

    const updateData: Partial<IServerDemo> = {
      updatedAt: new Date(),
    };

    // 分别处理每个可能的更新字段
    if (data.name !== undefined) updateData.name = data.name;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.gifUrl !== undefined) updateData.gifUrl = data.gifUrl;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.categoryId !== undefined) updateData.categoryId = new ObjectId(data.categoryId);

    const result = await db
      .collection<IServerDemo>("demos")
      .updateOne(
        { _id: new ObjectId(data._id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Demo not found" },
        { status: 404 }
      );
    }

    if (result.acknowledged) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to update demo" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 删除 demo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Demo ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection<IServerDemo>("demos")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Demo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
