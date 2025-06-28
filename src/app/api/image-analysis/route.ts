import { successResponse, withErrorHandler, errorResponse, ApiErrors } from "../data";
import sharp from 'sharp';

// 辅助函数：计算直方图峰值数量
function countHistogramPeaks(histogram: number[]): number {
    let peaks = 0;
    const threshold = Math.max(...histogram) * 0.1; // 10%阈值

    for (let i = 1; i < histogram.length - 1; i++) {
        if (histogram[i] > threshold &&
            histogram[i] > histogram[i - 1] &&
            histogram[i] > histogram[i + 1]) {
            peaks++;
        }
    }
    return peaks;
}

// 根据摄影理论重新设计的十大影调分析算法
// 参考：https://www.sohu.com/a/409629203_166844
function analyzeToneType(
    brightness: any,
    shadowRatio: number,
    midtoneRatio: number,
    highlightRatio: number,
    tonalRange: number,
    histogramPeaks: number
) {
    const { average, histogram } = brightness;

    // 按照摄影理论重新定义亮度区域
    // 将0-255的亮度值按照摄影理论分为10个区域
    const zones = [];
    for (let i = 0; i < 10; i++) {
        const start = Math.floor(i * 25.5);
        const end = Math.floor((i + 1) * 25.5);
        const count = histogram.slice(start, end).reduce((sum: number, val: number) => sum + val, 0);
        zones.push(count);
    }

    const totalPixels = zones.reduce((sum, val) => sum + val, 0);
    const zoneRatios = zones.map(count => count / totalPixels);

    // 定义区域分组
    const lowZones = zoneRatios.slice(0, 3).reduce((sum, val) => sum + val, 0);    // 区域1-3：低调区
    const midZones = zoneRatios.slice(3, 7).reduce((sum, val) => sum + val, 0);    // 区域4-7：中调区  
    const highZones = zoneRatios.slice(7, 10).reduce((sum, val) => sum + val, 0);  // 区域8-10：高调区

    // 计算亮度范围类型
    let rangeType = "中调范围"; // 默认6
    let rangeScore = 6;

    // 简化的对比度计算：基于亮度范围
    const simpleContrast = tonalRange / 255;

    // 判断亮度范围：长调(10)、中调(6)、短调(3)
    if (tonalRange > 200 && simpleContrast > 0.7) {
        rangeType = "长调范围";
        rangeScore = 10;
    } else if (tonalRange < 100 && simpleContrast < 0.3) {
        rangeType = "短调范围";
        rangeScore = 3;
    }

    // 判断主要亮度区域
    let dominantZone = "中调";
    let zoneScore = 5;

    if (highZones > 0.6) {
        dominantZone = "高调";
        zoneScore = 9;
    } else if (lowZones > 0.6) {
        dominantZone = "低调";
        zoneScore = 1;
    }

    // 特殊处理全长调：对比强烈，直方图呈U字型
    const isFullRange = (lowZones > 0.25 && highZones > 0.25 && midZones < 0.3 && simpleContrast > 0.8);

    let type = "中中调";
    let confidence = 0.5;
    const factors: string[] = [];

    // 根据组合判断具体的十大影调类型
    if (isFullRange) {
        type = "全长调";
        confidence = 0.9;
        factors.push("对比强烈", "直方图U字型", "亮度范围极广");
    } else {
        // 组合判断九大影调
        if (zoneScore === 9) { // 高调系列
            if (rangeScore === 10) {
                type = "高长调";
                confidence = 0.9;
                factors.push("高光为主", "亮度范围全覆盖", "明亮轻快");
            } else if (rangeScore === 6) {
                type = "高中调";
                confidence = 0.85;
                factors.push("高调为主", "具有中间调", "缺乏黑色");
            } else {
                type = "高短调";
                confidence = 0.85;
                factors.push("高调为主", "亮度范围窄", "无阴影中间调");
            }
        } else if (zoneScore === 1) { // 低调系列
            if (rangeScore === 10) {
                type = "低长调";
                confidence = 0.9;
                factors.push("暗部为主", "不缺高光中间调", "层次丰富");
            } else if (rangeScore === 6) {
                type = "低中调";
                confidence = 0.85;
                factors.push("暗部为主", "中间灰丰富", "层次细腻");
            } else {
                type = "低短调";
                confidence = 0.85;
                factors.push("暗部为主", "亮度范围窄", "深沉浓重");
            }
        } else { // 中调系列
            if (rangeScore === 10) {
                type = "中长调";
                confidence = 0.8;
                factors.push("中间调为主", "亮度范围广", "层次平衡");
            } else if (rangeScore === 6) {
                type = "中中调";
                confidence = 0.75;
                factors.push("中间灰居多", "无纯黑纯白", "调性平和");
            } else {
                type = "中短调";
                confidence = 0.75;
                factors.push("无高光阴影", "画面发灰", "适合雾霾意境");
            }
        }
    }

    // 添加数值化表示
    const notation = isFullRange ? "10" : `${rangeScore},${zoneScore}`;
    factors.push(`影调记号: ${notation}`);

    return {
        type,
        confidence: Math.round(confidence * 100) / 100,
        factors,
        notation,
        zones: {
            low: Math.round(lowZones * 100),
            mid: Math.round(midZones * 100),
            high: Math.round(highZones * 100)
        }
    };
}

