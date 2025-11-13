import { IExternalArticle, IExternalArticleDB, PaginatedExternalArticles, ExternalArticleStatus } from "@/app/model/external-article";
import {
  ApiErrors,
  successResponse,
  withErrorHandler,
} from "@/app/api/data";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";
import { UpdateFilter } from "mongodb";
import { verifyAdmin } from "@/utils/auth";
import { createDbHelper, IdHelper } from "@/utils/db-helpers";

const externalArticleDb = createDbHelper("externalArticles");
const externalArticleCategoryDb = createDbHelper("externalArticleCategories");

/**
 * 创建新的外部文章收录
 */
export const POST = withErrorHandler(async (request: Request) => {
  const article = await parseRequestBody(request);

  // 验证必需字段
  RequestValidator.validateRequired(article, ['title', 'url', 'categoryId']);
  RequestValidator.validateObjectIds(article, ['categoryId']);

  // 验证URL格式
  try {
    new URL(article.url);
  } catch {
    throw ApiErrors.VALIDATION_ERROR('无效的URL格式');
  }

  // 检查URL是否已存在
  const existingArticle = await externalArticleDb.findOne({ url: article.url });
  if (existingArticle) {
    throw ApiErrors.VALIDATION_ERROR('该URL已经被收录');
  }

  const articleToInsert: Omit<IExternalArticle, '_id'> = {
    title: article.title,
    url: article.url,
    categoryId: article.categoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await externalArticleDb.insertOne(articleToInsert);

  return successResponse({
    _id: result._id,
    ...articleToInsert,
  }, '外部文章收录成功');
});

/**
 * 获取外部文章列表或单篇文章
 */
export const GET = withErrorHandler<[Request], IExternalArticle | PaginatedExternalArticles>(async (request: Request) => {
  const params = createApiParams(request);
  
  // 获取参数
  const id = params.getObjectId("id");
  const categoryId = params.getString("categoryId");
  const search = params.getString("search");
  const { page, limit } = params.getPagination();

  // 验证是否为管理员
  const isAdmin = await verifyAdmin();

  // 如果有 ID，获取单篇文章
  if (id) {
    const article = await externalArticleDb.findById(id);
    if (!article) {
      throw ApiErrors.NOT_FOUND('外部文章不存在');
    }

    // 检查文章所属分类是否为管理员专用
    if (article.categoryId && !isAdmin) {
      const category = await externalArticleCategoryDb.findById(article.categoryId);
      if (category?.isAdminOnly) {
        throw ApiErrors.NOT_FOUND('外部文章不存在');
      }
    }

    return successResponse<IExternalArticle>(article as IExternalArticle, '获取外部文章成功');
  }

  // 否则获取文章列表
  const query: any = {};
  
  if (categoryId) {
    // 如果指定了分类ID，需要检查该分类是否为管理员专用
    if (!isAdmin) {
      const category = await externalArticleCategoryDb.findById(categoryId);
      if (category?.isAdminOnly) {
        return successResponse<PaginatedExternalArticles>({
          items: [],
          pagination: {
            page: 1,
            limit: limit,
            total: 0,
            totalPages: 0,
            hasMore: false
          }
        }, '获取外部文章列表成功');
      }
    }
    query.categoryId = categoryId;
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // 如果没有指定分类且不是管理员，需要额外过滤掉管理员专用分类的文章
  if (!categoryId && !isAdmin) {
    const publicCategories = await externalArticleCategoryDb.find({
      $or: [
        { isAdminOnly: { $ne: true } },
        { isAdminOnly: { $exists: false } }
      ]
    });
    const publicCategoryIds = publicCategories.map(cat => cat._id?.toString());

    if (publicCategoryIds.length > 0) {
      query.categoryId = { $in: publicCategoryIds };
    } else {
      return successResponse<PaginatedExternalArticles>({
        items: [],
        pagination: {
          page: 1,
          limit: limit,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      }, '获取外部文章列表成功');
    }
  }

  // 按最新时间排序
  const sortOptions = { createdAt: -1, _id: -1 };

  const paginatedData = await externalArticleDb.paginate(query, {
    page,
    limit,
    sort: sortOptions
  });

  return successResponse<PaginatedExternalArticles>(paginatedData as PaginatedExternalArticles, '获取外部文章列表成功');
});

/**
 * 更新外部文章
 */
export const PUT = withErrorHandler(async (request: Request) => {
  const params = createApiParams(request);
  const id = params.getRequiredObjectId("id");
  const article = await parseRequestBody(request);

  // 验证必需字段
  RequestValidator.validateRequired(article, ['title', 'url']);
  RequestValidator.validateObjectIds(article, ['categoryId']);

  // 验证URL格式
  if (article.url) {
    try {
      new URL(article.url);
    } catch {
      throw ApiErrors.VALIDATION_ERROR('无效的URL格式');
    }

    // 检查URL是否已存在（排除当前文章）
    const existingArticle = await externalArticleDb.findOne({ 
      url: article.url, 
      _id: { $ne: IdHelper.toObjectId(id) } 
    });
    if (existingArticle) {
      throw ApiErrors.VALIDATION_ERROR('该URL已经被收录');
    }
  }

  const articleToUpdate: any = {
    ...RequestValidator.sanitize(article, ['title', 'url', 'categoryId']),
    updatedAt: new Date().toISOString(),
  };

  const result = await externalArticleDb.updateById(id, { $set: articleToUpdate as UpdateFilter<any> });

  if (result.matchedCount === 0) {
    throw ApiErrors.NOT_FOUND('外部文章不存在');
  }

  return successResponse<IExternalArticle>({
    _id: id,
    ...article,
  }, '外部文章更新成功');
});

/**
 * 删除外部文章
 */
export const DELETE = withErrorHandler(async (request: Request) => {
  const params = createApiParams(request);
  const id = params.getRequiredObjectId("id");

  const result = await externalArticleDb.deleteById(id);

  if (result.deletedCount === 0) {
    throw ApiErrors.NOT_FOUND('外部文章不存在');
  }

  return successResponse(null, '外部文章删除成功');
});

