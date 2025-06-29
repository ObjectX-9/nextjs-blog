"use client";

import { Form, Switch, InputNumber, Spin, Button, Space } from "antd";
import { format } from "date-fns";
import { EditableSite } from "../types";
import { CaptchaDetail } from "../types";
import { verifyService } from "@/app/business/verify";
import { CaptchaType } from "@/app/model/captcha";

interface VerificationTabProps {
  editedSite: EditableSite;
  isEditing: boolean;
  handleInputChange: (field: string, value: any) => void;
  captchas: CaptchaDetail[];
  isLoadingCaptchas: boolean;
  generateCaptcha: () => Promise<any>;
}

export const VerificationTab: React.FC<VerificationTabProps> = ({
  editedSite,
  isEditing,
  handleInputChange,
  captchas,
  isLoadingCaptchas,
  generateCaptcha,
}) => {

  const handleGenerateCaptcha = async () => {
    try {
      await verifyService.createCaptcha({
        type: CaptchaType.ALPHANUMERIC,
        target: 'verify-page'
      });
      // 生成成功后刷新验证码列表
      await generateCaptcha();
    } catch (error) {
      console.error("生成验证码失败:", error);
    }
  };

  const handleCleanExpiredCaptchas = async () => {
    try {
      await verifyService.cleanExpiredCaptchas();
      // 清理后刷新验证码列表
      await generateCaptcha();
    } catch (error) {
      console.error("清理过期验证码失败:", error);
    }
  };

  return (
    <Form layout="vertical" className="space-y-6">
      <Form.Item label="开启文章验证">
        <Switch
          checked={editedSite.isOpenVerifyArticle === true}
          onChange={(checked) => {
            handleInputChange("isOpenVerifyArticle", checked);
            // 只有在开启验证且当前没有有效验证码时才生成新的
            if (checked) {
              const hasValidCaptcha = captchas.some(captcha => captcha.status === 'valid');
              if (!hasValidCaptcha) {
                handleGenerateCaptcha();
              }
            }
          }}
          disabled={!isEditing}
          className={!isEditing ? "cursor-not-allowed" : ""}
        />
        {!isEditing && (
          <div className="text-gray-400 text-sm mt-1">
            点击&quot;编辑&quot;按钮以修改设置
          </div>
        )}
      </Form.Item>

      {editedSite.isOpenVerifyArticle && (
        <>
          <Form.Item label="验证码激活有效期（小时）">
            <InputNumber
              min={1}
              max={720}
              value={editedSite.verificationCodeExpirationTime}
              onChange={(value) =>
                handleInputChange("verificationCodeExpirationTime", value)
              }
              disabled={!isEditing}
              placeholder="默认24小时"
            />
            <div className="text-gray-400 text-sm mt-1">
              设置验证码激活后的有效时长，超过该时长需要重新验证
            </div>
          </Form.Item>

          <Form.Item label="已生成的验证码列表">
            {isEditing && (
              <div className="mb-4">
                <Space>
                  <Button
                    type="primary"
                    onClick={handleGenerateCaptcha}
                    size="small"
                  >
                    生成新验证码
                  </Button>
                  <Button
                    onClick={handleCleanExpiredCaptchas}
                    size="small"
                    danger
                  >
                    清理过期验证码
                  </Button>
                </Space>
              </div>
            )}
            <div className="bg-white rounded-lg border">
              {isLoadingCaptchas ? (
                <div className="p-4 text-center">
                  <Spin tip="加载中..." spinning={true}>
                    <div className="h-20"></div>
                  </Spin>
                </div>
              ) : captchas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          验证码ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          验证码内容
                        </th>
                        <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          创建时间
                        </th>
                        <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          激活时间
                        </th>
                        <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          过期时间
                        </th>
                        <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          有效期
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {captchas.map((captcha) => (
                        <tr key={captcha._id} className="hover:bg-gray-50">
                          <td className="hidden sm:table-cell px-4 py-3 text-sm font-mono">
                            <div
                              className="max-w-[120px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                              title={captcha._id}
                            >
                              {captcha._id}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            <div>
                              <div className="sm:hidden text-xs text-gray-500 mb-1">
                                验证码：
                              </div>
                              <div
                                className="max-w-[120px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                                title={captcha.code}
                              >
                                {captcha.code}
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 py-3 text-sm">
                            {format(captcha.createdAt, "yyyy-MM-dd HH:mm:ss")}
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3 text-sm">
                            {captcha.activatedAt
                              ? format(
                                captcha.activatedAt,
                                "yyyy-MM-dd HH:mm:ss"
                              )
                              : "-"}
                          </td>
                          <td className="hidden md:table-cell px-4 py-3 text-sm">
                            {format(captcha.expiresAt, "yyyy-MM-dd HH:mm:ss")}
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 text-sm">
                            {captcha.activatedAt
                              ? `${editedSite.verificationCodeExpirationTime ||
                              24
                              }小时`
                              : "5分钟"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <div className="sm:hidden text-xs text-gray-500 mb-1">
                                状态：
                              </div>
                              <span
                                className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${captcha.status === "valid"
                                  ? "bg-green-50 text-green-700"
                                  : captcha.status === "used"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-red-50 text-red-700"
                                  }`}
                                style={{ minWidth: "60px" }}
                              >
                                {captcha.status === "valid"
                                  ? "有效"
                                  : captcha.status === "used"
                                    ? "已使用"
                                    : "已过期"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  暂无验证码记录
                </div>
              )}
            </div>
          </Form.Item>
        </>
      )}
    </Form>
  );
};
