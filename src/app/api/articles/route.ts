import { Article, ArticleDocument, ArticleStatus, PaginatedArticles } from "@/app/model/article";
import {
  ApiErrors,
  successResponse,
  withErrorHandler,
} from "@/app/api/data";
import { createDbHelper, DbDocument } from "@/utils/db-helpers";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";
import { UpdateFilter } from "mongodb";

// 创建文章数据库操作实例
const articleDb = createDbHelper<ArticleDocument>("articles");

/**
 * 创建新文章
 */
export const POST = withErrorHandler(async (request: Request) => {
  const article = await parseRequestBody(request);

  // 验证必需字段
  RequestValidator.validateRequired(article, ['title', 'content', 'categoryId']);
  RequestValidator.validateObjectIds(article, ['categoryId']);

  // 如果没有提供 order，获取当前最大 order 并加 1
  let order = article.order;
  if (order === undefined) {
    const lastArticle = await articleDb.find(
      { categoryId: article.categoryId },
      { sort: { order: -1 }, limit: 1 }
    );
    order = (lastArticle[0]?.order || 0) + 1;
  }

  const articleToInsert: Omit<Article, '_id'> = {
    ...article,
    order: Number(order),
    likes: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await articleDb.insertOne(articleToInsert);

  return successResponse({
    _id: result._id?.toString(),
    ...articleToInsert,
  }, '文章创建成功');
});

/**
 * 获取文章列表或单篇文章
 */
export const GET = withErrorHandler<[Request], Article | PaginatedArticles>(async (request: Request) => {
  const params = createApiParams(request);
  // 获取参数
  const id = params.getObjectId("id");
  const status = params.getString("status");
  const categoryId = params.getString("categoryId");
  const sortBy = params.getString("sortBy") || 'latest';
  const { page, limit } = params.getPagination();

  // 如果有 ID，获取单篇文章
  if (id) {
    const article = await articleDb.findById(id);
    if (!article) {
      throw ApiErrors.ARTICLE_NOT_FOUND();
    }

    return successResponse<Article>(article, '获取文章成功');
  }

  // 否则获取文章列表
  const query: Partial<ArticleDocument> = {};
  if (status) {
    query.status = status as ArticleStatus;
  }
  if (categoryId) {
    query.categoryId = categoryId as string;
  }

  // 根据排序类型设置排序规则
  let sortOptions: any;
  if (sortBy === 'order') {
    // 按 order 字段排序，主要用于分类内的自定义排序
    sortOptions = {
      order: 1,
      createdAt: -1,
      _id: -1
    };
  } else {
    // 默认按最新时间排序，主要用于首页展示
    sortOptions = {
      createdAt: -1,
      _id: -1
    };
  }

  const paginatedData = await articleDb.paginate(query, {
    page,
    limit,
    sort: sortOptions
  });

  return successResponse<PaginatedArticles>(paginatedData, '获取文章列表成功');
});

// 更新文章
export const PUT = withErrorHandler(async (request: Request) => {
  const params = createApiParams(request);
  const id = params.getRequiredObjectId("id");
  const article = await parseRequestBody(request);

  // 验证必需字段
  RequestValidator.validateRequired(article, ['title', 'content']);
  RequestValidator.validateObjectIds(article, ['categoryId']);
  if (article.order !== undefined) {
    RequestValidator.validateNumbers(article, ['order']);
  }

  const articleToUpdate: Partial<ArticleDocument> = {
    ...RequestValidator.sanitize(article, ['title', 'content', 'categoryId', 'order', 'status']),
    updatedAt: new Date().toISOString(),
  };

  if (article.order !== undefined) {
    articleToUpdate.order = Number(article.order);
  }

  const result = await articleDb.updateById(id, { $set: articleToUpdate as UpdateFilter<DbDocument> });

  if (result.matchedCount === 0) {
    throw ApiErrors.ARTICLE_NOT_FOUND();
  }

  return successResponse<Article>({
    _id: id,
    ...article,
  }, '文章更新成功');
});

// 删除文章
export const DELETE = withErrorHandler(async (request: Request) => {
  const params = createApiParams(request);
  const id = params.getRequiredObjectId("id");

  const result = await articleDb.deleteById(id);

  if (result.deletedCount === 0) {
    throw ApiErrors.ARTICLE_NOT_FOUND();
  }

  return successResponse(null, '文章删除成功');
});
