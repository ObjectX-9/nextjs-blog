import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import RSS from "rss";
import { createApiParams } from "@/utils/api-helpers";

// 使用force-dynamic确保路由在运行时动态生成，而不是尝试静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const apiParams = createApiParams(request);
    const categoryId = apiParams.getString("categoryId") || null;
    const type = apiParams.getString("type") || "bookmarks"; // 默认为书签类型

    // 基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 根据类型处理不同的内容
    switch (type) {
      case "articles":
        return await getArticlesRSS(baseUrl, categoryId);
      case "bookmarks":
      default:
        return await getBookmarksRSS(baseUrl, categoryId);
    }
  } catch (error: any) {
    console.error("RSS generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate RSS feed" },
      { status: 500 }
    );
  }
}

// 获取书签的 RSS
async function getBookmarksRSS(baseUrl: string, categoryId: string | null): Promise<NextResponse> {
  try {
    const db = await getDb();

    // 获取站点信息
    const site = await db.collection("sites").findOne({});
    const avatarUrl = site?.author?.avatar ? `${baseUrl}${site.author.avatar}` : `${baseUrl}/avatar.png`;

    // 构建查询条件
    let query: any = {};
    if (categoryId) {
      query.categoryId = new ObjectId(categoryId);
    }

    // 获取书签数据
    const bookmarks = await db.collection("bookmarks")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // 如果有分类ID，获取分类信息
    let categoryName = "全部书签";
    if (categoryId) {
      const category = await db.collection("bookmarkCategories").findOne({ _id: new ObjectId(categoryId) });
      if (category) {
        categoryName = category.name;
      }
    }

    // 创建 RSS feed
    const feed = new RSS({
      title: `ObjectX - ${categoryName}`,
      description: `ObjectX 书签导航 - ${categoryName}`,
      feed_url: `${baseUrl}/api/rss?type=bookmarks${categoryId ? `&categoryId=${categoryId}` : ""}`,
      site_url: `${baseUrl}/bookmarks`,
      image_url: avatarUrl,
      language: "zh-CN",
      pubDate: new Date(),
    });

    // 添加书签到 feed
    if (bookmarks.length > 0) {
      bookmarks.forEach((bookmark: any) => {
        feed.item({
          title: bookmark.title,
          description: bookmark.description || "",
          url: bookmark.url,
          guid: bookmark._id.toString(),
          date: bookmark.updatedAt || bookmark.createdAt,
        });
      });
    } else {
      // 如果没有书签，添加一个默认项
      feed.item({
        title: "暂无书签",
        description: "该分类下暂无书签",
        url: `${baseUrl}/bookmarks`,
        guid: "no-bookmarks",
        date: new Date(),
      });
    }

    // 生成 XML
    const xml = feed.xml();

    // 返回 XML 响应
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error: any) {
    console.error("Bookmarks RSS generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate bookmarks RSS feed" },
      { status: 500 }
    );
  }
}

// 获取文章的 RSS
async function getArticlesRSS(baseUrl: string, categoryId: string | null): Promise<NextResponse> {
  try {
    const db = await getDb();

    // 获取站点信息
    const site = await db.collection("sites").findOne({});
    const avatarUrl = site?.author?.avatar ? `${baseUrl}${site.author.avatar}` : `${baseUrl}/avatar.png`;
    const authorName = site?.author?.name || "ObjectX";

    // 构建查询条件
    let query: any = { status: "published" };
    if (categoryId) {
      // 使用字符串形式的 categoryId，与文章 API 保持一致
      query.categoryId = categoryId;
    }

    // 获取文章数据
    const articles = await db.collection("articles")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // 如果有分类ID，获取分类信息
    let categoryName = "全部文章";
    if (categoryId) {
      const category = await db.collection("articleCategories").findOne({ _id: new ObjectId(categoryId) });
      if (category) {
        categoryName = category.name;
      }
    }

    // 创建 RSS feed
    const feed = new RSS({
      title: `ObjectX - ${categoryName}`,
      description: `ObjectX 博客 - ${categoryName}`,
      feed_url: `${baseUrl}/api/rss?type=articles${categoryId ? `&categoryId=${categoryId}` : ""}`,
      site_url: `${baseUrl}/articles`,
      image_url: avatarUrl,
      language: "zh-CN",
      pubDate: new Date(),
      custom_namespaces: {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'dc': 'http://purl.org/dc/elements/1.1/',
        'media': 'http://search.yahoo.com/mrss/',
        'article': 'http://objectx.io/article/1.0/'
      },
      custom_elements: [
        {
          'generator': 'ObjectX RSS Generator'
        },
        {
          'content:format': 'markdown'
        }
      ]
    });

    // 添加文章到 feed
    if (articles.length > 0) {
      articles.forEach((article: any) => {
        // 使用完整的 Markdown 内容
        const markdownContent = article.content || "";
        const summary = article.summary || "";

        feed.item({
          title: article.title,
          description: summary,
          url: `${baseUrl}/articles/${article._id}`,
          guid: article._id.toString(),
          date: article.updatedAt || article.createdAt,
          categories: [categoryName],
          author: authorName,
          custom_elements: [
            {
              'content:encoded': {
                _cdata: markdownContent
              }
            },
            {
              'content:type': 'text/markdown'
            },
            {
              'dc:creator': authorName
            },
            {
              'media:thumbnail': {
                _attr: {
                  url: avatarUrl
                }
              }
            },
            {
              'article:views': article.views || 0
            },
            {
              'article:likes': article.likes || 0
            }
          ]
        });
      });
    } else {
      // 如果没有文章，添加一个默认项
      feed.item({
        title: "暂无文章",
        description: "该分类下暂无文章",
        url: `${baseUrl}/articles`,
        guid: "no-articles",
        date: new Date(),
      });
    }

    // 生成 XML
    const xml = feed.xml();

    // 返回 XML 响应
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error: any) {
    console.error("Articles RSS generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate articles RSS feed" },
      { status: 500 }
    );
  }
}
