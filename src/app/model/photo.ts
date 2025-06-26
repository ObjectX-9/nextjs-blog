import mongoose, { Schema, Document } from "mongoose";
import { ObjectId } from "mongodb";

// GPS 位置信息接口
export interface IGPSData {
  latitude?: number;         // 纬度
  longitude?: number;        // 经度
  altitude?: number;         // 海拔
  direction?: number;        // 拍摄方向
  locationName?: string;     // 地点名称
}

// 技术参数接口
export interface ITechnicalData {
  brightness?: string;       // 亮度值
  exposureMode?: string;     // 曝光模式
  meteringMode?: string;     // 测光模式
  focusMode?: string;        // 对焦模式
  sceneMode?: string;        // 场景模式
  digitalZoom?: number;      // 数字变焦
  compression?: string;      // 压缩方式
  resolution?: string;       // 分辨率单位
  colorProfile?: string;     // 色彩配置文件
}

// 直方图数据接口
export interface IHistogramData {
  red: number[];      // R通道直方图 (256个值)
  green: number[];    // G通道直方图 (256个值)
  blue: number[];     // B通道直方图 (256个值)
  luminance: number[]; // 亮度直方图 (256个值)
}

// 影调分析数据接口
export interface IToneAnalysis {
  toneType: string;        // 影调类型：正常/高调/低调/平调/高对比
  brightness: number;      // 亮度百分比 (0-100)
  contrast: number;        // 对比度百分比 (0-100)
  shadowRatio: number;     // 阴影占比 (0-100)
  highlightRatio: number;  // 高光占比 (0-100)
  histogram: IHistogramData; // 完整直方图数据
}

// 图像分析数据接口
export interface IImageAnalysis {
  dominantColors?: string[]; // 主色调
  averageBrightness?: number; // 平均亮度
  contrast?: number;         // 对比度
  saturation?: number;       // 饱和度
  sharpness?: number;        // 清晰度评分
  faces?: number;            // 检测到的人脸数量
  objects?: string[];        // 识别的物体
  scene?: string;            // 场景分类

  // 新增：完整影调分析数据
  toneAnalysis?: IToneAnalysis;
}

// 扩展的EXIF信息接口
export interface IExifData {
  // 基础拍摄参数
  camera?: string;           // 相机型号
  lens?: string;            // 镜头型号
  focalLength?: string;     // 焦距
  aperture?: string;        // 光圈值
  shutterSpeed?: string;    // 快门速度
  iso?: number;             // ISO 值
  exposureCompensation?: string; // 曝光补偿
  flash?: string;           // 闪光灯
  whiteBalance?: string;    // 白平衡
  filmSimulation?: string;  // 胶片模拟 (富士)
  colorSpace?: string;      // 色彩空间
  software?: string;        // 编辑软件

  // 扩展技术信息
  cameraSerialNumber?: string; // 相机序列号
  firmware?: string;         // 固件版本
  orientation?: number;      // 图像方向
  xResolution?: number;      // X轴分辨率
  yResolution?: number;      // Y轴分辨率
  resolutionUnit?: string;   // 分辨率单位

  // 拍摄设置
  exposureProgram?: string;  // 曝光程序
  meteringMode?: string;     // 测光模式
  lightSource?: string;      // 光源
  sensingMethod?: string;    // 感光方式
  fileSource?: string;       // 文件来源
  sceneType?: string;        // 场景类型
  customRendered?: string;   // 自定义渲染
  exposureMode?: string;     // 曝光模式
  sceneCaptureType?: string; // 场景捕获类型
  gainControl?: string;      // 增益控制
  contrast?: string;         // 对比度
  saturation?: string;       // 饱和度
  sharpness?: string;        // 锐度

