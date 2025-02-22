import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Captcha, CaptchaType } from "@/app/model/captcha";

// 生成验证码
function generateCode(type: CaptchaType): string {
  const length = 6;
  let chars =
    type === CaptchaType.NUMBER
      ? "0123456789"
      : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 创建新验证码
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    // 检查是否存在未过期且未使用的验证码
    const existingCaptcha = await db.collection<Captcha>("captchas").findOne({
      target: data.target,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (existingCaptcha) {
      // 返回验证码内容
      return NextResponse.json({
        success: true,
        captcha: existingCaptcha,
      });
    }

    // 创建新验证码
    const now = new Date();
    const captcha: Captcha = {
      id: new ObjectId().toString(),
      code: generateCode(data.type || CaptchaType.NUMBER),
      createdAt: now,
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000), // 5分钟有效期
      isUsed: false,
      target: data.target,
      isActivated: false,
      activationExpiryHours: data.activationExpiryHours || 24, // 默认24小时
    };

    // 使用原子操作插入新验证码
    await db.collection<Captcha>("captchas").insertOne(captcha);

    // 返回验证码信息（包含验证码内容）
    return NextResponse.json({
      success: true,
      captcha: captcha,
    });
  } catch (error) {
    console.error("Error creating captcha:", error);
    return NextResponse.json({ error: "验证码创建失败" }, { status: 500 });
  }
}

// 获取所有验证码
export async function GET(request: Request) {
  try {
    const db = await getDb();
    const captchas = await db
      .collection<Captcha>("captchas")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // 返回完整的验证码信息
    const captchasWithStatus = captchas.map((captcha) => {
      const now = new Date();
      const isExpired = captcha.expiresAt < now;
      return {
        ...captcha,
        status: captcha.isUsed ? "used" : isExpired ? "expired" : "valid",
      };
    });

    return NextResponse.json({
      success: true,
      captchas: captchasWithStatus,
    });
  } catch (error) {
    console.error("Error fetching captchas:", error);
    return NextResponse.json({ error: "获取验证码列表失败" }, { status: 500 });
  }
}

// 验证验证码
export async function PUT(request: Request) {
  try {
    const { id, code, target } = await request.json();
    const db = await getDb();

    // 先查找验证码
    const now = new Date();
    const captcha = await db.collection<Captcha>("captchas").findOne({
      id: id,
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
    const result = await db.collection<Captcha>("captchas").findOneAndUpdate(
      {
        id: id,
        target: target,
        isUsed: false,
        expiresAt: { $gt: now },
        code: code.toUpperCase(),
      },
      {
        $set: {
          isUsed: true,
          isActivated: true,
          activatedAt: now,
          // 更新过期时间为激活后的指定小时数
          expiresAt: new Date(
            now.getTime() +
              (captcha.activationExpiryHours || 24) * 60 * 60 * 1000
          ),
        },
      },
      { returnDocument: "before" }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying captcha:", error);
    return NextResponse.json({ error: "验证码验证失败" }, { status: 500 });
  }
}

// 删除过期验证码（定期清理）
export async function DELETE() {
  try {
    const db = await getDb();
    const now = new Date();
    const result = await db.collection<Captcha>("captchas").deleteMany({
      $or: [
        // 对于未激活的验证码，使用原始过期时间
        { isActivated: false, expiresAt: { $lt: now } },
        // 对于已激活的验证码，使用激活后的过期时间
        {
          isActivated: true,
          $expr: {
            $lt: [
              "$expiresAt",
              {
                $add: [
                  "$activatedAt",
                  { $multiply: ["$activationExpiryHours", 60, 60, 1000] },
                ],
              },
            ],
          },
        },
        // 已使用的验证码
        { isUsed: true },
      ],
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error cleaning up captchas:", error);
    return NextResponse.json({ error: "清理过期验证码失败" }, { status: 500 });
  }
}
