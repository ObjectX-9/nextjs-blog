import mongoose, { Schema } from "mongoose";

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
}

const projectRequirementsSchema = new Schema<IProjectRequirements>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    color: { type: String, trim: true },
    techStack: [{ type: String }],
    todos: [{ type: String }],
    difficulty: { type: String, trim: true },
    techSolutionOssPath: { type: String, trim: true },
    reflectionOssPath: { type: String, trim: true },
    difficultyLevel: { type: Number, min: 1, max: 4, default: 2 },
  },
  { timestamps: true }  // 自动添加 createdAt 和 updatedAt 字段
);

export const ProjectRequirements =
  (mongoose.models && mongoose.models.ProjectRequirements) || mongoose.model<IProjectRequirements>("ProjectRequirements", projectRequirementsSchema);