  // 详细元数据
  cameraOwnerName?: string;  // 相机所有者名称
  artist?: string;           // 艺术家/摄影师
  copyright?: string;        // 版权信息
  lensSpecification?: string; // 镜头规格
  subSecTime?: string;       // 亚秒级时间
  subSecTimeOriginal?: string; // 原始亚秒级时间
  subSecTimeDigitized?: string; // 数字化亚秒级时间
  flashPixVersion?: string;  // FlashPix版本
  pixelXDimension?: number;  // 像素X尺寸
  pixelYDimension?: number;  // 像素Y尺寸
  focalPlaneXResolution?: number; // 焦平面X分辨率
  focalPlaneYResolution?: number; // 焦平面Y分辨率
  focalPlaneResolutionUnit?: string; // 焦平面分辨率单位
  exifVersion?: string;      // EXIF版本
  shutterSpeedValue?: number; // 快门速度值
  apertureValue?: number;    // 光圈值
  exposureBiasValue?: number; // 曝光偏差值
  maxApertureValue?: number; // 最大光圈值
  subjectDistance?: number;  // 对象距离
  digitalZoomRatio?: number; // 数字变焦比
  focalLengthIn35mmFilm?: number; // 35mm等效焦距

  // 佳能相机专用字段
  imageQuality?: string;     // 图像质量 (RAW/JPEG等)
  noiseReduction?: string;   // 高ISO降噪
  digitalLensOptimizer?: string; // 数字镜头优化器
  dualPixelRaw?: string;     // 双像素RAW
  canonFocusMode?: string;   // 佳能对焦模式
  canonAFAreaMode?: string;  // 佳能AF区域模式

  // 白平衡和色彩详细信息
  whiteBalanceBias?: string; // 白平衡偏移
  colorTemperature?: string; // 色温
  colorTone?: string;        // 色调设置

  // Picture Style 详细参数
  contrastSetting?: string;  // 对比度设置
  saturationSetting?: string; // 饱和度设置
  sharpnessSetting?: string; // 锐度设置
  brightnessSetting?: string; // 亮度设置

  // 镜头详细信息
  lensInfo?: string;         // 镜头详细信息
  focalRange?: string;       // 镜头焦距范围
  apertureRange?: string;    // 镜头光圈范围
  lensFeatures?: string[];   // 镜头特性 (如：RF镜头, 光学防抖等)
  lensSerialNumber?: string; // 镜头序列号 (从MakerNote解析)

  // 镜头校正
  distortionCorrection?: string;    // 畸变校正
  chromaticAberrationCorrection?: string; // 色差校正
  vignettingCorrection?: string;    // 暗角校正
  peripheralIllumination?: string; // 周边光量校正
}

// 文件元数据接口
export interface IFileMetadata {
  fileName?: string;         // 原始文件名
  fileSize?: number;         // 文件大小(字节)
  mimeType?: string;         // MIME类型
  format?: string;           // 文件格式
  quality?: number;          // 图片质量
  bitDepth?: number;         // 色彩深度
  hasAlpha?: boolean;        // 是否有透明通道
  animated?: boolean;        // 是否为动图
  pages?: number;            // 页数/帧数
}

export interface IPhoto {
  _id?: string;
  src: string;
  width: number;
  height: number;
  title: string;
  location: string;
  date: string;

  // 扩展元数据
  exif?: IExifData;
  gps?: IGPSData;
  technical?: ITechnicalData;
  analysis?: IImageAnalysis;
  fileMetadata?: IFileMetadata;

  // 基础信息
  tags?: string[];          // 标签
  description?: string;     // 详细描述
  photographer?: string;    // 摄影师
  copyright?: string;       // 版权信息
  rating?: number;          // 评分 (1-5)
  favorite?: boolean;       // 是否收藏

  createdAt?: string;
  updatedAt?: string;
}

const gpsSchema = new Schema<IGPSData>({
  latitude: { type: Number },
  longitude: { type: Number },
  altitude: { type: Number },
  direction: { type: Number },
  locationName: { type: String },
}, { _id: false });

const technicalSchema = new Schema<ITechnicalData>({
  brightness: { type: String },
  exposureMode: { type: String },
  meteringMode: { type: String },
  focusMode: { type: String },
  sceneMode: { type: String },
  digitalZoom: { type: Number },
  compression: { type: String },
  resolution: { type: String },
  colorProfile: { type: String },
}, { _id: false });

const histogramSchema = new Schema<IHistogramData>({
  red: [{ type: Number }],
  green: [{ type: Number }],
  blue: [{ type: Number }],
  luminance: [{ type: Number }],
}, { _id: false });

const toneAnalysisSchema = new Schema<IToneAnalysis>({
  toneType: { type: String },
  brightness: { type: Number },
  contrast: { type: Number },
  shadowRatio: { type: Number },
  highlightRatio: { type: Number },
  histogram: { type: histogramSchema },
}, { _id: false });

