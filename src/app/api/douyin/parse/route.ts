import { NextRequest, NextResponse } from 'next/server';

interface DouyinVideoInfo {
    videoUrl: string;
    coverUrl: string;
    title: string;
    author: string;
    authorAvatar?: string;
    videoId: string;
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: '请提供抖音视频链接' }, { status: 400 });
        }

        const videoInfo = await parseDouyinVideo(url);
        return NextResponse.json(videoInfo);
    } catch (error) {
        console.error('解析抖音视频失败:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '解析失败' },
            { status: 500 }
        );
    }
}

async function parseDouyinVideo(shareUrl: string): Promise<DouyinVideoInfo> {
    const videoId = await extractVideoId(shareUrl);
    if (!videoId) {
        throw new Error('无法从链接中提取视频ID');
    }
    return await fetchVideoInfo(videoId);
}

async function extractVideoId(url: string): Promise<string | null> {
    const fullUrlMatch = url.match(/video\/(\d+)/);
    if (fullUrlMatch) return fullUrlMatch[1];

    if (url.includes('v.douyin.com') || url.includes('vm.tiktok.com')) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'manual',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
                }
            });
            const redirectUrl = response.headers.get('location');
            if (redirectUrl) {
                const match = redirectUrl.match(/video\/(\d+)/);
                if (match) return match[1];
            }
        } catch (error) {
            console.error('重定向请求失败:', error);
        }
    }
    return null;
}


async function fetchVideoInfo(videoId: string): Promise<DouyinVideoInfo> {
    // 方法1: 使用移动端页面 (更容易解析)
    const mobileUrl = `https://www.iesdouyin.com/share/video/${videoId}`;

    try {
        const response = await fetch(mobileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9',
            }
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        const html = await response.text();

        // 尝试多种提取方式
        let result = tryExtractFromRenderData(html, videoId);
        if (result) return result;

        result = tryExtractFromScript(html, videoId);
        if (result) return result;

        result = tryExtractFromMeta(html, videoId);
        if (result) return result;

        // 方法2: 尝试 PC 端
        return await fetchFromPC(videoId);

    } catch (error) {
        console.error('移动端获取失败，尝试PC端:', error);
        return await fetchFromPC(videoId);
    }
}

async function fetchFromPC(videoId: string): Promise<DouyinVideoInfo> {
    const pageUrl = `https://www.douyin.com/video/${videoId}`;

    const response = await fetch(pageUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.douyin.com/',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
        }
    });

    if (!response.ok) {
        throw new Error(`页面请求失败: ${response.status}`);
    }

    const html = await response.text();

    let result = tryExtractFromRenderData(html, videoId);
    if (result) return result;

    result = tryExtractFromScript(html, videoId);
    if (result) return result;

    result = tryExtractFromMeta(html, videoId);
    if (result) return result;

    throw new Error('无法从页面提取视频信息');
}


function tryExtractFromRenderData(html: string, videoId: string): DouyinVideoInfo | null {
    // 匹配 RENDER_DATA
    const renderMatch = html.match(/<script id="RENDER_DATA"[^>]*>([^<]+)<\/script>/);
    if (renderMatch) {
        try {
            const decoded = decodeURIComponent(renderMatch[1]);
            const data = JSON.parse(decoded);
            const videoData = findVideoInObject(data, videoId);
            if (videoData) {
                return extractInfo(videoData, videoId);
            }
        } catch (e) {
            console.error('RENDER_DATA 解析失败:', e);
        }
    }
    return null;
}

function tryExtractFromScript(html: string, videoId: string): DouyinVideoInfo | null {
    // 匹配各种可能的数据格式
    const patterns = [
        /window\._ROUTER_DATA\s*=\s*(\{.+?\})(?=\s*<\/script>)/,
        /window\.__INITIAL_STATE__\s*=\s*(\{.+?\})(?=\s*;?\s*<\/script>)/,
        /"aweme_detail"\s*:\s*(\{.+?\})(?=\s*,\s*")/,
        /"video"\s*:\s*(\{[^}]+?"play_addr"[^}]+?\})/,
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
            try {
                const data = JSON.parse(match[1].replace(/undefined/g, 'null'));
                const videoData = findVideoInObject(data, videoId);
                if (videoData) {
                    return extractInfo(videoData, videoId);
                }
            } catch {
                continue;
            }
        }
    }

    // 直接搜索视频URL
    const videoUrlMatch = html.match(/https?:\/\/[^"'\s]+?\.douyinvod\.com[^"'\s]+/);
    if (videoUrlMatch) {
        const coverMatch = html.match(/https?:\/\/[^"'\s]+?\.douyinpic\.com[^"'\s]+/);
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);

        return {
            videoUrl: videoUrlMatch[0].replace('playwm', 'play'),
            coverUrl: coverMatch ? coverMatch[0] : '',
            title: titleMatch ? titleMatch[1].replace(/ - 抖音$/, '') : '',
            author: '',
            videoId
        };
    }

    return null;
}

function tryExtractFromMeta(html: string, videoId: string): DouyinVideoInfo | null {
    // 从 meta 标签提取
    const ogVideo = html.match(/<meta[^>]+property="og:video:url"[^>]+content="([^"]+)"/);
    const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
    const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/);

    if (ogVideo) {
        return {
            videoUrl: ogVideo[1].replace('playwm', 'play'),
            coverUrl: ogImage ? ogImage[1] : '',
            title: ogTitle ? ogTitle[1] : '',
            author: '',
            videoId
        };
    }
    return null;
}


