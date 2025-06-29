import { ITimelineEvent } from "@/app/model/timeline";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { timelineDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";
import { verifyAdmin } from "@/utils/auth";

interface TimelineResponse {
  events: ITimelineEvent[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const GET = withErrorHandler<[Request], TimelineResponse>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const page = Math.max(1, parseInt(apiParams.getString("page") || "1"));
  const limit = Math.max(1, Math.min(50, parseInt(apiParams.getString("limit") || "20")));

  // 检查用户是否为管理员
  const isAdmin = await verifyAdmin();

  // 构建查询条件：非管理员只能看到非私有的时间线事件
  const filter = isAdmin ? {} : { $or: [{ isAdminOnly: { $ne: true } }, { isAdminOnly: { $exists: false } }] };

  const [events, total] = await Promise.all([
    timelineDb.find(filter, {
      sort: { year: -1, month: -1, day: -1 },
      skip: (page - 1) * limit,
      limit
    }),
    timelineDb.countDocuments(filter)
  ]);

  const response: TimelineResponse = {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };

  return successResponse(response);
});

export const POST = withErrorHandler<[Request], { event?: ITimelineEvent; insertedCount?: number }>(async (request: Request) => {
  const data = await parseRequestBody<{ events?: ITimelineEvent[]; } & ITimelineEvent>(request);

  // 检查是否是批量创建
  if (data.events && Array.isArray(data.events)) {
    RequestValidator.validateRequired({ events: data.events }, ['events']);

    if (data.events.length === 0) {
      return errorResponse(ApiErrors.VALIDATION_ERROR('事件列表不能为空'));
    }

    // 验证每个事件
    data.events.forEach((event, index) => {
      RequestValidator.validateRequired(event, ['year', 'month', 'day', 'title', 'description']);
    });

    const eventsToInsert = data.events.map(event => ({
      year: event.year,
      month: event.month,
      day: event.day,
      title: event.title,
      description: event.description,
      ...(event.location && { location: event.location }),
      ...(event.ossPath && { ossPath: event.ossPath }),
      ...(event.tweetUrl && { tweetUrl: event.tweetUrl }),
      ...(event.imageUrl && { imageUrl: event.imageUrl }),
      ...(event.links && { links: event.links }),
      ...(event.isAdminOnly !== undefined && { isAdminOnly: event.isAdminOnly }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const result = await timelineDb.insertMany(eventsToInsert);

    return successResponse({ insertedCount: result.length });
  } else {
    // 单个创建
    RequestValidator.validateRequired(data, ['year', 'month', 'day', 'title', 'description']);

    const event = {
      year: data.year,
      month: data.month,
      day: data.day,
      title: data.title,
      description: data.description,
      ...(data.location && { location: data.location }),
      ...(data.ossPath && { ossPath: data.ossPath }),
      ...(data.tweetUrl && { tweetUrl: data.tweetUrl }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      ...(data.links && { links: data.links }),
      ...(data.isAdminOnly !== undefined && { isAdminOnly: data.isAdminOnly }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await timelineDb.insertOne(event);

    return successResponse({ event: result });
  }
});

export const PUT = withErrorHandler<[Request], { event: ITimelineEvent }>(async (request: Request) => {
  const data = await parseRequestBody<ITimelineEvent>(request);
  RequestValidator.validateRequired(data, ['_id', 'year', 'month', 'day', 'title', 'description']);

  const updateData = {
    ...(data.year !== undefined && { year: data.year }),
    ...(data.month !== undefined && { month: data.month }),
    ...(data.day !== undefined && { day: data.day }),
    ...(data.title && { title: data.title }),
    ...(data.description && { description: data.description }),
    ...(data.location !== undefined && { location: data.location }),
    ...(data.ossPath !== undefined && { ossPath: data.ossPath }),
    ...(data.tweetUrl !== undefined && { tweetUrl: data.tweetUrl }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    ...(data.links !== undefined && { links: data.links }),
    ...(data.isAdminOnly !== undefined && { isAdminOnly: data.isAdminOnly }),
    updatedAt: new Date().toISOString(),
  };

  const updateResult = await timelineDb.updateOne({ _id: data._id }, { $set: updateData });

  if (updateResult.matchedCount > 0) {
    // 获取更新后的文档
    const updatedEvent = await timelineDb.findById(data._id!);
    if (updatedEvent) {
      return successResponse({ event: updatedEvent });
    }
  }

  return errorResponse(ApiErrors.NOT_FOUND('时间线事件未找到'));
});

export const DELETE = withErrorHandler<[Request], { event: ITimelineEvent }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  // 先获取要删除的文档
  const eventToDelete = await timelineDb.findById(id!);
  if (!eventToDelete) {
    return errorResponse(ApiErrors.NOT_FOUND('时间线事件未找到'));
  }

  const result = await timelineDb.deleteOne({ _id: id });

  if (result.deletedCount > 0) {
    return successResponse({ event: eventToDelete });
  }

  return errorResponse(ApiErrors.NOT_FOUND('时间线事件未找到'));
});
