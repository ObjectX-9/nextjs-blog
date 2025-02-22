import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Captcha } from "@/app/model/captcha";

export async function POST(request: Request) {
  try {
    const { captchaId, code, target } = await request.json();

    // 验证参数
    if (!captchaId || !code || !target) {
      return NextResponse.json(
        { success: false, message: "缺少必要参数" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const captcha = await db.collection<Captcha>("captchas").findOne({
      id: captchaId
    });

    if (!captcha) {
      return NextResponse.json(
        { success: false, message: "验证码不存在" },
        { status: 404 }
      );
    }

    // 检查验证码状态
    const now = new Date();
    if (captcha.expiresAt < now) {
      return NextResponse.json(
        { success: false, message: "验证码已过期" },
        { status: 400 }
      );
    }

    if (captcha.isUsed) {
      return NextResponse.json(
        { success: false, message: "验证码已使用" },
        { status: 400 }
      );
    }

    // 验证码匹配检查
    if (captcha.code !== code) {
      return NextResponse.json(
        { success: false, message: "验证码错误" },
        { status: 400 }
      );
    }

    // 验证目标检查
    if (captcha.target !== target) {
      return NextResponse.json(
        { success: false, message: "验证码与目标不匹配" },
        { status: 400 }
      );
    }

    // 更新验证码状态为已使用
    const activationExpiryHours = captcha.activationExpiryHours || 24; // 使用验证码自身的有效期设置
    const expiresAt = new Date(Date.now() + activationExpiryHours * 60 * 60 * 1000);

    await db.collection<Captcha>("captchas").updateOne(
      { id: captchaId },
      {
        $set: {
          isUsed: true,
          usedAt: new Date(),
          isActivated: true,
          activatedAt: new Date(),
          expiresAt: expiresAt
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: "验证成功",
      expireTime: expiresAt.getTime()
    });
  } catch (error) {
    console.error("验证码验证失败:", error);
    return NextResponse.json(
      { success: false, message: "验证过程出错，请稍后重试" },
      { status: 500 }
    );
  }
}
