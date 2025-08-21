export enum ProjectRequirementsStatus {
    /**
     * 待办
     */
    TODO = "todo",
    /**
     * 进行中
     */
    IN_PROGRESS = "in_progress",
    /**
     * 已完成
     */
    COMPLETED = "completed",
    /**
     * 已延期
     */
    DELAYED = "delayed",
    /**
     * 已取消
     */
    CANCELLED = "cancelled",
    /**
     * 已删除
     */
    DELETED = "deleted",
    /**
     * 已归档
     */
    ARCHIVED = "archived",
}

export enum ProjectRequirementsType {
    work = "work",
    personal = "personal",
}

export enum ProjectRequirementsDifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
    VERY_HARD = "very_hard",
}

export interface IProjectRequirements {
    _id?: string;
    /**
     * 标题
     */
    title: string;
    /**
     * 描述
     */
    description: string;
    /**
     * 状态
     */
    status: ProjectRequirementsStatus;

    /**
     * 需求类型：工作中的，自己的的
     */
    type: ProjectRequirementsType;

    /**
     * 起始时间
     */
    startDate?: Date;

    /**
     * 结束时间
     */
    endDate?: Date;

    /**
     * 颜色标记
     */
    color?: string;

    /**
     * 创建时间
     */
    createdAt?: Date;
    /**
     * 更新时间
     */
    updatedAt?: Date;

    /**
     * 涉及技术栈：用stacks中的
     */
    techStack?: string[];

    /**
     * todos：用todos中的
     */
    todos?: string[];

    /**
     * 难点
     */
    difficulty?: string;

    /**
     * 技术方案详情oss路径
     */
    techSolutionOssPath?: string;

    /**
     * 反思笔记oss路径
     */
    reflectionOssPath?: string;

    /**
     * 难度级别
     */
    difficultyLevel?: number;

    /**
     * 关联技术文档
     */
    relatedDocs?: {
        type: 'article' | 'url';
        value: string; // 文章ID或URL
        title: string; // 显示标题
    }[];

    /**
     * 关联github仓库
     */
    relatedGithubRepos?: {
        repoName: string;
        repoUrl: string;
    }[];
} 