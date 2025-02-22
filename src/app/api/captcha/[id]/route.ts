import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Captcha } from "@/app/model/captcha";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { success: false, message: "验证码ID不能为空" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const captcha = await db.collection<Captcha>("captchas").findOne({
      id: params.id
    });

    if (!captcha) {
      return NextResponse.json(
        { success: false, message: "验证码不存在" },
        { status: 404 }
      );
    }

    // 检查验证码状态
    const now = new Date();
    let status = 'valid';
    let expiresAt = captcha.expiresAt;

    // 如果验证码已激活，使用激活后的过期时间
    if (captcha.isActivated && captcha.activatedAt) {
      const activationExpiryTime = new Date(captcha.activatedAt.getTime() + (captcha.activationExpiryHours || 24) * 60 * 60 * 1000);
      expiresAt = activationExpiryTime;
    }

    // 判断状态
    if (captcha.isUsed) {
      status = 'used';
    } else if (expiresAt < now) {
      status = 'expired';
    }
    
    // 返回验证码信息（不包含验证码内容）
    const { code, ...captchaWithoutCode } = captcha;
    return NextResponse.json({
      success: true,
      captcha: {
        ...captchaWithoutCode,
        status,
        expiresAt,
        // 如果验证码已激活，返回激活信息
        ...(captcha.isActivated && {
          activatedAt: captcha.activatedAt,
          activationExpiryHours: captcha.activationExpiryHours
        })
      }
    });
  } catch (error) {
    console.error("Error fetching captcha:", error);
    return NextResponse.json(
      { success: false, message: "获取验证码信息失败" },
      { status: 500 }
    );
  }
}

// 验证验证码
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { code, target } = await request.json();
    const db = await getDb();

    // 先查找验证码
    const now = new Date();
    const captcha = await db.collection<Captcha>("captchas").findOne({
      id: params.id,
      target: target,
      isUsed: false,
      expiresAt: { $gt: now },
      code: code.toUpperCase(),
    });

    if (!captcha) {
      return NextResponse.json(
        { success: false, message: "验证码无效或已过期" },
        { status: 400 }
      );
    }

    // 更新验证码状态
    const expiresAt = new Date(
      now.getTime() + (captcha.activationExpiryHours || 24) * 60 * 60 * 1000
    );

    await db.collection<Captcha>("captchas").updateOne(
      { id: params.id },
      {
        $set: {
          isUsed: true,
          isActivated: true,
          activatedAt: now,
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
    console.error("Error verifying captcha:", error);
    return NextResponse.json(
      { success: false, message: "验证过程出错，请稍后重试" },
      { status: 500 }
    );
  }
}
