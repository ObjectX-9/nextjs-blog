import { NextRequest, NextResponse } from 'next/server';

/**
 * 代理抖音视频流，解决跨域问题
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: '缺少视频URL' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.douyin.com/',
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Range': request.headers.get('range') || '',
            },
        });

        if (!response.ok && response.status !== 206) {
            return NextResponse.json({ error: '视频获取失败' }, { status: response.status });
        }

        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('content-type') || 'video/mp4');
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Access-Control-Allow-Origin', '*');

        if (response.headers.get('content-length')) {
            headers.set('Content-Length', response.headers.get('content-length')!);
        }
        if (response.headers.get('content-range')) {
            headers.set('Content-Range', response.headers.get('content-range')!);
        }

        return new NextResponse(response.body, {
            status: response.status,
            headers,
        });
    } catch (error) {
        console.error('代理视频失败:', error);
        return NextResponse.json({ error: '代理失败' }, { status: 500 });
    }
}
