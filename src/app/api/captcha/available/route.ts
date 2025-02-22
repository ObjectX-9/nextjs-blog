import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Captcha } from "@/app/model/captcha";

// 获取可用的验证码
export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();

    // 使用原子操作查找并更新一个可用的验证码
    const result = await db.collection<Captcha>("captchas").findOneAndUpdate(
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
    );

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
