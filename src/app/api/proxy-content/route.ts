import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json(
                { error: '缺少url参数' },
                { status: 400 }
            );
        }

        // 验证URL是否来自我们的OSS域名（安全检查）
        const allowedDomains = [
            'next-blog.oss-cn-beijing.aliyuncs.com',
            // 可以添加其他允许的域名
        ];

        const urlObj = new URL(url);
        if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
            return NextResponse.json(
                { error: '不允许的域名' },
                { status: 403 }
            );
        }

        // 代理请求到OSS
        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json(
                { error: `获取文件失败: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const content = await response.text();

        return NextResponse.json({
            content,
            contentType: response.headers.get('content-type') || 'text/plain'
        });

    } catch (error) {
        console.error('代理获取内容失败:', error);
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
} 