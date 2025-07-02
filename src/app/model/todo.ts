import mongoose, { Schema } from "mongoose";
import { ITodo, TodoStatus } from "./types/todo";

const todoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    startDate: { type: Date },
    dueDate: { type: Date },
    priority: { type: Number, min: 1, max: 5, default: 3 },
    subTasks: [{
      taskId: { type: String }
    }],
    projectId: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
  },
  { timestamps: true }  // 自动添加 createdAt 和 updatedAt 字段
);

export const Todo =
  (mongoose.models && mongoose.models.Todo) || mongoose.model<ITodo>("Todo", todoSchema);

// 重新导出类型定义，保持向后兼容
export type { ITodo } from "./types/todo";
export { TodoStatus } from "./types/todo";
