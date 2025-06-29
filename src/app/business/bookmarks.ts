import { request } from "@/utils/request";
import { IBookmark, IBookmarkCategory, BookmarkCountByCategory } from "../model/bookmark";

interface BookmarkParams {
    categoryId?: string;
}

class BookmarksBusiness {
    /**
     * 获取收藏夹列表
     * @param params 查询参数，可按分类过滤
     */
    async getBookmarks(params?: BookmarkParams): Promise<IBookmark[]> {
        const queryString = params?.categoryId ? `?categoryId=${params.categoryId}` : '';
        const response = await request.get<{ bookmarks: IBookmark[] }>(`bookmarks${queryString}`);
        return response.data.bookmarks;
    }

    /**
     * 创建收藏夹
     */
    async createBookmark(bookmark: Omit<IBookmark, '_id' | 'createdAt' | 'updatedAt'>): Promise<IBookmark> {
        const response = await request.post<{ bookmark: IBookmark }>('bookmarks', bookmark);
        return response.data.bookmark;
    }

    /**
     * 更新收藏夹
     */
    async updateBookmark(bookmark: IBookmark): Promise<IBookmark> {
        const response = await request.put<{ bookmark: IBookmark }>('bookmarks', bookmark);
        return response.data.bookmark;
    }

    /**
     * 删除收藏夹
     */
    async deleteBookmark(id: string): Promise<any> {
        const response = await request.delete<{ bookmark: any }>(`bookmarks?id=${id}`);
        return response.data.bookmark;
    }

    /**
     * 根据 ID 获取单个收藏夹
     */
    async getBookmarkById(id: string): Promise<IBookmark | null> {
        try {
            const allBookmarks = await this.getBookmarks();
            return allBookmarks.find(bookmark => bookmark._id === id) || null;
        } catch (error) {
            console.error('Error fetching bookmark by ID:', error);
            return null;
        }
    }

    /**
     * 根据分类获取收藏夹
     */
    async getBookmarksByCategory(categoryId: string): Promise<IBookmark[]> {
        return this.getBookmarks({ categoryId });
    }

    /**
     * 批量创建收藏夹
     */
    async createBookmarks(bookmarks: Omit<IBookmark, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<IBookmark[]> {
        const createdBookmarks: IBookmark[] = [];

        for (const bookmark of bookmarks) {
            try {
                const createdBookmark = await this.createBookmark(bookmark);
                createdBookmarks.push(createdBookmark);
            } catch (error) {
                console.error('Error creating bookmark:', error);
                // 可以选择是否继续处理其他收藏夹
            }
        }

        return createdBookmarks;
    }

    /**
     * 搜索收藏夹
     */
    async searchBookmarks(keyword: string): Promise<IBookmark[]> {
        const allBookmarks = await this.getBookmarks();

        if (!keyword.trim()) {
            return allBookmarks;
        }

        const lowerKeyword = keyword.toLowerCase();
        return allBookmarks.filter(bookmark =>
            bookmark.title.toLowerCase().includes(lowerKeyword) ||
            bookmark.description.toLowerCase().includes(lowerKeyword) ||
            bookmark.url.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * 获取收藏夹分类列表
     */
    async getBookmarkCategories(): Promise<IBookmarkCategory[]> {
        const response = await request.get<{ categories: IBookmarkCategory[] }>('bookmarks/categories');
        return response.data.categories;
    }

    /**
     * 获取收藏夹分类统计
     */
    async getBookmarkCategoryStats(): Promise<BookmarkCountByCategory[]> {
        const response = await request.get<BookmarkCountByCategory[]>('bookmarks/categories/stats');
        return response.data;
    }

    /**
     * 创建收藏夹分类
     */
    async createBookmarkCategory(category: Omit<IBookmarkCategory, '_id' | 'bookmarks' | 'createdAt' | 'updatedAt'>): Promise<IBookmarkCategory> {
        const response = await request.post<{ category: IBookmarkCategory }>('bookmarks/categories', category);
        return response.data.category;
    }

    /**
     * 更新收藏夹分类
     */
    async updateBookmarkCategory(category: Omit<IBookmarkCategory, 'bookmarks'>): Promise<IBookmarkCategory> {
        const response = await request.put<{ category: IBookmarkCategory }>('bookmarks/categories', category);
        return response.data.category;
    }

    /**
     * 删除收藏夹分类
     */
    async deleteBookmarkCategory(id: string): Promise<any> {
        const response = await request.delete<{ category: any }>(`bookmarks/categories?id=${id}`);
        return response.data.category;
    }

    /**
     * 获取收藏夹统计信息
     */
    async getBookmarkStats(): Promise<{
        total: number;
        categoriesCount: number;
        recentCount: number;
    }> {
        try {
            const [bookmarks, categories] = await Promise.all([
                this.getBookmarks(),
                this.getBookmarkCategories()
            ]);

            // 计算最近7天的收藏夹数量
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const recentCount = bookmarks.filter(bookmark => {
                if (!bookmark.createdAt) return false;
                const createdDate = new Date(bookmark.createdAt);
                return createdDate >= sevenDaysAgo;
            }).length;

            return {
                total: bookmarks.length,
                categoriesCount: categories.length,
                recentCount
            };
        } catch (error) {
            console.error('Error fetching bookmark stats:', error);
            return {
                total: 0,
                categoriesCount: 0,
                recentCount: 0
            };
        }
    }

    /**
     * 获取详细的分类统计信息（包含每个分类的收藏夹数量）
     */
    async getDetailedCategoryStats(): Promise<{
        categoryStats: BookmarkCountByCategory[];
        totalBookmarks: number;
        totalCategories: number;
        averageBookmarksPerCategory: number;
        topCategories: { name: string; count: number }[];
    }> {
        try {
            const categoryStats = await this.getBookmarkCategoryStats();
            const totalBookmarks = categoryStats.reduce((sum, stat) => sum + stat.count, 0);
            const totalCategories = categoryStats.length;
            const averageBookmarksPerCategory = totalCategories > 0 ? Math.round(totalBookmarks / totalCategories * 100) / 100 : 0;

            // 获取前3个收藏夹最多的分类
            const topCategories = categoryStats
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map(stat => ({
                    name: stat.categoryName,
                    count: stat.count
                }));

            return {
                categoryStats,
                totalBookmarks,
                totalCategories,
                averageBookmarksPerCategory,
                topCategories
            };
        } catch (error) {
            console.error('Error fetching detailed category stats:', error);
            return {
                categoryStats: [],
                totalBookmarks: 0,
                totalCategories: 0,
                averageBookmarksPerCategory: 0,
                topCategories: []
            };
        }
    }
}

export const bookmarksBusiness = new BookmarksBusiness(); 