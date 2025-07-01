import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface ITimelineLink {
  text: string;
  url: string;
}

// 前端使用的接口，符合 FrontendDocument 约束
export interface ITimelineEvent {
  _id?: string;
  year: number;
  month: number;
  day: number;
  title: string;
  location?: string;
  description: string;
  ossPath?: string; // OSS存储路径，存储markdown文件
  tweetUrl?: string;
  imageUrl?: string;
  links?: ITimelineLink[];
  isAdminOnly?: boolean; // 是否仅管理员可见
  createdAt?: string;
  updatedAt?: string;
}

// 数据库接口（用于 MongoDB）
export interface ITimelineEventDocument {
  _id?: ObjectId;
  year: number;
  month: number;
  day: number;
  title: string;
  location?: string;
  description: string;
  ossPath?: string; // OSS存储路径，存储markdown文件
  tweetUrl?: string;
  imageUrl?: string;
  links?: ITimelineLink[];
  isAdminOnly?: boolean; // 是否仅管理员可见
  createdAt?: Date;
  updatedAt?: Date;
}

const timelineLinkSchema = new Schema<ITimelineLink>({
  text: { type: String, required: true },
  url: { type: String, required: true }
});

const timelineEventSchema = new Schema<ITimelineEvent>({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  day: { type: Number, required: true },
  title: { type: String, required: true },
  location: { type: String },
  description: { type: String, required: true },
  ossPath: { type: String }, // OSS存储路径，存储markdown文件
  tweetUrl: { type: String },
  imageUrl: { type: String },
  links: [timelineLinkSchema],
  isAdminOnly: { type: Boolean, default: false } // 是否仅管理员可见，默认false
}, {
  timestamps: true
});

export const TimelineEvent = (mongoose.models && mongoose.models.TimelineEvent) || mongoose.model<ITimelineEvent>('TimelineEvent', timelineEventSchema);
