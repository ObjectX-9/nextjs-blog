import { IExternalArticle, PaginatedExternalArticles, ExternalArticleQueryParams } from '@/app/model/external-article';

class ExternalArticlesService {
  private baseUrl = '/api/external-articles';

  /**
   * 获取外部文章列表
   */
  async getExternalArticles(params: ExternalArticleQueryParams = {}): Promise<PaginatedExternalArticles> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '获取外部文章列表失败');
    }
    
    return result.data;
  }

  /**
   * 获取单篇外部文章
   */
  async getExternalArticle(id: string): Promise<IExternalArticle> {
    const response = await fetch(`${this.baseUrl}?id=${id}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '获取外部文章失败');
    }
    
    return result.data;
  }

  /**
   * 创建外部文章
   */
  async createExternalArticle(article: Omit<IExternalArticle, '_id' | 'createdAt' | 'updatedAt'>): Promise<IExternalArticle> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(article),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '创建外部文章失败');
    }
    
    return result.data;
  }

  /**
   * 更新外部文章
   */
  async updateExternalArticle(id: string, article: Partial<IExternalArticle>): Promise<IExternalArticle> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(article),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '更新外部文章失败');
    }
    
    return result.data;
  }

  /**
   * 删除外部文章
   */
  async deleteExternalArticle(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '删除外部文章失败');
    }
  }
}

export const externalArticlesService = new ExternalArticlesService();
