import { request } from "@/utils/request";
import { Article, ArticleCategory, ArticleCountByCategory, ArticleStatus, PaginatedArticles } from "../model/article";
interface GetArticlesParams {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
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

    const { page = 1, limit = 0, status, categoryId, sortBy = 'latest' } = params;

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

    const response = await request.get<PaginatedArticles>('articles', {
      ...queryParams,
    });
    return response.data;
  }

  /**
   * 获取单篇文章
   */
  async getArticle(id: string): Promise<Article> {
    const response = await request.get<Article>(`articles/${id}`);
    return response.data;
  }

  /**
   * 更新文章
   */
  async updateArticle(id: string, article: Partial<Article>): Promise<Article> {
    const response = await request.put<Article>(`articles/${id}`, article);
    return response.data;
  }

  /**
   * 删除文章
   */
  async deleteArticle(id: string): Promise<void> {
    const response = await request.delete<void>(`articles/${id}`);
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
}

export const articlesService = new ArticlesBusiness();