import mongoose, { Schema } from "mongoose";
import { Tags } from 'exiftool-vendored'

// 影调分析结果接口
export interface ImageAnalysisResult {
  dimensions: {
    width: number;
    height: number;
  };
  brightness: {
    average: number;
    min: number;
    max: number;
    histogram: number[];
    rgbHistograms: {
      red: number[];
      green: number[];
      blue: number[];
    };
  };
  toneAnalysis: {
    type: string;
    confidence: number;
    shadowRatio: number;
    midtoneRatio: number;
    highlightRatio: number;
    factors: string[];
    notation: string;
    zones: {
      low: number;
      mid: number;
      high: number;
    };
  };
}

export interface IPhoto {
  _id?: string;
  src: string;
  width: number;
  height: number;
  title: string;
  location: string;
  date: string;
  exif?: Tags & {
    ExposureCompensation?: number;
  };
  imageAnalysis?: ImageAnalysisResult; // 新增影调分析字段
  createdAt?: string;
  updatedAt?: string;
}

const photoSchema = new Schema<IPhoto>(
  {
    src: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    exif: { type: Schema.Types.Mixed },  // 使用Mixed类型存储任意EXIF数据
    imageAnalysis: { type: Schema.Types.Mixed }, // 新增影调分析字段
  },
  {
    timestamps: true,
  }
);

export const Photo =
  (mongoose.models && mongoose.models.Photo) || mongoose.model<IPhoto>("Photo", photoSchema);
