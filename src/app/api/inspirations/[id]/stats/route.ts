import { ObjectId } from "mongodb";
import { ApiErrors, successResponse, withErrorHandler } from "@/app/api/data";
import { parseRequestBody } from "@/utils/api-helpers";
import { inspirationDb } from "@/utils/db-instances";

// 更新点赞数和浏览量
export const POST = withErrorHandler<[Request, { params: { id: string } }], { likes?: number; views?: number }>(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const inspirationId = params.id;

  // 从请求体获取 action
  const { action } = await parseRequestBody(request);

  if (!["like", "view"].includes(action)) {
    throw ApiErrors.BAD_REQUEST("Invalid action. Use 'like' or 'view'");
  }

  // 先检查灵感笔记是否存在
  const inspiration = await inspirationDb.findOne({
    _id: new ObjectId(inspirationId)
  });

  if (!inspiration) {
    throw ApiErrors.NOT_FOUND("灵感笔记不存在");
  }

  const updateField = action === "like" ? "likes" : "views";
  const result = await inspirationDb.updateOne(
    { _id: new ObjectId(inspirationId) },
    { $inc: { [updateField]: 1 } }
  );

  if (result.modifiedCount === 0) {
    throw ApiErrors.INTERNAL_ERROR(`更新${action === "like" ? "点赞" : "浏览"}数失败`);
  }

  // 返回更新后的计数
  const newCount = (inspiration[updateField] || 0) + 1;
  return successResponse({
    [updateField]: newCount,
  }, `更新${action === "like" ? "点赞" : "浏览"}数成功`);
});
