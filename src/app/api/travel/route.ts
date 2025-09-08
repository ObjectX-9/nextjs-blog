import { ITravelRecord } from "@/app/model/travel";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { travelRecordDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";
import { verifyAdmin } from "@/utils/auth";

interface TravelRecordResponse {
    records: ITravelRecord[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const GET = withErrorHandler<[Request], TravelRecordResponse>(async (request: Request) => {
    const apiParams = createApiParams(request);
    const page = Math.max(1, parseInt(apiParams.getString("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(apiParams.getString("limit") || "20")));

    // 检查用户是否为管理员
    const isAdmin = await verifyAdmin();

    // 构建查询条件：非管理员只能看到非私有的记录
    const filter = isAdmin ? {} : { $or: [{ isAdminOnly: { $ne: true } }, { isAdminOnly: { $exists: false } }] };

    const [records, total] = await Promise.all([
        travelRecordDb.find(filter, {
            sort: { date: -1 }, // 按日期倒序排列
            skip: (page - 1) * limit,
            limit
        }),
        travelRecordDb.countDocuments(filter)
    ]);

    const response: TravelRecordResponse = {
        records,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };

    return successResponse(response);
});

export const POST = withErrorHandler<[Request], { record?: ITravelRecord; insertedCount?: number }>(async (request: Request) => {
    const data = await parseRequestBody<{ records?: ITravelRecord[]; } & ITravelRecord>(request);

    // 检查是否是批量创建
    if (data.records && Array.isArray(data.records)) {
        RequestValidator.validateRequired({ records: data.records }, ['records']);

        if (data.records.length === 0) {
            return errorResponse(ApiErrors.VALIDATION_ERROR('记录列表不能为空'));
        }

        // 验证每个记录
        data.records.forEach((record, index) => {
            RequestValidator.validateRequired(record, ['title', 'description', 'date']);
        });

        const recordsToInsert = data.records.map(record => ({
            title: record.title,
            description: record.description,
            date: record.date,
            ...(record.destination && { destination: record.destination }),
            ...(record.weather && { weather: record.weather }),
            ...(record.companions && { companions: record.companions }),
            ...(record.transportation && { transportation: record.transportation }),
            ...(record.cost !== undefined && { cost: record.cost }),
            ...(record.rating !== undefined && { rating: record.rating }),
            ...(record.images && { images: record.images }),
            ...(record.videos && { videos: record.videos }),
            ...(record.tags && { tags: record.tags }),
            ...(record.isAdminOnly !== undefined && { isAdminOnly: record.isAdminOnly }),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        const result = await travelRecordDb.insertMany(recordsToInsert);

        return successResponse({ insertedCount: result.length });
    } else {
        // 单个创建
        RequestValidator.validateRequired(data, ['title', 'description', 'date']);

        const record = {
            title: data.title,
            description: data.description,
            date: data.date,
            ...(data.destination && { destination: data.destination }),
            ...(data.weather && { weather: data.weather }),
            ...(data.companions && { companions: data.companions }),
            ...(data.transportation && { transportation: data.transportation }),
            ...(data.cost !== undefined && { cost: data.cost }),
            ...(data.rating !== undefined && { rating: data.rating }),
            ...(data.images && { images: data.images }),
            ...(data.videos && { videos: data.videos }),
            ...(data.tags && { tags: data.tags }),
            ...(data.isAdminOnly !== undefined && { isAdminOnly: data.isAdminOnly }),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await travelRecordDb.insertOne(record);

        return successResponse({ record: result });
    }
});

export const PUT = withErrorHandler<[Request], { record: ITravelRecord }>(async (request: Request) => {
    const data = await parseRequestBody<ITravelRecord>(request);
    RequestValidator.validateRequired(data, ['_id', 'title', 'description', 'date']);

    const updateData = {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.date && { date: data.date }),
        ...(data.destination !== undefined && { destination: data.destination }),
        ...(data.weather !== undefined && { weather: data.weather }),
        ...(data.companions !== undefined && { companions: data.companions }),
        ...(data.transportation !== undefined && { transportation: data.transportation }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.videos !== undefined && { videos: data.videos }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.isAdminOnly !== undefined && { isAdminOnly: data.isAdminOnly }),
        updatedAt: new Date().toISOString(),
    };

    const updateResult = await travelRecordDb.updateOne({ _id: data._id }, { $set: updateData });

    if (updateResult.matchedCount > 0) {
        // 获取更新后的文档
        const updatedRecord = await travelRecordDb.findById(data._id!);
        if (updatedRecord) {
            return successResponse({ record: updatedRecord });
        }
    }

    return errorResponse(ApiErrors.NOT_FOUND('旅行记录未找到'));
});

export const DELETE = withErrorHandler<[Request], { record: ITravelRecord }>(async (request: Request) => {
    const apiParams = createApiParams(request);
    const id = apiParams.getString("id");

    RequestValidator.validateRequired({ id }, ['id']);

    // 先获取要删除的文档
    const recordToDelete = await travelRecordDb.findById(id!);
    if (!recordToDelete) {
        return errorResponse(ApiErrors.NOT_FOUND('旅行记录未找到'));
    }

    const result = await travelRecordDb.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
        return successResponse({ record: recordToDelete });
    }

    return errorResponse(ApiErrors.NOT_FOUND('旅行记录未找到'));
}); 