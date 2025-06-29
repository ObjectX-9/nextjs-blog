export interface Captcha {
  /**
   * 文档ID
   */
  _id?: string;

  /**
   * 验证码内容
   */
  code: string;

  /**
   * 验证码创建时间
   */
  createdAt: Date;

  /**
   * 验证码过期时间
   */
  expiresAt: Date;



  /**
   * 验证码关联的用户标识（如邮箱或手机号）
   */
  target?: string;

  /**
   * 验证码是否已激活
   */
  isActivated?: boolean;

  /**
   * 验证码激活时间
   */
  activatedAt?: Date;

  /**
   * 验证码激活有效期（小时）
   */
  activationExpiryHours?: number;

  /**
   * 最后访问时间
   */
  lastAccessedAt?: Date;
}

/**
 * 验证码的类型
 */
export enum CaptchaType {
  /**
   * 数字验证码
   */
  NUMBER = "number",

  /**
   * 字母数字混合验证码
   */
  ALPHANUMERIC = "alphanumeric",
}

/**
 * 验证码的验证结果
 */
export interface CaptchaVerificationResult {
  /**
   * 验证是否成功
   */
  success: boolean;

  /**
   * 验证失败的原因
   */
  message?: string;
}
