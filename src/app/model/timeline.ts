import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineLink extends Document {
  text: string;
  url: string;
}

export interface ITimelineEvent extends Document {
  year: number;
  month: number;
  title: string;
  location?: string;
  description: string;
  tweetUrl?: string;
  imageUrl?: string;
  links?: ITimelineLink[];
}

const timelineLinkSchema = new Schema<ITimelineLink>({
  text: { type: String, required: true },
  url: { type: String, required: true }
});

const timelineEventSchema = new Schema<ITimelineEvent>({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  title: { type: String, required: true },
  location: { type: String },
  description: { type: String, required: true },
  tweetUrl: { type: String },
  imageUrl: { type: String },
  links: [timelineLinkSchema]
}, {
  timestamps: true
});

export const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model<ITimelineEvent>('TimelineEvent', timelineEventSchema);