interface ImageAnalysisResult {
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

export const POST = withErrorHandler<[Request], { analysis: ImageAnalysisResult }>(async (request: Request) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return errorResponse(ApiErrors.BAD_REQUEST("No file provided"));
        }

        if (!file.type.startsWith("image/")) {
            return errorResponse(ApiErrors.BAD_REQUEST("Only image files are allowed"));
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // 获取图像基本信息
        const image = sharp(buffer);
        const metadata = await image.metadata();
        const { width = 0, height = 0, channels, space } = metadata;

        console.log(`开始分析图像: ${width}x${height}`);

        // 确保图像转换为RGB格式并缩放
        const maxSize = 600;
        let processImage = image.removeAlpha().toColorspace('srgb');

        if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            processImage = processImage.resize({
                width: Math.round(width * scale),
                height: Math.round(height * scale),
                fit: 'inside'
            });
        }

        // 获取灰度图像统计信息
        const stats = await processImage.stats();
        const grayBuffer = await processImage.greyscale().raw().toBuffer();

        // 计算灰度直方图
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < grayBuffer.length; i++) {
            histogram[grayBuffer[i]]++;
        }

        // 获取RGB通道数据并计算RGB直方图
        const rgbBuffer = await processImage.raw().toBuffer();

        const rHistogram = new Array(256).fill(0);
        const gHistogram = new Array(256).fill(0);
        const bHistogram = new Array(256).fill(0);

        for (let i = 0; i < rgbBuffer.length; i += 3) {
            rHistogram[rgbBuffer[i]]++;
            gHistogram[rgbBuffer[i + 1]]++;
            bHistogram[rgbBuffer[i + 2]]++;
        }

        // 计算基础统计
        const totalPixels = grayBuffer.length;
        const shadowRatio = histogram.slice(0, 85).reduce((sum, count) => sum + count, 0) / totalPixels;
        const midtoneRatio = histogram.slice(85, 170).reduce((sum, count) => sum + count, 0) / totalPixels;
        const highlightRatio = histogram.slice(170, 256).reduce((sum, count) => sum + count, 0) / totalPixels;

        // 计算亮度统计
        const channelStats = stats.channels[0];

        const brightness = {
            average: Math.round(channelStats.mean),
            min: Math.round(channelStats.min),
            max: Math.round(channelStats.max),
            histogram,
            rgbHistograms: {
                red: rHistogram,
                green: gHistogram,
                blue: bHistogram
            }
        };

        // 计算影调分析所需参数
        const tonalRange = brightness.max - brightness.min;
        const histogramPeaks = countHistogramPeaks(histogram);

        // 基于亮度数据的影调类型分析
        const toneTypeResult = analyzeToneType(
            brightness,
            shadowRatio,
            midtoneRatio,
            highlightRatio,
            tonalRange,
            histogramPeaks
        );

        console.log(`✅ 影调分析完成: ${toneTypeResult.type} (置信度: ${Math.round(toneTypeResult.confidence * 100)}%)`);

        const analysis: ImageAnalysisResult = {
            dimensions: { width, height },
            brightness,
            toneAnalysis: {
                type: toneTypeResult.type,
                confidence: toneTypeResult.confidence,
                shadowRatio: Math.round(shadowRatio * 100) / 100,
                midtoneRatio: Math.round(midtoneRatio * 100) / 100,
                highlightRatio: Math.round(highlightRatio * 100) / 100,
                factors: toneTypeResult.factors,
                notation: toneTypeResult.notation,
                zones: toneTypeResult.zones
            }
        };

        return successResponse({ analysis });

    } catch (error: any) {
        console.error("Image analysis error:", error);
        return errorResponse(ApiErrors.INTERNAL_ERROR(`Failed to analyze image: ${error.message}`));
    }
}); 