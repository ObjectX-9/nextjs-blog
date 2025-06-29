import { IBookmark } from "@/app/model/bookmark";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { bookmarkDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { bookmarks: IBookmark[] }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const categoryId = apiParams.getString('categoryId');

  let bookmarks: IBookmark[];

  if (categoryId) {
    // 按分类过滤 - db-helper 会自动处理 categoryId 的类型转换
    bookmarks = await bookmarkDb.find({ categoryId }, { sort: { createdAt: -1 } });
  } else {
    // 获取所有收藏夹
    bookmarks = await bookmarkDb.find({}, { sort: { createdAt: -1 } });
  }

  return successResponse({ bookmarks }, '获取收藏夹成功');
});

export const POST = withErrorHandler<[Request], { bookmark: IBookmark }>(async (request: Request) => {
  const data = await parseRequestBody<IBookmark>(request);
  RequestValidator.validateRequired(data, ['title', 'url', 'description', 'categoryId']);

  const bookmark = {
    title: data.title,
    url: data.url,
    description: data.description,
    imageUrl: data.imageUrl,
    categoryId: data.categoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 创建收藏夹
  const result = await bookmarkDb.insertOne(bookmark);

  // 更新分类中的收藏夹列表（这里简化处理，不直接维护关联）
  // 实际使用时可以通过查询来获取分类下的收藏夹

  return successResponse({ bookmark: result }, '创建收藏夹成功');
});

export const PUT = withErrorHandler<[Request], { bookmark: any }>(async (request: Request) => {
  const data = await parseRequestBody<IBookmark>(request);
  RequestValidator.validateRequired(data, ['_id']);

  // 如果分类发生变化，需要特殊处理
  const oldBookmark = await bookmarkDb.findById(data._id!);
  if (!oldBookmark) {
    return errorResponse(ApiErrors.NOT_FOUND('收藏夹不存在'));
  }

  const updateData = {
    ...(data.title && { title: data.title }),
    ...(data.url && { url: data.url }),
    ...(data.description && { description: data.description }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    ...(data.categoryId && { categoryId: data.categoryId }),
    updatedAt: new Date().toISOString(),
  };

  const result = await bookmarkDb.updateById(data._id!, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ bookmark: result }, '更新收藏夹成功');
  }

  return errorResponse(ApiErrors.NOT_FOUND('收藏夹不存在'));
});

export const DELETE = withErrorHandler<[Request], { bookmark: any }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  // 检查收藏夹是否存在
  const bookmark = await bookmarkDb.findById(id!);
  if (!bookmark) {
    return errorResponse(ApiErrors.NOT_FOUND('收藏夹不存在'));
  }

  // 删除收藏夹
  const result = await bookmarkDb.deleteById(id!);

  if (result.deletedCount > 0) {
    return successResponse({ bookmark: result }, '删除收藏夹成功');
  }

  return errorResponse(ApiErrors.NOT_FOUND('收藏夹不存在'));
});
