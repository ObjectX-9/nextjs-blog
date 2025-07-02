import mongoose, { Schema } from "mongoose";
import {
  IProjectRequirements,
  ProjectRequirementsStatus,
  ProjectRequirementsType,
  ProjectRequirementsDifficultyLevel
} from "./types/project-requirements";

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
    relatedDocs: [{
      type: { type: String, enum: ['article', 'url'], required: true },
      value: { type: String, required: true, trim: true },
      title: { type: String, required: true, trim: true }
    }],
  },
  { timestamps: true }  // 自动添加 createdAt 和 updatedAt 字段
);

export const ProjectRequirements =
  (mongoose.models && mongoose.models.ProjectRequirements) || mongoose.model<IProjectRequirements>("ProjectRequirements", projectRequirementsSchema);

// 重新导出类型定义，保持向后兼容
export type { IProjectRequirements } from "./types/project-requirements";
export {
  ProjectRequirementsStatus,
  ProjectRequirementsType,
  ProjectRequirementsDifficultyLevel
} from "./types/project-requirements";
