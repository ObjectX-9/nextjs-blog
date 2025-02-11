import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/auth";

// 简单的内存缓存实现速率限制
const rateLimit = new Map<string, { count: number; timestamp: number }>();

// 不需要限制的API路径
const excludedPaths = [
  "/api/articles/", // 文章基础路径
  "/api/inspirations/", // 灵感基础路径
  "/api/demos/", // 示例基础路径
  "/like", // 点赞
  "/view", // 浏览
  "/stats", // 统计
];

// 不需要限制的操作类型
const excludedActions = [
  "/like", // 点赞
  "/view", // 浏览
  "/stats", // 统计
];

// 需要管理员权限的操作
const adminOnlyPaths = [
  {
    path: "/api/site",
    methods: ["POST", "PUT", "DELETE"], // 只允许 GET 和 PATCH
  },
  {
    path: "/api/articles",
    methods: ["POST", "PUT", "DELETE"],
  },
  {
    path: "/api/inspirations",
    methods: ["POST", "PUT", "DELETE"],
  },
  {
    path: "/api/demos",
    methods: ["POST", "PUT", "DELETE"],
  },
];

// 不需要验证的路径
const publicPaths = [
  "/api/auth/login",
  "/api/auth", // GET 检查登录状态
];

export async function middleware(request: NextRequest) {
  // 本地开发环境跳过验证
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // 检查是否是公开路径
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 验证 token
  const token = request.cookies.get("admin_token")?.value;
  const isValidToken = token ? await verifyToken(token) : null;

  // 检查是否需要管理员权限
  if (isApiRoute) {
    const adminPath = adminOnlyPaths.find(
      (item) => pathname.startsWith(item.path) && item.methods.includes(method)
    );

    if (adminPath && !isValidToken) {
      return new NextResponse(
        JSON.stringify({
          error: "需要管理员权限",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 检查是否是需要排除的路径（仅对非管理员操作）
    const isExcludedPath =
      // 检查是否包含基础路径
      excludedPaths.some((path) => pathname.includes(path)) &&
      // 检查是否以指定操作结尾
      (excludedActions.some((action) => pathname.endsWith(action)) ||
        // 或者是站点统计的 PATCH 请求
        (pathname === "/api/site" && method === "PATCH"));

    // 如果不是排除的路径，则应用速率限制
    if (!isExcludedPath) {
      const ip = request.ip || "unknown";
      const now = Date.now();
      const windowMs = 60 * 1000; // 1分钟窗口
      const maxRequests = 60; // 每分钟最大请求数

      const current = rateLimit.get(ip) || { count: 0, timestamp: now };

      // 重置计数器
      if (now - current.timestamp > windowMs) {
        current.count = 0;
        current.timestamp = now;
      }

      current.count++;
      rateLimit.set(ip, current);

      // 超出限制
      if (current.count > maxRequests) {
        return new NextResponse(
          JSON.stringify({
            error: "请求太频繁，请稍后再试",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
            },
          }
        );
      }
    }

    // API 认证检查
    if (pathname.startsWith("/api/admin") && !isValidToken) {
      return new NextResponse(
        JSON.stringify({
          error: "未授权访问",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  // 管理路由保护
  if (isAdminRoute && !isValidToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 已登录用户重定向
  if (isLoginPage && isValidToken) {
    return NextResponse.redirect(new URL("/admin/bookmarks", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/api/:path*"],
};
