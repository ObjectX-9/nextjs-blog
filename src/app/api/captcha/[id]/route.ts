import { Captcha } from "@/app/model/captcha";
import { ApiErrors, successResponse, withErrorHandler } from "../../data";
import { captchaDb } from "@/utils/db-instances";

// 获取验证码详情
export const GET = withErrorHandler<[Request, { params: { id: string } }], { captcha: Omit<Captcha, 'code'> & { status: string; expiresAt: Date } }>(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const captchaId = params.id;

  if (!captchaId) {
    throw ApiErrors.BAD_REQUEST("验证码ID不能为空");
  }

  const captcha = await captchaDb.findById(captchaId);

  if (!captcha) {
    throw ApiErrors.NOT_FOUND("验证码不存在");
  }

  // 检查验证码状态
  const now = new Date();
  let status = "valid";
  let expiresAt = captcha.expiresAt;

  // 如果验证码已激活，使用激活后的过期时间
  if (captcha.isActivated && captcha.activatedAt) {
    const activationExpiryTime = new Date(
      captcha.activatedAt.getTime() +
      (captcha.activationExpiryHours || 24) * 60 * 60 * 1000
    );
    expiresAt = activationExpiryTime;
  }

  // 判断状态
  if (expiresAt < now) {
    status = "expired";
  }

  // 返回验证码信息（不包含验证码内容）
  const { code, ...captchaWithoutCode } = captcha;
  const result = {
    ...captchaWithoutCode,
    status,
    expiresAt,
    // 如果验证码已激活，返回激活信息
    ...(captcha.isActivated && {
      activatedAt: captcha.activatedAt,
      activationExpiryHours: captcha.activationExpiryHours,
    }),
  };

  return successResponse({ captcha: result });
});

// 验证验证码
export const PUT = withErrorHandler<[Request, { params: { id: string } }], { message: string; expireTime: number }>(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const captchaId = params.id;

  if (!captchaId) {
    throw ApiErrors.BAD_REQUEST("验证码ID不能为空");
  }

  // 先查找验证码
  const captcha = await captchaDb.findById(captchaId);

  if (!captcha) {
    throw ApiErrors.BAD_REQUEST("验证码无效或已过期");
  }

  // 检查验证码是否已激活
  if (captcha.isActivated) {
    throw ApiErrors.BAD_REQUEST("验证码已被激活");
  }

  // 检查验证码是否过期（未激活状态下的5分钟有效期）
  const now = new Date();
  if (captcha.expiresAt < now) {
    throw ApiErrors.BAD_REQUEST("验证码已过期");
  }

  // 更新验证码状态为已激活（但不是已使用）
  const expiresAt = new Date(
    now.getTime() + (captcha.activationExpiryHours || 24) * 60 * 60 * 1000
  );

  await captchaDb.updateById(captchaId, {
    $set: {
      isActivated: true,
      activatedAt: now,
      expiresAt: expiresAt,
      lastAccessedAt: now
    },
  });

  return successResponse({
    message: "验证成功",
    expireTime: expiresAt.getTime()
  });
});


