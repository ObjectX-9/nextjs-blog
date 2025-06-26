import EXIF from 'exif-js';
import { IExifData, IGPSData, ITechnicalData, IFileMetadata, IImageAnalysis, IToneAnalysis, IHistogramData } from '@/app/model/photo';

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

    // 富士相机特有字段 (保留基础支持)
    FilmMode?: string;          // 胶片模拟

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

    // 白平衡和色彩相关
    WhiteBalanceMode?: number;      // 白平衡模式
    WhiteBalanceBias?: number;      // 白平衡偏移
    ColorTemperature?: number;      // 色温
    ColorMode?: number;             // 色彩模式
    ColorFilter?: number;           // 色彩滤镜

    // 镜头详细信息
    LensMinFocalLength?: number;    // 镜头最小焦距
    LensMaxFocalLength?: number;    // 镜头最大焦距
    LensMaxAperture?: number;       // 镜头最大光圈
    LensMinAperture?: number;       // 镜头最小光圈
    LensInfo?: string;              // 镜头信息
    LensFStops?: number;            // 镜头光圈档数

    // 可能的备选镜头字段名
    Lens?: string;                  // 镜头信息（备选）
    LensType?: string;              // 镜头类型
    LensID?: string;                // 镜头ID

    // 图像处理参数 (标准EXIF)
    ColorTone?: number;             // 色调
    HighlightTone?: number;         // 高光色调

    // 佳能特有字段
    CanonCs?: any;                  // 佳能相机设置
    CanonSi?: any;                  // 佳能拍摄信息  
    CanonPi?: any;                  // 佳能处理信息
    CanonFi?: any;                  // 佳能文件信息
    CanonPa?: any;                  // 佳能全景信息

    // MakerNote 相关
    MakerNote?: any;                // 制造商注释
    MakerNoteCanon?: any;           // 佳能MakerNote

    // 可能的镜头相关标签（数字形式）
    [key: number]: any;             // 支持数字键（如EXIF标签号）

    // 高ISO降噪
    HighISONoiseReduction?: number; // 高ISO降噪设置

    // 色彩风格参数
    PictureStyleContrast?: number;   // Picture Style对比度
    PictureStyleSaturation?: number; // Picture Style饱和度
    PictureStyleSharpness?: number;  // Picture Style锐度
    PictureStyleColorTone?: number;  // Picture Style色调

    // 镜头校正
    LensAberrationCorrection?: number; // 镜头像差校正
    ChromaticAberrationCorrection?: number; // 色差校正
    DistortionCorrection?: number;   // 畸变校正
    VignettingCorrection?: number;   // 暗角校正
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

