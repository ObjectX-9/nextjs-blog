import mongoose, { Schema, Document } from 'mongoose';

export interface IStack {
  _id?: string;
  title: string;
  description: string;
  link: string;
  iconSrc: string;
}

const stackSchema = new Schema<IStack>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  iconSrc: { type: String, required: true }
}, {
  timestamps: true
});

export const Stack = (mongoose.models && mongoose.models.Stack) || mongoose.model<IStack>('Stack', stackSchema);
