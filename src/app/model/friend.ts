import mongoose, { Schema, Document } from 'mongoose';

export interface IFriend extends Document {
  avatar: string;
  name: string;
  title: string;
  description: string;
  link: string;
  position?: string;
  location?: string;
  isApproved: boolean;
}

const friendSchema = new Schema<IFriend>({
  avatar: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  position: { type: String },
  location: { type: String },
  isApproved: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Friend = (mongoose.models && mongoose.models.Friend) || mongoose.model<IFriend>('Friend', friendSchema);
