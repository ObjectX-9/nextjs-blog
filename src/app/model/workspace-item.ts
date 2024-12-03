import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceItem extends Document {
  id: number;
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

const workspaceItemSchema = new Schema<IWorkspaceItem>({
  id: { type: Number, required: true, unique: true },
  product: { type: String, required: true },
  specs: { type: String, required: true },
  buyAddress: { type: String, required: true },
  buyLink: { type: String, required: true }
}, {
  timestamps: true
});

export const WorkspaceItem = mongoose.models.WorkspaceItem || mongoose.model<IWorkspaceItem>('WorkspaceItem', workspaceItemSchema);
