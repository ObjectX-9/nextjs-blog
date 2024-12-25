import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IDemo, IDemoCategory, IDemoCategoryDB } from "@/app/model/demo";

// 获取所有 demo 分类及其关联的 demos
export async function GET(request: Request) {
  try {
    const db = await getDb();
    
    // 获取所有分类
    const categories = await db
      .collection<IDemoCategoryDB>("demoCategories")
      .find()
      .toArray();

    // 获取所有 demos
    const demos = await db
      .collection<IDemo>("demos")
      .find()
      .toArray();

    // 按分类ID对demos进行分组
    const demosByCategory = demos.reduce((acc, demo) => {
      const categoryId = demo.categoryId.toString();
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(demo);
      return acc;
    }, {} as Record<string, IDemo[]>);

    // 将demos关联到对应的分类中
    const categoriesWithDemos = categories.map(category => ({
      ...category,
      demos: demosByCategory[category._id.toString()] || []
    }));

    return NextResponse.json({ 
      success: true,
      categories: categoriesWithDemos 
    });
  } catch (error) {
    console.error("获取demo分类错误:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 创建新的 demo 分类
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    if (!data.name) {
      return NextResponse.json(
        { success: false, error: "分类名称是必需的" },
        { status: 400 }
      );
    }

    const category: Omit<IDemoCategoryDB, "_id"> = {
      name: data.name,
      description: data.description || "",
      demos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<IDemoCategoryDB>("demoCategories")
      .insertOne(category as IDemoCategoryDB);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        category: { ...category, _id: result.insertedId },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "创建分类失败" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("创建demo分类错误:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 删除 demo 分类
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "分类ID是必需的" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查分类下是否有demos
    const demosCount = await db
      .collection("demos")
      .countDocuments({ categoryId: new ObjectId(id) });

    if (demosCount > 0) {
      return NextResponse.json(
        { success: false, error: "无法删除非空分类，请先删除或移动该分类下的所有demos" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("demoCategories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "分类不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除demo分类错误:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 更新 demo 分类
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    if (!data._id) {
      return NextResponse.json(
        { success: false, error: "分类ID是必需的" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const updateData: Partial<IDemoCategoryDB> = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    const result = await db
      .collection("demoCategories")
      .updateOne(
        { _id: new ObjectId(data._id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "分类不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新demo分类错误:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
