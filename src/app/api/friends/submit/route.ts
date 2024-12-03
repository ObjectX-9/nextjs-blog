import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
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

    // 读取现有的friends数据
    const configPath = path.join(process.cwd(), "src", "config", "friends.ts");
    const configContent = await fs.readFile(configPath, "utf-8");

    // 提取现有的friends数组
    const friendsMatch = configContent.match(/export const friends: Friend\[\] = \[([\s\S]*?)\];/);
    if (!friendsMatch) {
      throw new Error("Could not find friends array in config file");
    }

    // 格式化新的friend对象
    const newFriendStr = `  {
    avatar: "${friend.avatar}",
    name: "${friend.name}",
    title: "${friend.title || ""}",
    description: "${friend.description || ""}",
    link: "${friend.link}",
    position: "${friend.position || ""}",
    location: "${friend.location || ""}",
    isApproved: false,
  },\n`;

    // 在数组的开头插入新的friend
    const updatedFriends = friendsMatch[0].replace(
      "export const friends: Friend[] = [",
      `export const friends: Friend[] = [\n${newFriendStr}`
    );

    // 更新整个文件内容
    const updatedContent = configContent.replace(
      /export const friends: Friend\[\] = \[([\s\S]*?)\];/,
      updatedFriends
    );

    // 写入文件
    await fs.writeFile(configPath, updatedContent, "utf-8");

    return NextResponse.json({ 
      success: true,
      message: "友链提交成功，等待审核" 
    });
  } catch (error) {
    console.error("Error submitting friend:", error);
    return NextResponse.json(
      { error: "提交失败，请稍后重试" },
      { status: 500 }
    );
  }
}
