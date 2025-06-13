import { request } from "@/utils/request";
import { Article, ArticleCategory, PaginatedArticles } from "../model/article";

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
    page: number,
    limit: number,
    status?: string,
    categoryId?: string,
    sortBy: 'latest' | 'order' = 'latest'
  ): Promise<PaginatedArticles> {
    const params: any = {
      page: page,
      limit: limit,
    };

    if (status) {
      params.status = status;
    }

    if (categoryId) {
      params.categoryId = categoryId;
    }

    if (sortBy) {
      params.sortBy = sortBy;
    }

    const response = await request.get<PaginatedArticles>('articles', params);
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
   * 获取每个分类的文章数量（优化版本）
   */
  async getArticleCountByCategory(): Promise<{ categoryId: string, categoryName: string, count: number }[]> {
    // 直接调用统计API，避免获取大量文章数据
    const response = await request.get<{ categoryId: string, categoryName: string, count: number }[]>('articles/categories/stats');
    return response.data;
  }
}

export const articlesService = new ArticlesBusiness();