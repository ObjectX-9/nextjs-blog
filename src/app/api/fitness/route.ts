import { IFitnessRecord } from "@/app/model/fitness";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { fitnessRecordDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";
import { verifyAdmin } from "@/utils/auth";

interface FitnessRecordResponse {
    records: IFitnessRecord[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const GET = withErrorHandler<[Request], FitnessRecordResponse>(async (request: Request) => {
    const apiParams = createApiParams(request);
    const page = Math.max(1, parseInt(apiParams.getString("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(apiParams.getString("limit") || "20")));

    // 检查用户是否为管理员
    const isAdmin = await verifyAdmin();

    // 构建查询条件：非管理员只能看到非私有的记录
    const filter = isAdmin ? {} : { $or: [{ isAdminOnly: { $ne: true } }, { isAdminOnly: { $exists: false } }] };

    const [records, total] = await Promise.all([
        fitnessRecordDb.find(filter, {
            sort: { date: -1 }, // 按日期倒序排列
            skip: (page - 1) * limit,
            limit
        }),
        fitnessRecordDb.countDocuments(filter)
    ]);

    const response: FitnessRecordResponse = {
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

export const POST = withErrorHandler<[Request], { record?: IFitnessRecord; insertedCount?: number }>(async (request: Request) => {
    const data = await parseRequestBody<{ records?: IFitnessRecord[]; } & IFitnessRecord>(request);

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
            date: record.date, // 保持字符串格式
            ...(record.images && { images: record.images }),
            ...(record.videos && { videos: record.videos }),
            ...(record.isAdminOnly !== undefined && { isAdminOnly: record.isAdminOnly }),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        const result = await fitnessRecordDb.insertMany(recordsToInsert);

        return successResponse({ insertedCount: result.length });
    } else {
        // 单个创建
        RequestValidator.validateRequired(data, ['title', 'description', 'date']);

        const record = {
            title: data.title,
            description: data.description,
            date: data.date, // 保持字符串格式
            ...(data.images && { images: data.images }),
            ...(data.videos && { videos: data.videos }),
            ...(data.isAdminOnly !== undefined && { isAdminOnly: data.isAdminOnly }),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await fitnessRecordDb.insertOne(record);

        return successResponse({ record: result });
    }
});

export const PUT = withErrorHandler<[Request], { record: IFitnessRecord }>(async (request: Request) => {
    const data = await parseRequestBody<IFitnessRecord>(request);
    RequestValidator.validateRequired(data, ['_id', 'title', 'description', 'date']);

    const updateData = {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.date && { date: data.date }), // 保持字符串格式
        ...(data.images !== undefined && { images: data.images }),
        ...(data.videos !== undefined && { videos: data.videos }),
        ...(data.isAdminOnly !== undefined && { isAdminOnly: data.isAdminOnly }),
        updatedAt: new Date().toISOString(),
    };

    const updateResult = await fitnessRecordDb.updateOne({ _id: data._id }, { $set: updateData });

    if (updateResult.matchedCount > 0) {
        // 获取更新后的文档
        const updatedRecord = await fitnessRecordDb.findById(data._id!);
        if (updatedRecord) {
            return successResponse({ record: updatedRecord });
        }
    }

    return errorResponse(ApiErrors.NOT_FOUND('健身记录未找到'));
});

export const DELETE = withErrorHandler<[Request], { record: IFitnessRecord }>(async (request: Request) => {
    const apiParams = createApiParams(request);
    const id = apiParams.getString("id");

    RequestValidator.validateRequired({ id }, ['id']);

    // 先获取要删除的文档
    const recordToDelete = await fitnessRecordDb.findById(id!);
    if (!recordToDelete) {
        return errorResponse(ApiErrors.NOT_FOUND('健身记录未找到'));
    }

    const result = await fitnessRecordDb.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
        return successResponse({ record: recordToDelete });
    }

    return errorResponse(ApiErrors.NOT_FOUND('健身记录未找到'));
}); 