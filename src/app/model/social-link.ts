import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink extends Document {
  name: string;
  icon: string;
  url: string;
  bgColor: string;
}

const socialLinkSchema = new Schema<ISocialLink>({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  url: { type: String, required: true },
  bgColor: { type: String, required: true }
}, {
  timestamps: true
});

export const SocialLink = mongoose.models.SocialLink || mongoose.model<ISocialLink>('SocialLink', socialLinkSchema);
