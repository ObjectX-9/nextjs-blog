import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface IArticleCategory {
  _id?: ObjectId;
  name: string;
  order: number;
  description?: string;
  isTop?: boolean;
  status?: 'completed' | 'in_progress';
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
      .sort({ order: 1, name: 1 }) // 首先按order排序，其次按name排序
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
    const { name, description, order, isTop, status } = await request.json();
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
      order: order || 0, // 默认排序为0
      description,
      isTop: isTop || false, // 默认不置顶
      status: status || 'in_progress', // 默认进行中
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
    const { id, name, description, order, isTop, status } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "分类名称不能为空" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查分类是否存在
    const category = await db
      .collection<IArticleCategory>("articleCategories")
      .findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json(
        { error: "分类不存在" },
        { status: 404 }
      );
    }

    // 检查是否存在同名分类（排除当前分类）
    const existingCategory = await db
      .collection<IArticleCategory>("articleCategories")
      .findOne({ name, _id: { $ne: new ObjectId(id) } });

    if (existingCategory) {
      return NextResponse.json(
        { error: "分类名称已存在" },
        { status: 400 }
      );
    }

    const result = await db.collection<IArticleCategory>("articleCategories").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          order: order !== undefined ? order : category.order,
          isTop: isTop !== undefined ? isTop : category.isTop,
          status: status || category.status,
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "分类 ID 不能为空" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查分类是否存在
    const category = await db
      .collection<IArticleCategory>("articleCategories")
      .findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json(
        { error: "分类不存在" },
        { status: 404 }
      );
    }

    // 检查是否有文章使用该分类
    const articlesCount = await db
      .collection("articles")
      .countDocuments({ categoryId: new ObjectId(id) });

    if (articlesCount > 0) {
      return NextResponse.json(
        { error: "该分类下还有文章，无法删除" },
        { status: 400 }
      );
    }

    const result = await db
      .collection<IArticleCategory>("articleCategories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "删除分类失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除分类出错:", error);
    return NextResponse.json(
      { error: "删除分类失败" },
      { status: 500 }
    );
  }
}