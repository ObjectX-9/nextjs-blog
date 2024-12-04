import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceItem extends Document {
  _id?: string;  // 使用可选的 _id
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

const workspaceItemSchema = new Schema<IWorkspaceItem>(
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
  mongoose.model<IWorkspaceItem>("WorkspaceItem", workspaceItemSchema);
