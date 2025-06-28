"use client";

import React from 'react';
import { ImageAnalysisResult } from '@/app/model/photo';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
);

interface ImageAnalysisDisplayProps {
    imageAnalysis: ImageAnalysisResult;
}

// 影调类型详细解释组件
const ToneTypeExplanation = ({ toneType }: { toneType: string }) => {
    const explanations: Record<string, {
        description: string;
        characteristics: string[];
        applications: string[];
        techniques: string[];
        examples: string[];
    }> = {
        "高长调": {
            description: "高长调是明亮而层次丰富的影调类型，画面以高光为主导，但保持了完整的亮度范围，从纯黑到纯白都有分布。",
            characteristics: [
                "画面整体明亮轻快，给人积极向上的感觉",
                "高光区域占主导地位（60%以上）",
                "仍保留丰富的中间调和阴影细节",
                "对比度适中，层次感强烈",
                "亮度范围覆盖0-255全区间"
            ],
            applications: [
                "风光摄影中的雪景、沙滩、云海",
                "人像摄影中的清新、甜美风格",
                "商业摄影中需要明亮感的产品",
                "婚纱摄影、儿童摄影",
                "表现希望、纯洁、干净的主题"
            ],
            techniques: [
                "适当增加曝光补偿（+0.5到+1.5EV）",
                "使用反光板或补光灯填充阴影",
                "后期适当提亮高光和中间调",
                "保持足够的对比度避免画面发灰",
                "注意保留高光细节不过曝"
            ],
            examples: [
                "雪山风光：白雪皑皑但保留岩石和天空层次",
                "海滩人像：明亮的沙滩背景下的清新人像",
                "室内写真：大窗户自然光营造的明亮氛围"
            ]
        },
        "高中调": {
            description: "高中调以高光和中间调为主，缺少深色调，整体偏亮但亮度范围相对有限，营造柔和明亮的视觉效果。",
            characteristics: [
                "高光区域丰富，中间调过渡自然",
                "缺乏深黑色调和强烈阴影",
                "画面柔和，对比度适中",
                "亮度主要集中在中高调区域",
                "给人温和、舒适的感觉"
            ],
            applications: [
                "肖像摄影中的柔美风格",
                "时尚摄影的梦幻效果",
                "产品摄影中需要柔和感的商品",
                "室内摄影的温馨氛围",
                "表现浪漫、优雅的主题"
            ],
            techniques: [
                "使用柔光灯具或大面积光源",
                "避免强烈的直射光和深阴影",
                "后期减少对比度，提亮中间调",
                "使用渐变滤镜平衡曝光",
                "注意保持柔和的过渡效果"
            ],
            examples: [
                "室内肖像：窗户散射光下的柔美人像",
                "花卉摄影：漫射光下的淡雅花朵",
                "静物摄影：柔和光线下的精致物品"
            ]
        },
        "高短调": {
            description: "高短调主要由高光组成，亮度范围很窄，几乎没有中间调和阴影，创造出极简、纯净的视觉效果。",
            characteristics: [
                "画面几乎全为高光，极度明亮",
                "亮度范围非常窄，缺乏层次变化",
                "对比度很低，画面偏平",
                "给人简洁、纯净、空灵的感觉",
                "容易产生过曝的视觉效果"
            ],
            applications: [
                "极简主义艺术摄影",
                "表现雾、雪等自然现象",
                "概念摄影和实验性作品",
                "需要纯净感的商业摄影",
                "表现梦境、幻觉等抽象主题"
            ],
            techniques: [
                "大幅增加曝光补偿（+2EV以上）",
                "使用逆光或强散射光",
                "后期大幅提亮，压缩动态范围",
                "注意保留微妙的层次变化",
                "避免完全过曝丢失所有细节"
            ],
            examples: [
                "雾景摄影：浓雾中若隐若现的景物",
                "雪景极简：大雪覆盖下的简洁构图",
                "白色背景产品：纯白背景下的简洁产品"
            ]
        },
        "中长调": {
            description: "中长调以中间调为主导，保持完整的亮度范围，是最平衡和自然的影调类型，适合表现真实的光影关系。",
            characteristics: [
                "中间调占主导地位，层次丰富",
                "亮度范围完整，从黑到白都有分布",
                "对比度适中，层次平衡",
                "最接近人眼观察的自然效果",
                "画面和谐，视觉舒适"
            ],
            applications: [
                "风光摄影的自然表现",
                "纪实摄影和新闻摄影",
                "人像摄影的自然风格",
                "建筑摄影的真实记录",
                "日常生活的记录摄影"
            ],
            techniques: [
                "使用标准曝光，不刻意调整",
                "保持自然的光影对比",
                "后期适度调整，保持真实感",
                "注意高光和阴影的细节保留",
                "维持画面的整体平衡"
            ],
            examples: [
                "自然风光：正常光线下的山川河流",
                "街头摄影：日常生活中的真实瞬间",
                "环境人像：自然环境中的人物肖像"
            ]
        },
        "中中调": {
            description: "中中调主要由中间灰调组成，缺少纯黑和纯白，创造出平和、统一的视觉效果，调性温和稳重。",
            characteristics: [
                "中间灰调占绝大部分",
                "缺少纯黑和纯白的极端亮度",
                "对比度较低，画面偏灰",
                "调性平和，没有强烈视觉冲击",
                "适合表现宁静、含蓄的情绪"
            ],
            applications: [
                "文艺摄影的怀旧风格",
                "室内摄影的柔和氛围",
                "肖像摄影的内敛表达",
                "静物摄影的优雅呈现",
                "表现沉思、宁静的主题"
            ],
            techniques: [
                "使用柔和均匀的光线",
                "避免强烈的明暗对比",
                "后期降低对比度和饱和度",
                "保持色调的统一性",
                "营造柔和的光影过渡"
            ],
            examples: [
                "阴天风光：柔和光线下的自然景色",
                "室内静物：均匀光线下的生活物品",
                "人文肖像：表现内心世界的人物特写"
            ]
        },
        "中短调": {
            description: "中短调亮度范围窄，主要集中在中间调，缺少高光和阴影，常呈现发灰的效果，适合特定的艺术表达。",
            characteristics: [
                "亮度集中在中间区域",
                "缺少明显的高光和阴影",
                "画面整体发灰，对比度很低",
                "层次变化微妙而细腻",
                "适合表现朦胧、模糊的意境"
            ],
            applications: [
                "雾霾天气的记录",
                "表现忧郁、迷茫的情绪",
                "艺术摄影的特殊效果",
                "怀旧复古的影像风格",
                "表现模糊、不确定的主题"
            ],
            techniques: [
                "在雾霾或阴霾天气拍摄",
                "使用柔焦滤镜或后期模糊",
                "降低对比度和清晰度",
                "保持单调的色彩基调",
                "营造朦胧的视觉效果"
            ],
            examples: [
                "雾霾城市：朦胧中的城市轮廓",
                "室内窗景：透过纱窗看到的模糊景象",
                "抽象艺术：表现不确定状态的概念作品"
            ]
        },
        "低长调": {
            description: "低长调以暗部为主导，但保持完整的亮度范围，营造深沉厚重的视觉效果，层次丰富而富有戏剧性。",
            characteristics: [
                "暗部占主导地位，深沉厚重",
                "保留丰富的中间调和高光细节",
                "对比度强烈，戏剧性效果明显",
                "亮度范围完整，层次丰富",
                "营造神秘、庄重的氛围"
            ],
            applications: [
                "夜景摄影和夜间人像",
                "戏剧性的人像摄影",
                "表现神秘、庄重主题的作品",
                "电影感的影像创作",
                "艺术摄影的情绪表达"
            ],
            techniques: [
                "减少曝光补偿（-0.5到-1.5EV）",
                "使用侧光或逆光营造阴影",
                "后期压暗整体，保留高光细节",
                "增强对比度突出明暗关系",
                "注意阴影区域的层次保留"
            ],
            examples: [
                "夜景人像：街灯下的戏剧性人物肖像",
                "室内剪影：窗光下的人物轮廓",
                "建筑摄影：强烈光影下的建筑结构"
            ]
        },
        "低中调": {
            description: "低中调以暗部和中间调为主，缺少明亮的高光，营造深沉而细腻的视觉效果，层次在暗部区域丰富。",
            characteristics: [
                "暗部和中间调占主导",
                "缺少明亮的高光区域",
                "暗部层次丰富细腻",
                "整体色调深沉内敛",
                "适合表现沉稳、深刻的情绪"
            ],
            applications: [
                "室内摄影的温馨氛围",
                "人像摄影的深度表达",
                "静物摄影的质感呈现",
                "表现思考、内省的主题",
                "复古怀旧的影像风格"
            ],
            techniques: [
                "使用柔和的侧光或顶光",
                "控制曝光避免过亮的高光",
                "后期压暗高光，保留暗部细节",
                "增强暗部的层次感",
                "保持色调的统一性"
            ],
            examples: [
                "咖啡馆肖像：温暖灯光下的人物特写",
                "书房静物：柔和光线下的书籍和文具",
                "室内建筑：展现空间氛围的室内景观"
            ]
        },
        "低短调": {
            description: "低短调主要由暗部组成，亮度范围很窄，营造出深沉浓重的视觉效果，具有强烈的情绪冲击力。",
            characteristics: [
                "画面几乎全为暗部，极度深沉",
                "亮度范围很窄，层次变化微妙",
                "对比度相对较低但富有张力",
                "营造神秘、压抑或庄重的氛围",
                "容易产生欠曝的视觉效果"
            ],
            applications: [
                "表现神秘、恐怖主题的摄影",
                "极简主义的暗色调作品",
                "电影noir风格的影像",
                "表现沉重、压抑情绪的作品",
                "概念摄影和实验性创作"
            ],
            techniques: [
                "大幅减少曝光（-2EV以上）",
                "使用最小光源或自然暗光",
                "后期大幅压暗，保留暗部细节",
                "增强暗部的微妙层次变化",
                "避免完全欠曝失去所有细节"
            ],
            examples: [
                "夜景剪影：夜空下的建筑或人物轮廓",
                "室内暗光：微弱光线下的室内场景",
                "黑白肖像：表现深沉情绪的人物特写"
            ]
        },
        "全长调": {
            description: "全长调具有完整的亮度范围和强烈的对比度，直方图呈U字型分布，高光和阴影都很丰富，中间调相对较少。",
            characteristics: [
                "亮度范围覆盖0-255全区间",
                "对比度极强，明暗分明",
                "直方图呈现U字型分布",
                "高光和阴影都很丰富",
                "中间调相对较少，过渡明显"
            ],
            applications: [
                "戏剧性的人像摄影",
                "强烈光影对比的风光摄影",
                "黑白摄影的经典表现",
                "需要视觉冲击力的商业摄影",
                "表现强烈对比主题的艺术作品"
            ],
            techniques: [
                "使用强烈的定向光源",
                "营造明显的明暗对比",
                "后期增强对比度和清晰度",
                "保持高光和阴影的细节",
                "突出画面的戏剧性效果"
            ],
            examples: [
                "强光人像：阳光直射下的强烈光影人像",
                "建筑摄影：强烈阳光下的建筑光影",
                "黑白肖像：高对比度的经典黑白人像"
            ]
        }
    };

    const explanation = explanations[toneType];
    if (!explanation) {
        return (
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-4">影调解释</h3>
                <div className="text-gray-300">暂无该影调类型的详细解释。</div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
            <h3 className="text-white font-semibold text-lg mb-4">{toneType} - 专业解释</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="text-gray-300 font-medium mb-2">影调特征：</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{explanation.description}</p>
                </div>

                <div>
                    <h4 className="text-gray-300 font-medium mb-2">视觉特征：</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                        {explanation.characteristics.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-gray-300 font-medium mb-2">适用场景：</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                        {explanation.applications.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-gray-300 font-medium mb-2">拍摄技巧：</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                        {explanation.techniques.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-gray-300 font-medium mb-2">典型例子：</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                        {explanation.examples.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// 亮度直方图组件
const HistogramChart = ({ histogram, title }: { histogram: number[], title: string }) => {
    const labels = Array.from({ length: 256 }, (_, i) => i.toString());

    const data = {
        labels,
        datasets: [
            {
                label: '像素数量',
                data: histogram,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                barThickness: 1,
                maxBarThickness: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title,
                color: 'white',
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: '亮度值 (0-255)',
                    color: 'rgba(255, 255, 255, 0.8)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    callback: function (value: any, index: number) {
                        if (index % 32 === 0 || value === 255) {
                            return value;
                        }
                        return '';
                    },
                    maxTicksLimit: 9,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: '像素数量',
                    color: 'rgba(255, 255, 255, 0.8)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="h-64">
            <Bar data={data} options={options} />
        </div>
    );
};

// RGB通道直方图组件
const RGBHistogramChart = ({ rgbHistograms }: { rgbHistograms: { red: number[], green: number[], blue: number[] } }) => {
    const labels = Array.from({ length: 256 }, (_, i) => i.toString());

    const data = {
        labels,
        datasets: [
            {
                label: '红色通道',
                data: rgbHistograms.red,
                backgroundColor: 'rgba(239, 68, 68, 0.4)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                barThickness: 1,
                maxBarThickness: 1,
            },
            {
                label: '绿色通道',
                data: rgbHistograms.green,
                backgroundColor: 'rgba(34, 197, 94, 0.4)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
                barThickness: 1,
                maxBarThickness: 1,
            },
            {
                label: '蓝色通道',
                data: rgbHistograms.blue,
                backgroundColor: 'rgba(59, 130, 246, 0.4)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                barThickness: 1,
                maxBarThickness: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    color: 'white',
                },
            },
            title: {
                display: true,
                text: 'RGB三通道色彩分布',
                color: 'white',
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: '色彩值 (0-255)',
                    color: 'rgba(255, 255, 255, 0.8)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    callback: function (value: any, index: number) {
                        if (index % 32 === 0 || value === 255) {
                            return value;
                        }
                        return '';
                    },
                    maxTicksLimit: 9,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: '像素数量',
                    color: 'rgba(255, 255, 255, 0.8)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="h-64">
            <Bar data={data} options={options} />
        </div>
    );
};

// 影调匹配度雷达图组件
const ToneMatchRadarChart = ({ analysisResult }: { analysisResult: ImageAnalysisResult }) => {
    const { toneAnalysis, brightness } = analysisResult;

    // 计算各种影调的匹配度
    const calculateToneMatches = () => {
        const { zones } = toneAnalysis;
        const { average } = brightness;
        const tonalRange = brightness.max - brightness.min;
        const simpleContrast = tonalRange / 255; // 简化的对比度计算

        return {
            高长调: Math.min(100, zones.high * 1.2 + (tonalRange > 200 ? 30 : 0) + (simpleContrast > 0.7 ? 20 : 0)),
            高中调: Math.min(100, zones.high * 1.1 + (zones.mid > 20 ? 20 : 0) + (average > 180 ? 20 : 0)),
            高短调: Math.min(100, zones.high * 1.3 + (tonalRange < 100 ? 30 : 0) + (simpleContrast < 0.3 ? 20 : 0)),
            中长调: Math.min(100, zones.mid * 1.2 + (tonalRange > 200 ? 30 : 0) + (Math.abs(average - 128) < 30 ? 20 : 0)),
            中中调: Math.min(100, zones.mid * 1.3 + (simpleContrast < 0.5 ? 20 : 0) + (Math.abs(average - 128) < 20 ? 30 : 0)),
            中短调: Math.min(100, zones.mid * 1.1 + (tonalRange < 100 ? 30 : 0) + (simpleContrast < 0.3 ? 25 : 0)),
            低长调: Math.min(100, zones.low * 1.2 + (tonalRange > 200 ? 30 : 0) + (simpleContrast > 0.7 ? 20 : 0)),
            低中调: Math.min(100, zones.low * 1.1 + (zones.mid > 20 ? 20 : 0) + (average < 100 ? 20 : 0)),
            低短调: Math.min(100, zones.low * 1.3 + (tonalRange < 100 ? 30 : 0) + (simpleContrast < 0.3 ? 20 : 0)),
            全长调: Math.min(100, (zones.low > 25 && zones.high > 25 && zones.mid < 30 ? 80 : 0) + (simpleContrast > 0.8 ? 20 : 0))
        };
    };

    const matches = calculateToneMatches();

    const data = {
        labels: Object.keys(matches),
        datasets: [
            {
                label: '匹配度 (%)',
                data: Object.values(matches),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: '十大影调匹配度分析',
                color: 'white',
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
        },
        scales: {
            r: {
                angleLines: {
                    display: true,
                    color: 'rgba(255, 255, 255, 0.2)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    color: 'rgba(255, 255, 255, 0.6)',
                    backdropColor: 'transparent', // 明确设置背景为透明
                    callback: function (value: any) {
                        return value + '%';
                    },
                },
                pointLabels: {
                    font: {
                        size: 12,
                    },
                    color: 'rgba(255, 255, 255, 0.8)',
                    backdropColor: 'transparent', // 明确设置背景为透明
                    callback: function (label: string) {
                        return label === toneAnalysis.type ? `★ ${label}` : label;
                    },
                },
            },
        },
    };

    return (
        <div className="h-80">
            <Radar data={data} options={options} />
        </div>
    );
};

// 摄影十区域可视化组件
const TenZoneChart = ({ histogram }: { histogram: number[] }) => {
    // 将256个亮度值分成10个区域
    const zones = [];
    for (let i = 0; i < 10; i++) {
        const start = Math.floor(i * 25.5);
        const end = Math.floor((i + 1) * 25.5);
        const count = histogram.slice(start, end).reduce((sum, val) => sum + val, 0);
        zones.push(count);
    }

    const totalPixels = zones.reduce((sum, val) => sum + val, 0);
    const zonePercentages = zones.map(count => (count / totalPixels * 100));

    const data = {
        labels: ['区域1', '区域2', '区域3', '区域4', '区域5', '区域6', '区域7', '区域8', '区域9', '区域10'],
        datasets: [
            {
                label: '像素分布 (%)',
                data: zonePercentages,
                backgroundColor: [
                    '#1a1a1a', '#2d2d2d', '#404040', // 低调区 (1-3)
                    '#535353', '#666666', '#797979', '#8c8c8c', // 中调区 (4-7)
                    '#9f9f9f', '#b2b2b2', '#c5c5c5', // 高调区 (8-10)
                ],
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: '摄影十区域分布',
                color: 'white',
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: '摄影区域',
                    color: 'rgba(255, 255, 255, 0.8)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: '像素分布 (%)',
                    color: 'rgba(255, 255, 255, 0.8)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                beginAtZero: true,
                max: Math.max(...zonePercentages) * 1.1,
            },
        },
    };

    return (
        <div className="h-64">
            <Bar data={data} options={options} />
        </div>
    );
};

const ImageAnalysisDisplay: React.FC<ImageAnalysisDisplayProps> = ({ imageAnalysis }) => {
    return (
        <div className="space-y-6">
            {/* 影调分析结果 */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    🎨 影调分析结果
                </h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                        <span className="text-gray-300">影调类型:</span>
                        <div className="text-white font-semibold text-xl">{imageAnalysis.toneAnalysis.type}</div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-gray-300">置信度:</span>
                        <div className="text-white font-semibold text-lg">{Math.round(imageAnalysis.toneAnalysis.confidence * 100)}%</div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-gray-300">影调记号:</span>
                        <div className="text-white font-mono text-lg">{imageAnalysis.toneAnalysis.notation}</div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-gray-300">平均亮度:</span>
                        <div className="text-white font-semibold">{imageAnalysis.brightness.average}/255</div>
                    </div>
                </div>

                {/* 摄影十区域分布 */}
                <div className="mt-6 pt-6 border-t border-white/30">
                    <div className="text-gray-300 font-medium mb-4">摄影十区域分布</div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center bg-white/10 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-2">低调区域 (1-3区)</div>
                            <div className="text-white font-bold text-2xl">{imageAnalysis.toneAnalysis.zones.low}%</div>
                        </div>
                        <div className="text-center bg-white/10 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-2">中调区域 (4-7区)</div>
                            <div className="text-white font-bold text-2xl">{imageAnalysis.toneAnalysis.zones.mid}%</div>
                        </div>
                        <div className="text-center bg-white/10 rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-2">高调区域 (8-10区)</div>
                            <div className="text-white font-bold text-2xl">{imageAnalysis.toneAnalysis.zones.high}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 影调类型详细解释 */}
            <ToneTypeExplanation toneType={imageAnalysis.toneAnalysis.type} />

            {/* 亮度直方图 */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    📊 图像亮度分布
                </h3>
                <div className="bg-black/20 rounded-lg p-4">
                    <HistogramChart
                        histogram={imageAnalysis.brightness.histogram}
                        title="图像亮度分布"
                    />
                </div>
                <div className="mt-4 text-sm text-gray-300 text-center bg-white/10 rounded-lg p-3">
                    横轴：亮度值(0-255)，纵轴：该亮度的像素数量。直方图显示图像中不同亮度级别的像素分布情况
                </div>
            </div>

            {/* 十大影调匹配度分析 */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    🎯 十大影调匹配度分析
                </h3>
                <div className="bg-black/20 rounded-lg p-4">
                    <ToneMatchRadarChart analysisResult={imageAnalysis} />
                </div>
                <div className="mt-4 text-sm text-gray-300 text-center bg-white/10 rounded-lg p-3">
                    雷达图显示当前图像与十大影调类型的匹配程度，★标记为最终识别结果
                </div>
            </div>

            {/* RGB三通道分析 */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    🌈 RGB三通道色彩分析
                </h3>
                <div className="bg-black/20 rounded-lg p-4">
                    <RGBHistogramChart rgbHistograms={imageAnalysis.brightness.rgbHistograms} />
                </div>
                <div className="mt-4 text-sm text-gray-300 text-center bg-white/10 rounded-lg p-3">
                    红、绿、蓝三个颜色通道的分布情况，有助于分析图像的色彩特征和白平衡
                </div>
            </div>

            {/* 摄影十区域分析 */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    📐 摄影十区域分析
                </h3>
                <div className="bg-black/20 rounded-lg p-4">
                    <TenZoneChart histogram={imageAnalysis.brightness.histogram} />
                </div>
                <div className="mt-4 text-sm text-gray-300 text-center bg-white/10 rounded-lg p-3">
                    按Ansel Adams摄影理论将亮度分为10个区域，便于专业影调分析和创作指导
                </div>
            </div>

            {/* 摄影理论参考 */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-gray-300 font-semibold text-lg mb-4 flex items-center">
                    📚 摄影理论参考
                </h3>
                <div className="bg-black/20 rounded-lg p-4">
                    <div className="text-sm text-gray-200 space-y-3">
                        <div className="flex items-start space-x-2">
                            <span className="text-gray-400 font-bold">•</span>
                            <div><strong className="text-gray-300">十区域系统：</strong>由 Ansel Adams 创立，将亮度分为10个区域，区域1-3为低调（阴影），区域4-7为中调，区域8-10为高调（高光）</div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="text-gray-400 font-bold">•</span>
                            <div><strong className="text-gray-300">影调记号：</strong>第一个数字表示亮度范围（3=短调，6=中调，10=长调），第二个数字表示主导区域（1=低调，5=中调，9=高调）</div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="text-gray-400 font-bold">•</span>
                            <div><strong className="text-gray-300">十大影调：</strong>高长调、高中调、高短调、中长调、中中调、中短调、低长调、低中调、低短调、全长调</div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="text-gray-400 font-bold">•</span>
                            <div><strong className="text-gray-300">参考资料：</strong><a href="https://www.sohu.com/a/409629203_166844" target="_blank" className="text-gray-400 underline hover:text-gray-300 transition-colors">摄影必学：十大影调详解</a></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageAnalysisDisplay; 