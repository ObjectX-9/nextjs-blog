import {
  ApiErrors,
  successResponse,
  withErrorHandler,
  validateRequiredParams
} from "@/app/api/data";
import { createDbHelper } from "@/utils/db-helpers";
import { articleDb } from "../route";

interface IArticleCategory {
  _id?: string;
  name: string;
  order: number;
  description?: string;
  isTop?: boolean;
  status?: 'completed' | 'in_progress';
  createdAt: string;
  updatedAt: string;
}

// 创建文章分类数据库操作实例
export const articleCategoryDb = createDbHelper<IArticleCategory>("articleCategories");

// 获取所有文章分类
export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('includeStats') === 'true';

  // 使用新的db-helpers API
  const categories = await articleCategoryDb.find({}, {
    sort: { order: 1, name: 1 } // 首先按order排序，其次按name排序
  });

  // 如果需要包含统计信息
  if (includeStats) {
    // 使用聚合查询统计每个分类的文章数量
    const pipeline = [
      {
        $match: { status: "published" } // 只统计已发布的文章
      },
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 }
        }
      }
    ];

    const articleCounts = await articleDb.aggregate<{ _id: string; count: number }>(pipeline);

    // 创建计数映射
    const countMap: Record<string, number> = {};
    articleCounts.forEach((item: { _id: string, count: number }) => {
      if (item._id) {
        countMap[item._id] = item.count;
      }
    });

    // 为每个分类添加文章数量
    const categoriesWithStats = categories.map((category: IArticleCategory) => ({
      ...category,
      articleCount: countMap[category._id!] || 0
    }));

    return successResponse<any[]>(categoriesWithStats, '获取分类列表成功');
  }

  return successResponse<IArticleCategory[]>(categories, '获取分类列表成功');
});

// 创建新分类
export const POST = withErrorHandler<[Request], IArticleCategory>(async (request: Request) => {
  const { name, description, order, isTop, status } = await request.json();

  validateRequiredParams({ name }, ['name']);

  // 检查分类名是否已存在
  const existingCategory = await articleCategoryDb.findOne({ name });

  if (existingCategory) {
    throw ApiErrors.DUPLICATE_ENTRY('分类名称已存在');
  }

  const categoryToInsert: Omit<IArticleCategory, '_id'> = {
    name,
    order: order || 0, // 默认排序为0
    description,
    isTop: isTop || false, // 默认不置顶
    status: status || 'in_progress', // 默认进行中
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await articleCategoryDb.insertOne(categoryToInsert);

  return successResponse<IArticleCategory>(result, '创建分类成功');
});

// 更新分类
export const PUT = withErrorHandler<[Request], IArticleCategory>(async (request: Request) => {
  const { id, name, description, order, isTop, status } = await request.json();

  validateRequiredParams({ id, name }, ['id', 'name']);

  // 检查分类是否存在
  const category = await articleCategoryDb.findById(id);

  if (!category) {
    throw ApiErrors.NOT_FOUND('分类不存在');
  }

  // 检查是否存在同名分类（排除当前分类）- 新的db-helpers支持MongoDB查询操作符
  const existingCategory = await articleCategoryDb.findOne({
    name,
    _id: { $ne: id }
  });

  if (existingCategory) {
    throw ApiErrors.DUPLICATE_ENTRY('分类名称已存在');
  }

  const updateData = {
    name,
    description,
    order: order !== undefined ? order : category.order,
    isTop: isTop !== undefined ? isTop : category.isTop,
    status: status || category.status,
    updatedAt: new Date().toISOString(),
  };

  const result = await articleCategoryDb.updateById(id, { $set: updateData });

  if (result.matchedCount === 0) {
    throw ApiErrors.NOT_FOUND('分类不存在');
  }

  return successResponse<IArticleCategory>({
    ...category,
    ...updateData
  }, '更新分类成功');
});

// 删除分类
export const DELETE = withErrorHandler<[Request], null>(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    throw ApiErrors.MISSING_PARAMS('分类ID不能为空');
  }

  // 检查分类是否存在
  const category = await articleCategoryDb.findById(id);

  if (!category) {
    throw ApiErrors.NOT_FOUND('分类不存在');
  }

  // 检查是否有文章使用该分类
  const articlesCount = await articleDb.countDocuments({ categoryId: id });

  if (articlesCount > 0) {
    throw ApiErrors.CONFLICT('该分类下还有文章，无法删除');
  }

  const result = await articleCategoryDb.deleteById(id);

  if (result.deletedCount === 0) {
    throw ApiErrors.INTERNAL_ERROR('删除分类失败');
  }

  return successResponse<null>(null, '删除分类成功');
});