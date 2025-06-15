import { createDbHelper } from "@/utils/db-helpers";
import { ArticleDocument } from "@/app/model/article";

// 文章分类接口
export interface IArticleCategory {
    _id?: string;
    name: string;
    order: number;
    description?: string;
    isTop?: boolean;
    status?: 'completed' | 'in_progress';
    createdAt: string;
    updatedAt: string;
}

// 数据库实例
export const articleDb = createDbHelper<ArticleDocument>("articles");
export const articleCategoryDb = createDbHelper<IArticleCategory>("articleCategories"); 