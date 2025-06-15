import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLinkBase {
  name: string;
  icon: string;
  url: string;
  bgColor: string;
}

export interface ISocialLink extends ISocialLinkBase {
  _id: string;
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
