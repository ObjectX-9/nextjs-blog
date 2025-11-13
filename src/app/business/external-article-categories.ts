import { IExternalArticleCategory, ExternalArticleCountByCategory } from '@/app/model/external-article';

class ExternalArticleCategoriesService {
  private baseUrl = '/api/external-articles/categories';

  /**
   * 获取外部文章分类列表
   */
  async getCategories(): Promise<IExternalArticleCategory[]> {
    const response = await fetch(this.baseUrl);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '获取外部文章分类失败');
    }
    
    return result.data;
  }

  /**
   * 获取带文章数量的分类统计
   */
  async getCategoriesWithCount(): Promise<ExternalArticleCountByCategory[]> {
    const response = await fetch(`${this.baseUrl}?withCount=true`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '获取外部文章分类统计失败');
    }
    
    return result.data;
  }

  /**
   * 创建外部文章分类
   */
  async createCategory(category: Omit<IExternalArticleCategory, '_id' | 'createdAt' | 'updatedAt'>): Promise<IExternalArticleCategory> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '创建外部文章分类失败');
    }
    
    return result.data;
  }

  /**
   * 更新外部文章分类
   */
  async updateCategory(id: string, category: Partial<IExternalArticleCategory>): Promise<IExternalArticleCategory> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '更新外部文章分类失败');
    }
    
    return result.data;
  }

  /**
   * 删除外部文章分类
   */
  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '删除外部文章分类失败');
    }
  }
}

export const externalArticleCategoriesService = new ExternalArticleCategoriesService();
