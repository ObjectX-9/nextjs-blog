// 前端埋点 SDK

const ANALYTICS_ENDPOINT = '/api/analytics';
const HEARTBEAT_INTERVAL = 30000; // 30秒心跳
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟会话超时

// 频率限制配置
const RATE_LIMIT = {
    maxRequests: 20,      // 时间窗口内最大请求数
    windowMs: 60000,      // 时间窗口（1分钟）
    minInterval: 500,     // 最小请求间隔（500ms）
};

class Analytics {
    private visitorId: string = '';
    private sessionId: string = '';
    private currentPath: string = '';
    private pageEnterTime: number = 0;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private initialized: boolean = false;

    // 频率限制相关
    private requestTimestamps: number[] = [];
    private lastRequestTime: number = 0;

    // 初始化
    init() {
        if (typeof window === 'undefined' || this.initialized) return;

        this.visitorId = this.getOrCreateVisitorId();
        this.sessionId = this.getOrCreateSessionId();
        this.initialized = true;

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // 监听页面卸载
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // 开始心跳
        this.startHeartbeat();
    }

    // 生成或获取访客ID（基于浏览器指纹）
    private getOrCreateVisitorId(): string {
        const stored = localStorage.getItem('_vid');
        if (stored) return stored;

        // 简单的浏览器指纹
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset(),
        ].join('|');

        const id = this.hashCode(fingerprint) + '_' + Date.now().toString(36);
        localStorage.setItem('_vid', id);
        return id;
    }

    // 生成或获取会话ID
    private getOrCreateSessionId(): string {
        const stored = sessionStorage.getItem('_sid');
        const lastActive = sessionStorage.getItem('_lastActive');

        // 检查会话是否过期
        if (stored && lastActive) {
            const elapsed = Date.now() - parseInt(lastActive);
            if (elapsed < SESSION_TIMEOUT) {
                sessionStorage.setItem('_lastActive', Date.now().toString());
                return stored;
            }
        }

        // 创建新会话
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
        sessionStorage.setItem('_sid', id);
        sessionStorage.setItem('_lastActive', Date.now().toString());
        return id;
    }

    // 简单哈希函数
    private hashCode(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // 获取 UTM 参数
    private getUTMParams() {
        if (typeof window === 'undefined') return {};

        const params = new URLSearchParams(window.location.search);
        return {
            utmSource: params.get('utm_source') || undefined,
            utmMedium: params.get('utm_medium') || undefined,
            utmCampaign: params.get('utm_campaign') || undefined,
            utmTerm: params.get('utm_term') || undefined,
            utmContent: params.get('utm_content') || undefined,
        };
    }

    // 检查是否超过频率限制
    private isRateLimited(): boolean {
        const now = Date.now();

        // 检查最小间隔
        if (now - this.lastRequestTime < RATE_LIMIT.minInterval) {
            return true;
        }

        // 清理过期的时间戳
        this.requestTimestamps = this.requestTimestamps.filter(
            ts => now - ts < RATE_LIMIT.windowMs
        );

        // 检查时间窗口内的请求数
        if (this.requestTimestamps.length >= RATE_LIMIT.maxRequests) {
            console.warn('Analytics: Rate limit exceeded, request dropped');
            return true;
        }

        return false;
    }

    // 记录请求时间
    private recordRequest() {
        const now = Date.now();
        this.lastRequestTime = now;
        this.requestTimestamps.push(now);
    }

    // 发送数据
    private async send(type: string, data: any) {
        // 心跳和页面卸载时的 duration 不受频率限制
        const bypassRateLimit = type === 'heartbeat' || type === 'duration';

        if (!bypassRateLimit && this.isRateLimited()) {
            return;
        }

        this.recordRequest();

        try {
            await fetch(ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data }),
                keepalive: true, // 确保页面卸载时也能发送
            });
        } catch (error) {
            console.error('Analytics send error:', error);
        }
    }

    // 记录页面访问
    trackPageView(path?: string) {
        if (typeof window === 'undefined') return;

        const newPath = path || window.location.pathname;

        // 防止同一页面重复记录（React Strict Mode 会触发两次）
        if (this.currentPath === newPath && Date.now() - this.pageEnterTime < 1000) {
            return;
        }

        // 发送上一页的停留时间
        if (this.currentPath && this.pageEnterTime && this.currentPath !== newPath) {
            const duration = Math.round((Date.now() - this.pageEnterTime) / 1000);
            this.send('duration', {
                sessionId: this.sessionId,
                path: this.currentPath,
                duration,
            });
        }

        this.currentPath = newPath;
        this.pageEnterTime = Date.now();

        const utmParams = this.getUTMParams();

        this.send('pageview', {
            sessionId: this.sessionId,
            visitorId: this.visitorId,
            path: this.currentPath,
            title: document.title,
            referrer: document.referrer,
            ...utmParams,
            screenWidth: screen.width,
            screenHeight: screen.height,
            language: navigator.language,
        });
    }

    // 记录自定义事件
    trackEvent(
        eventName: string,
        options?: {
            category?: string;
            elementId?: string;
            elementClass?: string;
            elementText?: string;
            properties?: Record<string, any>;
        }
    ) {
        if (typeof window === 'undefined') return;

        this.send('event', {
            sessionId: this.sessionId,
            visitorId: this.visitorId,
            eventName,
            eventCategory: options?.category || 'custom',
            path: window.location.pathname,
            elementId: options?.elementId,
            elementClass: options?.elementClass,
            elementText: options?.elementText,
            properties: options?.properties,
        });
    }

    // 记录点击事件
    trackClick(element: HTMLElement, eventName?: string) {
        this.trackEvent(eventName || 'click', {
            category: 'click',
            elementId: element.id || undefined,
            elementClass: element.className || undefined,
            elementText: element.textContent?.slice(0, 100) || undefined,
        });
    }

    // 记录表单提交
    trackFormSubmit(formName: string, properties?: Record<string, any>) {
        this.trackEvent('form_submit', {
            category: 'form',
            properties: { formName, ...properties },
        });
    }

    // 心跳
    private startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.send('heartbeat', {
                sessionId: this.sessionId,
                visitorId: this.visitorId,
                path: this.currentPath,
            });
            sessionStorage.setItem('_lastActive', Date.now().toString());
        }, HEARTBEAT_INTERVAL);
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // 页面可见性变化处理
    private handleVisibilityChange = () => {
        if (document.hidden) {
            this.stopHeartbeat();
        } else {
            this.startHeartbeat();
        }
    };

    // 页面卸载处理
    private handleBeforeUnload = () => {
        // 发送最后的停留时间
        if (this.currentPath && this.pageEnterTime) {
            const duration = Math.round((Date.now() - this.pageEnterTime) / 1000);
            this.send('duration', {
                sessionId: this.sessionId,
                path: this.currentPath,
                duration,
            });
        }
    };

    // 清理
    destroy() {
        this.stopHeartbeat();
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        this.initialized = false;
    }
}

// 导出单例
export const analytics = new Analytics();

// 便捷方法
export const trackPageView = (path?: string) => analytics.trackPageView(path);
export const trackEvent = (
    eventName: string,
    options?: Parameters<Analytics['trackEvent']>[1]
) => analytics.trackEvent(eventName, options);
export const trackClick = (element: HTMLElement, eventName?: string) =>
    analytics.trackClick(element, eventName);
export const trackFormSubmit = (formName: string, properties?: Record<string, any>) =>
    analytics.trackFormSubmit(formName, properties);
