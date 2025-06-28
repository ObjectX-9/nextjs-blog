import { successResponse, withErrorHandler, errorResponse, ApiErrors } from "../data";
import sharp from 'sharp';
import chroma from 'chroma-js';

// @ts-ignore - color-temperature库缺少类型定义
const colorTemperature = require('color-temperature');

// 精简的色温计算 - 只保留最准确的两种方法
function calculateColorTemperatureMultiMethod(rgbBuffer: Buffer): {
    methods: {
        whitePatch: number;
        histogramCenter: number;
    };
    final: number;
    debug: string[];
} {
    const rgbPixels = rgbBuffer.length / 3;
    const debugInfo: string[] = [];

    // 预处理：提取RGB数据
    let totalR = 0, totalG = 0, totalB = 0;
    const brightPixels: Array<{ r: number, g: number, b: number, brightness: number }> = [];

    for (let i = 0; i < rgbBuffer.length; i += 3) {
        const r = rgbBuffer[i];
        const g = rgbBuffer[i + 1];
        const b = rgbBuffer[i + 2];
        const brightness = (r + g + b) / 3;

        totalR += r;
        totalG += g;
        totalB += b;

        // 收集亮像素
        if (brightness > 150) {
            brightPixels.push({ r, g, b, brightness });
        }
    }

    const avgR = totalR / rgbPixels;
    const avgG = totalG / rgbPixels;
    const avgB = totalB / rgbPixels;

    debugInfo.push(`RGB平均值: (${avgR.toFixed(1)}, ${avgG.toFixed(1)}, ${avgB.toFixed(1)})`);

    // 方法1: White Patch算法 - 分析最亮区域的色彩倾向
    let whitePatchTemp = 5500;
    if (brightPixels.length > 0) {
        const whiteR = brightPixels.reduce((sum, p) => sum + p.r, 0) / brightPixels.length;
        const whiteG = brightPixels.reduce((sum, p) => sum + p.g, 0) / brightPixels.length;
        const whiteB = brightPixels.reduce((sum, p) => sum + p.b, 0) / brightPixels.length;

        const whiteRBRatio = whiteR / Math.max(whiteB, 1);
        if (whiteRBRatio > 1.2) {
            whitePatchTemp = Math.max(2000, 4000 - (whiteRBRatio - 1) * 1500);
        } else if (whiteRBRatio < 0.8) {
            whitePatchTemp = Math.min(8000, 6000 + (1 - whiteRBRatio) * 2000);
        } else {
            whitePatchTemp = 5000 + (whiteRBRatio - 1) * 1000;
        }
        debugInfo.push(`White Patch: 亮区RGB=(${whiteR.toFixed(1)}, ${whiteG.toFixed(1)}, ${whiteB.toFixed(1)}), 红蓝比=${whiteRBRatio.toFixed(3)} → ${whitePatchTemp.toFixed(0)}K`);
    } else {
        debugInfo.push(`White Patch: 无足够亮像素，使用默认 → ${whitePatchTemp}K`);
    }

    // 方法2: RGB直方图重心分析 - 基于通道分布重心
    const rHistogram = new Array(256).fill(0);
    const gHistogram = new Array(256).fill(0);
    const bHistogram = new Array(256).fill(0);

    for (let i = 0; i < rgbBuffer.length; i += 3) {
        rHistogram[rgbBuffer[i]]++;
        gHistogram[rgbBuffer[i + 1]]++;
        bHistogram[rgbBuffer[i + 2]]++;
    }

    const calculateCenter = (histogram: number[]): number => {
        let weightedSum = 0, totalWeight = 0;
        for (let i = 0; i < histogram.length; i++) {
            weightedSum += i * histogram[i];
            totalWeight += histogram[i];
        }
        return totalWeight > 0 ? weightedSum / totalWeight : 128;
    };

    const redCenter = calculateCenter(rHistogram);
    const greenCenter = calculateCenter(gHistogram);
    const blueCenter = calculateCenter(bHistogram);

    const centerRBRatio = redCenter / Math.max(blueCenter, 1);
    const histogramTemp = Math.max(2000, Math.min(8000,
        5000 + (centerRBRatio - 1) * 2000
    ));
    debugInfo.push(`直方图重心: R=${redCenter.toFixed(1)}, G=${greenCenter.toFixed(1)}, B=${blueCenter.toFixed(1)}, 比值=${centerRBRatio.toFixed(3)} → ${histogramTemp.toFixed(0)}K`);

    // 双方法平均
    const methods = {
        whitePatch: Math.round(whitePatchTemp),
        histogramCenter: Math.round(histogramTemp)
    };

    const finalTemp = Math.round((whitePatchTemp + histogramTemp) / 2);
    debugInfo.push(`最终结果: White Patch(${methods.whitePatch}K) + 直方图重心(${methods.histogramCenter}K) 平均 = ${finalTemp}K`);

    return {
        methods,
        final: finalTemp,
        debug: debugInfo
    };
}