function findVideoInObject(obj: unknown, videoId: string, depth = 0): Record<string, unknown> | null {
    if (depth > 15 || !obj || typeof obj !== 'object') return null;

    const record = obj as Record<string, unknown>;

    // 检查是否是视频对象
    if (record.aweme_id === videoId || record.awemeId === videoId ||
        (record.video && typeof record.video === 'object')) {
        const video = record.video as Record<string, unknown> | undefined;
        if (video?.play_addr || video?.playAddr || video?.play_addr_h264) {
            return record;
        }
    }

    // 检查 aweme_detail
    if (record.aweme_detail && typeof record.aweme_detail === 'object') {
        return record.aweme_detail as Record<string, unknown>;
    }

    // 递归搜索
    for (const key of Object.keys(record)) {
        if (key === 'log_pb' || key === 'extra') continue;
        const result = findVideoInObject(record[key], videoId, depth + 1);
        if (result) return result;
    }

    return null;
}

function extractInfo(data: Record<string, unknown>, videoId: string): DouyinVideoInfo {
    const video = data.video as Record<string, unknown> | undefined;
    const author = data.author as Record<string, unknown> | undefined;

    let videoUrl = '';
    if (video) {
        // 尝试多种地址格式
        const addrKeys = ['play_addr', 'playAddr', 'play_addr_h264', 'play_addr_265'];
        for (const key of addrKeys) {
            const addr = video[key] as Record<string, unknown> | undefined;
            if (addr) {
                const urlList = (addr.url_list || addr.urlList) as string[] | undefined;
                if (urlList?.length) {
                    videoUrl = urlList[0].replace('playwm', 'play');
                    break;
                }
            }
        }

        // 尝试 bit_rate
        if (!videoUrl && Array.isArray(video.bit_rate) && video.bit_rate.length > 0) {
            const bitRate = video.bit_rate[0] as Record<string, unknown>;
            const playAddr = bitRate?.play_addr as Record<string, unknown>;
            const urlList = playAddr?.url_list as string[] | undefined;
            if (urlList?.length) {
                videoUrl = urlList[0].replace('playwm', 'play');
            }
        }
    }

    let coverUrl = '';
    if (video) {
        const coverKeys = ['cover', 'origin_cover', 'dynamic_cover', 'ai_dynamic_cover'];
        for (const key of coverKeys) {
            const cover = video[key] as Record<string, unknown> | undefined;
            if (cover) {
                const urlList = (cover.url_list || cover.urlList) as string[] | undefined;
                if (urlList?.length) {
                    coverUrl = urlList[0];
                    break;
                }
            }
        }
    }

    const shareInfo = data.share_info as Record<string, unknown> | undefined;
    const title = (data.desc || data.title || shareInfo?.share_title || '') as string;

    let authorName = '';
    let authorAvatar = '';
    if (author) {
        authorName = (author.nickname || author.name || '') as string;
        const avatar = (author.avatar_thumb || author.avatar_medium) as Record<string, unknown> | undefined;
        if (avatar) {
            const urlList = (avatar.url_list || avatar.urlList) as string[] | undefined;
            if (urlList?.length) {
                authorAvatar = urlList[0];
            }
        }
    }

    return { videoUrl, coverUrl, title, author: authorName, authorAvatar, videoId };
}

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
        return NextResponse.json(
            { error: '请提供抖音视频链接，例如: ?url=https://v.douyin.com/xxxxx/' },
            { status: 400 }
        );
    }

    try {
        const videoInfo = await parseDouyinVideo(url);
        return NextResponse.json(videoInfo);
    } catch (error) {
        console.error('解析抖音视频失败:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '解析失败' },
            { status: 500 }
        );
    }
}