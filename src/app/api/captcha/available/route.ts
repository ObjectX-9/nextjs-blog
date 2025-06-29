import { Captcha } from "@/app/model/captcha";
import { successResponse, withErrorHandler } from "../../data";
import { captchaDb } from "@/utils/db-instances";

// 清理过期的验证码
async function cleanExpiredCaptchas() {
  try {
    const now = new Date();

    // 查找所有验证码并判断是否过期
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

    if (expiredIds.length > 0) {
      const result = await captchaDb.deleteMany({ _id: { $in: expiredIds } });
      console.log(`已清理 ${result.deletedCount} 个过期的验证码`);
    }
  } catch (error) {
    console.error("清理过期验证码失败:", error);
  }
}

// 获取可用的验证码
export const GET = withErrorHandler<[Request], { captcha?: Captcha; message?: string }>(async () => {
  const now = new Date();

  // 先清理过期的验证码
  await cleanExpiredCaptchas();

  // 查找一个可用的验证码（未激活且未过期）
  const captcha = await captchaDb.findOne({
    target: "verify-page",
    expiresAt: { $gt: now },
    isActivated: false
  });

  if (captcha && captcha._id) {
    // 更新访问时间
    await captchaDb.updateById(captcha._id, {
      $set: {
        lastAccessedAt: now
      }
    });

    return successResponse({ captcha });
  }

  return successResponse({
    captcha: undefined,
    message: "没有可用的验证码"
  });
});
