import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  ApiErrors,
  successResponse,
  withErrorHandler
} from "@/app/api/data";

export const POST = withErrorHandler<[Request, { params: { id: string } }], { views: number }>(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
    const db = await getDb();
    const articleId = params.id;

  // 先检查文章是否存在
  const article = await db.collection("articles").findOne({
    _id: new ObjectId(articleId)
  });

  if (!article) {
    throw ApiErrors.ARTICLE_NOT_FOUND();
  }

    const result = await db.collection("articles").updateOne(
      { _id: new ObjectId(articleId) },
      { $inc: { views: 1 } }
    );

    if (result.modifiedCount === 0) {
      throw ApiErrors.INTERNAL_ERROR('更新浏览量失败');
    }

  // 返回更新后的浏览量
  return successResponse<{ views: number }>({
    views: (article.views || 0) + 1
  }, '更新浏览量成功');
});
