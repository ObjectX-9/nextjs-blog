import { createDbHelper } from "@/utils/db-helpers";
import { ArticleDocument } from "@/app/model/article";
import { ISocialLink } from "@/app/model/social-link";
import { IWorkExperience } from "@/app/model/work-experience";
import { IStack } from "@/app/model/stack";

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
// 文章
export const articleDb = createDbHelper<ArticleDocument>("articles");

// 文章分类
export const articleCategoryDb = createDbHelper<IArticleCategory>("articleCategories");

// 社交链接
export const socialLinkDb = createDbHelper<ISocialLink>("socialLinks");

// 工作经历
export const workExperienceDb = createDbHelper<IWorkExperience>("workExperiences");

// 技术栈
export const stackDb = createDbHelper<IStack>("stacks");
