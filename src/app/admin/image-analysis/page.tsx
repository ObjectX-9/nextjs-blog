"use client";

import { useState } from "react";
import { Button, Upload, Card, Alert, Spin, Space, Typography, Row, Col, Statistic, Progress } from 'antd';
import { UploadOutlined, BgColorsOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import Image from 'next/image';
import { message } from 'antd';
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

const { Title, Text } = Typography;

// 影调类型详细解释
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
            <Card size="small" title="影调解释">
                <Text>暂无该影调类型的详细解释。</Text>
            </Card>
        );
    }

    return (
        <Card size="small" title={`${toneType} - 专业解释`}>
            <div className="space-y-4">
                <div>
                    <Text strong className="text-blue-600">影调特征：</Text>
                    <p className="mt-1 text-sm text-gray-700">{explanation.description}</p>
                </div>

                <div>
                    <Text strong className="text-green-600">视觉特征：</Text>
                    <ul className="mt-1 text-sm text-gray-700 list-disc list-inside space-y-1">
                        {explanation.characteristics.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <Text strong className="text-purple-600">适用场景：</Text>
                    <ul className="mt-1 text-sm text-gray-700 list-disc list-inside space-y-1">
                        {explanation.applications.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <Text strong className="text-orange-600">拍摄技巧：</Text>
                    <ul className="mt-1 text-sm text-gray-700 list-disc list-inside space-y-1">
                        {explanation.techniques.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <Text strong className="text-red-600">典型例子：</Text>
                    <ul className="mt-1 text-sm text-gray-700 list-disc list-inside space-y-1">
                        {explanation.examples.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Card>
    );
};





// 直方图组件
const HistogramChart = ({ histogram, title }: { histogram: number[], title: string }) => {
    const labels = Array.from({ length: 256 }, (_, i) => i.toString());

    const data = {
        labels,
        datasets: [
            {
                label: '像素数量',
                data: histogram,
                backgroundColor: 'rgba(24, 144, 255, 0.6)',
                borderColor: 'rgba(24, 144, 255, 1)',
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
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                callbacks: {
                    title: (context: any) => `亮度值: ${context[0].label}`,
                    label: (context: any) => `像素数量: ${context.parsed.y}`,
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: '亮度值 (0-255)',
                },
                ticks: {
                    callback: function (value: any, index: number) {
                        // 只显示关键刻度值
                        if (index % 32 === 0 || value === 255) {
                            return value;
                        }
                        return '';
                    },
                    maxTicksLimit: 9,
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: '像素数量',
                },
                beginAtZero: true,
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
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
                backgroundColor: 'rgba(255, 99, 132, 0.4)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                barThickness: 1,
                maxBarThickness: 1,
            },
            {
                label: '绿色通道',
                data: rgbHistograms.green,
                backgroundColor: 'rgba(75, 192, 192, 0.4)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                barThickness: 1,
                maxBarThickness: 1,
            },
            {
                label: '蓝色通道',
                data: rgbHistograms.blue,
                backgroundColor: 'rgba(54, 162, 235, 0.4)',
                borderColor: 'rgba(54, 162, 235, 1)',
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
                },
            },
            title: {
                display: true,
                text: 'RGB三通道色彩分布',
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                callbacks: {
                    title: (context: any) => `色彩值: ${context[0].label}`,
                    label: (context: any) => `${context.dataset.label}: ${context.parsed.y}`,
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: '色彩值 (0-255)',
                },
                ticks: {
                    callback: function (value: any, index: number) {
                        // 只显示关键刻度值
                        if (index % 32 === 0 || value === 255) {
                            return value;
                        }
                        return '';
                    },
                    maxTicksLimit: 9,
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: '像素数量',
                },
                beginAtZero: true,
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
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
                backgroundColor: 'rgba(24, 144, 255, 0.2)',
                borderColor: 'rgba(24, 144, 255, 1)',
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: 'rgba(24, 144, 255, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(24, 144, 255, 1)',
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
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const match = context.parsed.y.toFixed(1);
                        return `${context.label}: ${match}%`;
                    },
                },
            },
        },
        scales: {
            r: {
                angleLines: {
                    display: true,
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    callback: function (value: any) {
                        return value + '%';
                    },
                },
                pointLabels: {
                    font: {
                        size: 12,
                    },
                    callback: function (label: string) {
                        // 为当前识别的影调类型添加标记
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
                    '#000000', '#1a1a1a', '#333333', // 低调区 (1-3)
                    '#4d4d4d', '#666666', '#808080', '#999999', // 中调区 (4-7)
                    '#b3b3b3', '#cccccc', '#e6e6e6', // 高调区 (8-10)
                ],
                borderColor: '#ffffff',
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
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                callbacks: {
                    title: (context: any) => context[0].label,
                    label: (context: any) => `分布: ${context.parsed.y.toFixed(1)}%`,
                    afterLabel: (context: any) => {
                        const zoneIndex = context.dataIndex;
                        if (zoneIndex < 3) return '(低调区)';
                        if (zoneIndex < 7) return '(中调区)';
                        return '(高调区)';
                    },
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: '摄影区域',
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: '像素分布 (%)',
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

export default function ImageAnalysisTestPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
    const [error, setError] = useState<string>("");

    const handleFileSelect = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            message.error("请选择图片文件");
            return;
        }

        setSelectedFile(file);
        setError("");
        setAnalysisResult(null);

        // 创建预览URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const analyzeImage = async () => {
        if (!selectedFile) {
            message.error("请先选择图片文件");
            return;
        }

        setAnalyzing(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/image-analysis', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setAnalysisResult(result.data.analysis);
                message.success(`图像分析完成！检测到影调类型：${result.data.analysis.toneAnalysis.type}`);
            } else {
                setError(result.error || '图像分析失败');
            }
        } catch (error: any) {
            console.error('图像分析错误:', error);
            setError('图像分析过程中发生错误，请重试');
        } finally {
            setAnalyzing(false);
        }
    };

    const clearAll = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setAnalysisResult(null);
        setError("");
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    };

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            handleFileSelect(file);
            return false;
        },
        showUploadList: false,
        accept: 'image/*'
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2}>
                    <BgColorsOutlined className="mr-2" />
                    摄影十大影调智能分析
                </Title>
                <Text type="secondary">
                    基于专业摄影理论的十大影调自动识别系统，精确分析高长调、高中调、高短调、中长调、中中调、中短调、低长调、低中调、低短调、全长调等类型
                </Text>
            </div>

            <Row gutter={24}>
                {/* 左侧：上传和预览 */}
                <Col xs={24} lg={12}>
                    <Card title="图片上传" className="h-fit">
                        <Space direction="vertical" className="w-full">
                            <Upload.Dragger {...uploadProps} className="w-full">
                                {!previewUrl ? (
                                    <>
                                        <p className="ant-upload-drag-icon">
                                            <UploadOutlined />
                                        </p>
                                        <p className="ant-upload-text">点击选择图片或拖拽到此处</p>
                                        <p className="ant-upload-hint">
                                            支持 JPG、PNG、TIFF 等格式
                                        </p>
                                    </>
                                ) : (
                                    <div className="p-4">
                                        <Image
                                            src={previewUrl}
                                            alt="预览图片"
                                            width={300}
                                            height={200}
                                            className="mx-auto max-h-48 rounded-lg object-contain"
                                            priority
                                        />
                                        <div className="mt-2 text-center">
                                            <Text type="secondary">{selectedFile?.name}</Text>
                                            <br />
                                            <Text type="secondary">
                                                {selectedFile && `大小: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                                            </Text>
                                        </div>
                                    </div>
                                )}
                            </Upload.Dragger>

                            {selectedFile && (
                                <Space className="w-full">
                                    <Button
                                        type="primary"
                                        onClick={analyzeImage}
                                        loading={analyzing}
                                        disabled={!selectedFile}
                                        size="large"
                                    >
                                        {analyzing ? '正在分析...' : '开始分析'}
                                    </Button>

                                    <Button onClick={clearAll} size="large">
                                        清除
                                    </Button>
                                </Space>
                            )}
                        </Space>
                    </Card>
                </Col>

                {/* 右侧：分析状态 */}
                <Col xs={24} lg={12}>
                    <Card title="分析状态" className="h-fit">
                        {error && (
                            <Alert
                                message="分析失败"
                                description={error}
                                type="error"
                                className="mb-4"
                                showIcon
                            />
                        )}

                        {analyzing && (
                            <div className="text-center py-8">
                                <Spin size="large" />
                                <div className="mt-2">正在分析图像特征...</div>
                            </div>
                        )}

                        {!analyzing && !error && !analysisResult && (
                            <div className="text-center py-8 text-gray-500">
                                <InfoCircleOutlined className="text-4xl mb-2" />
                                <div>请选择图片文件并点击分析按钮</div>
                            </div>
                        )}

                        {analysisResult && !analyzing && (
                            <div>
                                <Alert
                                    message="分析完成"
                                    description={`成功识别影调类型：${analysisResult.toneAnalysis.type}，置信度：${Math.round(analysisResult.toneAnalysis.confidence * 100)}%`}
                                    type="success"
                                    showIcon
                                    className="mb-4"
                                />

                                <Text strong>图像基本信息：</Text>
                                <div className="text-sm text-gray-600 mb-4">
                                    尺寸: {analysisResult.dimensions.width} × {analysisResult.dimensions.height}px
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* 详细分析结果 */}
            {analysisResult && !analyzing && (
                <Card
                    title="详细分析结果"
                    className="mt-6"
                >
                    <Row gutter={16} className="mb-6">
                        <Col xs={24} sm={8}>
                            <Card size="small">
                                <Statistic
                                    title="影调类型"
                                    value={analysisResult.toneAnalysis.type}
                                    valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                                />
                                <Progress
                                    percent={Math.round(analysisResult.toneAnalysis.confidence * 100)}
                                    size="small"
                                    format={(percent) => `置信度 ${percent}%`}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={8}>
                            <Card size="small">
                                <Statistic
                                    title="平均亮度"
                                    value={analysisResult.brightness.average}
                                    suffix="/ 255"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    范围: {analysisResult.brightness.min} - {analysisResult.brightness.max}
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} sm={8}>
                            <Card size="small">
                                <Statistic
                                    title="影调记号"
                                    value={analysisResult.toneAnalysis.notation}
                                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    亮度范围: {analysisResult.brightness.max - analysisResult.brightness.min}
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Card size="small" title="摄影十区域分布">
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>低调区域 (1-3区):</span>
                                            <span>{analysisResult.toneAnalysis.zones.low}%</span>
                                        </div>
                                        <Progress
                                            percent={analysisResult.toneAnalysis.zones.low}
                                            size="small"
                                            strokeColor="#2c2c2c"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>中调区域 (4-7区):</span>
                                            <span>{analysisResult.toneAnalysis.zones.mid}%</span>
                                        </div>
                                        <Progress
                                            percent={analysisResult.toneAnalysis.zones.mid}
                                            size="small"
                                            strokeColor="#808080"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>高调区域 (8-10区):</span>
                                            <span>{analysisResult.toneAnalysis.zones.high}%</span>
                                        </div>
                                        <Progress
                                            percent={analysisResult.toneAnalysis.zones.high}
                                            size="small"
                                            strokeColor="#e6e6e6"
                                        />
                                    </div>

                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">影调记号:</span>
                                            <span className="font-mono text-blue-600">{analysisResult.toneAnalysis.notation}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card size="small" title="分析算法说明">
                                <div className="space-y-2 text-sm">
                                    <div><strong>影调识别</strong>: 基于摄影十区域系统</div>
                                    <div><strong>亮度分析</strong>: 256级直方图统计</div>
                                    <div><strong>RGB通道</strong>: 红绿蓝三通道分布分析</div>
                                    <div><strong>区域分布</strong>: 按Ansel Adams十区域理论分析</div>
                                    <div><strong>影调记号</strong>: 第一位数字表示亮度范围，第二位表示主导区域</div>
                                    <div><strong>置信度</strong>: 基于多因素综合评估</div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* 直方图可视化 */}
                    <Row gutter={16} className="mt-4">
                        <Col xs={24} lg={12}>
                            <Card title="亮度直方图" className="h-fit">
                                <HistogramChart
                                    histogram={analysisResult.brightness.histogram}
                                    title="图像亮度分布"
                                />
                                <div className="mt-2 text-xs text-gray-500 text-center">
                                    横轴：亮度值(0-255)，纵轴：该亮度的像素数量
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card title="影调匹配度分析" className="h-fit">
                                <ToneMatchRadarChart
                                    analysisResult={analysisResult}
                                />
                                <div className="mt-2 text-xs text-gray-500 text-center">
                                    雷达图显示当前图像与十大影调类型的匹配程度，★标记为最终识别结果
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={16} className="mt-4">
                        <Col xs={24} lg={12}>
                            <Card title="RGB三通道色彩分析" className="h-fit">
                                <RGBHistogramChart
                                    rgbHistograms={analysisResult.brightness.rgbHistograms}
                                />
                                <div className="mt-2 text-xs text-gray-500 text-center">
                                    红、绿、蓝三个颜色通道的分布情况，有助于分析图像的色彩偏向和白平衡
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card title="摄影十区域分析" className="h-fit">
                                <TenZoneChart
                                    histogram={analysisResult.brightness.histogram}
                                />
                                <div className="mt-2 text-xs text-gray-500 text-center">
                                    按摄影理论将亮度分为10个区域，便于影调分析
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* 影调类型详细解释 */}
                    <Row gutter={16} className="mt-4">
                        <Col xs={24}>
                            <ToneTypeExplanation toneType={analysisResult.toneAnalysis.type} />
                        </Col>
                    </Row>

                    <Alert
                        message="十大影调分析结果"
                        description={
                            <div className="text-sm">
                                <p>• <strong>影调类型</strong>: {analysisResult.toneAnalysis.type} (记号: {analysisResult.toneAnalysis.notation})</p>
                                <p>• <strong>分析依据</strong>: {analysisResult.toneAnalysis.factors.join('、')}</p>
                                <p>• <strong>置信度</strong>: {Math.round(analysisResult.toneAnalysis.confidence * 100)}% - 基于摄影理论算法分析</p>
                                <p>• <strong>理论基础</strong>: 按照摄影十区域理论，将亮度分为1-10区，其中1-3为低调区，4-7为中调区，8-10为高调区</p>
                                <p>• <strong>记号说明</strong>: 第一个数字表示亮度范围(3=短调，6=中调，10=长调)，第二个数字表示主导区域(1=低调，5=中调，9=高调)</p>
                                <p>• <strong>亮度分析</strong>: 平均亮度 {analysisResult.brightness.average}/255，亮度范围 {analysisResult.brightness.min}-{analysisResult.brightness.max}</p>
                                <p>• <strong>直方图分析</strong>: 亮度直方图显示像素在0-255亮度值上的分布，摄影十区域图将亮度按Ansel Adams的区域系统分为10个区域进行分析</p>
                                <p>• <strong>区域系统</strong>: 区域1-3为阴影(低调)，区域4-7为中间调，区域8-10为高光(高调)。不同影调类型在十区域中会呈现不同的分布模式</p>
                                <p>• <strong>参考资料</strong>: <a href="https://www.sohu.com/a/409629203_166844" target="_blank" className="text-blue-600 underline">摄影必学：十大影调详解</a></p>
                            </div>
                        }
                        type="success"
                        showIcon
                        className="mt-4"
                    />
                </Card>
            )}
        </div>
    );
} 