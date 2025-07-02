import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { createApiParams, RequestValidator } from "@/utils/api-helpers";

export const dynamic = 'force-dynamic';

// 允许的域名配置
const ALLOWED_DOMAINS = [
    'next-blog.oss-cn-beijing.aliyuncs.com',
    // 可以添加其他允许的域名
];

// 响应接口
interface ProxyContentResponse {
    content: string;
    contentType: string;
}

export const GET = withErrorHandler<[Request], ProxyContentResponse>(async (request: Request) => {
    const apiParams = createApiParams(request);
    const url = apiParams.getString("url");

    // 验证必需参数
    RequestValidator.validateRequired({ url }, ['url']);

    // 由于经过了 validateRequired 验证，url 不会是 undefined
    const urlString = url as string;

    // 验证URL格式
    let urlObj: URL;
    try {
        urlObj = new URL(urlString);
    } catch {
        return errorResponse(ApiErrors.BAD_REQUEST('无效的URL格式'));
    }

    // 验证URL是否来自允许的域名（安全检查）
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain =>
        urlObj.hostname.includes(domain)
    );

    if (!isAllowedDomain) {
        return errorResponse(ApiErrors.FORBIDDEN('不允许的域名'));
    }

    // 代理请求到OSS
    const response = await fetch(urlString, {
        // 添加请求超时
        signal: AbortSignal.timeout(30000), // 30秒超时
        headers: {
            'User-Agent': 'NextJS-Proxy/1.0',
        }
    });

    if (!response.ok) {
        return errorResponse(
            ApiErrors.EXTERNAL_API_ERROR(
                `获取文件失败: ${response.status} ${response.statusText}`
            )
        );
    }

    const content = await response.text();
    const contentType = response.headers.get('content-type') || 'text/plain';

    return successResponse({
        content,
        contentType
    });
}); 