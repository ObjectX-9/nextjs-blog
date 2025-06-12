import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/auth";

// 限流缓存
const rateLimit = new Map<string, { count: number; timestamp: number }>();

// 权限规则定义
type RouteRule = {
  path: string;
  methods?: string[];
  public?: boolean;
  adminOnly?: boolean;
  rateLimit?: boolean;
};

// 路由权限配置
const routeRules: RouteRule[] = [
  { path: "/api/auth", public: true },
  { path: "/api/auth/login", public: true },
  { path: "/api/articles/[id]/like", public: true },
  { path: "/api/inspirations/[id]/stats", public: true },
  { path: "/api/demos/[id]", public: true },
  { path: "/api/site", public: true, methods: ["PATCH"] },

  { path: "/api/site", adminOnly: true, methods: ["POST", "PUT", "DELETE"] },
  { path: "/api/articles", adminOnly: true, methods: ["POST", "PUT", "DELETE"] },
  { path: "/api/inspirations", adminOnly: true, methods: ["POST", "PUT", "DELETE"] },
  { path: "/api/demos", adminOnly: true, methods: ["POST", "PUT", "DELETE"] },

  { path: "/api/articles", rateLimit: true },
  { path: "/api/inspirations", rateLimit: true },
  { path: "/api/demos", rateLimit: true },
];

// 路径匹配工具
function matchRoute(pathname: string, method: string) {
  return routeRules.find((rule) => {
    const regex = new RegExp("^" + rule.path.replace(/\[id\]/g, "[^/]+") + "$");
    return regex.test(pathname) && (!rule.methods || rule.methods.includes(method));
  });
}

// 限流检查
function checkRateLimit(ip: string, limit = 300, windowMs = 60_000): boolean {
  const now = Date.now();
  const current = rateLimit.get(ip) || { count: 0, timestamp: now };

  if (now - current.timestamp > windowMs) {
    current.count = 0;
    current.timestamp = now;
  }

  current.count++;
  rateLimit.set(ip, current);

  return current.count > limit;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 开发环境跳过所有检查
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api");

  const route = matchRoute(pathname, method);
  const token = request.cookies.get("admin_token")?.value;
  const isValidToken = token ? await verifyToken(token) : null;

  // 公开路径直接放行
  if (route?.public) {
    return NextResponse.next();
  }

  // 管理员权限校验
  if (route?.adminOnly && !isValidToken) {
    return new NextResponse(JSON.stringify({ error: "需要管理员权限" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 限流检查（仅限部分需要限流的接口）
  if (route?.rateLimit) {
    const ip = request.ip || "unknown";
    if (checkRateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: "请求太频繁，请稍后再试" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      });
    }
  }

  // 后台管理页面需要登录
  if (isAdminRoute && !isValidToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 已登录用户访问登录页，跳转后台首页
  if (isLoginPage && isValidToken) {
    return NextResponse.redirect(new URL("/admin/bookmarks", request.url));
  }

  return NextResponse.next();
}

// 匹配所有 API 和 admin 路由
export const config = {
  matcher: ["/admin/:path*", "/login", "/api/:path*"],
};