// 获取闪光灯状态 (佳能相机优化)
const getFlashStatus = (flashValue: number, cameraMake?: string): string => {
    // 标准闪光灯状态
    const standardFlashModes: { [key: number]: string } = {
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

    // 佳能相机专用闪光灯状态
    const canonFlashModes: { [key: number]: string } = {
        0: '未触发',
        1: '已触发',
        5: '已触发，强制闪光，未检测到反射',
        7: '已触发，强制闪光，检测到反射',
        9: '已触发，强制闪光，红眼减轻',
        13: '已触发，强制闪光，红眼减轻，未检测到反射',
        15: '已触发，强制闪光，红眼减轻，检测到反射',
        16: '未触发，闪光灯禁用',
        24: '未触发，自动模式',
        25: '已触发，自动模式',
        29: '已触发，自动模式，未检测到反射',
        31: '已触发，自动模式，检测到反射',
        32: '不支持闪光灯功能',
        65: '已触发，红眼减轻模式',
        69: '已触发，红眼减轻模式，未检测到反射',
        71: '已触发，红眼减轻模式，检测到反射',
        73: '已触发，强制闪光，红眼减轻模式',
        77: '已触发，强制闪光，红眼减轻，未检测到反射',
        79: '已触发，强制闪光，红眼减轻，检测到反射',
        89: '已触发，自动模式，红眼减轻',
        93: '已触发，自动模式，红眼减轻，未检测到反射',
        95: '已触发，自动模式，红眼减轻，检测到反射',
    };

    // 如果是佳能相机，使用佳能专用映射
    if (cameraMake && cameraMake.toLowerCase().includes('canon')) {
        return canonFlashModes[flashValue] || standardFlashModes[flashValue] || '自动';
    }

    return standardFlashModes[flashValue] || '未知';
};

// 获取白平衡状态 (佳能相机优化)
const getWhiteBalance = (value: number, cameraMake?: string): string => {
    // 标准白平衡模式
    const standardWbModes: { [key: number]: string } = {
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

    // 佳能相机专用白平衡模式
    const canonWbModes: { [key: number]: string } = {
        0: '自动',
        1: '日光',
        2: '阴天',
        3: '钨丝灯',
        4: '荧光灯',
        5: '闪光灯',
        6: '自定义',
        7: '阴影',
        8: '色温',
        9: '自动环境优先',
        10: '自动白色优先',
        11: '水中',
        12: '自定义功能设置',
        13: 'PC-1',
        14: 'PC-2',
        15: 'PC-3',
        16: '手动',
        17: '自动（氛围优先）',
        18: '自动（白色优先）',
        19: '自动（智能）',
        20: '日光（色温5200K）',
        21: '阴天（色温6000K）',
        22: '阴影（色温7000K）',
        23: '钨丝灯（色温3200K）',
        24: '白色荧光灯（色温4000K）',
        25: '闪光灯（色温6000K）',
    };

    // 如果是佳能相机，使用佳能专用映射
    if (cameraMake && cameraMake.toLowerCase().includes('canon')) {
        return canonWbModes[value] || standardWbModes[value] || '自动';
    }

    return standardWbModes[value] || '自动';
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

// 获取曝光程序 (佳能相机优化)
const getExposureProgram = (value: number, cameraMake?: string): string => {
    // 标准曝光程序
    const standardPrograms: { [key: number]: string } = {
        1: '手动',
        2: '程序自动曝光',
        3: '光圈优先',
        4: '快门优先',
        5: '创意程序',
        6: '动作程序',
        7: '人像模式',
        8: '风景模式',
    };

    // 佳能相机专用曝光程序
    const canonPrograms: { [key: number]: string } = {
        0: '未定义',
        1: '手动 (M)',
        2: '程序自动 (P)',
        3: '光圈优先 (Av)',
        4: '快门优先 (Tv)',
        5: '创意程序',
        6: '动作程序',
        7: '人像模式',
        8: '风景模式',
        9: '夜景模式',
        10: '运动模式',
        11: '微距模式',
        12: '自动模式',
        13: '智能场景',
        14: '创意自动',
        15: 'Fv模式',
        16: 'B门',
        17: 'C1用户自定义',
        18: 'C2用户自定义',
        19: 'C3用户自定义',
    };

    // 如果是佳能相机，使用佳能专用映射
    if (cameraMake && cameraMake.toLowerCase().includes('canon')) {
        return canonPrograms[value] || standardPrograms[value] || '程序自动';
    }

    return standardPrograms[value] || '程序自动';
};

// 获取测光模式 (佳能相机优化)
const getMeteringMode = (value: number, cameraMake?: string): string => {
    // 标准测光模式
    const standardModes: { [key: number]: string } = {
        1: '平均测光',
        2: '中央重点测光',
        3: '点测光',
        4: '多重测光',
        5: '多区域测光',
        6: '部分测光',
    };

    // 佳能相机专用测光模式
    const canonModes: { [key: number]: string } = {
        0: '未知',
        1: '平均测光',
        2: '中央重点测光',
        3: '点测光',
        4: '多重测光',
        5: '评价测光',
        6: '部分测光',
        7: '中央加权测光',
        8: '智能测光',
        9: '区域测光',
        10: '局部测光',
        11: 'AF点联动测光',
        12: '多点测光',
        13: '大区域AF测光',
        14: '单点AF测光',
        15: '自动AF点选择测光',
    };

    // 如果是佳能相机，使用佳能专用映射
    if (cameraMake && cameraMake.toLowerCase().includes('canon')) {
        return canonModes[value] || standardModes[value] || '评价测光';
    }

    return standardModes[value] || '多重测光';
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
        '11': 'Classic Neg.',
        '12': 'Eterna/电影',
        '13': 'PRO Neg. Std',
        '14': 'Classic Chrome',
        '15': 'ETERNA BLEACH BYPASS',
        '16': 'NOSTALGIC Neg.',
    };

    if (rawExif.FilmMode) {
        return fujiFilmModes[rawExif.FilmMode.toString()] || rawExif.FilmMode;
    }
    return undefined;
};


// 获取佳能照片风格 (Picture Style)
const getCanonPictureStyle = (rawExif: any): string | undefined => {
    // 佳能照片风格映射
    const canonPictureStyles: { [key: string]: string } = {
        '0': '标准',
        '1': '人像',
        '2': '风景',
        '3': '中性',
        '4': '忠实',
        '5': '单色',
        '6': '用户定义1',
        '7': '用户定义2',
        '8': '用户定义3',
        '9': '自动',
        '10': '精细细节',
        '11': 'Fine Detail',
        '80': '标准',
        '81': '人像',
        '82': '风景',
        '83': '中性',
        '84': '忠实',
        '85': '单色',
        '86': '用户定义1',
        '87': '用户定义2',
        '88': '用户定义3',
    };

    // 检查多个可能的字段
    if (rawExif.PictureStyle !== undefined) {
        return canonPictureStyles[rawExif.PictureStyle.toString()] || `Picture Style ${rawExif.PictureStyle}`;
    }

    if (rawExif.CanonCs && rawExif.CanonCs.PictureStyle !== undefined) {
        return canonPictureStyles[rawExif.CanonCs.PictureStyle.toString()] || `Picture Style ${rawExif.CanonCs.PictureStyle}`;
    }

    return undefined;
};

// 统一的胶片模拟/照片风格获取函数 (佳能专用)
const getFilmSimulationOrPictureStyle = (rawExif: any): string | undefined => {
    // 检测相机品牌
    const make = rawExif.Make?.toLowerCase();

    if (make?.includes('canon')) {
        return getCanonPictureStyle(rawExif);
    }

    // 对于富士相机，仍然支持基础的胶片模拟识别，但不扩展
    if (make?.includes('fujifilm') || make?.includes('fuji')) {
        return getFujiFilmSimulation(rawExif);
    }

    return undefined;
};

// 佳能相机专用解析函数
const getCanonImageQuality = (rawExif: any): string | undefined => {
    const qualities: { [key: string]: string } = {
        '0': 'RAW',
        '1': 'sRAW',
        '2': 'mRAW',
        '3': 'JPEG Fine',
        '4': 'JPEG Normal',
        '5': 'JPEG Basic',
        '6': 'RAW + JPEG Fine',
        '7': 'RAW + JPEG Normal',
        '8': 'sRAW + JPEG Fine',
        '9': 'sRAW + JPEG Normal',
        '10': 'HEIF',
        '130': 'RAW',
        '131': 'sRAW1',
        '132': 'sRAW2',
        '133': 'JPEG Fine',
        '134': 'JPEG Normal',
        '135': 'JPEG Basic',
        '136': 'RAW + JPEG Fine',
        '137': 'RAW + JPEG Normal',
    };

    if (rawExif.CanonCs && rawExif.CanonCs.Quality !== undefined) {
        return qualities[rawExif.CanonCs.Quality.toString()] || `Quality ${rawExif.CanonCs.Quality}`;
    }
    return undefined;
};

const getCanonNoiseReduction = (rawExif: any): string | undefined => {
    const nrModes: { [key: string]: string } = {
        '0': '关闭',
        '1': '低',
        '2': '标准',
        '3': '高',
        '4': '自动',
        '5': '多重拍摄降噪',
    };

    if (rawExif.HighISONoiseReduction !== undefined) {
        return nrModes[rawExif.HighISONoiseReduction.toString()] || `降噪 ${rawExif.HighISONoiseReduction}`;
    }
    return undefined;
};

const getCanonDLO = (rawExif: any): string | undefined => {
    const dloModes: { [key: string]: string } = {
        '0': '关闭',
        '1': '开启',
        '2': '自动',
    };

    if (rawExif.CanonCs && rawExif.CanonCs.LensCorrection !== undefined) {
        return dloModes[rawExif.CanonCs.LensCorrection.toString()] || '关闭';
    }
    return undefined;
};

const getCanonDualPixelRaw = (rawExif: any): string | undefined => {
    const dpRawModes: { [key: string]: string } = {
        '0': '关闭',
        '1': '开启',
    };

    if (rawExif.CanonCs && rawExif.CanonCs.DualPixelRaw !== undefined) {
        return dpRawModes[rawExif.CanonCs.DualPixelRaw.toString()] || '关闭';
    }
    return undefined;
};

// 获取佳能对焦模式 (针对R6 Mark II优化)
const getCanonFocusMode = (rawExif: any): string | undefined => {
    const focusModes: { [key: string]: string } = {
        '0': '单次自动对焦 (One Shot)',
        '1': '人工智能伺服 (AI Servo)',
        '2': '人工智能对焦 (AI Focus)',
        '3': '手动对焦 (MF)',
        '4': '单次',
        '5': '连续',
        '6': '手动',
        '7': '自动',
        '8': '宏模式',
        '9': '多区域对焦',
        '10': '单点对焦',
        '11': '动态区域对焦',
    };

    if (rawExif.CanonCs && rawExif.CanonCs.FocusMode !== undefined) {
        return focusModes[rawExif.CanonCs.FocusMode.toString()] || `对焦模式 ${rawExif.CanonCs.FocusMode}`;
    }
    return undefined;
};

// 获取佳能自动对焦区域模式
const getCanonAFAreaMode = (rawExif: any): string | undefined => {
    const afAreaModes: { [key: string]: string } = {
        '0': '单点AF',
        '1': '扩展AF区域 (上下左右)',
        '2': '扩展AF区域 (周围)',
        '3': '区域AF',
        '4': '大区域AF (垂直)',
        '5': '大区域AF (水平)',
        '6': '全自动45点',
        '7': '自动选择',
        '8': '手动选择',
        '9': '单点+手动',
        '10': '单点+自动',
        '11': '多点',
        '12': '面部+追踪',
        '13': '追踪',
        '14': '点对焦',
        '15': '自动',
    };

    if (rawExif.CanonCs && rawExif.CanonCs.AFAreaMode !== undefined) {
        return afAreaModes[rawExif.CanonCs.AFAreaMode.toString()] || `AF区域 ${rawExif.CanonCs.AFAreaMode}`;
    }
    return undefined;
};

// 获取白平衡偏移 (针对佳能优化)
const getWhiteBalanceBias = (rawExif: any): string | undefined => {
    // 检查佳能特有的白平衡偏移
    if (rawExif.CanonCs && rawExif.CanonCs.WhiteBalanceBias !== undefined) {
        const bias = rawExif.CanonCs.WhiteBalanceBias;
        if (bias === 0) return '0';
        const sign = bias > 0 ? '+' : '';
        return `${sign}${bias}`;
    }

    // 检查标准白平衡偏移
    if (rawExif.WhiteBalanceBias !== undefined) {
        const bias = rawExif.WhiteBalanceBias;
        if (bias === 0) return '0';
        const sign = bias > 0 ? '+' : '';
        return `${sign}${bias}`;
    }

    return undefined;
};

// 获取色温
const getColorTemperature = (rawExif: any): string | undefined => {
    // 检查佳能色温
    if (rawExif.CanonCs && rawExif.CanonCs.ColorTemperature !== undefined) {
        return `${rawExif.CanonCs.ColorTemperature}K`;
    }

    // 检查标准色温
    if (rawExif.ColorTemperature !== undefined) {
        return `${rawExif.ColorTemperature}K`;
    }

    return undefined;
};

// 获取对比度设置
const getContrastSetting = (rawExif: any, cameraMake?: string): string | undefined => {
    // 佳能Picture Style对比度
    if (cameraMake?.toLowerCase().includes('canon')) {
        // 检查多个可能的对比度字段
        const possibleFields = [
            'ContrastSetting',
            'Contrast',
            'PictureStyleContrast',
            'ContrastCurve',
            'ToneCurve'
        ];

        for (const field of possibleFields) {
            let contrast: number | undefined;

            // 从佳能特有字段获取
            if (rawExif.CanonCs && rawExif.CanonCs[field] !== undefined) {
                contrast = rawExif.CanonCs[field];
            }
            // MakerNote是二进制数据，不能直接访问
            // 已解析的佳能字段会在CanonCs等字段中
            // 从根级别获取
            else if (rawExif[field] !== undefined) {
                contrast = rawExif[field];
            }

            if (contrast !== undefined) {
                // 佳能的对比度值通常在-4到+4范围内
                if (contrast >= 128) {
                    // 如果是大数值，可能需要转换
                    contrast = contrast - 128;
                }

                if (contrast === 0) return '标准';
                if (contrast > 0) return `+${contrast}`;
                return `${contrast}`;
            }
        }

        // 尝试从Picture Style详细参数获取
        if (rawExif.CanonPi) {
            for (const field of possibleFields) {
                if (rawExif.CanonPi[field] !== undefined) {
                    const contrast = rawExif.CanonPi[field];
                    if (contrast === 0) return '标准';
                    if (contrast > 0) return `+${contrast}`;
                    return `${contrast}`;
                }
            }
        }
    }

    // 标准EXIF对比度
    if (rawExif.Contrast !== undefined) {
        const contrastMap: { [key: number]: string } = {
            0: '标准',
            1: '低',
            2: '高',
        };
        return contrastMap[rawExif.Contrast] || `${rawExif.Contrast}`;
    }

    return undefined;
};

// 获取饱和度设置
const getSaturationSetting = (rawExif: any, cameraMake?: string): string | undefined => {
    // 佳能Picture Style饱和度
    if (cameraMake?.toLowerCase().includes('canon')) {
        // 检查多个可能的饱和度字段
        const possibleFields = [
            'SaturationSetting',
            'Saturation',
            'PictureStyleSaturation',
            'ColorSaturation',
            'ChromaSaturation'
        ];

        for (const field of possibleFields) {
            let saturation: number | undefined;

            // 从佳能特有字段获取
            if (rawExif.CanonCs && rawExif.CanonCs[field] !== undefined) {
                saturation = rawExif.CanonCs[field];
            }
            // MakerNote是二进制数据，不能直接访问
            // 已解析的佳能字段会在CanonCs等字段中
            // 从根级别获取
            else if (rawExif[field] !== undefined) {
                saturation = rawExif[field];
            }

            if (saturation !== undefined) {
                // 佳能的饱和度值通常在-4到+4范围内
                if (saturation >= 128) {
                    // 如果是大数值，可能需要转换
                    saturation = saturation - 128;
                }

                if (saturation === 0) return '标准';
                if (saturation > 0) return `+${saturation}`;
                return `${saturation}`;
            }
        }

        // 尝试从Picture Style详细参数获取
        if (rawExif.CanonPi) {
            for (const field of possibleFields) {
                if (rawExif.CanonPi[field] !== undefined) {
                    const saturation = rawExif.CanonPi[field];
                    if (saturation === 0) return '标准';
                    if (saturation > 0) return `+${saturation}`;
                    return `${saturation}`;
                }
            }
        }
    }

    // 标准EXIF饱和度
    if (rawExif.Saturation !== undefined) {
        const saturationMap: { [key: number]: string } = {
            0: '标准',
            1: '低',
            2: '高',
        };
        return saturationMap[rawExif.Saturation] || `${rawExif.Saturation}`;
    }

    return undefined;
};

// 获取锐度设置
const getSharpnessSetting = (rawExif: any, cameraMake?: string): string | undefined => {
    // 佳能Picture Style锐度
    if (cameraMake?.toLowerCase().includes('canon')) {
        // 检查多个可能的锐度字段
        const possibleFields = [
            'SharpnessSetting',
            'Sharpness',
            'PictureStyleSharpness',
            'SharpnessLevel',
            'EdgeSharpness',
            'DetailSharpness'
        ];

        for (const field of possibleFields) {
            let sharpness: number | undefined;

            // 从佳能特有字段获取
            if (rawExif.CanonCs && rawExif.CanonCs[field] !== undefined) {
                sharpness = rawExif.CanonCs[field];
            }
            // MakerNote是二进制数据，不能直接访问
            // 已解析的佳能字段会在CanonCs等字段中
            // 从根级别获取
            else if (rawExif[field] !== undefined) {
                sharpness = rawExif[field];
            }

            if (sharpness !== undefined) {
                // 佳能的锐度值通常在-4到+4范围内
                if (sharpness >= 128) {
                    // 如果是大数值，可能需要转换
                    sharpness = sharpness - 128;
                }

                if (sharpness === 0) return '标准';
                if (sharpness > 0) return `+${sharpness}`;
                return `${sharpness}`;
            }
        }

        // 尝试从Picture Style详细参数获取
        if (rawExif.CanonPi) {
            for (const field of possibleFields) {
                if (rawExif.CanonPi[field] !== undefined) {
                    const sharpness = rawExif.CanonPi[field];
                    if (sharpness === 0) return '标准';
                    if (sharpness > 0) return `+${sharpness}`;
                    return `${sharpness}`;
                }
            }
        }
    }

    // 标准EXIF锐度
    if (rawExif.Sharpness !== undefined) {
        const sharpnessMap: { [key: number]: string } = {
            0: '标准',
            1: '低',
            2: '高',
        };
        return sharpnessMap[rawExif.Sharpness] || `${rawExif.Sharpness}`;
    }

    return undefined;
};

// 获取色调设置 (佳能Color Tone)
const getColorToneSetting = (rawExif: any): string | undefined => {
    // 检查多个可能的色调字段
    const possibleFields = [
        'ColorTone',
        'PictureStyleColorTone',
        'ToneSetting',
        'ColorTemperatureSetting'
    ];

    for (const field of possibleFields) {
        let tone: number | undefined;

        // 从佳能特有字段获取
        if (rawExif.CanonCs && rawExif.CanonCs[field] !== undefined) {
            tone = rawExif.CanonCs[field];
        }
        // MakerNote是二进制数据，不能直接访问
        // 已解析的佳能字段会在CanonCs等字段中
        // 从根级别获取
        else if (rawExif[field] !== undefined) {
            tone = rawExif[field];
        }

        if (tone !== undefined) {
            // 佳能的色调值通常在-4到+4范围内
            if (tone >= 128) {
                // 如果是大数值，可能需要转换
                tone = tone - 128;
            }

            if (tone === 0) return '标准';
            if (tone > 0) return `+${tone}`;
            return `${tone}`;
        }
    }

    // 尝试从Picture Style详细参数获取
    if (rawExif.CanonPi) {
        for (const field of possibleFields) {
            if (rawExif.CanonPi[field] !== undefined) {
                const tone = rawExif.CanonPi[field];
                if (tone === 0) return '标准';
                if (tone > 0) return `+${tone}`;
                return `${tone}`;
            }
        }
    }

    return undefined;
};

// 获取亮度设置 (佳能Picture Style Brightness)
const getBrightnessSetting = (rawExif: any, cameraMake?: string): string | undefined => {
    // 佳能Picture Style亮度
    if (cameraMake?.toLowerCase().includes('canon')) {
        // 检查多个可能的亮度字段
        const possibleFields = [
            'BrightnessSetting',
            'Brightness',
            'PictureStyleBrightness',
            'Luminance',
            'LuminanceAdjustment',
            'ExposureAdjustment'
        ];

        for (const field of possibleFields) {
            let brightness: number | undefined;

            // 从佳能特有字段获取
            if (rawExif.CanonCs && rawExif.CanonCs[field] !== undefined) {
                brightness = rawExif.CanonCs[field];
            }
            // MakerNote是二进制数据，不能直接访问
            // 已解析的佳能字段会在CanonCs等字段中
            // 从根级别获取
            else if (rawExif[field] !== undefined) {
                brightness = rawExif[field];
            }

            if (brightness !== undefined) {
                // 佳能的亮度值通常在-4到+4范围内
                if (brightness >= 128) {
                    // 如果是大数值，可能需要转换
                    brightness = brightness - 128;
                }

                if (brightness === 0) return '标准';
                if (brightness > 0) return `+${brightness}`;
                return `${brightness}`;
            }
        }

        // 尝试从Picture Style详细参数获取
        if (rawExif.CanonPi) {
            for (const field of possibleFields) {
                if (rawExif.CanonPi[field] !== undefined) {
                    const brightness = rawExif.CanonPi[field];
                    if (brightness === 0) return '标准';
                    if (brightness > 0) return `+${brightness}`;
                    return `${brightness}`;
                }
            }
        }
    }

    return undefined;
};

// 从二进制数据中读取字符串
const readStringFromBinary = (data: number[], offset: number, maxLength: number = 50): string => {
    let result = '';
    for (let i = 0; i < maxLength && offset + i < data.length; i++) {
        const byte = data[offset + i];
        if (byte === 0) break; // 遇到空字节停止
        if (byte >= 32 && byte <= 126) { // 可打印ASCII字符
            result += String.fromCharCode(byte);
        } else if (byte > 126) { // 可能是UTF-8
            break;
        }
    }
    return result.trim();
};

// 从二进制数据中读取16位整数（小端序）
const readUint16LE = (data: number[], offset: number): number => {
    if (offset + 1 >= data.length) return 0;
    return data[offset] | (data[offset + 1] << 8);
};

// 从二进制数据中读取32位整数（小端序）
const readUint32LE = (data: number[], offset: number): number => {
    if (offset + 3 >= data.length) return 0;
    return data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24);
};

// 将佳能的Picture Style数值转换为用户可读格式
const formatCanonStyleValue = (value: number): string => {
    // 佳能通常使用0作为标准值，正负值表示调整
    if (value === 0 || value === 128) return '标准';

    // 处理可能的偏移编码
    let adjustedValue = value;
    if (value >= 128) {
        adjustedValue = value - 128;
    }

    // 限制在合理范围内 (-4 到 +4)
    if (adjustedValue < -4) adjustedValue = -4;
    if (adjustedValue > 4) adjustedValue = 4;

    if (adjustedValue > 0) return `+${adjustedValue}`;
    if (adjustedValue < 0) return `${adjustedValue}`;
    return '标准';
};

// 解析Picture Style参数从二进制数据
const parsePictureStyleFromBinary = (data: number[], offset: number, count: number, type: number): {
    contrast?: string;
    saturation?: string;
    sharpness?: string;
    brightness?: string;
    colorTone?: string;
} | null => {
    const result: any = {};

    try {
        console.log(`📝 🎨 解析Picture Style数据: offset=${offset}, count=${count}, type=${type}`);

        // 根据数据类型和大小来解析
        if (type === 3) { // SHORT (16位整数)
            for (let i = 0; i < Math.min(count, 50) && offset + (i * 2) + 1 < data.length; i++) {
                const value = readUint16LE(data, offset + (i * 2));

                // 根据在数组中的位置推断参数类型
                // 佳能通常在特定偏移存储这些值
                if (i === 0 || i === 1) { // 前几个可能是Picture Style模式
                    console.log(`📝 🎨 位置 ${i} 的值: ${value} (0x${value.toString(16)})`);
                } else if (i >= 2 && i <= 10) { // 中间位置可能是调整参数
                    const formatted = formatCanonStyleValue(value);
                    console.log(`📝 🎨 位置 ${i} 的Picture Style参数: ${value} -> ${formatted}`);

                    // 根据位置尝试分配参数（这需要根据实际测试调整）
                    if (i === 2) result.contrast = formatted;
                    else if (i === 3) result.saturation = formatted;
                    else if (i === 4) result.sharpness = formatted;
                    else if (i === 5) result.brightness = formatted;
                    else if (i === 6) result.colorTone = formatted;
                }
            }
        } else if (type === 4) { // LONG (32位整数)
            for (let i = 0; i < Math.min(count, 20) && offset + (i * 4) + 3 < data.length; i++) {
                const value = readUint32LE(data, offset + (i * 4));
                console.log(`📝 🎨 32位值 ${i}: ${value} (0x${value.toString(16)})`);
            }
        } else if (type === 1) { // BYTE
            for (let i = 0; i < Math.min(count, 100) && offset + i < data.length; i++) {
                const value = data[offset + i];
                if (value !== 0 && value !== 255) { // 忽略填充字节
                    console.log(`📝 🎨 字节 ${i}: ${value}`);

                    // 对于字节类型，尝试直接解析Picture Style参数
                    const formatted = formatCanonStyleValue(value);
                    if (formatted !== '标准') {
                        // 根据位置分配参数（需要实际测试来确定正确位置）
                        if (i === 10) result.contrast = formatted;
                        else if (i === 11) result.saturation = formatted;
                        else if (i === 12) result.sharpness = formatted;
                        else if (i === 13) result.brightness = formatted;
                        else if (i === 14) result.colorTone = formatted;
                    }
                }
            }
        }

        // 扫描整个区域寻找特定的Picture Style模式
        console.log('📝 🎨 扫描Picture Style参数模式...');
        for (let i = 0; i < Math.min(count * 4, 200) && offset + i < data.length; i++) {
            const byte = data[offset + i];

            // 寻找可能的Picture Style参数组合
            // 佳能通常将对比度、饱和度、锐度等连续存储
            if (byte > 0 && byte < 20 && offset + i + 4 < data.length) {
                const values = [
                    data[offset + i],
                    data[offset + i + 1],
                    data[offset + i + 2],
                    data[offset + i + 3],
                    data[offset + i + 4]
                ];

                // 检查是否像Picture Style参数（通常在0-8范围内，或120-136范围内）
                const isValidPattern = values.every(v =>
                    (v >= 0 && v <= 8) || (v >= 120 && v <= 136) || v === 0
                );

                if (isValidPattern && values.some(v => v !== 0)) {
                    console.log(`📝 🎨 在偏移 ${offset + i} 发现可能的Picture Style参数:`, values);

                    values.forEach((value, idx) => {
                        if (value > 0) {
                            const formatted = formatCanonStyleValue(value);
                            console.log(`📝 🎨 参数 ${idx}: ${value} -> ${formatted}`);

                            // 分配给相应的参数
                            if (idx === 0 && !result.contrast) result.contrast = formatted;
                            else if (idx === 1 && !result.saturation) result.saturation = formatted;
                            else if (idx === 2 && !result.sharpness) result.sharpness = formatted;
                            else if (idx === 3 && !result.brightness) result.brightness = formatted;
                            else if (idx === 4 && !result.colorTone) result.colorTone = formatted;
                        }
                    });
                }
            }
        }

        // 如果找到了任何参数，返回结果
        if (Object.keys(result).length > 0) {
            console.log('📝 🎨 ✅ 成功解析Picture Style参数:', result);
            return result;
        }
    } catch (error) {
        console.log('📝 🎨 ❌ Picture Style解析出错:', error);
    }

    return null;
};

// 解析佳能 MakerNote 获取镜头信息
const parseCanonMakerNote = (rawExif: any): {
    lensModel?: string;
    lensType?: string;
    lensID?: string;
    lensSerialNumber?: string;
    focalLengthRange?: string;
    apertureRange?: string;
    lensFeatures?: string[];
    pictureStyleSettings?: {
        contrast?: string;
        saturation?: string;
        sharpness?: string;
        brightness?: string;
        colorTone?: string;
    };
} => {
    const result: any = {};

    console.log('📝 开始解析佳能 MakerNote 二进制数据...');

    // 处理二进制MakerNote数据
    if (rawExif.MakerNote && Array.isArray(rawExif.MakerNote)) {
        const data = rawExif.MakerNote;
        console.log('📝 MakerNote 二进制数据长度:', data.length);

        // 扫描二进制数据寻找ASCII字符串
        console.log('📝 扫描MakerNote中的文本信息...');

        for (let i = 0; i < data.length - 10; i++) {
            const str = readStringFromBinary(data, i, 100);

            if (str.length >= 8) { // 只关注较长的字符串
                console.log(`📝 在偏移 ${i} 处发现文本:`, str);

                // 检查是否是镜头信息
                if (str.includes('mm') && (str.includes('F') || str.includes('f'))) {
                    if (!result.lensModel || str.length > (result.lensModel.length || 0)) {
                        result.lensModel = str;
                        console.log('📝 ✅ 找到镜头型号:', str);
                    }
                }

                // 检查是否是序列号（通常是MR开头的字符串）
                if (str.match(/^[A-Z]{2}\d{6,}/)) {
                    result.lensSerialNumber = str;
                    console.log('📝 ✅ 找到可能的序列号:', str);
                }

                // 检查是否是固件版本
                if (str.includes('Version') || str.match(/\d+\.\d+\.\d+/)) {
                    console.log('📝 📄 固件/版本信息:', str);
                }

                // 检查是否是相机型号
                if (str.includes('Canon') || str.includes('EOS')) {
                    console.log('📝 📷 相机型号:', str);
                }
            }
        }

        // 尝试解析TIFF结构中的IFD条目
        console.log('📝 尝试解析佳能MakerNote TIFF结构...');

        // 佳能MakerNote通常以TIFF头开始
        for (let offset = 0; offset < Math.min(100, data.length - 12); offset++) {
            // 寻找可能的TIFF条目数量标识
            const entryCount = readUint16LE(data, offset);

            if (entryCount > 0 && entryCount < 200) { // 合理的条目数量
                console.log(`📝 在偏移 ${offset} 处可能有 ${entryCount} 个TIFF条目`);

                // 解析每个条目
                for (let i = 0; i < Math.min(entryCount, 50); i++) {
                    const entryOffset = offset + 2 + (i * 12);
                    if (entryOffset + 12 > data.length) break;

                    const tag = readUint16LE(data, entryOffset);
                    const type = readUint16LE(data, entryOffset + 2);
                    const count = readUint32LE(data, entryOffset + 4);
                    const valueOffset = readUint32LE(data, entryOffset + 8);

                    // 检查已知的佳能标签
                    const knownTags: { [key: number]: string } = {
                        1: 'CameraSettings',
                        2: 'FocalLength',
                        4: 'ShotInfo',
                        6: 'ImageType',
                        7: 'FirmwareVersion',
                        9: 'OwnerName',
                        95: 'LensModel', // 0x005F
                        149: 'LensInfo', // 0x0095
                        150: 'LensSerialNumber', // 0x0096
                        // Picture Style相关标签
                        38: 'ProcessingInfo', // 0x0026 - 包含Picture Style参数
                        61: 'ColorData', // 0x003D - 色彩数据
                        147: 'ColorInfo', // 0x0093 - 色彩信息
                        160: 'ProcessingInfo2', // 0x00A0 - 更多处理信息
                        224: 'ColorBalance', // 0x00E0 - 色彩平衡
                    };

                    if (knownTags[tag]) {
                        console.log(`📝 🔍 佳能标签 ${tag} (${knownTags[tag]}): 类型=${type}, 数量=${count}, 值偏移=${valueOffset}`);

                        // 如果是字符串类型的镜头信息
                        if (tag === 95 || tag === 149) { // LensModel或LensInfo
                            if (type === 2 && valueOffset < data.length) { // ASCII字符串
                                const lensStr = readStringFromBinary(data, valueOffset, count);
                                if (lensStr && lensStr.length > 5) {
                                    result.lensModel = lensStr;
                                    console.log('📝 ✅ 从TIFF条目找到镜头:', lensStr);
                                }
                            }
                        }

                        // 如果是镜头序列号
                        if (tag === 150) { // LensSerialNumber
                            if (type === 2 && valueOffset < data.length) {
                                const serialStr = readStringFromBinary(data, valueOffset, count);
                                if (serialStr) {
                                    result.lensSerialNumber = serialStr;
                                    console.log('📝 ✅ 从TIFF条目找到镜头序列号:', serialStr);
                                }
                            }
                        }

                        // 如果是Picture Style相关数据
                        if (tag === 1 || tag === 38 || tag === 61 || tag === 147 || tag === 160 || tag === 224) {
                            if (valueOffset < data.length) {
                                console.log(`📝 🎨 解析Picture Style相关标签 ${tag}...`);
                                const pictureStyleData = parsePictureStyleFromBinary(data, valueOffset, count, type);
                                if (pictureStyleData) {
                                    if (!result.pictureStyleSettings) {
                                        result.pictureStyleSettings = {};
                                    }
                                    Object.assign(result.pictureStyleSettings, pictureStyleData);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 检查佳能特有的已解析字段（这些是EXIF库从MakerNote解析出来的）
    const canonFields = [
        'CanonCs', 'CanonSi', 'CanonPi', 'CanonFi', 'CanonPa',
        'Canon.CameraSettings', 'Canon.ShotInfo', 'Canon.ProcessingInfo',
        'Canon.FileInfo', 'Canon.PanoramaInfo'
    ];

    canonFields.forEach(field => {
        if (rawExif[field]) {
            console.log(`📝 发现佳能字段 ${field}:`, rawExif[field]);

            // 如果有佳能相机设置，尝试提取镜头信息
            if (field === 'CanonCs' && rawExif[field]) {
                const cs = rawExif[field];
                if (cs.LensType !== undefined) {
                    console.log('📝 镜头类型 (LensType):', cs.LensType);
                }
                if (cs.LensModel && !result.lensModel) {
                    result.lensModel = cs.LensModel;
                    console.log('📝 从CanonCs找到镜头型号:', cs.LensModel);
                }
            }
        }
    });

    // 从镜头信息推断特性
    if (result.lensModel) {
        const features: string[] = [];
        const lensStr = result.lensModel.toLowerCase();

        // 推断焦距范围
        const focalMatch = result.lensModel.match(/(\d+)-?(\d+)?mm/);
        if (focalMatch) {
            if (focalMatch[2]) {
                result.focalLengthRange = `${focalMatch[1]}-${focalMatch[2]}mm`;
            } else {
                result.focalLengthRange = `${focalMatch[1]}mm`;
            }
        }

        // 推断光圈范围
        const apertureMatch = result.lensModel.match(/[Ff](\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?/);
        if (apertureMatch) {
            if (apertureMatch[2]) {
                result.apertureRange = `f/${apertureMatch[1]}-f/${apertureMatch[2]}`;
            } else {
                result.apertureRange = `f/${apertureMatch[1]}`;
            }
        }

        // 推断镜头特性
        if (lensStr.includes('rf')) features.push('RF镜头');
        else if (lensStr.includes('ef-s')) features.push('EF-S镜头');
        else if (lensStr.includes('ef-m')) features.push('EF-M镜头');
        else if (lensStr.includes('ef')) features.push('EF镜头');

        if (lensStr.includes('is')) features.push('光学防抖 (IS)');
        if (lensStr.includes('stm')) features.push('STM步进马达');
        if (lensStr.includes('usm')) features.push('USM超声波马达');
        if (lensStr.includes('nano usm')) features.push('Nano USM马达');
        if (lensStr.includes('l ') || lensStr.endsWith('l')) features.push('L级专业镜头');
        if (lensStr.includes('macro')) features.push('微距镜头');
        if (lensStr.includes('fisheye')) features.push('鱼眼镜头');
        if (lensStr.includes('ts-e')) features.push('移轴镜头');

        if (features.length > 0) {
            result.lensFeatures = features;
        }
    }

    console.log('📝 MakerNote解析完成，结果:', result);
    return result;
};

// 获取镜头详细信息 (增强版)
const getLensDetails = (rawExif: any): {
    lensInfo?: string;
    focalRange?: string;
    apertureRange?: string;
    lensFeatures?: string[];
} => {
    const details: any = {};

    // 首先尝试从 MakerNote 解析镜头信息
    const makerNoteData = parseCanonMakerNote(rawExif);

    // 镜头信息字符串 - 多种来源（按优先级顺序）
    if (makerNoteData.lensModel) {
        details.lensInfo = makerNoteData.lensModel;
        console.log('📝 使用 MakerNote 中的镜头信息:', makerNoteData.lensModel);
    } else if (rawExif.LensMake && rawExif.LensModel) {
        details.lensInfo = `${rawExif.LensMake} ${rawExif.LensModel}`;
    } else if (rawExif.LensModel) {
        details.lensInfo = rawExif.LensModel;
    } else if (rawExif.LensInfo) {
        details.lensInfo = rawExif.LensInfo;
    } else if (rawExif.Lens) {
        details.lensInfo = rawExif.Lens;
    } else if ((rawExif as any)['0xA434']) {
        // 镜头型号的十六进制标签
        details.lensInfo = (rawExif as any)['0xA434'];
    } else if (rawExif.LensType) {
        details.lensInfo = rawExif.LensType;
    } else if (rawExif.LensID) {
        details.lensInfo = rawExif.LensID;
    }

    // 佳能特有镜头信息
    if (rawExif.CanonCs && !details.lensInfo) {
        // 从佳能特有字段获取镜头信息
        if (rawExif.CanonCs.LensModel) {
            details.lensInfo = rawExif.CanonCs.LensModel;
        } else if (rawExif.CanonCs.LensInfo) {
            details.lensInfo = rawExif.CanonCs.LensInfo;
        }
    }

    // 焦距范围 - 多种数据源
    if (rawExif.LensMinFocalLength && rawExif.LensMaxFocalLength) {
        if (rawExif.LensMinFocalLength === rawExif.LensMaxFocalLength) {
            details.focalRange = `${rawExif.LensMinFocalLength}mm`;
        } else {
            details.focalRange = `${rawExif.LensMinFocalLength}-${rawExif.LensMaxFocalLength}mm`;
        }
    } else if (rawExif.LensSpecification && Array.isArray(rawExif.LensSpecification) && rawExif.LensSpecification.length >= 2) {
        const [minFocal, maxFocal] = rawExif.LensSpecification;
        if (minFocal && maxFocal) {
            if (minFocal === maxFocal) {
                details.focalRange = `${minFocal}mm`;
            } else {
                details.focalRange = `${minFocal}-${maxFocal}mm`;
            }
        }
    } else if (rawExif.CanonCs) {
        // 从佳能设置中获取焦距信息
        if (rawExif.CanonCs.MinFocalLength && rawExif.CanonCs.MaxFocalLength) {
            if (rawExif.CanonCs.MinFocalLength === rawExif.CanonCs.MaxFocalLength) {
                details.focalRange = `${rawExif.CanonCs.MinFocalLength}mm`;
            } else {
                details.focalRange = `${rawExif.CanonCs.MinFocalLength}-${rawExif.CanonCs.MaxFocalLength}mm`;
            }
        }
    }

    // 光圈范围 - 多种数据源
    if (rawExif.LensMaxAperture && rawExif.LensMinAperture) {
        if (rawExif.LensMaxAperture === rawExif.LensMinAperture) {
            details.apertureRange = `f/${rawExif.LensMaxAperture}`;
        } else {
            details.apertureRange = `f/${rawExif.LensMaxAperture}-f/${rawExif.LensMinAperture}`;
        }
    } else if (rawExif.LensSpecification && Array.isArray(rawExif.LensSpecification) && rawExif.LensSpecification.length >= 4) {
        const [, , maxAperture, minAperture] = rawExif.LensSpecification;
        if (maxAperture && minAperture) {
            if (maxAperture === minAperture) {
                details.apertureRange = `f/${maxAperture}`;
            } else {
                details.apertureRange = `f/${maxAperture}-f/${minAperture}`;
            }
        }
    } else if (rawExif.MaxApertureValue) {
        // 使用最大光圈值
        details.apertureRange = `f/${rawExif.MaxApertureValue.toFixed(1)}`;
    }

    // 镜头特性 (佳能)
    const features: string[] = [];
    if (rawExif.CanonCs) {
        if (rawExif.CanonCs.LensType !== undefined) {
            const lensTypeMap: { [key: number]: string } = {
                1: 'EF镜头',
                2: 'EF-S镜头',
                3: 'EF-M镜头',
                4: 'RF镜头',
                5: 'RF-S镜头',
                61: 'EF-S镜头',
                131: 'TS-E镜头',
                136: 'MP-E镜头',
                137: 'TS-E镜头',
                138: 'EF-M镜头',
                254: 'RF镜头',
                255: 'RF-S镜头',
            };
            const lensType = lensTypeMap[rawExif.CanonCs.LensType];
            if (lensType) features.push(lensType);
        }

        // 检查镜头防抖
        if (rawExif.CanonCs.LensISMode !== undefined && rawExif.CanonCs.LensISMode > 0) {
            features.push('光学防抖 (IS)');
        }

        // 检查其他镜头特性
        if (rawExif.CanonCs.USMLens !== undefined && rawExif.CanonCs.USMLens > 0) {
            features.push('USM超声波马达');
        }

        if (rawExif.CanonCs.LensStabilizer !== undefined && rawExif.CanonCs.LensStabilizer > 0) {
            features.push('镜头稳定器');
        }
    }

    // 从镜头型号推断特性
    if (details.lensInfo) {
        const lensModel = details.lensInfo.toLowerCase();
        if (lensModel.includes('is') && !features.some(f => f.includes('防抖'))) {
            features.push('光学防抖 (IS)');
        }
        if (lensModel.includes('usm') && !features.some(f => f.includes('USM'))) {
            features.push('USM超声波马达');
        }
        if (lensModel.includes('stm')) {
            features.push('STM步进马达');
        }
        if (lensModel.includes('nano usm')) {
            features.push('Nano USM马达');
        }
        if (lensModel.includes('l ') || lensModel.endsWith(' l')) {
            features.push('L级专业镜头');
        }
        if (lensModel.includes('macro')) {
            features.push('微距镜头');
        }
        if (lensModel.includes('fisheye')) {
            features.push('鱼眼镜头');
        }
        if (lensModel.includes('ts-e')) {
            features.push('移轴镜头');
        }
    }

    if (features.length > 0) {
        details.lensFeatures = features;
    }

    return details;
};

// 获取镜头校正信息
const getLensCorrections = (rawExif: any): {
    digitalLensOptimizer?: string;
    distortionCorrection?: string;
    chromaticAberrationCorrection?: string;
    vignettingCorrection?: string;
    peripheralIllumination?: string;
} => {
    const corrections: any = {};

    if (rawExif.CanonCs) {
        // 数字镜头优化器
        if (rawExif.CanonCs.DigitalLensOptimizer !== undefined) {
            const dloMap: { [key: number]: string } = {
                0: '关闭',
                1: '开启',
                2: '自动',
            };
            corrections.digitalLensOptimizer = dloMap[rawExif.CanonCs.DigitalLensOptimizer] || '未知';
        }

        // 畸变校正
        if (rawExif.CanonCs.DistortionCorrection !== undefined) {
            const distortionMap: { [key: number]: string } = {
                0: '关闭',
                1: '开启',
                2: '自动',
            };
            corrections.distortionCorrection = distortionMap[rawExif.CanonCs.DistortionCorrection] || '未知';
        }

        // 色差校正
        if (rawExif.CanonCs.ChromaticAberrationCorrection !== undefined) {
            const chromaticMap: { [key: number]: string } = {
                0: '关闭',
                1: '开启',
                2: '自动',
            };
            corrections.chromaticAberrationCorrection = chromaticMap[rawExif.CanonCs.ChromaticAberrationCorrection] || '未知';
        }

        // 暗角校正
        if (rawExif.CanonCs.VignettingCorrection !== undefined) {
            const vignettingMap: { [key: number]: string } = {
                0: '关闭',
                1: '开启',
                2: '自动',
            };
            corrections.vignettingCorrection = vignettingMap[rawExif.CanonCs.VignettingCorrection] || '未知';
        }

        // 周边光量校正
        if (rawExif.CanonCs.PeripheralIllumination !== undefined) {
            const peripheralMap: { [key: number]: string } = {
                0: '关闭',
                1: '开启',
                2: '自动',
            };
            corrections.peripheralIllumination = peripheralMap[rawExif.CanonCs.PeripheralIllumination] || '未知';
        }
    }

    return corrections;
};

// 获取光源类型
const getLightSource = (value: number): string => {
    const sources: { [key: number]: string } = {
        0: '未知',
        1: '日光',
        2: '荧光灯',
        3: '钨丝灯',
        4: '闪光灯',
        9: '晴天',
        10: '阴天',
        11: '阴影',
        12: '日光荧光灯',
        13: '日白荧光灯',
        14: '冷白荧光灯',
        15: '暖白荧光灯',
        17: '标准光A',
        18: '标准光B',
        19: '标准光C',
        20: 'D55',
        21: 'D65',
        22: 'D75',
        23: 'D50',
        24: 'ISO钨丝灯',
        255: '其他',
    };
    return sources[value] || '未知';
};

// 获取场景捕获类型 (针对佳能相机优化)
const getSceneCaptureType = (value: number, cameraMake?: string): string => {
    // 标准 EXIF 场景类型
    const standardTypes: { [key: number]: string } = {
        0: '标准',
        1: '风景',
        2: '人像',
        3: '夜景',
    };

    // 佳能相机专用场景模式
    const canonTypes: { [key: number]: string } = {
        0: '标准',
        1: '风景',
        2: '人像',
        3: '夜景人像',
        4: '运动',
        5: '微距',
        6: '自动',
        7: '智能场景',
        8: '儿童',
        9: '食物',
        10: '特殊场景',
        11: '混合自动',
        12: 'SCN特殊场景',
        13: '创意自动',
        14: '手持夜景',
        15: 'HDR逆光控制',
        16: '静音',
        17: '自拍',
        18: '加影模式',
        19: '创意滤镜',
        20: '短片摘要',
        21: '短片',
        22: '创意助手',
        23: 'Fv模式',
        24: '柔焦',
        25: '鱼眼效果',
        26: '油画效果',
        27: '水彩画效果',
        28: '玩具相机效果',
        29: '微缩景观效果',
        256: '用户自定义1',
        257: '用户自定义2',
        258: '用户自定义3',
        259: 'My Menu',
    };

    // 如果是佳能相机，使用佳能专用映射
    if (cameraMake && cameraMake.toLowerCase().includes('canon')) {
        return canonTypes[value] || standardTypes[value] || '标准';
    }

    // 其他相机使用标准映射
    return standardTypes[value] || '标准';
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

// 获取所有原始 EXIF 数据（包括 MakerNote）
const getAllRawExifData = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
        EXIF.getData(file as any, function (this: any) {
            try {
                // 获取所有标签，包括原始的数字标签
                const allTags = EXIF.getAllTags(this);

                // 尝试获取更多原始数据
                const rawData: any = { ...allTags };

                // 尝试获取 MakerNote 的原始字节数据
                if (EXIF.getTag && typeof EXIF.getTag === 'function') {
                    try {
                        const makerNote = EXIF.getTag(this, 'MakerNote');
                        if (makerNote) {
                            rawData.MakerNote = makerNote;
                            console.log('📝 获取到 MakerNote 原始数据:', makerNote);
                        }
                    } catch (e) {
                        console.log('📝 无法获取 MakerNote:', e);
                    }
                }

                // 尝试获取所有可能的数字标签
                for (let i = 1; i <= 50000; i++) {
                    try {
                        if (EXIF.getTag && typeof EXIF.getTag === 'function') {
                            const value = EXIF.getTag(this, i);
                            if (value !== undefined && value !== null) {
                                rawData[i] = value;
                            }
                        }
                    } catch (e) {
                        // 忽略错误，继续尝试下一个标签
                    }
                }

                // 检查 exif-js 内部数据结构
                if (this.exifdata) {
                    console.log('📝 exif-js 内部数据:', this.exifdata);
                    Object.assign(rawData, this.exifdata);
                }

                resolve(rawData);
            } catch (error) {
                console.error('Error getting raw EXIF data:', error);
                reject(error);
            }
        });
    });
};

// 从图片文件提取 EXIF 信息
export const extractExifFromFile = (file: File): Promise<IExifData> => {
    return new Promise((resolve, reject) => {
        EXIF.getData(file as any, function (this: any) {
            try {
                const rawExif: RawExifData = EXIF.getAllTags(this) as any;
                console.log('Raw EXIF data:', rawExif);

                // 佳能相机特殊调试信息
                if (rawExif.Make && rawExif.Make.toLowerCase().includes('canon')) {
                    console.log('🔍 佳能相机检测到:', rawExif.Make, rawExif.Model);
                    console.log('📷 场景捕获类型原始值:', rawExif.SceneCaptureType);

                    // 佳能 R6 Mark II 专用调试
                    if (rawExif.Model && rawExif.Model.toLowerCase().includes('r6')) {
                        console.log('🎯 佳能 R6 系列相机特殊优化已启用');

                        // 输出原始镜头EXIF数据以便调试
                        console.log('🔍 原始镜头EXIF数据:');
                        console.log('  - LensModel:', rawExif.LensModel);
                        console.log('  - LensMake:', rawExif.LensMake);
                        console.log('  - LensInfo:', rawExif.LensInfo);
                        console.log('  - LensSpecification:', rawExif.LensSpecification);
                        console.log('  - LensSerialNumber:', rawExif.LensSerialNumber);
                        console.log('  - MaxApertureValue:', rawExif.MaxApertureValue);
                        console.log('  - FocalLengthIn35mmFilm:', rawExif.FocalLengthIn35mmFilm);

                        // 检查所有可能的镜头相关字段
                        console.log('🔍 所有镜头相关字段搜索:');
                        Object.keys(rawExif).forEach(key => {
                            const lowerKey = key.toLowerCase();
                            if (lowerKey.includes('lens') || lowerKey.includes('focal') || lowerKey.includes('aperture')) {
                                console.log(`  - ${key}:`, (rawExif as any)[key]);
                            }
                        });

                        // 检查制造商特定字段
                        console.log('🔍 制造商特定字段搜索:');
                        Object.keys(rawExif).forEach(key => {
                            const lowerKey = key.toLowerCase();
                            if (lowerKey.includes('canon') || lowerKey.includes('maker') || lowerKey.includes('tag')) {
                                console.log(`  - ${key}:`, (rawExif as any)[key]);
                            }
                        });

                        // 检查数字标签（可能包含镜头信息）
                        console.log('🔍 数字标签搜索:');
                        Object.keys(rawExif).forEach(key => {
                            // 检查纯数字键或十六进制键
                            if (/^\d+$/.test(key) || /^0x[0-9A-F]+$/i.test(key)) {
                                const value = (rawExif as any)[key];
                                console.log(`  - 标签 ${key}:`, value);
                            }
                        });

                        // 解析 MakerNote 数据
                        console.log('📝 MakerNote 解析结果:');

                        // 输出完整的EXIF数据对象（查看所有可用字段）
                        console.log('🔍 完整EXIF对象:', rawExif);

                        if (rawExif.CanonCs) {
                            console.log('  - CanonCs.LensType:', rawExif.CanonCs.LensType);
                            console.log('  - CanonCs.LensModel:', rawExif.CanonCs.LensModel);
                            console.log('  - CanonCs.LensInfo:', rawExif.CanonCs.LensInfo);
                            console.log('  - CanonCs.LensISMode:', rawExif.CanonCs.LensISMode);
                            console.log('  - CanonCs完整对象:', rawExif.CanonCs);
                        }

                        console.log('📊 佳能特有功能解析结果:');
                        console.log('  - 图像质量:', getCanonImageQuality(rawExif));
                        console.log('  - 高ISO降噪:', getCanonNoiseReduction(rawExif));
                        console.log('  - 数字镜头优化器:', getCanonDLO(rawExif));
                        console.log('  - 双像素RAW:', getCanonDualPixelRaw(rawExif));
                        console.log('  - 对焦模式:', getCanonFocusMode(rawExif));
                        console.log('  - AF区域模式:', getCanonAFAreaMode(rawExif));
                        console.log('  - Picture Style:', getCanonPictureStyle(rawExif));
                        console.log('  - 曝光程序:', rawExif.ExposureProgram !== undefined ? getExposureProgram(rawExif.ExposureProgram, rawExif.Make) : '未知');
                        console.log('  - 测光模式:', rawExif.MeteringMode !== undefined ? getMeteringMode(rawExif.MeteringMode, rawExif.Make) : '未知');
                        console.log('  - 白平衡:', rawExif.WhiteBalance !== undefined ? getWhiteBalance(rawExif.WhiteBalance, rawExif.Make) : '未知');
                        console.log('  - 闪光灯状态:', rawExif.Flash !== undefined ? getFlashStatus(rawExif.Flash, rawExif.Make) : '未知');

                        console.log('🎨 色彩和白平衡信息:');
                        console.log('  - 白平衡偏移:', getWhiteBalanceBias(rawExif) || '无');
                        console.log('  - 色温:', getColorTemperature(rawExif) || '自动');
                        console.log('  - 色调:', getColorToneSetting(rawExif) || '标准');

                        console.log('🎨 Picture Style 详细参数:');

                        // 解析MakerNote获取Picture Style参数（调试用）
                        const debugMakerNoteData = parseCanonMakerNote(rawExif);
                        if (debugMakerNoteData.pictureStyleSettings) {
                            console.log('  📝 从MakerNote解析的Picture Style:');
                            console.log('    - 对比度:', debugMakerNoteData.pictureStyleSettings.contrast || '未检测到');
                            console.log('    - 饱和度:', debugMakerNoteData.pictureStyleSettings.saturation || '未检测到');
                            console.log('    - 锐度:', debugMakerNoteData.pictureStyleSettings.sharpness || '未检测到');
                            console.log('    - 亮度:', debugMakerNoteData.pictureStyleSettings.brightness || '未检测到');
                            console.log('    - 色调:', debugMakerNoteData.pictureStyleSettings.colorTone || '未检测到');
                        }

                        // 传统方法获取的参数（作为备用）
                        console.log('  📝 传统方法解析的Picture Style:');
                        console.log('    - 对比度:', getContrastSetting(rawExif, rawExif.Make) || '标准');
                        console.log('    - 饱和度:', getSaturationSetting(rawExif, rawExif.Make) || '标准');
                        console.log('    - 锐度:', getSharpnessSetting(rawExif, rawExif.Make) || '标准');
                        console.log('    - 亮度:', getBrightnessSetting(rawExif, rawExif.Make) || '标准');

                        console.log('🔍 镜头详细信息:');
                        const lensDetails = getLensDetails(rawExif);
                        console.log('  - 镜头信息:', debugMakerNoteData.lensModel || lensDetails.lensInfo || '未知');
                        console.log('  - 镜头序列号:', debugMakerNoteData.lensSerialNumber || '未知');
                        console.log('  - 焦距范围:', debugMakerNoteData.focalLengthRange || lensDetails.focalRange || '未知');
                        console.log('  - 光圈范围:', debugMakerNoteData.apertureRange || lensDetails.apertureRange || '未知');
                        console.log('  - 镜头特性:', (debugMakerNoteData.lensFeatures || lensDetails.lensFeatures)?.join(', ') || '无');

                        // 同时输出构建后的基础lens字段用于对比
                        const constructedLens = (() => {
                            if (rawExif.LensMake && rawExif.LensModel) {
                                return `${rawExif.LensMake} ${rawExif.LensModel}`.trim();
                            }
                            if (rawExif.LensModel) {
                                return rawExif.LensModel;
                            }
                            if (lensDetails.lensInfo) {
                                return lensDetails.lensInfo;
                            }
                            if (rawExif.LensInfo) {
                                return rawExif.LensInfo;
                            }
                            return '未知';
                        })();
                        console.log('  - 最终构建的lens字段:', constructedLens);

                        console.log('🛠️ 镜头校正信息:');
                        const lensCorrections = getLensCorrections(rawExif);
                        console.log('  - 畸变校正:', lensCorrections.distortionCorrection || '未设置');
                        console.log('  - 色差校正:', lensCorrections.chromaticAberrationCorrection || '未设置');
                        console.log('  - 暗角校正:', lensCorrections.vignettingCorrection || '未设置');
                        console.log('  - 周边光量校正:', lensCorrections.peripheralIllumination || '未设置');
                    }

                    if (rawExif.SceneCaptureType !== undefined) {
                        console.log('🎯 解析后的场景类型:', getSceneCaptureType(rawExif.SceneCaptureType, rawExif.Make));
                    }
                }

                // 构建相机型号字符串
                const camera = [rawExif.Make, rawExif.Model]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || undefined;

                // 解析 MakerNote 数据（在此处统一解析一次）
                const makerNoteData = parseCanonMakerNote(rawExif);
                console.log('  - MakerNote镜头信息:', makerNoteData);

                // 提取镜头详细信息（优先使用MakerNote解析的数据）
                const lensDetails = getLensDetails(rawExif);
                const lensCorrections = getLensCorrections(rawExif);

                // 合并MakerNote解析的镜头信息
                if (makerNoteData.lensModel && !lensDetails.lensInfo) {
                    lensDetails.lensInfo = makerNoteData.lensModel;
                }
                if (makerNoteData.focalLengthRange && !lensDetails.focalRange) {
                    lensDetails.focalRange = makerNoteData.focalLengthRange;
                }
                if (makerNoteData.apertureRange && !lensDetails.apertureRange) {
                    lensDetails.apertureRange = makerNoteData.apertureRange;
                }
                if (makerNoteData.lensFeatures && (!lensDetails.lensFeatures || lensDetails.lensFeatures.length === 0)) {
                    lensDetails.lensFeatures = makerNoteData.lensFeatures;
                }

                // 佳能相机特殊字段解析
                const canonSpecificData = rawExif.Make?.toLowerCase().includes('canon') ? {
                    imageQuality: getCanonImageQuality(rawExif),
                    noiseReduction: getCanonNoiseReduction(rawExif),
                    digitalLensOptimizer: getCanonDLO(rawExif),
                    dualPixelRaw: getCanonDualPixelRaw(rawExif),
                    canonFocusMode: getCanonFocusMode(rawExif),
                    canonAFAreaMode: getCanonAFAreaMode(rawExif),
                } : {};



                // 通用色彩和白平衡信息（优先使用MakerNote解析的数据）
                const colorAndWBData = {
                    whiteBalanceBias: getWhiteBalanceBias(rawExif),
                    colorTemperature: getColorTemperature(rawExif),
                    colorTone: getColorToneSetting(rawExif),
                    // Picture Style参数 - 优先使用MakerNote解析的值
                    contrastSetting: makerNoteData.pictureStyleSettings?.contrast || getContrastSetting(rawExif, rawExif.Make),
                    saturationSetting: makerNoteData.pictureStyleSettings?.saturation || getSaturationSetting(rawExif, rawExif.Make),
                    sharpnessSetting: makerNoteData.pictureStyleSettings?.sharpness || getSharpnessSetting(rawExif, rawExif.Make),
                    brightnessSetting: makerNoteData.pictureStyleSettings?.brightness || getBrightnessSetting(rawExif, rawExif.Make),
                };

                // 镜头信息
                const lensData = {
                    lensInfo: lensDetails.lensInfo,
                    focalRange: lensDetails.focalRange,
                    apertureRange: lensDetails.apertureRange,
                    lensFeatures: lensDetails.lensFeatures,
                    lensSerialNumber: makerNoteData.lensSerialNumber,
                    distortionCorrection: lensCorrections.distortionCorrection,
                    chromaticAberrationCorrection: lensCorrections.chromaticAberrationCorrection,
                    vignettingCorrection: lensCorrections.vignettingCorrection,
                    peripheralIllumination: lensCorrections.peripheralIllumination,
                };

                // 构建基础镜头型号字符串 (优先使用完整信息)
                const lens = (() => {
                    // 0. 优先使用 MakerNote 中的镜头信息
                    if (makerNoteData.lensModel) {
                        return makerNoteData.lensModel;
                    }
                    // 1. 首先尝试从 LensMake + LensModel 组合
                    if (rawExif.LensMake && rawExif.LensModel) {
                        return `${rawExif.LensMake} ${rawExif.LensModel}`.trim();
                    }
                    // 2. 只有 LensModel
                    if (rawExif.LensModel) {
                        return rawExif.LensModel;
                    }
                    // 3. 从 LensInfo 字段
                    if (rawExif.LensInfo) {
                        return rawExif.LensInfo;
                    }
                    // 4. 从 Lens 字段（备选）
                    if (rawExif.Lens) {
                        return rawExif.Lens;
                    }
                    // 5. 从十六进制标签
                    if ((rawExif as any)['0xA434']) {
                        return (rawExif as any)['0xA434'];
                    }
                    // 6. 从 lensDetails 获取 (如果上面都没有)
                    if (lensDetails.lensInfo) {
                        return lensDetails.lensInfo;
                    }
                    // 7. 其他备选字段
                    if (rawExif.LensType) {
                        return rawExif.LensType;
                    }
                    if (rawExif.LensID) {
                        return rawExif.LensID;
                    }
                    return undefined;
                })();

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
                    flash: rawExif.Flash !== undefined ? getFlashStatus(rawExif.Flash, rawExif.Make) : undefined,
                    whiteBalance: rawExif.WhiteBalance !== undefined ? getWhiteBalance(rawExif.WhiteBalance, rawExif.Make) : undefined,
                    filmSimulation: getFilmSimulationOrPictureStyle(rawExif),
                    colorSpace: rawExif.ColorSpace !== undefined ? getColorSpace(rawExif.ColorSpace) : undefined,
                    software: rawExif.Software || undefined,

                    // 扩展参数
                    cameraSerialNumber: rawExif.BodySerialNumber,
                    firmware: rawExif.FirmwareVersion,
                    orientation: rawExif.Orientation,
                    xResolution: rawExif.XResolution,
                    yResolution: rawExif.YResolution,
                    resolutionUnit: rawExif.ResolutionUnit === 2 ? 'inches' : 'cm',
                    exposureProgram: rawExif.ExposureProgram !== undefined ? getExposureProgram(rawExif.ExposureProgram, rawExif.Make) : undefined,
                    meteringMode: rawExif.MeteringMode !== undefined ? getMeteringMode(rawExif.MeteringMode, rawExif.Make) : undefined,
                    lightSource: rawExif.LightSource !== undefined ? getLightSource(rawExif.LightSource) : undefined,
                    sensingMethod: rawExif.SensingMethod !== undefined ? getSensingMethod(rawExif.SensingMethod) : undefined,
                    exposureMode: rawExif.ExposureMode !== undefined ? (rawExif.ExposureMode === 0 ? '自动曝光' : '手动曝光') : undefined,
                    sceneCaptureType: rawExif.SceneCaptureType !== undefined ? getSceneCaptureType(rawExif.SceneCaptureType, rawExif.Make) : undefined,

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

                    // 合并佳能特定字段
                    ...canonSpecificData,

                    // 合并色彩和白平衡数据
                    ...colorAndWBData,

                    // 合并镜头数据
                    ...lensData,
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
                    getMeteringMode(rawExif.MeteringMode, rawExif.Make) : undefined,
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

// 完整的图像分析（包含影调分析）
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

                // 使用适当的尺寸进行分析，保持详细度
                const maxSize = 800;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // 初始化直方图数组 (0-255)
                const histogram: IHistogramData = {
                    red: new Array(256).fill(0),
                    green: new Array(256).fill(0),
                    blue: new Array(256).fill(0),
                    luminance: new Array(256).fill(0)
                };

                let totalR = 0, totalG = 0, totalB = 0;
                let totalBrightness = 0;
                let shadowPixels = 0;
                let highlightPixels = 0;
                const pixelCount = data.length / 4;

                // 颜色统计
                const colorCounts: { [key: string]: number } = {};

                // 遍历每个像素
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    totalR += r;
                    totalG += g;
                    totalB += b;

                    // 更新RGB直方图
                    histogram.red[r]++;
                    histogram.green[g]++;
                    histogram.blue[b]++;

                    // 计算亮度 (使用感知亮度公式)
                    const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                    histogram.luminance[luminance]++;

                    const brightness = luminance / 255;
                    totalBrightness += brightness;

                    // 统计阴影和高光
                    if (luminance < 64) shadowPixels++; // 阴影区域 (0-63)
                    if (luminance > 192) highlightPixels++; // 高光区域 (192-255)

                    // 简化的主色调检测
                    const colorKey = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`;
                    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
                }

                // 获取主色调
                const sortedColors = Object.entries(colorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([color]) => `rgb(${color})`);

                // 计算统计数据
                const avgBrightness = totalBrightness / pixelCount;
                const brightness = Math.round((avgBrightness) * 100);
                const shadowRatio = Math.round((shadowPixels / pixelCount) * 100);
                const highlightRatio = Math.round((highlightPixels / pixelCount) * 100);

                // 计算对比度 (基于标准差)
                let variance = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                    variance += Math.pow(luminance - (avgBrightness * 255), 2);
                }
                const standardDeviation = Math.sqrt(variance / pixelCount);
                const contrast = Math.min(Math.round((standardDeviation / 64) * 100), 100);

                // 判断影调类型
                let toneType = '正常';
                if (brightness > 70 && shadowRatio < 20) {
                    toneType = '高调';
                } else if (brightness < 30 && highlightRatio < 10) {
                    toneType = '低调';
                } else if (contrast < 25) {
                    toneType = '平调';
                } else if (contrast > 60) {
                    toneType = '高对比';
                }

                // 基于亮度和颜色分布进行简单场景分类
                let scene = '未知';
                if (avgBrightness > 0.7) {
                    scene = '明亮场景';
                } else if (avgBrightness < 0.3) {
                    scene = '暗调场景';
                } else {
                    scene = '自然风景';
                }

                // 创建完整的影调分析数据
                const toneAnalysis: IToneAnalysis = {
                    toneType,
                    brightness,
                    contrast,
                    shadowRatio,
                    highlightRatio,
                    histogram
                };

                const analysis: IImageAnalysis = {
                    dominantColors: sortedColors,
                    averageBrightness: avgBrightness,
                    contrast: contrast / 100, // 保持原有的0-1范围用于兼容
                    saturation: 0.7, // 简化值
                    sharpness: 7.5, // 简化值
                    scene,
                    toneAnalysis // 新增完整的影调分析数据
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