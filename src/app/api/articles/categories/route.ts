import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface IArticleCategory {
  _id?: ObjectId;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 获取所有文章分类
export async function GET() {
  try {
    const db = await getDb();
    const categories = await db
      .collection<IArticleCategory>("articleCategories")
      .find()
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching article categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch article categories" },
      { status: 500 }
    );
  }
}

// 创建新分类
export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    const db = await getDb();

    // 检查分类名是否已存在
    const existingCategory = await db
      .collection<IArticleCategory>("articleCategories")
      .findOne({ name });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    const categoryToInsert: IArticleCategory = {
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db
      .collection<IArticleCategory>("articleCategories")
      .insertOne(categoryToInsert);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        category: { ...categoryToInsert, _id: result.insertedId },
      });
    }

    throw new Error("Failed to insert category");
  } catch (error) {
    console.error("Error creating article category:", error);
    return NextResponse.json(
      { error: "Failed to create article category" },
      { status: 500 }
    );
  }
}

// 更新分类
export async function PUT(request: Request) {
  try {
    const { id, name, description } = await request.json();
    const db = await getDb();

    // 检查是否存在同名分类（排除当前分类）
    const existingCategory = await db
      .collection<IArticleCategory>("articleCategories")
      .findOne({ name, _id: { $ne: new ObjectId(id) } });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 400 }
      );
    }

    const result = await db.collection<IArticleCategory>("articleCategories").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating article category:", error);
    return NextResponse.json(
      { error: "Failed to update article category" },
      { status: 500 }
    );
  }
}

// 删除分类
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const db = await getDb();

    // 检查是否有文章使用此分类
    const articlesUsingCategory = await db
      .collection("articles")
      .findOne({ categoryId: new ObjectId(id) });

    if (articlesUsingCategory) {
      return NextResponse.json(
        { error: "Cannot delete category that is being used by articles" },
        { status: 400 }
      );
    }

    const result = await db
      .collection<IArticleCategory>("articleCategories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article category:", error);
    return NextResponse.json(
      { error: "Failed to delete article category" },
      { status: 500 }
    );
  }
}
