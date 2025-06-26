import EXIF from 'exif-js';
import { IExifData, IGPSData, ITechnicalData, IFileMetadata, IImageAnalysis } from '@/app/model/photo';

// EXIF 数据接口（扩展）
interface RawExifData {
    // 基础设备信息
    Make?: string;              // 相机制造商
    Model?: string;             // 相机型号
    LensModel?: string;         // 镜头型号
    LensMake?: string;          // 镜头制造商

    // 拍摄参数
    FocalLength?: number;       // 焦距
    FNumber?: number;           // 光圈值
    ExposureTime?: number;      // 曝光时间
    ISO?: number;               // ISO值
    ISOSpeedRatings?: number;   // ISO值（备用字段）
    ExposureCompensation?: number; // 曝光补偿
    Flash?: number;             // 闪光灯
    WhiteBalance?: number;      // 白平衡
    ColorSpace?: number;        // 色彩空间
    Software?: string;          // 编辑软件
    DateTime?: string;          // 拍摄时间
    DateTimeOriginal?: string;  // 原始拍摄时间

    // GPS信息
    GPSLatitude?: number[];     // GPS纬度
    GPSLongitude?: number[];    // GPS经度
    GPSLatitudeRef?: string;    // 纬度参考
    GPSLongitudeRef?: string;   // 经度参考
    GPSAltitude?: number;       // GPS海拔
    GPSAltitudeRef?: number;    // 海拔参考
    GPSImgDirection?: number;   // 图像方向

    // 技术参数
    ExposureProgram?: number;   // 曝光程序
    MeteringMode?: number;      // 测光模式
    LightSource?: number;       // 光源
    SensingMethod?: number;     // 感光方式
    FileSource?: number;        // 文件来源
    SceneType?: number;         // 场景类型
    CustomRendered?: number;    // 自定义渲染
    ExposureMode?: number;      // 曝光模式
    SceneCaptureType?: number;  // 场景捕获类型
    GainControl?: number;       // 增益控制
    Contrast?: number;          // 对比度
    Saturation?: number;        // 饱和度
    Sharpness?: number;         // 锐度

    // 图像信息
    Orientation?: number;       // 图像方向
    XResolution?: number;       // X轴分辨率
    YResolution?: number;       // Y轴分辨率
    ResolutionUnit?: number;    // 分辨率单位
    Compression?: number;       // 压缩方式

    // 富士相机特有字段
    FilmMode?: string;          // 胶片模拟
    ShadowTone?: number;        // 阴影色调
    HighlightTone?: number;     // 高光色调
    NoiseReduction?: number;    // 降噪

    // 序列号等
    BodySerialNumber?: string;  // 机身序列号
    LensSerialNumber?: string;  // 镜头序列号
    FirmwareVersion?: string;   // 固件版本
    CameraOwnerName?: string;   // 相机所有者名称
    Artist?: string;            // 艺术家/摄影师
    Copyright?: string;         // 版权信息
    LensSpecification?: number[]; // 镜头规格

    // 更多技术细节
    SubSecTime?: string;        // 亚秒级时间
    SubSecTimeOriginal?: string; // 原始亚秒级时间
    SubSecTimeDigitized?: string; // 数字化亚秒级时间
    FlashPixVersion?: string;   // FlashPix版本
    PixelXDimension?: number;   // 像素X尺寸
    PixelYDimension?: number;   // 像素Y尺寸
    FocalPlaneXResolution?: number; // 焦平面X分辨率
    FocalPlaneYResolution?: number; // 焦平面Y分辨率
    FocalPlaneResolutionUnit?: number; // 焦平面分辨率单位
    ExifVersion?: string;       // EXIF版本
    ComponentsConfiguration?: any; // 组件配置
    ShutterSpeedValue?: number; // 快门速度值
    ApertureValue?: number;     // 光圈值
    ExposureBiasValue?: number; // 曝光偏差值
    MaxApertureValue?: number;  // 最大光圈值
    SubjectDistance?: number;   // 对象距离
    DigitalZoomRatio?: number;  // 数字变焦比
    FocalLengthIn35mmFilm?: number; // 35mm等效焦距
}

