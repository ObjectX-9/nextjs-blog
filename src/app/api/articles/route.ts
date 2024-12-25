import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Article } from "@/app/model/article";

// MongoDB中的文章接口
interface IArticleDB extends Omit<Article, '_id'> {
  _id?: ObjectId;
}

// 数据转换函数
function toArticle(dbArticle: IArticleDB): Article {
  const { _id, ...rest } = dbArticle;
  return {
    ...rest,
    _id: _id?.toString(),
  };
}

function toDBArticle(article: Article): Omit<IArticleDB, '_id'> {
  const { _id, ...rest } = article;
  return rest;
}

// 创建新文章
export async function POST(request: Request) {
  try {
    const { article } = await request.json();
    const db = await getDb();

    // 验证分类是否存在
    const category = await db.collection("articleCategories").findOne({
      _id: new ObjectId(article.categoryId)
    });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const articleToInsert: IArticleDB = {
      ...toDBArticle(article),
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection<IArticleDB>("articles").insertOne(articleToInsert);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        article: toArticle({ ...articleToInsert, _id: result.insertedId }),
      });
    }

    throw new Error("Failed to insert article");
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

// 获取所有文章
export async function GET(request: Request) {
  try {
    const db = await getDb();
    const articles = await db
      .collection<IArticleDB>("articles")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    // 获取所有分类信息
    const categories = await db
      .collection("articleCategories")
      .find()
      .toArray();

    // 创建分类映射
    const categoryMap = new Map(
      categories.map(category => [category._id.toString(), category.name])
    );

    // 为每个文章添加分类名称
    const articlesWithCategories = articles.map(article => ({
      ...toArticle(article),
      category: categoryMap.get(article.categoryId) || "未分类"
    }));

    return NextResponse.json({ success: true, articles: articlesWithCategories });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request: Request) {
  try {
    const { id, updates } = await request.json();
    const db = await getDb();

    // 验证分类是否存在
    if (updates.categoryId) {
      const category = await db.collection("articleCategories").findOne({
        _id: new ObjectId(updates.categoryId)
      });

      if (!category) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    // 确保更新时间被设置
    const updatedArticle = {
      ...toDBArticle(updates),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection<IArticleDB>("articles").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedArticle }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No changes made to the article" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const db = await getDb();

    const result = await db
      .collection<IArticleDB>("articles")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
