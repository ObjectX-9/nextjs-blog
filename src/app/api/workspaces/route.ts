import { IWorkspaceItem } from "@/app/model/workspace-item";
import { ApiErrors, errorResponse, successResponse, withErrorHandler, paginatedResponse } from "../data";
import { workspaceItemDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { workspaceItems: IWorkspaceItem[] } | { items: IWorkspaceItem[]; pagination: any }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const page = apiParams.getNumber('page');
  const limit = apiParams.getNumber('limit');

  // 如果有分页参数，使用分页查询
  if (page && limit) {
    const result = await workspaceItemDb.paginate({}, {
      page,
      limit,
      sort: { createdAt: -1 }
    });

    return paginatedResponse(result.items, result.pagination, '获取工作空间物品成功');
  }

  // 否则返回所有数据
  const workspaceItems = await workspaceItemDb.find({}, { sort: { createdAt: -1 } });
  return successResponse({ workspaceItems }, '获取工作空间物品成功');
});

export const POST = withErrorHandler<[Request], { workspaceItem: IWorkspaceItem }>(async (request: Request) => {
  const data = await parseRequestBody<IWorkspaceItem>(request);
  RequestValidator.validateRequired(data, ['product', 'specs', 'buyAddress', 'buyLink']);

  const workspaceItem = {
    product: data.product,
    specs: data.specs,
    buyAddress: data.buyAddress,
    buyLink: data.buyLink,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await workspaceItemDb.insertOne(workspaceItem);

  return successResponse({ workspaceItem: result }, '创建工作空间物品成功');
});

export const PUT = withErrorHandler<[Request], { workspaceItem: any }>(async (request: Request) => {
  const data = await parseRequestBody<IWorkspaceItem>(request);
  RequestValidator.validateRequired(data, ['_id']);

  const updateData = {
    ...(data.product && { product: data.product }),
    ...(data.specs && { specs: data.specs }),
    ...(data.buyAddress && { buyAddress: data.buyAddress }),
    ...(data.buyLink && { buyLink: data.buyLink }),
    updatedAt: new Date().toISOString(),
  };

  const result = await workspaceItemDb.updateById(data._id!, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ workspaceItem: result }, '更新工作空间物品成功');
  }

  return errorResponse(ApiErrors.NOT_FOUND('工作空间物品不存在'));
});

export const DELETE = withErrorHandler<[Request], { workspaceItem: any }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  const result = await workspaceItemDb.deleteById(id!);

  if (result.deletedCount > 0) {
    return successResponse({ workspaceItem: result }, '删除工作空间物品成功');
  }

  return errorResponse(ApiErrors.NOT_FOUND('工作空间物品不存在'));
});