// 格式化曝光时间
const formatExposureTime = (exposureTime: number): string => {
    if (exposureTime >= 1) {
        return `${exposureTime}s`;
    }
    const fraction = 1 / exposureTime;
    return `1/${Math.round(fraction)}s`;
};

// 格式化焦距
const formatFocalLength = (focalLength: number): string => {
    return `${Math.round(focalLength)}mm`;
};

// 格式化光圈值
const formatAperture = (fNumber: number): string => {
    return fNumber.toFixed(1);
};

// 格式化曝光补偿
const formatExposureCompensation = (value: number): string => {
    if (value === 0) return '0';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}EV`;
};

// 获取闪光灯状态
const getFlashStatus = (flashValue: number): string => {
    const flashModes: { [key: number]: string } = {
        0: '未闪光',
        1: '闪光',
        5: '强制闪光',
        7: '强制闪光，红眼减少模式',
        9: '强制闪光',
        13: '强制闪光，红眼减少模式',
        15: '强制闪光，红眼减少模式',
        16: '未闪光，强制关闭',
        20: '自动，未闪光',
        24: '自动，闪光',
        25: '自动，闪光，红眼减少模式',
        29: '自动，闪光',
        31: '自动，闪光，红眼减少模式',
    };
    return flashModes[flashValue] || '未知';
};

// 获取白平衡状态
const getWhiteBalance = (value: number): string => {
    const wbModes: { [key: number]: string } = {
        0: '自动',
        1: '手动',
        2: '白炽灯',
        3: '荧光灯',
        4: '闪光灯',
        9: '晴天',
        10: '阴天',
        11: '阴影',
        12: '日光荧光灯',
        13: '日白荧光灯',
        14: '冷白荧光灯',
        15: '暖白荧光灯',
    };
    return wbModes[value] || '未知';
};

// 获取色彩空间
const getColorSpace = (value: number): string => {
    const colorSpaces: { [key: number]: string } = {
        1: 'sRGB',
        2: 'Adobe RGB',
        65535: 'Uncalibrated',
    };
    return colorSpaces[value] || '未知';
};

// 获取曝光程序
const getExposureProgram = (value: number): string => {
    const programs: { [key: number]: string } = {
        1: '手动',
        2: '程序自动曝光',
        3: '光圈优先',
        4: '快门优先',
        5: '创意程序',
        6: '动作程序',
        7: '人像模式',
        8: '风景模式',
    };
    return programs[value] || '未知';
};

// 获取测光模式
const getMeteringMode = (value: number): string => {
    const modes: { [key: number]: string } = {
        1: '平均测光',
        2: '中央重点测光',
        3: '点测光',
        4: '多重测光',
        5: '多区域测光',
        6: '部分测光',
    };
    return modes[value] || '多重测光';
};

// 获取感光方式
const getSensingMethod = (value: number): string => {
    const methods: { [key: number]: string } = {
        1: '未定义',
        2: '单片彩色区域传感器',
        3: '双片彩色区域传感器',
        4: '三片彩色区域传感器',
        5: '彩色序列区域传感器',
        7: '三线传感器',
        8: '彩色序列线性传感器',
    };
    return methods[value] || '单片彩色区域传感器';
};

// 获取富士胶片模拟模式
const getFujiFilmSimulation = (rawExif: any): string | undefined => {
    const fujiFilmModes: { [key: string]: string } = {
        '0': 'PROVIA/标准',
        '1': 'Velvia/鲜艳',
        '2': 'ASTIA/柔和',
        '3': 'Classic Chrome',
        '4': 'PRO Neg. Hi',
        '5': 'PRO Neg. Std',
        '6': 'Classic Neg.',
        '7': 'Eterna',
        '8': 'Acros',
        '9': 'Nostalgic Neg.',
        '10': 'Eterna Bleach Bypass',
    };

    if (rawExif.FilmMode) {
        return fujiFilmModes[rawExif.FilmMode.toString()] || rawExif.FilmMode;
    }
    return undefined;
};

// 转换GPS坐标
const convertGPSCoordinate = (coordinate: number[], ref: string): number => {
    if (!coordinate || coordinate.length < 3) return 0;

    const degrees = coordinate[0];
    const minutes = coordinate[1];
    const seconds = coordinate[2];

    let decimal = degrees + (minutes / 60) + (seconds / 3600);

    if (ref === 'S' || ref === 'W') {
        decimal = -decimal;
    }

    return decimal;
};

// 从图片文件提取完整元数据
export const extractCompleteMetadata = async (file: File): Promise<{
    exif: IExifData;
    gps?: IGPSData;
    technical?: ITechnicalData;
    fileMetadata: IFileMetadata;
    analysis?: IImageAnalysis;
}> => {
    const exifData = await extractExifFromFile(file);
    const gpsData = await extractGPSFromFile(file);
    const technicalData = await extractTechnicalData(file);
    const fileMetadata = await extractFileMetadata(file);
    const analysisData = await analyzeImage(file);

    return {
        exif: exifData,
        gps: gpsData,
        technical: technicalData,
        fileMetadata,
        analysis: analysisData,
    };
};

// 从图片文件提取 EXIF 信息
export const extractExifFromFile = (file: File): Promise<IExifData> => {
    return new Promise((resolve, reject) => {
        EXIF.getData(file as any, function (this: any) {
            try {
                const rawExif: RawExifData = EXIF.getAllTags(this) as any;
                console.log('Raw EXIF data:', rawExif);

                // 构建相机型号字符串
                const camera = [rawExif.Make, rawExif.Model]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || undefined;

                // 构建镜头型号字符串
                const lens = [rawExif.LensMake, rawExif.LensModel]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || rawExif.LensModel || undefined;

                // 处理镜头规格
                const formatLensSpecification = (spec: number[]): string | undefined => {
                    if (!spec || spec.length < 4) return undefined;
                    const [minFocal, maxFocal, minAperture, maxAperture] = spec;
                    if (minFocal === maxFocal) {
                        return `${minFocal}mm f/${minAperture || maxAperture}`;
                    }
                    return `${minFocal}-${maxFocal}mm f/${minAperture}-${maxAperture}`;
                };

                // 格式化 EXIF 数据
                const exifData: IExifData = {
                    // 基础参数
                    camera,
                    lens,
                    focalLength: rawExif.FocalLength ? formatFocalLength(rawExif.FocalLength) : undefined,
                    aperture: rawExif.FNumber ? formatAperture(rawExif.FNumber) : undefined,
                    shutterSpeed: rawExif.ExposureTime ? formatExposureTime(rawExif.ExposureTime) : undefined,
                    iso: rawExif.ISO || rawExif.ISOSpeedRatings || undefined,
                    exposureCompensation: rawExif.ExposureCompensation ? formatExposureCompensation(rawExif.ExposureCompensation) : undefined,
                    flash: rawExif.Flash !== undefined ? getFlashStatus(rawExif.Flash) : undefined,
                    whiteBalance: rawExif.WhiteBalance !== undefined ? getWhiteBalance(rawExif.WhiteBalance) : undefined,
                    filmSimulation: getFujiFilmSimulation(rawExif),
                    colorSpace: rawExif.ColorSpace !== undefined ? getColorSpace(rawExif.ColorSpace) : undefined,
                    software: rawExif.Software || undefined,

                    // 扩展参数
                    lensSerialNumber: rawExif.LensSerialNumber,
                    cameraSerialNumber: rawExif.BodySerialNumber,
                    firmware: rawExif.FirmwareVersion,
                    orientation: rawExif.Orientation,
                    xResolution: rawExif.XResolution,
                    yResolution: rawExif.YResolution,
                    resolutionUnit: rawExif.ResolutionUnit === 2 ? 'inches' : 'cm',
                    exposureProgram: rawExif.ExposureProgram !== undefined ? getExposureProgram(rawExif.ExposureProgram) : undefined,
                    meteringMode: rawExif.MeteringMode !== undefined ? getMeteringMode(rawExif.MeteringMode) : undefined,
                    sensingMethod: rawExif.SensingMethod !== undefined ? getSensingMethod(rawExif.SensingMethod) : undefined,
                    exposureMode: rawExif.ExposureMode !== undefined ? (rawExif.ExposureMode === 0 ? '自动曝光' : '手动曝光') : undefined,

                    // 详细元数据
                    cameraOwnerName: rawExif.CameraOwnerName,
                    artist: rawExif.Artist,
                    copyright: rawExif.Copyright,
                    lensSpecification: rawExif.LensSpecification ? formatLensSpecification(rawExif.LensSpecification) : undefined,
                    subSecTime: rawExif.SubSecTime,
                    subSecTimeOriginal: rawExif.SubSecTimeOriginal,
                    subSecTimeDigitized: rawExif.SubSecTimeDigitized,
                    flashPixVersion: rawExif.FlashPixVersion,
                    pixelXDimension: rawExif.PixelXDimension,
                    pixelYDimension: rawExif.PixelYDimension,
                    focalPlaneXResolution: rawExif.FocalPlaneXResolution,
                    focalPlaneYResolution: rawExif.FocalPlaneYResolution,
                    focalPlaneResolutionUnit: rawExif.FocalPlaneResolutionUnit === 2 ? 'inches' : 'cm',
                    exifVersion: rawExif.ExifVersion,
                    shutterSpeedValue: rawExif.ShutterSpeedValue,
                    apertureValue: rawExif.ApertureValue,
                    exposureBiasValue: rawExif.ExposureBiasValue,
                    maxApertureValue: rawExif.MaxApertureValue,
                    subjectDistance: rawExif.SubjectDistance,
                    digitalZoomRatio: rawExif.DigitalZoomRatio,
                    focalLengthIn35mmFilm: rawExif.FocalLengthIn35mmFilm,
                };

                // 过滤掉 undefined 值
                const filteredExifData = Object.fromEntries(
                    Object.entries(exifData).filter(([_, value]) => value !== undefined)
                ) as IExifData;

                console.log('Processed EXIF data:', filteredExifData);
                resolve(filteredExifData);
            } catch (error) {
                console.error('Error processing EXIF data:', error);
                reject(error);
            }
        });
    });
};

// 提取GPS信息
export const extractGPSFromFile = (file: File): Promise<IGPSData | undefined> => {
    return new Promise((resolve) => {
        EXIF.getData(file as any, function (this: any) {
            const rawExif: RawExifData = EXIF.getAllTags(this) as any;

            if (rawExif.GPSLatitude && rawExif.GPSLongitude) {
                const gpsData: IGPSData = {
                    latitude: convertGPSCoordinate(rawExif.GPSLatitude, rawExif.GPSLatitudeRef || 'N'),
                    longitude: convertGPSCoordinate(rawExif.GPSLongitude, rawExif.GPSLongitudeRef || 'E'),
                    altitude: rawExif.GPSAltitude,
                    direction: rawExif.GPSImgDirection,
                };

                resolve(gpsData);
            } else {
                resolve(undefined);
            }
        });
    });
};

// 提取技术参数
export const extractTechnicalData = (file: File): Promise<ITechnicalData | undefined> => {
    return new Promise((resolve) => {
        EXIF.getData(file as any, function (this: any) {
            const rawExif: RawExifData = EXIF.getAllTags(this) as any;

            const technicalData: ITechnicalData = {
                exposureMode: rawExif.ExposureMode !== undefined ?
                    (rawExif.ExposureMode === 0 ? '自动曝光' : '手动曝光') : undefined,
                meteringMode: rawExif.MeteringMode !== undefined ?
                    getMeteringMode(rawExif.MeteringMode) : undefined,
                compression: rawExif.Compression !== undefined ?
                    (rawExif.Compression === 6 ? 'JPEG' : '未压缩') : undefined,
                resolution: rawExif.ResolutionUnit === 2 ? 'inches' : 'cm',
            };

            const filteredData = Object.fromEntries(
                Object.entries(technicalData).filter(([_, value]) => value !== undefined)
            ) as ITechnicalData;

            resolve(Object.keys(filteredData).length > 0 ? filteredData : undefined);
        });
    });
};

// 提取文件元数据
export const extractFileMetadata = async (file: File): Promise<IFileMetadata> => {
    return {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        format: file.type.split('/')[1]?.toUpperCase(),
        bitDepth: 8, // 默认值，实际需要更复杂的检测
        hasAlpha: file.type === 'image/png', // 简化判断
        animated: file.type === 'image/gif', // 简化判断
    };
};

// 简单的图像分析（仅客户端）
export const analyzeImage = async (file: File): Promise<IImageAnalysis | undefined> => {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('Image analysis is only available in browser environment');
        return undefined;
    }

    return new Promise((resolve) => {
        const img = new Image();
        let canvas: HTMLCanvasElement;
        let ctx: CanvasRenderingContext2D | null = null;

        try {
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
        } catch (error) {
            console.error('Failed to create canvas context:', error);
            resolve(undefined);
            return;
        }

        img.onload = () => {
            try {
                if (!ctx) {
                    resolve(undefined);
                    return;
                }

                // 缩小图片以提高分析性能
                const maxSize = 200;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let totalR = 0, totalG = 0, totalB = 0;
                let totalBrightness = 0;
                const pixelCount = data.length / 4;

                // 颜色统计
                const colorCounts: { [key: string]: number } = {};

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    totalR += r;
                    totalG += g;
                    totalB += b;

                    // 计算亮度 (感知亮度公式)
                    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    totalBrightness += brightness;

                    // 简化的主色调检测
                    const colorKey = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`;
                    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
                }

                // 获取主色调
                const sortedColors = Object.entries(colorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([color]) => `rgb(${color})`);

                // 基于亮度和颜色分布进行简单场景分类
                const avgBrightness = totalBrightness / pixelCount;
                let scene = '未知';

                if (avgBrightness > 0.7) {
                    scene = '明亮场景';
                } else if (avgBrightness < 0.3) {
                    scene = '暗调场景';
                } else {
                    scene = '自然风景';
                }

                const analysis: IImageAnalysis = {
                    dominantColors: sortedColors,
                    averageBrightness: avgBrightness,
                    contrast: Math.abs(0.5 - avgBrightness) * 2, // 基于亮度计算对比度
                    saturation: 0.7, // 简化值
                    sharpness: 7.5, // 简化值
                    scene,
                };

                // 清理ObjectURL
                URL.revokeObjectURL(img.src);
                resolve(analysis);

            } catch (error) {
                console.error('Image analysis processing error:', error);
                URL.revokeObjectURL(img.src);
                resolve(undefined);
            }
        };

        img.onerror = (error) => {
            console.error('Image load error:', error);
            URL.revokeObjectURL(img.src);
            resolve(undefined);
        };

        try {
            img.src = URL.createObjectURL(file);
        } catch (error) {
            console.error('Failed to create object URL:', error);
            resolve(undefined);
        }
    });
};

