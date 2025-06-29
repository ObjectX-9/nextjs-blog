import mongoose, { Schema, Document } from "mongoose";

// 前端使用的接口，符合 FrontendDocument 约束
export interface IWorkspaceItem {
  _id?: string;
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
  createdAt?: string;
  updatedAt?: string;
}

// mongoose 文档接口
export interface IWorkspaceItemDocument extends Document {
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

const workspaceItemSchema = new Schema<IWorkspaceItemDocument>(
  {
    product: { type: String, required: true },
    specs: { type: String, required: true },
    buyAddress: { type: String, required: true },
    buyLink: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const WorkspaceItem =
  mongoose.models.WorkspaceItem ||
  mongoose.model<IWorkspaceItemDocument>("WorkspaceItem", workspaceItemSchema);
