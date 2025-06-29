import { Captcha, CaptchaType } from "@/app/model/captcha";
import { successResponse, withErrorHandler } from "../data";
import { captchaDb, siteDb } from "@/utils/db-instances";
import { parseRequestBody, RequestValidator } from "@/utils/api-helpers";

// 获取站点设置
async function getSiteSettings() {
  const site = await siteDb.findOne({});
  return site || { verificationCodeExpirationTime: 24 }; // 默认24小时
}

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
export const POST = withErrorHandler<[Request], { captcha: Captcha }>(async (request: Request) => {
  const data = await parseRequestBody<{ type?: CaptchaType; target?: string }>(request);

  // 验证target字段
  if (data.target) {
    RequestValidator.validateRequired(data, ['target']);
  }

  // 不再检查现有验证码，每次都生成新的

  // 获取站点设置
  const site = await getSiteSettings();

  // 创建新验证码
  const now = new Date();
  const captcha: Captcha = {
    code: generateCode(data.type || CaptchaType.ALPHANUMERIC),
    createdAt: now,
    expiresAt: new Date(now.getTime() + 5 * 60 * 1000), // 5分钟有效期
    target: data.target || undefined,
    isActivated: false,
    activationExpiryHours: site.verificationCodeExpirationTime || 24,
  };

  const result = await captchaDb.insertOne(captcha);
  return successResponse({ captcha: result });
});

// 获取所有验证码
export const GET = withErrorHandler<[Request], { captchas: (Captcha & { status: string })[] }>(async () => {
  const captchas = await captchaDb.find({}, { sort: { createdAt: -1 } });

  // 返回完整的验证码信息，包含状态
  const captchasWithStatus = captchas.map((captcha) => {
    const now = new Date();
    let status = "valid";

    if (captcha.isActivated && captcha.activatedAt) {
      // 已激活：显示为已使用，但还需要检查是否过期
      const activationExpiryTime = new Date(
        captcha.activatedAt.getTime() + (captcha.activationExpiryHours || 24) * 60 * 60 * 1000
      );
      status = activationExpiryTime < now ? "expired" : "used";
    } else {
      // 未激活：检查是否超过5分钟
      status = captcha.expiresAt < now ? "expired" : "valid";
    }

    return {
      ...captcha,
      status,
    };
  });

  return successResponse({ captchas: captchasWithStatus });
});

// 删除过期验证码（定期清理）
export const DELETE = withErrorHandler<[Request], { deletedCount: number }>(async () => {
  const now = new Date();

  // 先找到真正过期的验证码
  const captchas = await captchaDb.find({});
  const expiredIds: string[] = [];

  for (const captcha of captchas) {
    let shouldDelete = false;

    if (captcha.isActivated && captcha.activatedAt) {
      // 已激活：只有超过激活有效期才删除
      const activationExpiryTime = new Date(
        captcha.activatedAt.getTime() + (captcha.activationExpiryHours || 24) * 60 * 60 * 1000
      );
      shouldDelete = activationExpiryTime < now;
    } else {
      // 未激活：超过5分钟就删除
      shouldDelete = captcha.expiresAt < now;
    }

    if (shouldDelete && captcha._id) {
      expiredIds.push(captcha._id);
    }
  }

  // 删除过期的验证码
  const result = await captchaDb.deleteMany({ _id: { $in: expiredIds } });
  return successResponse({ deletedCount: result.deletedCount });
});
