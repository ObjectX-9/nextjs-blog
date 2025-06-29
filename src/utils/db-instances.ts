import { createDbHelper } from "@/utils/db-helpers";
import { ArticleDocument } from "@/app/model/article";
import { ISocialLink } from "@/app/model/social-link";
import { IWorkExperience } from "@/app/model/work-experience";
import { IStack } from "@/app/model/stack";
import { IInspiration } from "@/app/model/inspiration";
import { IPhoto } from "@/app/model/photo";
import { Captcha } from "@/app/model/captcha";
import { ISite } from "@/app/model/site";
import { IWorkspaceItem } from "@/app/model/workspace-item";

// 文章分类接口
export interface IArticleCategory {
    _id?: string;
    name: string;
    order: number;
    description?: string;
    isTop?: boolean;
    status?: 'completed' | 'in_progress';
    isAdminOnly?: boolean;
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

export const inspirationDb = createDbHelper<IInspiration>("inspirations");

// 照片
export const photoDb = createDbHelper<IPhoto>("photos");

// 验证码
export const captchaDb = createDbHelper<Captcha>("captchas");

// 站点设置
export const siteDb = createDbHelper<ISite>("sites");

// 工作空间物品
export const workspaceItemDb = createDbHelper<IWorkspaceItem>("workspaceItems");