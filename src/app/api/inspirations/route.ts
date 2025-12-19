import { NextRequest } from "next/server";
import { IInspiration, IInspirationCreate, IInspirationFilter, IInspirationUpdate, PaginatedInspirations } from "@/app/model/inspiration";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";
import { ApiErrors, successResponse, withErrorHandler } from "../data";
import { inspirationDb } from "@/utils/db-instances";

/**
 * 获取灵感笔记列表
 */
export const GET = withErrorHandler<[Request], PaginatedInspirations>(async (request: Request) => {
  const params = createApiParams(request);

  // 获取参数
  const { page, limit } = params.getPagination();
  const status = params.getString("status");
  const tags = params.getString("tags");

  // 构建查询条件
  const query: IInspirationFilter = {};
  if (status) query.status = status as "draft" | "published";
  if (tags) query.tags = tags.split(',') as string[];

  // 获取分页数据
  const paginatedData = await inspirationDb.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 }
  });

  const response: PaginatedInspirations = {
    data: paginatedData.items,
    total: paginatedData.pagination.total,
    page: paginatedData.pagination.page,
    limit: paginatedData.pagination.limit,
  };

  return successResponse(response, '获取灵感笔记列表成功');
});

/**
 * 创建新的灵感笔记
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const data: IInspirationCreate = await parseRequestBody(request);

  // 验证必需字段
  RequestValidator.validateRequired(data, ['title', 'content']);

  const now = new Date();
  const inspiration: Omit<IInspiration, '_id'> = {
    ...data,
    createdAt: now,
    updatedAt: now,
    likes: 0,
    views: 0,
    images: data.images || [],
    videos: data.videos || [],
  };

  const result = await inspirationDb.insertOne(inspiration);

  return successResponse({
    _id: result._id,
    ...inspiration,
  }, '灵感笔记创建成功');
});

/**
 * 更新灵感笔记
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const params = createApiParams(request);
  const id = params.getRequiredObjectId("id");
  const data: IInspirationUpdate = await parseRequestBody(request);

  // 验证必需字段
  RequestValidator.validateRequired(data, ['title', 'content']);

  const updateData = {
    ...RequestValidator.sanitize(data, ['title', 'content', 'status', 'tags', 'images', 'videos', 'links', 'bilibili']),
    updatedAt: new Date(),
  };

  const result = await inspirationDb.updateById(id, { $set: updateData });

  if (result.matchedCount === 0) {
    throw ApiErrors.NOT_FOUND('灵感笔记不存在');
  }

  return successResponse({
    _id: id,
    ...data,
  }, '灵感笔记更新成功');
});

/**
 * 删除灵感笔记
 */
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const params = createApiParams(request);
  const id = params.getRequiredObjectId("id");

  const result = await inspirationDb.deleteById(id);

  if (result.deletedCount === 0) {
    throw ApiErrors.NOT_FOUND('灵感笔记不存在');
  }

  return successResponse(null, '灵感笔记删除成功');
});
