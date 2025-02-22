import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Captcha } from "@/app/model/captcha";
import { Db } from "mongodb";

// 清理过期的验证码
async function cleanExpiredCaptchas(db: Db) {
  try {
    const now = new Date();
    const result = await db.collection("captchas").deleteMany({
      $or: [
        { expiresAt: { $lt: now } },  // 过期的验证码
        { 
          isUsed: true,  // 已使用的验证码
          createdAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }  // 且创建时间超过24小时
        }
      ]
    });
    console.log(`已清理 ${result.deletedCount} 个过期或无效的验证码`);
  } catch (error) {
    console.error("清理过期验证码失败:", error);
  }
}

// 获取可用的验证码
export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();

    // 先清理过期的验证码
    await cleanExpiredCaptchas(db);

    // 使用原子操作查找并更新一个可用的验证码
    const result = await db.collection("captchas").findOneAndUpdate(
      {
        target: "verify-page",
        isUsed: false,
        expiresAt: { $gt: now },
        isActivated: false
      },
      {
        $set: {
          lastAccessedAt: now
        }
      },
      {
        sort: { createdAt: 1 }, // 优先使用最早创建的验证码
        returnDocument: "after"
      }
    ) as Captcha | null;

    if (result) {
      return NextResponse.json({
        success: true,
        captcha: result
      });
    }
    
    return NextResponse.json({
      success: false,
      message: "没有可用的验证码"
    });
  } catch (error) {
    console.error("Error getting available captcha:", error);
    return NextResponse.json(
      { success: false, message: "获取验证码失败" },
      { status: 500 }
    );
  }
}
