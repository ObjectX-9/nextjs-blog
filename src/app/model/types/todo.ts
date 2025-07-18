export enum TodoStatus {
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

export interface ITodo {
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
    status: TodoStatus;

    /**
     * 起始时间
     */
    startDate?: Date;

    /**
     * 截止日期
     */
    dueDate?: Date;
    /**
     * 优先级 (1-5，5为最高)
     */
    priority?: number;

    /**
     * 子任务列表
     */
    subTasks?: Array<{
        taskId?: string;
    }>;

    /**
     * 所属项目/工作区ID，用项目中的projectId
     */
    projectId?: string;

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
} 