const analysisSchema = new Schema<IImageAnalysis>({
  dominantColors: [{ type: String }],
  averageBrightness: { type: Number },
  contrast: { type: Number },
  saturation: { type: Number },
  sharpness: { type: Number },
  faces: { type: Number },
  objects: [{ type: String }],
  scene: { type: String },
  toneAnalysis: { type: toneAnalysisSchema },
}, { _id: false });

const fileMetadataSchema = new Schema<IFileMetadata>({
  fileName: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  format: { type: String },
  quality: { type: Number },
  bitDepth: { type: Number },
  hasAlpha: { type: Boolean },
  animated: { type: Boolean },
  pages: { type: Number },
}, { _id: false });

const exifSchema = new Schema<IExifData>({
  // 基础参数
  camera: { type: String },
  lens: { type: String },
  focalLength: { type: String },
  aperture: { type: String },
  shutterSpeed: { type: String },
  iso: { type: Number },
  exposureCompensation: { type: String },
  flash: { type: String },
  whiteBalance: { type: String },
  filmSimulation: { type: String },
  colorSpace: { type: String },
  software: { type: String },

  // 扩展参数
  cameraSerialNumber: { type: String },
  firmware: { type: String },
  orientation: { type: Number },
  xResolution: { type: Number },
  yResolution: { type: Number },
  resolutionUnit: { type: String },
  exposureProgram: { type: String },
  meteringMode: { type: String },
  lightSource: { type: String },
  sensingMethod: { type: String },
  fileSource: { type: String },
  sceneType: { type: String },
  customRendered: { type: String },
  exposureMode: { type: String },
  sceneCaptureType: { type: String },
  gainControl: { type: String },
  contrast: { type: String },
  saturation: { type: String },
  sharpness: { type: String },

  // 详细元数据
  cameraOwnerName: { type: String },
  artist: { type: String },
  copyright: { type: String },
  lensSpecification: { type: String },
  subSecTime: { type: String },
  subSecTimeOriginal: { type: String },
  subSecTimeDigitized: { type: String },
  flashPixVersion: { type: String },
  pixelXDimension: { type: Number },
  pixelYDimension: { type: Number },
  focalPlaneXResolution: { type: Number },
  focalPlaneYResolution: { type: Number },
  focalPlaneResolutionUnit: { type: String },
  exifVersion: { type: String },
  shutterSpeedValue: { type: Number },
  apertureValue: { type: Number },
  exposureBiasValue: { type: Number },
  maxApertureValue: { type: Number },
  subjectDistance: { type: Number },
  digitalZoomRatio: { type: Number },
  focalLengthIn35mmFilm: { type: Number },

  // 佳能相机专用字段
  imageQuality: { type: String },
  noiseReduction: { type: String },
  digitalLensOptimizer: { type: String },
  dualPixelRaw: { type: String },
  canonFocusMode: { type: String },
  canonAFAreaMode: { type: String },

  // 白平衡和色彩详细信息
  whiteBalanceBias: { type: String },
  colorTemperature: { type: String },
  colorTone: { type: String },

  // Picture Style 详细参数
  contrastSetting: { type: String },
  saturationSetting: { type: String },
  sharpnessSetting: { type: String },
  brightnessSetting: { type: String },

  // 镜头详细信息
  lensInfo: { type: String },
  focalRange: { type: String },
  apertureRange: { type: String },
  lensFeatures: [{ type: String }],
  lensSerialNumber: { type: String },

  // 镜头校正
  distortionCorrection: { type: String },
  chromaticAberrationCorrection: { type: String },
  vignettingCorrection: { type: String },
  peripheralIllumination: { type: String },
}, { _id: false });

const photoSchema = new Schema<IPhoto>(
  {
    src: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },

    exif: { type: exifSchema },
    gps: { type: gpsSchema },
    technical: { type: technicalSchema },
    analysis: { type: analysisSchema },
    fileMetadata: { type: fileMetadataSchema },

    tags: [{ type: String }],
    description: { type: String },
    photographer: { type: String },
    copyright: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    favorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Photo =
  mongoose.models.Photo || mongoose.model<IPhoto>("Photo", photoSchema);