// 从图片 URL 提取完整元数据
export const extractCompleteMetadataFromUrl = async (imageUrl: string): Promise<{
    exif: IExifData;
    gps?: IGPSData;
    technical?: ITechnicalData;
    fileMetadata?: IFileMetadata;
    analysis?: IImageAnalysis;
}> => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });

        // 提取EXIF和GPS数据
        const exifData = await extractExifFromFile(file);
        const gpsData = await extractGPSFromFile(file);
        const technicalData = await extractTechnicalData(file);
        const fileMetadata = await extractFileMetadata(file);

        // 图像分析只在客户端环境中进行
        let analysisData: IImageAnalysis | undefined;
        if (typeof window !== 'undefined') {
            try {
                analysisData = await analyzeImage(file);
            } catch (error) {
                console.warn('Image analysis failed:', error);
            }
        }

        return {
            exif: exifData,
            gps: gpsData,
            technical: technicalData,
            fileMetadata,
            analysis: analysisData,
        };
    } catch (error) {
        console.error('Error extracting metadata from URL:', error);
        throw error;
    }
};

// 从图片 URL 提取 EXIF 信息（向后兼容）
export const extractExifFromUrl = async (imageUrl: string): Promise<IExifData> => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });

        return await extractExifFromFile(file);
    } catch (error) {
        console.error('Error extracting EXIF from URL:', error);
        throw error;
    }
};