// 白平衡分析函数
function analyzeWhiteBalance(rgbBuffer: Buffer, estimatedColorTemp: number, dominantR: number, dominantG: number, dominantB: number): {
    colorBias: {
        overall: string;
        degree: number;
        direction: 'warm' | 'cool' | 'neutral';
    };
    whiteBalanceAssessment: {
        isCorrect: boolean;
        suggestedAdjustment: string;
        confidence: number;
    };
    neutralGrayDeviation: {
        redDeviation: number;
        blueDeviation: number;
        severity: 'none' | 'slight' | 'moderate' | 'severe';
    };
    debug: string[];
} {
    const rgbPixels = rgbBuffer.length / 3;
    const debugInfo: string[] = [];

    // 使用主导色彩作为主要分析数据（与色温分析保持一致）
    const avgR = dominantR;
    const avgG = dominantG;
    const avgB = dominantB;

    debugInfo.push(`🎯 白平衡分析基于主导色彩: RGB(${avgR}, ${avgG}, ${avgB})`);

    // 计算整体RGB平均值用于对比
    let totalR = 0, totalG = 0, totalB = 0;
    for (let i = 0; i < rgbBuffer.length; i += 3) {
        totalR += rgbBuffer[i];
        totalG += rgbBuffer[i + 1];
        totalB += rgbBuffer[i + 2];
    }

    const overallAvgR = totalR / rgbPixels;
    const overallAvgG = totalG / rgbPixels;
    const overallAvgB = totalB / rgbPixels;

    debugInfo.push(`📊 整体RGB平均: RGB(${overallAvgR.toFixed(1)}, ${overallAvgG.toFixed(1)}, ${overallAvgB.toFixed(1)})`);
    debugInfo.push(`🌡️ 检测到色温: ${estimatedColorTemp}K`);

    // 寻找可能的白色/灰色区域
    const neutralPixels: Array<{ r: number, g: number, b: number }> = [];
    for (let i = 0; i < rgbBuffer.length; i += 3) {
        const r = rgbBuffer[i];
        const g = rgbBuffer[i + 1];
        const b = rgbBuffer[i + 2];
        const brightness = (r + g + b) / 3;

        // 寻找高亮度且色彩相对中性的像素
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        if (brightness > 150 && brightness < 240 && maxDiff < 30) {
            neutralPixels.push({ r, g, b });
        }
    }

    // 分析色偏
    let biasR = 0, biasG = 0, biasB = 0;

    if (neutralPixels.length > 10) {
        // 使用检测到的中性像素
        const neutralR = neutralPixels.reduce((sum, p) => sum + p.r, 0) / neutralPixels.length;
        const neutralG = neutralPixels.reduce((sum, p) => sum + p.g, 0) / neutralPixels.length;
        const neutralB = neutralPixels.reduce((sum, p) => sum + p.b, 0) / neutralPixels.length;

        const neutralAvg = (neutralR + neutralG + neutralB) / 3;
        biasR = neutralR - neutralAvg;
        biasG = neutralG - neutralAvg;
        biasB = neutralB - neutralAvg;
    } else {
        // 使用整体平均值
        const overallAvg = (avgR + avgG + avgB) / 3;
        biasR = avgR - overallAvg;
        biasG = avgG - overallAvg;
        biasB = avgB - overallAvg;
    }

    // 计算色偏方向和程度
    const warmCoolBias = biasR - biasB; // 正值偏暖，负值偏冷
    const biasDegree = Math.sqrt(biasR * biasR + biasG * biasG + biasB * biasB);

    debugInfo.push(`🧮 色偏计算: 红色偏差=${biasR.toFixed(2)}, 蓝色偏差=${biasB.toFixed(2)}, 暖冷偏差=${warmCoolBias.toFixed(2)}`);
    debugInfo.push(`📏 色偏程度: ${biasDegree.toFixed(2)} (综合偏差)`);

    let direction: 'warm' | 'cool' | 'neutral';
    let overallBias: string;

    // 降低中性判断的阈值，使检测更灵敏
    if (Math.abs(warmCoolBias) < 2) {
        direction = 'neutral';
        overallBias = '色彩平衡良好';
    } else if (warmCoolBias > 0) {
        direction = 'warm';
        overallBias = warmCoolBias > 8 ? '明显偏暖/偏黄' : '轻微偏暖';
    } else {
        direction = 'cool';
        overallBias = warmCoolBias < -8 ? '明显偏冷/偏蓝' : '轻微偏冷';
    }

    debugInfo.push(`🎨 色偏判断: ${direction} (${overallBias})`);

    // 评估白平衡正确性
    const isCorrect = biasDegree < 10 && Math.abs(warmCoolBias) < 8;
    let suggestedAdjustment: string;
    let confidence: number;

    if (isCorrect) {
        suggestedAdjustment = '白平衡设置合适，无需调整';
        confidence = 0.9;
    } else if (warmCoolBias > 10) {
        suggestedAdjustment = `建议将白平衡调低约${Math.round(warmCoolBias * 50)}K，或使用更冷的白平衡预设`;
        confidence = 0.8;
    } else if (warmCoolBias < -10) {
        suggestedAdjustment = `建议将白平衡调高约${Math.round(-warmCoolBias * 50)}K，或使用更暖的白平衡预设`;
        confidence = 0.8;
    } else {
        suggestedAdjustment = '白平衡基本正确，可微调优化';
        confidence = 0.7;
    }

    // 中性灰偏差评估
    const redDeviation = Math.round(biasR * 100) / 100;
    const blueDeviation = Math.round(biasB * 100) / 100;

    let severity: 'none' | 'slight' | 'moderate' | 'severe';
    if (biasDegree < 5) severity = 'none';
    else if (biasDegree < 12) severity = 'slight';
    else if (biasDegree < 20) severity = 'moderate';
    else severity = 'severe';

    debugInfo.push(`⚖️ 白平衡评估: ${isCorrect ? '正确' : '需调整'} (置信度${Math.round(confidence * 100)}%)`);
    debugInfo.push(`💡 调整建议: ${suggestedAdjustment}`);

    return {
        colorBias: {
            overall: overallBias,
            degree: Math.round(biasDegree * 100) / 100,
            direction
        },
        whiteBalanceAssessment: {
            isCorrect,
            suggestedAdjustment,
            confidence: Math.round(confidence * 100) / 100
        },
        neutralGrayDeviation: {
            redDeviation,
            blueDeviation,
            severity
        },
        debug: debugInfo
    };
}

