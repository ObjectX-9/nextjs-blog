import { IBookmarkCategory } from "@/app/model/bookmark";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../../data";
import { bookmarkDb, bookmarkCategoryDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { categories: IBookmarkCategory[] }>(async (request: Request) => {
  // 获取所有分类
  const categories = await bookmarkCategoryDb.find({}, { sort: { createdAt: -1 } });

  // 为每个分类获取对应的收藏夹
  const categoriesWithBookmarksPromises = categories.map(async (category) => {
    const bookmarks = await bookmarkDb.find({ categoryId: category._id }, { sort: { createdAt: -1 } });

    return {
      ...category,
      bookmarks
    };
  });

  const categoriesWithBookmarks = await Promise.all(categoriesWithBookmarksPromises);

  return successResponse({ categories: categoriesWithBookmarks }, '获取收藏夹分类成功');
});

export const POST = withErrorHandler<[Request], { category: IBookmarkCategory }>(async (request: Request) => {
  const data = await parseRequestBody<{ name: string }>(request);
  RequestValidator.validateRequired(data, ['name']);

  const category = {
    name: data.name,
    bookmarks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await bookmarkCategoryDb.insertOne(category);

  return successResponse({ category: result }, '创建收藏夹分类成功');
});

export const PUT = withErrorHandler<[Request], { category: any }>(async (request: Request) => {
  const data = await parseRequestBody<IBookmarkCategory>(request);
  RequestValidator.validateRequired(data, ['_id', 'name']);

  const updateData = {
    name: data.name,
    updatedAt: new Date().toISOString(),
  };

  const result = await bookmarkCategoryDb.updateById(data._id!, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ category: result }, '更新收藏夹分类成功');
  }

  return errorResponse(ApiErrors.NOT_FOUND('收藏夹分类不存在'));
});

export const DELETE = withErrorHandler<[Request], { category: any }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  // 检查分类是否存在
  const category = await bookmarkCategoryDb.findById(id!);
  if (!category) {
    return errorResponse(ApiErrors.NOT_FOUND('收藏夹分类不存在'));
  }

  // 删除该分类下的所有收藏夹
  await bookmarkDb.deleteMany({ categoryId: id });

  // 删除分类
  const result = await bookmarkCategoryDb.deleteById(id!);

  if (result.deletedCount > 0) {
    return successResponse({ category: result }, '删除收藏夹分类成功');
  }

  return errorResponse(ApiErrors.NOT_FOUND('收藏夹分类不存在'));
});
