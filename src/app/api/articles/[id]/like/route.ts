import { ObjectId } from "mongodb";
import {
  ApiErrors,
  successResponse,
  withErrorHandler
} from "@/app/api/data";
import { articleDb } from "../../route";

export const POST = withErrorHandler<[Request, { params: { id: string } }], { likes: number }>(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const articleId = params.id;

  // 先检查文章是否存在
  const article = await articleDb.findOne({
    _id: new ObjectId(articleId)
  });

  if (!article) {
    throw ApiErrors.ARTICLE_NOT_FOUND();
  }

  const result = await articleDb.updateOne(
    { _id: new ObjectId(articleId) },
    { $inc: { likes: 1 } }
  );

  if (result.modifiedCount === 0) {
    throw ApiErrors.INTERNAL_ERROR('更新点赞数失败');
  }

  // 返回更新后的点赞数
  return successResponse<{ likes: number }>({
    likes: (article.likes || 0) + 1
  }, '点赞成功');
});
