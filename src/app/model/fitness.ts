import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IFitnessImage {
    url: string;
    caption?: string;
}

export interface IFitnessVideo {
    url: string;
    title?: string;
    thumbnail?: string; // 视频缩略图
    isDouyin?: boolean; // 是否是抖音链接，需要解析
}

// 前端使用的接口，符合 FrontendDocument 约束
export interface IFitnessRecord {
    _id?: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD 格式
    images?: IFitnessImage[]; // 多个图片
    videos?: IFitnessVideo[]; // 多个视频
    isAdminOnly?: boolean; // 是否仅管理员可见
    createdAt?: string;
    updatedAt?: string;
}

// 数据库接口（用于 MongoDB）
export interface IFitnessRecordDocument {
    _id?: ObjectId;
    title: string;
    description: string;
    date: Date;
    images?: IFitnessImage[];
    videos?: IFitnessVideo[];
    isAdminOnly?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const fitnessImageSchema = new Schema<IFitnessImage>({
    url: { type: String, required: true },
    caption: { type: String }
});

const fitnessVideoSchema = new Schema<IFitnessVideo>({
    url: { type: String, required: true },
    title: { type: String },
    thumbnail: { type: String }, // 视频缩略图
    isDouyin: { type: Boolean, default: false } // 是否是抖音链接
});

const fitnessRecordSchema = new Schema<IFitnessRecordDocument>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    images: [fitnessImageSchema], // 多个图片
    videos: [fitnessVideoSchema], // 多个视频
    isAdminOnly: { type: Boolean, default: false } // 是否仅管理员可见，默认false
}, {
    timestamps: true
});

export const FitnessRecord = (mongoose.models && mongoose.models.FitnessRecord) || mongoose.model<IFitnessRecordDocument>('FitnessRecord', fitnessRecordSchema); 