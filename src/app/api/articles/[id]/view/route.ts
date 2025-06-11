import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const articleId = params.id;
    console.trace('✅ ✅ ✅ ~  articleId:', articleId);

    // 使用 findOneAndUpdate 来获取更新后的数据
    const result = await db.collection("articles").findOneAndUpdate(
      { _id: new ObjectId(articleId) },
      { $inc: { views: 1 } },
      {
        returnDocument: 'after', // 返回更新后的文档
        projection: { views: 1, likes: 1, title: 1 } // 只返回需要的字段
      }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // 返回更新后的文章数据
    return NextResponse.json({
      success: true,
      article: {
        _id: result.value._id,
        title: result.value.title,
        views: result.value.views,
        likes: result.value.likes
      }
    });
  } catch (error) {
    console.error("Error updating article views:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
