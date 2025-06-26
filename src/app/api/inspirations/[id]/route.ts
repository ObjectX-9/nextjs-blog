import { NextRequest } from "next/server";
import { createApiParams } from "@/utils/api-helpers";
import { ApiErrors, successResponse, withErrorHandler } from "../../data";
import { inspirationDb } from "@/utils/db-instances";

// 获取单个灵感笔记
export const GET = withErrorHandler(async (request: NextRequest) => {
  const params = createApiParams(request);
  const id = params.getRequiredString("id");
  const inspiration = await inspirationDb.findById(id);

  if (!inspiration) {
    throw ApiErrors.NOT_FOUND("Inspiration not found");
  }

  return successResponse(inspiration, "获取灵感笔记成功");
});

// 更新灵感笔记
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const params = createApiParams(request);
  const id = params.getRequiredString("id");
  const data = await request.json();
  const inspiration = await inspirationDb.findById(id);

  if (!inspiration) {
    throw ApiErrors.NOT_FOUND("Inspiration not found");
  }

  const now = new Date();
  let updateData: any = {
    updatedAt: now,
  };

  // Support incrementing likes
  if (data.incrementLikes) {
    updateData.$inc = { likes: 1 };
  }

  // Support incrementing views
  if (data.incrementViews) {
    updateData.$inc = { ...updateData.$inc, views: 1 };
  }

  // Add any other update fields
  if (Object.keys(data).length > 0) {
    updateData = {
      ...updateData,
      ...Object.fromEntries(
        Object.entries(data).filter(([key]) =>
          !['incrementLikes', 'incrementViews'].includes(key)
        )
      )
    };
  }

  const result = await inspirationDb.updateById(id, { $set: updateData });

  if (!result) {
    throw ApiErrors.NOT_FOUND("Inspiration not found");
  }

  return successResponse(result, "更新灵感笔记成功");
});

// 点赞和浏览量接口
export const POST = withErrorHandler(async (request: NextRequest) => {
  const params = createApiParams(request);
  const id = params.getRequiredString("id");
  const type = params.getString("type");
  const inspiration = await inspirationDb.findById(id);

  if (!inspiration) {
    throw ApiErrors.NOT_FOUND("Inspiration not found");
  }

  let updateData: any = {};

  // Increment likes or views based on the type
  if (type === 'like') {
    updateData.$inc = { likes: 1 };
  } else if (type === 'view') {
    updateData.$inc = { views: 1 };
  } else {
    throw ApiErrors.BAD_REQUEST("Invalid type. Use 'like' or 'view'.");
  }

  const result = await inspirationDb.updateById(id, updateData);

  if (!result) {
    throw ApiErrors.NOT_FOUND("Inspiration not found");
  }

  return successResponse(result, "更新点赞和浏览量成功");
});

// 删除灵感笔记
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const params = createApiParams(request);
  const id = params.getRequiredString("id");
  const result = await inspirationDb.deleteById(id);

  if (!result) {
    throw ApiErrors.NOT_FOUND("Inspiration not found");
  }

  return successResponse(result, "删除灵感笔记成功");
});