// 获取拍摄日期
export const getDateFromExif = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
        EXIF.getData(file as any, function (this: any) {
            const rawExif: RawExifData = EXIF.getAllTags(this) as any;
            const dateTime = rawExif.DateTimeOriginal || rawExif.DateTime;

            if (dateTime) {
                // EXIF 日期格式: "YYYY:MM:DD HH:MM:SS"
                // 转换为 ISO 格式: "YYYY-MM-DD"
                const isoDate = dateTime.split(' ')[0].replace(/:/g, '-');
                resolve(isoDate);
            } else {
                resolve(null);
            }
        });
    });
};

// 生成基于所有元数据的标签
export const generateTagsFromMetadata = (
    exif: IExifData,
    gps?: IGPSData,
    analysis?: IImageAnalysis
): string[] => {
    const tags: string[] = [];

    // 基于相机品牌添加标签
    if (exif.camera) {
        const cameraBrand = exif.camera.split(' ')[0].toLowerCase();
        const brandMap: { [key: string]: string } = {
            'canon': '佳能',
            'nikon': '尼康',
            'sony': '索尼',
            'fujifilm': '富士',
            'leica': '徕卡',
            'olympus': '奥林巴斯',
            'panasonic': '松下',
            'apple': '苹果',
        };
        if (brandMap[cameraBrand]) {
            tags.push(brandMap[cameraBrand]);
        }
    }

    // 基于焦距添加标签
    if (exif.focalLength) {
        const focal = parseInt(exif.focalLength);
        if (focal <= 24) {
            tags.push('超广角');
        } else if (focal <= 35) {
            tags.push('广角');
        } else if (focal <= 85) {
            tags.push('标准镜头');
        } else if (focal <= 200) {
            tags.push('中长焦');
        } else {
            tags.push('超长焦');
        }
    }

    // 基于光圈添加标签
    if (exif.aperture) {
        const aperture = parseFloat(exif.aperture);
        if (aperture <= 1.8) {
            tags.push('超大光圈');
        } else if (aperture <= 2.8) {
            tags.push('大光圈');
        }
    }

    // 基于ISO添加标签
    if (exif.iso) {
        if (exif.iso <= 200) {
            tags.push('低ISO');
        } else if (exif.iso >= 1600) {
            tags.push('高ISO');
        }
    }

    // 基于胶片模拟添加标签
    if (exif.filmSimulation) {
        tags.push('胶片模拟');
    }

    // 基于GPS位置添加标签
    if (gps?.latitude && gps?.longitude) {
        tags.push('有位置信息');
        if (gps.altitude && gps.altitude > 1000) {
            tags.push('高海拔');
        }
    }

    // 基于图像分析添加标签
    if (analysis) {
        if (analysis.scene) {
            tags.push(analysis.scene);
        }

        if (analysis.faces && analysis.faces > 0) {
            tags.push('人像');
        }

        if (analysis.averageBrightness && analysis.averageBrightness < 0.3) {
            tags.push('暗调');
        } else if (analysis.averageBrightness && analysis.averageBrightness > 0.7) {
            tags.push('高调');
        }

        if (analysis.saturation && analysis.saturation > 0.8) {
            tags.push('高饱和度');
        }
    }

    return Array.from(new Set(tags)); // 去重
};

// 向后兼容的标签生成函数
export const generateTagsFromExif = (exifData: IExifData): string[] => {
    return generateTagsFromMetadata(exifData);
}; 