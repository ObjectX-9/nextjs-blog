import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Friend } from "@/config/friends";

// 简单的内存缓存来实现速率限制
const RATE_LIMIT_WINDOW = 3600000; // 1小时（毫秒）
const RATE_LIMIT_MAX = 5; // 每小时最大请求数
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = requestLog.get(ip) || [];
  
  // 清理旧的请求记录
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return true;
  }
  
  recentRequests.push(now);
  requestLog.set(ip, recentRequests);
  return false;
}

export async function POST(request: Request) {
  try {
    // 获取请求IP（在生产环境中需要根据实际部署情况调整）
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // 检查速率限制
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "请求太频繁，请稍后再试" },
        { status: 429 }
      );
    }

    const { friend } = await request.json();

    // 验证必需字段
    if (!friend.name || !friend.avatar || !friend.link) {
      return NextResponse.json(
        { error: "缺少必需字段" },
        { status: 400 }
      );
    }

    // 连接数据库并插入新友链
    const db = await getDb();
    const result = await db.collection("friends").insertOne({
      ...friend,
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    if (!result.acknowledged) {
      throw new Error("Failed to insert friend");
    }

    return NextResponse.json({ 
      success: true,
      message: "友链提交成功，等待审核",
      friend: { ...friend, _id: result.insertedId }
    });
  } catch (error) {
    console.error("Error submitting friend:", error);
    return NextResponse.json(
      { error: "提交失败，请稍后重试" },
      { status: 500 }
    );
  }
}
