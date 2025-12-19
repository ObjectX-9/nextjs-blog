import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface ITravelImage {
    url: string;
    caption?: string;
}

export interface ITravelVideo {
    url: string;
    title?: string;
    thumbnail?: string; // 视频缩略图
    isDouyin?: boolean; // 是否是抖音链接
}

// 前端使用的接口，符合 FrontendDocument 约束
export interface ITravelRecord {
    _id?: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD 格式
    destination?: string; // 目的地
    weather?: string; // 天气情况
    companions?: string[]; // 同行人员
    transportation?: string; // 交通方式
    cost?: number; // 费用
    rating?: number; // 评分 1-5
    images?: ITravelImage[]; // 多个图片
    videos?: ITravelVideo[]; // 多个视频
    tags?: string[]; // 标签
    isAdminOnly?: boolean; // 是否仅管理员可见
    createdAt?: string;
    updatedAt?: string;
}

// 数据库接口（用于 MongoDB）
export interface ITravelRecordDocument {
    _id?: ObjectId;
    title: string;
    description: string;
    date: Date;
    destination?: string;
    weather?: string;
    companions?: string[];
    transportation?: string;
    cost?: number;
    rating?: number;
    images?: ITravelImage[];
    videos?: ITravelVideo[];
    tags?: string[];
    isAdminOnly?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const travelImageSchema = new Schema<ITravelImage>({
    url: { type: String, required: true },
    caption: { type: String }
});

const travelVideoSchema = new Schema<ITravelVideo>({
    url: { type: String, required: true },
    title: { type: String },
    thumbnail: { type: String }, // 视频缩略图
    isDouyin: { type: Boolean, default: false } // 是否是抖音链接
});

const travelRecordSchema = new Schema<ITravelRecordDocument>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    destination: { type: String }, // 目的地
    weather: { type: String }, // 天气情况
    companions: [{ type: String }], // 同行人员
    transportation: { type: String }, // 交通方式
    cost: { type: Number }, // 费用
    rating: { type: Number, min: 1, max: 5 }, // 评分 1-5
    images: [travelImageSchema], // 多个图片
    videos: [travelVideoSchema], // 多个视频
    tags: [{ type: String }], // 标签
    isAdminOnly: { type: Boolean, default: false } // 是否仅管理员可见，默认false
}, {
    timestamps: true
});

export const TravelRecord = (mongoose.models && mongoose.models.TravelRecord) || mongoose.model<ITravelRecordDocument>('TravelRecord', travelRecordSchema); 