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
    const article = await request.json();
    const db = await getDb();

    // 如果没有提供 order，获取当前最大 order 并加 1
    let order = article.order;
    if (order === undefined) {
      const lastArticle = await db
        .collection<IArticleDB>("articles")
        .find({ categoryId: article.categoryId })
        .sort({ order: -1 })
        .limit(1)
        .toArray();
      order = (lastArticle[0]?.order || 0) + 1;
    }

    const articleToInsert: IArticleDB = {
      ...article,
      order: Number(order),
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection<IArticleDB>("articles").insertOne(articleToInsert);

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...article,
    });
  } catch (error: any) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create article" },
      { status: 500 }
    );
  }
}

// 获取文章列表或单篇文章
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const id = searchParams.get("id");
    const categoryId = searchParams.get("categoryId");
    const db = await getDb();

    // 如果有 ID，获取单篇文章
    if (id) {
      const article = await db.collection<IArticleDB>("articles").findOne({
        _id: new ObjectId(id),
      });

      if (!article) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(toArticle(article));
    }

    // 否则获取文章列表
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const articles = await db
      .collection<IArticleDB>("articles")
      .find(query)
      .sort({ order: 1, updatedAt: -1 })
      .toArray();

    return NextResponse.json({ articles: articles.map(toArticle) });
  } catch (error: any) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const article = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const articleToUpdate = {
      ...toDBArticle(article),
      updatedAt: new Date().toISOString(),
    };

    // 处理 order 的更新
    if (article.order !== undefined) {
      articleToUpdate.order = Number(article.order);
    }

    const result = await db.collection<IArticleDB>("articles").updateOne(
      { _id: new ObjectId(id) },
      { $set: articleToUpdate }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: id,
      ...article,
    });
  } catch (error: any) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection<IArticleDB>("articles").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}
