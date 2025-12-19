import { FrontendDocument } from "@/utils/db-helpers";

// 页面访问事件
export interface PageViewEvent {
    _id?: string;

    // 会话标识
    sessionId: string;
    visitorId: string; // 访客唯一标识（基于浏览器指纹）

    // 页面信息
    path: string;
    title?: string;
    referrer?: string;

    // UTM参数
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;

    // 流量来源分类
    trafficSource: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'paid' | 'other';

    // 访客信息
    userAgent: string;
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    browserVersion?: string;
    os: string;
    osVersion?: string;
    screenWidth?: number;
    screenHeight?: number;
    language?: string;

    // 地理位置
    country?: string;
    city?: string;
    ip?: string;

    // 页面停留时间（秒）
    duration?: number;

    // 是否跳出（只访问一个页面就离开）
    isBounce?: boolean;

    // 时间戳
    timestamp: Date;
    createdAt?: Date;
}

// 自定义事件
export interface CustomEvent {
    _id?: string;

    // 会话标识
    sessionId: string;
    visitorId: string;

    // 事件信息
    eventName: string;
    eventCategory: string; // click, form, scroll, video, custom

    // 页面信息
    path: string;

    // 元素信息（用于点击事件）
    elementId?: string;
    elementClass?: string;
    elementText?: string;

    // 自定义属性
    properties?: Record<string, any>;

    // 时间戳
    timestamp: Date;
    createdAt?: Date;
}

// 会话信息
export interface Session {
    _id?: string;

    sessionId: string;
    visitorId: string;

    // 会话开始和结束时间
    startTime: Date;
    endTime?: Date;

    // 会话统计
    pageViews: number;
    events: number;
    duration?: number; // 秒

    // 入口页和出口页
    entryPage: string;
    exitPage?: string;

    // 是否跳出
    isBounce: boolean;

    // 访客信息（冗余存储，方便查询）
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    country?: string;
    city?: string;
    trafficSource: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'paid' | 'other';

    // 最后活跃时间
    lastActiveAt: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

// 实时在线用户
export interface RealtimeVisitor {
    _id?: string;
    visitorId: string;
    sessionId: string;
    path: string;
    device: string;
    country?: string;
    lastActiveAt: Date;
}

// 统计数据聚合
export interface AnalyticsSummary {
    date: string; // YYYY-MM-DD

    // 基础指标
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;

    // 跳出率和停留时间
    bounceRate: number;
    avgDuration: number;

    // 按维度统计
    topPages: { path: string; views: number; uniqueVisitors: number }[];
    topReferrers: { referrer: string; count: number }[];
    devices: { device: string; count: number; percentage: number }[];
    browsers: { browser: string; count: number; percentage: number }[];
    countries: { country: string; count: number; percentage: number }[];
    trafficSources: { source: string; count: number; percentage: number }[];
}

// 漏斗分析
export interface FunnelStep {
    name: string;
    eventName: string;
    eventCategory?: string;
    properties?: Record<string, any>;
}

export interface Funnel {
    _id?: string;
    name: string;
    steps: FunnelStep[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface FunnelAnalysis {
    funnel: Funnel;
    dateRange: { start: Date; end: Date };
    steps: {
        name: string;
        count: number;
        conversionRate: number; // 相对于上一步
        overallRate: number; // 相对于第一步
    }[];
    totalConversionRate: number;
}

export type PageViewDocument = PageViewEvent & FrontendDocument;
export type CustomEventDocument = CustomEvent & FrontendDocument;
export type SessionDocument = Session & FrontendDocument;