// 辅助函数：计算暖冷指数
function calculateWarmCoolIndex(r: number, g: number, b: number): number {
    // 避免除零
    if (r + g + b === 0) return 0;

    // 标准化RGB值
    const total = r + g + b;
    const rNorm = r / total;
    const gNorm = g / total;
    const bNorm = b / total;

    // 基于色温理论的暖冷指数计算
    // 暖色调：红色和黄色（红+绿）占优
    // 冷色调：蓝色占优
    const warmComponent = rNorm + (gNorm * 0.5); // 红色权重1，绿色权重0.5
    const coolComponent = bNorm;

    // 计算暖冷指数（-1到1，负值偏冷，正值偏暖）
    const index = (warmComponent - coolComponent) / (warmComponent + coolComponent + 0.001);

    return Math.max(-1, Math.min(1, Math.round(index * 100) / 100));
}

// 辅助函数：计算对比度
function calculateContrast(brightness: any, histogram: number[], totalPixels: number) {
    const { min, max, average } = brightness;

    // 1. 全局对比度：基于亮度范围
    const global = max > min ? (max - min) / 255 : 0;

    // 2. RMS对比度：基于标准差
    let squaredSum = 0;
    for (let i = 0; i < histogram.length; i++) {
        const count = histogram[i];
        const diff = i - average;
        squaredSum += count * diff * diff;
    }
    const variance = squaredSum / totalPixels;
    const standardDeviation = Math.sqrt(variance);
    const rms = standardDeviation / 255; // 归一化

    // 3. Michelson对比度：适用于周期性图案
    const michelson = (max + min) > 0 ? (max - min) / (max + min) : 0;

    // 4. 韦伯对比度：基于平均亮度
    const weber = average > 0 ? (max - min) / average : 0;

    // 5. 综合对比度：结合多种算法
    const composite = (global * 0.4 + rms * 0.3 + michelson * 0.2 + Math.min(weber / 255, 1) * 0.1);

    return {
        global: Math.round(global * 100) / 100,
        rms: Math.round(rms * 100) / 100,
        michelson: Math.round(michelson * 100) / 100,
        weber: Math.round(weber / 255 * 100) / 100,
        composite: Math.round(composite * 100) / 100
    };
}

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
    contrast: any,
    warmCoolIndex: number,
    shadowRatio: number,
    midtoneRatio: number,
    highlightRatio: number,
    tonalRange: number,
    histogramPeaks: number
) {
    const { average, histogram } = brightness;
    const { global } = contrast;

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

    // 判断亮度范围：长调(10)、中调(6)、短调(3)
    if (tonalRange > 200 && global > 0.7) {
        rangeType = "长调范围";
        rangeScore = 10;
    } else if (tonalRange < 100 && global < 0.3) {
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
    const isFullRange = (lowZones > 0.25 && highZones > 0.25 && midZones < 0.3 && global > 0.8);

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
    colors: {
        dominant: string;
        temperature: number;
        temperatureMethods: {
            whitePatch: number;
            histogramCenter: number;
        };
        warmCoolIndex: number;
    };
    whiteBalance: {
        colorBias: {
            overall: string;
            degree: number;
            direction: 'warm' | 'cool' | 'neutral';
        };
        whiteBalanceAssessment: {
            isCorrect: boolean;
            suggestedAdjustment: string;
            confidence: number;
        };
        neutralGrayDeviation: {
            redDeviation: number;
            blueDeviation: number;
            severity: 'none' | 'slight' | 'moderate' | 'severe';
        };
        debug: string[];
    };
    contrast: {
        global: number;
        rms: number;
        michelson: number;
        weber: number;
        composite: number;
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

        console.log(`原始图像信息: ${width}x${height}, 通道数:${channels}, 色彩空间:${space}`);

        // 确保图像转换为RGB格式并缩放
        const maxSize = 600;
        let processImage = image.removeAlpha().toColorspace('srgb'); // 强制转换为sRGB，移除alpha通道

        if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            processImage = processImage.resize({
                width: Math.round(width * scale),
                height: Math.round(height * scale),
                fit: 'inside'
            });
        }

        // 验证处理后的图像信息
        const processedMeta = await processImage.metadata();
        console.log(`处理后图像: ${processedMeta.width}x${processedMeta.height}, 通道数:${processedMeta.channels}, 色彩空间:${processedMeta.space}`);

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

        // 调试：检查前几个像素的RGB值
        console.log(`RGB缓冲区大小: ${rgbBuffer.length} bytes`);
        console.log(`前10个像素的RGB值:`);
        for (let i = 0; i < Math.min(30, rgbBuffer.length); i += 3) {
            const r = rgbBuffer[i];
            const g = rgbBuffer[i + 1];
            const b = rgbBuffer[i + 2];
            console.log(`  像素${Math.floor(i / 3)}: RGB(${r}, ${g}, ${b})`);
        }

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

        // 改进的主导色彩提取 - 基于饱和度分析
        const rgbPixels = rgbBuffer.length / 3;

        // 收集高饱和度像素（真正有颜色的像素）
        const colorfulPixels: Array<{ r: number, g: number, b: number, saturation: number, brightness: number }> = [];

        for (let i = 0; i < rgbBuffer.length; i += 3) {
            const r = rgbBuffer[i];
            const g = rgbBuffer[i + 1];
            const b = rgbBuffer[i + 2];
            const brightness = (r + g + b) / 3;

            // 计算饱和度
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max > 0 ? (max - min) / max : 0;

            // 改进的颜色像素过滤条件 - 排除噪点和极端值
            const isValidColor = saturation > 0.2 &&
                brightness > 40 && brightness < 220 &&
                max > 50 && // 排除太暗的像素
                min < 200 && // 排除太亮的像素  
                (max - min) > 25; // 排除色彩差异太小的

            if (isValidColor) {
                colorfulPixels.push({ r, g, b, saturation, brightness });
            }
        }

        console.log(`发现 ${colorfulPixels.length} 个有颜色的像素 (${(colorfulPixels.length / rgbPixels * 100).toFixed(1)}%)`);

        let avgR, avgG, avgB;

        if (colorfulPixels.length > rgbPixels * 0.05) { // 至少5%的像素有颜色
            // 分析最高饱和度的像素
            colorfulPixels.sort((a, b) => b.saturation - a.saturation);
            const top10 = colorfulPixels.slice(0, 10);
            console.log(`最高饱和度的10个像素:`);
            top10.forEach((p, i) => {
                console.log(`  ${i + 1}. RGB(${p.r}, ${p.g}, ${p.b}) 饱和度=${p.saturation.toFixed(3)}`);
            });

            // 策略1：使用高饱和度像素的加权平均
            let rSum = 0, gSum = 0, bSum = 0, weightSum = 0;

            colorfulPixels.forEach(pixel => {
                // 饱和度越高，权重越大
                const weight = Math.pow(pixel.saturation, 2);
                rSum += pixel.r * weight;
                gSum += pixel.g * weight;
                bSum += pixel.b * weight;
                weightSum += weight;
            });

            avgR = Math.round(rSum / weightSum);
            avgG = Math.round(gSum / weightSum);
            avgB = Math.round(bSum / weightSum);

            console.log(`饱和度加权: rSum=${rSum.toFixed(0)}, gSum=${gSum.toFixed(0)}, bSum=${bSum.toFixed(0)}, weightSum=${weightSum.toFixed(2)}`);
            console.log(`使用饱和度加权算法: (${avgR}, ${avgG}, ${avgB})`);

            // 备选：直接用最饱和的前5%像素的简单平均
            const topPercent = colorfulPixels.slice(0, Math.max(10, Math.floor(colorfulPixels.length * 0.05)));
            const altR = Math.round(topPercent.reduce((sum, p) => sum + p.r, 0) / topPercent.length);
            const altG = Math.round(topPercent.reduce((sum, p) => sum + p.g, 0) / topPercent.length);
            const altB = Math.round(topPercent.reduce((sum, p) => sum + p.b, 0) / topPercent.length);
            console.log(`备选方案(前5%简单平均): (${altR}, ${altG}, ${altB})`);

            // 如果加权平均还是灰色，使用备选方案
            const weightedSaturation = Math.max(Math.abs(avgR - avgG), Math.abs(avgG - avgB), Math.abs(avgR - avgB));
            const altSaturation = Math.max(Math.abs(altR - altG), Math.abs(altG - altB), Math.abs(altR - altB));

            if (altSaturation > weightedSaturation) {
                avgR = altR; avgG = altG; avgB = altB;
                console.log(`采用备选方案，因为饱和度更高 (${altSaturation} > ${weightedSaturation})`);
            }

        } else if (colorfulPixels.length > 0) {
            // 策略2：饱和度像素太少，使用最饱和的前10%
            colorfulPixels.sort((a, b) => b.saturation - a.saturation);
            const topPixels = colorfulPixels.slice(0, Math.max(10, Math.floor(colorfulPixels.length * 0.1)));

            avgR = Math.round(topPixels.reduce((sum, p) => sum + p.r, 0) / topPixels.length);
            avgG = Math.round(topPixels.reduce((sum, p) => sum + p.g, 0) / topPixels.length);
            avgB = Math.round(topPixels.reduce((sum, p) => sum + p.b, 0) / topPixels.length);

            console.log(`使用最饱和像素算法: (${avgR}, ${avgG}, ${avgB}), 取前${topPixels.length}个像素`);

        } else {
            // 策略3：没有饱和像素，回退到亮区域分析
            let brightR = 0, brightG = 0, brightB = 0, brightCount = 0;

            for (let i = 0; i < rgbBuffer.length; i += 3) {
                const r = rgbBuffer[i];
                const g = rgbBuffer[i + 1];
                const b = rgbBuffer[i + 2];
                const brightness = (r + g + b) / 3;

                if (brightness > 120 && brightness < 220) {
                    brightR += r;
                    brightG += g;
                    brightB += b;
                    brightCount++;
                }
            }

            if (brightCount > 0) {
                avgR = Math.round(brightR / brightCount);
                avgG = Math.round(brightG / brightCount);
                avgB = Math.round(brightB / brightCount);
                console.log(`使用亮区域算法: (${avgR}, ${avgG}, ${avgB})`);
            } else {
                avgR = avgG = avgB = 128;
                console.log(`所有方法失败，使用默认灰色: (128, 128, 128)`);
            }
        }

        // 简单平均用于对比
        const simpleR = Math.round(rgbBuffer.reduce((sum, val, i) => i % 3 === 0 ? sum + val : sum, 0) / rgbPixels);
        const simpleG = Math.round(rgbBuffer.reduce((sum, val, i) => i % 3 === 1 ? sum + val : sum, 0) / rgbPixels);
        const simpleB = Math.round(rgbBuffer.reduce((sum, val, i) => i % 3 === 2 ? sum + val : sum, 0) / rgbPixels);

        console.log(`主导色彩: (${avgR}, ${avgG}, ${avgB}) vs 简单平均: (${simpleR}, ${simpleG}, ${simpleB}), 有颜色像素: ${colorfulPixels.length}个`);

        // 使用多种方法计算色温 - 基于提取的主导色彩
        console.log(`🎯 色温计算使用主导色彩: RGB(${avgR}, ${avgG}, ${avgB})`);

        // 创建一个模拟的RGB缓冲区，全部填充主导色彩
        const dominantColorBuffer = Buffer.alloc(rgbBuffer.length);
        for (let i = 0; i < dominantColorBuffer.length; i += 3) {
            dominantColorBuffer[i] = avgR;     // R
            dominantColorBuffer[i + 1] = avgG; // G  
            dominantColorBuffer[i + 2] = avgB; // B
        }

        const temperatureResult = calculateColorTemperatureMultiMethod(dominantColorBuffer);
        const temperature = temperatureResult.final;
        const warmCoolIndex = calculateWarmCoolIndex(avgR, avgG, avgB);

        // 输出调试信息到控制台
        console.log('=== 精简色温计算方法对比 ===');
        temperatureResult.debug.forEach(line => console.log(line));
        console.log(`各方法结果: White Patch=${temperatureResult.methods.whitePatch}K, 直方图重心=${temperatureResult.methods.histogramCenter}K`);
        console.log(`最终采用: ${temperature}K`);
        console.log('===========================');

        // 计算亮度统计
        const channelStats = stats.channels[0]; // 取第一个通道的统计信息
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

        // 计算更精确的对比度
        const contrast = calculateContrast(brightness, histogram, totalPixels);

        // 计算色调范围和分布特征
        const tonalRange = brightness.max - brightness.min;
        const histogramPeaks = countHistogramPeaks(histogram);

        // 白平衡分析
        const whiteBalanceResult = analyzeWhiteBalance(rgbBuffer, temperature, avgR, avgG, avgB);

        // 输出白平衡调试信息到控制台
        console.log('=== 白平衡分析调试信息 ===');
        whiteBalanceResult.debug.forEach(line => console.log(line));
        console.log(`白平衡结论: ${whiteBalanceResult.colorBias.overall} (${whiteBalanceResult.colorBias.direction})`);
        console.log(`调整建议: ${whiteBalanceResult.whiteBalanceAssessment.suggestedAdjustment}`);
        console.log('=========================');

        // 更精确的影调类型分析
        const toneTypeResult = analyzeToneType(
            brightness,
            contrast,
            warmCoolIndex,
            shadowRatio,
            midtoneRatio,
            highlightRatio,
            tonalRange,
            histogramPeaks
        );

        const analysis: ImageAnalysisResult = {
            dimensions: { width, height },
            brightness,
            colors: {
                dominant: `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`,
                temperature,
                temperatureMethods: temperatureResult.methods,
                warmCoolIndex: Math.round(warmCoolIndex * 100) / 100
            },
            whiteBalance: whiteBalanceResult,
            contrast: {
                global: contrast.global,
                rms: contrast.rms,
                michelson: contrast.michelson,
                weber: contrast.weber,
                composite: contrast.composite
            },
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