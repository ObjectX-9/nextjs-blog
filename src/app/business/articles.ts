import { request } from "@/utils/request";
import { Article, ArticleCountByCategory, PaginatedArticles } from "../model/article";
interface GetArticlesParams {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  search?: string;
  sortBy?: 'latest' | 'order';
}
class ArticlesBusiness {
  /**
   * 创建新文章
   */
  async createArticle(article: Omit<Article, '_id'>): Promise<Article> {
    const response = await request.post<Article>('articles', article);
    return response.data;
  }

  /**
   * 获取文章列表
   */
  async getArticles(
    params: GetArticlesParams
  ): Promise<PaginatedArticles> {

    const { page = 1, limit = 10, status, categoryId, sortBy = 'latest', search } = params;

    // 调试信息：确认传入的参数
    console.log('🌐 articlesService.getArticles 接收到的参数:', params);

    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (status) {
      queryParams.status = status;
    }

    if (categoryId) {
      queryParams.categoryId = categoryId;
    }

    if (sortBy) {
      queryParams.sortBy = sortBy;
    }

    if (search) {
      queryParams.search = search;
    }

    console.log('🌐 发送的查询参数:', queryParams);

    const response = await request.get<PaginatedArticles>('articles', {
      ...queryParams,
    });

    console.log('🌐 API返回数据:', {
      itemsCount: response.data.items?.length || 0,
      pagination: response.data.pagination
    });

    return response.data;
  }

  /**
   * 获取单篇文章
   */
  async getArticle(id: string): Promise<Article> {
    const response = await request.get<Article>(`articles`, {
      id,
    });
    return response.data;
  }

  /**
   * 更新文章
   */
  async updateArticle(id: string, article: Partial<Article>): Promise<Article> {
    const response = await request.put<Article>(`articles?id=${id}`, article);
    return response.data;
  }

  /**
   * 删除文章
   */
  async deleteArticle(id: string): Promise<void> {
    const response = await request.delete<void>(`articles?id=${id}`);
    return response.data;
  }

  /**
   * 获取每个分类的文章数量
   */
  async getArticleCountByCategory(): Promise<ArticleCountByCategory[]> {
    // 直接调用统计API，避免获取大量文章数据
    const response = await request.get<ArticleCountByCategory[]>('articles/categories/stats');
    return response.data;
  }

  /**
   * 更新文章浏览量
   */
  async updateArticleViews(id: string): Promise<void> {
    console.log("✅ ~ id:", id)
    const response = await request.post<void>(`articles/${id}/view`);
    return response.data;
  }

  /**
   * 更新文章点赞数
   */
  async updateArticleLikes(id: string): Promise<void> {
    const response = await request.patch<void>(`articles/${id}/like`);
    return response.data;
  }
}

export const articlesService = new ArticlesBusiness();