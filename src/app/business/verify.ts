import { request } from "@/utils/request";
import { Captcha, CaptchaType } from "../model/captcha";

interface CreateCaptchaParams {
    type?: CaptchaType;
    target?: string;
}

interface CaptchaDetail extends Captcha {
    status: 'valid' | 'used' | 'expired';
}

interface VerifyCaptchaResult {
    message: string;
    expireTime: number;
}

interface GetAvailableCaptchaResult {
    captcha?: Captcha;
    message?: string;
}

interface VerifyResult {
    success: boolean;
    message?: string;
    captcha?: Captcha;
}

class VerifyBusiness {
    /**
     * 获取所有验证码列表
     */
    async getAllCaptchas(): Promise<{ success: boolean; captchas: CaptchaDetail[] }> {
        const response = await request.get<{ captchas: CaptchaDetail[] }>('captcha');
        return {
            success: true,
            captchas: response.data.captchas
        };
    }

    /**
     * 获取可用的验证码
     */
    async getAvailableCaptcha(): Promise<{ success: boolean; captcha?: Captcha; message?: string }> {
        const response = await request.get<{ captcha?: Captcha; message?: string }>('captcha/available');
        return {
            success: true,
            captcha: response.data.captcha,
            message: response.data.message
        };
    }

    /**
     * 创建新验证码
     */
    async createCaptcha(params: CreateCaptchaParams = {}): Promise<{ success: boolean; captcha: Captcha }> {
        const response = await request.post<{ captcha: Captcha }>('captcha', params);
        return {
            success: true,
            captcha: response.data.captcha
        };
    }

    /**
     * 根据ID获取验证码详情（不包含验证码内容）
     */
    async getCaptchaDetail(id: string): Promise<{ success: boolean; captcha: Omit<Captcha, 'code'> & { status: string } }> {
        const response = await request.get<{ captcha: Omit<Captcha, 'code'> & { status: string } }>(`captcha/${id}`);
        return {
            success: true,
            captcha: response.data.captcha
        };
    }

    /**
     * 验证验证码（激活验证码）
     */
    async verifyCaptcha(id: string): Promise<{ success: boolean; message: string; expireTime: number }> {
        const response = await request.put<VerifyCaptchaResult>(`captcha/${id}`);
        return {
            success: true,
            message: response.data.message,
            expireTime: response.data.expireTime
        };
    }

    /**
     * 清理过期验证码
     */
    async cleanExpiredCaptchas(): Promise<{ success: boolean; deletedCount: number }> {
        const response = await request.delete<{ deletedCount: number }>('captcha');
        return {
            success: true,
            deletedCount: response.data.deletedCount
        };
    }

    /**
     * 为验证页面生成验证码
     */
    async generateVerifyPageCaptcha(): Promise<VerifyResult> {
        try {
            // 先清理过期验证码
            const cleanupResponse = await request.delete<{ deletedCount: number }>('captcha');
            const deletedCount = cleanupResponse.data.deletedCount;
            console.log(`已清理 ${deletedCount} 个过期验证码`);

            // 创建新的验证码
            const response = await fetch("/api/captcha", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error("生成验证码失败");
            }

            const data = await response.json();
            return {
                success: true,
                captcha: data.data.captcha,
                message: deletedCount > 0 ? `已清理 ${deletedCount} 个过期验证码` : undefined
            };
        } catch (error) {
            console.error("生成验证码失败:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "生成验证码失败",
            };
        }
    }

    /**
     * 为管理员生成验证码
     */
    async generateAdminCaptcha(): Promise<{ success: boolean; captcha: Captcha }> {
        return this.createCaptcha({
            type: CaptchaType.ALPHANUMERIC,
            target: 'admin'
        });
    }

    /**
     * 检查验证码是否有效
     */
    async isCaptchaValid(id: string): Promise<boolean> {
        try {
            const result = await this.getCaptchaDetail(id);
            return result.success && result.captcha.status === 'valid';
        } catch (error) {
            console.error('检查验证码有效性失败:', error);
            return false;
        }
    }

    /**
     * 获取验证码统计信息
     */
    async getCaptchaStats(): Promise<{
        total: number;
        valid: number;
        used: number;
        expired: number;
    }> {
        try {
            const result = await this.getAllCaptchas();
            if (!result.success) {
                return { total: 0, valid: 0, used: 0, expired: 0 };
            }

            const stats = result.captchas.reduce(
                (acc, captcha) => {
                    acc.total++;
                    acc[captcha.status]++;
                    return acc;
                },
                { total: 0, valid: 0, used: 0, expired: 0 }
            );

            return stats;
        } catch (error) {
            console.error('获取验证码统计失败:', error);
            return { total: 0, valid: 0, used: 0, expired: 0 };
        }
    }
}

export const verifyService = new VerifyBusiness(); 