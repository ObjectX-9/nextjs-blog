// 解析 User-Agent
export function parseUserAgent(ua: string): {
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    browserVersion?: string;
    os: string;
    osVersion?: string;
} {
    // 设备检测
    let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
        device = 'tablet';
    } else if (/Mobile|iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        device = 'mobile';
    }

    const result = {
        device,
        browser: 'Unknown',
        browserVersion: undefined as string | undefined,
        os: 'Unknown',
        osVersion: undefined as string | undefined,
    };

    // 浏览器检测
    const browserPatterns = [
        { name: 'Edge', pattern: /Edg(?:e|A|iOS)?\/(\d+[\.\d]*)/ },
        { name: 'Chrome', pattern: /Chrome\/(\d+[\.\d]*)/ },
        { name: 'Firefox', pattern: /Firefox\/(\d+[\.\d]*)/ },
        { name: 'Safari', pattern: /Version\/(\d+[\.\d]*).*Safari/ },
        { name: 'Opera', pattern: /OPR\/(\d+[\.\d]*)/ },
        { name: 'IE', pattern: /MSIE (\d+[\.\d]*)|Trident.*rv:(\d+[\.\d]*)/ },
    ];

    for (const { name, pattern } of browserPatterns) {
        const match = ua.match(pattern);
        if (match) {
            result.browser = name;
            result.browserVersion = match[1] || match[2];
            break;
        }
    }

    // 操作系统检测
    const osPatterns = [
        { name: 'Windows', pattern: /Windows NT (\d+[\.\d]*)/ },
        { name: 'macOS', pattern: /Mac OS X (\d+[_\.\d]*)/ },
        { name: 'iOS', pattern: /iPhone OS (\d+[_\.\d]*)|iPad.*OS (\d+[_\.\d]*)/ },
        { name: 'Android', pattern: /Android (\d+[\.\d]*)/ },
        { name: 'Linux', pattern: /Linux/ },
    ];

    for (const { name, pattern } of osPatterns) {
        const match = ua.match(pattern);
        if (match) {
            result.os = name;
            result.osVersion = (match[1] || match[2])?.replace(/_/g, '.');
            break;
        }
    }

    return result;
}

// 判断流量来源
export function getTrafficSource(
    referrer?: string,
    utmSource?: string,
    utmMedium?: string
): 'direct' | 'search' | 'social' | 'referral' | 'email' | 'paid' | 'other' {
    // UTM 参数优先
    if (utmMedium) {
        const medium = utmMedium.toLowerCase();
        if (medium === 'cpc' || medium === 'ppc' || medium === 'paid') return 'paid';
        if (medium === 'email') return 'email';
        if (medium === 'social') return 'social';
    }

    if (!referrer || referrer === '') return 'direct';

    try {
        const url = new URL(referrer);
        const hostname = url.hostname.toLowerCase();

        // 搜索引擎
        const searchEngines = [
            'google', 'bing', 'yahoo', 'baidu', 'sogou', 'so.com',
            'duckduckgo', 'yandex', 'ecosia', 'ask.com'
        ];
        if (searchEngines.some(se => hostname.includes(se))) return 'search';

        // 社交媒体
        const socialNetworks = [
            'facebook', 'twitter', 'x.com', 'instagram', 'linkedin',
            'pinterest', 'reddit', 'tiktok', 'youtube', 'weibo',
            'wechat', 'qq.com', 'zhihu', 'douyin', 'bilibili'
        ];
        if (socialNetworks.some(sn => hostname.includes(sn))) return 'social';

        return 'referral';
    } catch {
        return 'other';
    }
}

// 获取地理位置（简化版，实际可接入 IP 地理位置服务）
export async function getGeoFromIP(ip: string): Promise<{ country?: string; city?: string }> {
    // 本地/内网 IP 不查询
    if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { country: 'Local', city: 'Local' };
    }

    try {
        // 使用免费的 IP 地理位置 API（生产环境建议使用付费服务）
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
            next: { revalidate: 86400 } // 缓存24小时
        });

        if (response.ok) {
            const data = await response.json();
            return {
                country: data.country || 'Unknown',
                city: data.city || 'Unknown',
            };
        }
    } catch (error) {
        console.error('Geo lookup error:', error);
    }

    return { country: 'Unknown', city: 'Unknown' };
}
