import { IExternalArticleCategory, ExternalArticleCountByCategory } from "@/app/model/external-article";
import {
    ApiErrors,
    successResponse,
    withErrorHandler,
} from "@/app/api/data";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";
import { UpdateFilter } from "mongodb";
import { createDbHelper } from "@/utils/db-helpers";

const externalArticleCategoryDb = createDbHelper("externalArticleCategories");
const externalArticleDb = createDbHelper("externalArticles");

/**
 * 创建新的外部文章分类
 */
export const POST = withErrorHandler(async (request: Request) => {
    const category = await parseRequestBody(request);

    // 验证必需字段
    RequestValidator.validateRequired(category, ['name']);

    // 如果没有提供 order，获取当前最大 order 并加 1
    let order = category.order;
    if (order === undefined) {
        const lastCategory = await externalArticleCategoryDb.find(
            {},
            { sort: { order: -1 }, limit: 1 }
        );
        order = (lastCategory[0]?.order || 0) + 1;
    }

    const categoryToInsert: Omit<IExternalArticleCategory, '_id'> = {
        name: category.name,
        description: category.description || '',
        color: category.color || '#3B82F6',
        isAdminOnly: Boolean(category.isAdminOnly),
        order: Number(order),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const result = await externalArticleCategoryDb.insertOne(categoryToInsert);

    return successResponse({
        _id: result._id,
        ...categoryToInsert,
    }, '外部文章分类创建成功');
});

/**
 * 获取外部文章分类列表
 */
export const GET = withErrorHandler(async (request: Request) => {
    const params = createApiParams(request);
    const withCount = params.getBoolean("withCount");

    if (withCount) {
        // 获取带文章数量的分类统计
        const pipeline = [
            {
                $lookup: {
                    from: 'externalArticles',
                    let: { categoryId: { $toString: '$_id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$categoryId', '$$categoryId'] }
                            }
                        }
                    ],
                    as: 'articles'
                }
            },
            {
                $project: {
                    _id: 1,
                    categoryId: { $toString: '$_id' },
                    categoryName: '$name',
                    color: 1,
                    count: { $size: '$articles' },
                    createdAt: {
                        $cond: {
                            if: { $eq: [{ $type: '$createdAt' }, 'date'] },
                            then: { $dateToString: { date: '$createdAt' } },
                            else: '$createdAt'
                        }
                    },
                    updatedAt: {
                        $cond: {
                            if: { $eq: [{ $type: '$updatedAt' }, 'date'] },
                            then: { $dateToString: { date: '$updatedAt' } },
                            else: '$updatedAt'
                        }
                    }
                }
            },
            {
                $sort: { order: 1 }
            }
        ];

        const categories = await externalArticleCategoryDb.aggregate<ExternalArticleCountByCategory>(pipeline);
        return successResponse(categories, '获取外部文章分类统计成功');
    } else {
        // 获取普通分类列表
        const categories = await externalArticleCategoryDb.find({}, { sort: { order: 1 } });
        return successResponse(categories, '获取外部文章分类列表成功');
    }
});

/**
 * 更新外部文章分类
 */
export const PUT = withErrorHandler(async (request: Request) => {
    const params = createApiParams(request);
    const id = params.getRequiredObjectId("id");
    const category = await parseRequestBody(request);

    // 验证必需字段
    RequestValidator.validateRequired(category, ['name']);

    const categoryToUpdate: any = {
        ...RequestValidator.sanitize(category, ['name', 'description', 'color', 'isAdminOnly', 'order']),
        updatedAt: new Date().toISOString(),
    };

    if (category.order !== undefined) {
        categoryToUpdate.order = Number(category.order);
    }

    const result = await externalArticleCategoryDb.updateById(id, { $set: categoryToUpdate as UpdateFilter<any> });

    if (result.matchedCount === 0) {
        throw ApiErrors.NOT_FOUND('外部文章分类不存在');
    }

    return successResponse({
        _id: id,
        ...category,
    }, '外部文章分类更新成功');
});

/**
 * 删除外部文章分类
 */
export const DELETE = withErrorHandler(async (request: Request) => {
    const params = createApiParams(request);
    const id = params.getRequiredObjectId("id");

    // 检查是否有文章使用此分类
    const articlesCount = await externalArticleDb.countDocuments({ categoryId: id });
    if (articlesCount > 0) {
        throw ApiErrors.BAD_REQUEST(`无法删除分类，还有 ${articlesCount} 篇外部文章使用此分类`);
    }

    const result = await externalArticleCategoryDb.deleteById(id);

    if (result.deletedCount === 0) {
        throw ApiErrors.NOT_FOUND('外部文章分类不存在');
    }

    return successResponse(null, '外部文章分类删除成功');
});
