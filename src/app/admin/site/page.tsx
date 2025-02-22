"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ISite } from "@/app/model/site";
import {
  Button,
  Input,
  message,
  Tabs,
  Card,
  Form,
  Upload,
  Statistic,
  DatePicker,
  Typography,
  Switch,
  InputNumber,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import dayjs from "dayjs";
import Image from "next/image";
import { Spin } from "antd";

// 类型定义
interface SiteWithId extends ISite {
  _id?: string;
}

interface EditableSite extends Omit<ISite, "visitCount" | "likeCount"> {
  _id?: string;
  visitCount: number | null;
  likeCount: number | null;
  isOpenVerifyArticle?: boolean;
  verificationCode?: string;
  verificationCodeExpirationTime?: number;
  wechatGroupName?: string;
  wechatKeyword?: string;
  googleTagManagerId?: string;
  googleAdsenseId?: string;
  isOpenGtm?: boolean;
  isOpenAdsense?: boolean;
}

interface CaptchaDetail {
  id: string;
  code?: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  isActivated?: boolean;
  activatedAt?: Date;
  activationExpiryHours?: number;
  status?: "valid" | "used" | "expired";
}

interface FileState {
  selectedFiles: { [key: string]: File };
  previewUrls: { [key: string]: string };
  isUploading: { [key: string]: boolean };
}

// 默认值
const defaultSite: SiteWithId = {
  createdAt: new Date(),
  visitCount: 0,
  likeCount: 0,
  favicon: "",
  qrcode: "",
  appreciationCode: "",
  wechatGroup: "",
  wechatGroupName: "",
  wechatKeyword: "",
  googleTagManagerId: "",
  googleAdsenseId: "",
  backgroundImage: "",
  title: "",
  description: "",
  author: {
    name: "",
    avatar: "",
    bio: "",
    description: "",
    education: [],
  },
  seo: {
    keywords: [],
    description: "",
  },
  isOpenVerifyArticle: false,
  verificationCode: "",
  verificationCodeExpirationTime: 24,
};

// 编辑时使用的默认值
const defaultEditableSite: EditableSite = {
  ...defaultSite,
  visitCount: null,
  likeCount: null,
};

// API 相关函数
const api = {
  async fetchSite() {
    const response = await fetch("/api/site");
    if (!response.ok) throw new Error("获取网站信息失败");
    return response.json();
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("上传失败");
    return response.json();
  },

  async saveSite(siteData: any) {
    const response = await fetch("/api/site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      body: JSON.stringify(siteData),
    });
    if (!response.ok) throw new Error("保存失败");
    return response.json();
  },

  async generateCaptcha() {
    const response = await fetch("/api/captcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "ALPHANUMERIC",
      }),
    });
    if (!response.ok) throw new Error("生成验证码失败");
    return response.json();
  },

  async getCaptchaDetail(id: string) {
    if (!id) return null;
    const response = await fetch(`/api/captcha/${encodeURIComponent(id)}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取验证码详情失败");
    }
    return response.json();
  },

  async getAllCaptchas() {
    const response = await fetch("/api/captcha");
    if (!response.ok) throw new Error("获取验证码列表失败");
    return response.json();
  },
};

export default function SiteManagementPage() {
  // 状态管理
  const [site, setSite] = useState<SiteWithId>(defaultSite);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editedSite, setEditedSite] =
    useState<EditableSite>(defaultEditableSite);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [fileState, setFileState] = useState<FileState>({
    selectedFiles: {},
    previewUrls: {},
    isUploading: {},
  });
  const [captchaDetail, setCaptchaDetail] = useState<CaptchaDetail | null>(
    null
  );
  const [captchas, setCaptchas] = useState<CaptchaDetail[]>([]);
  const [isLoadingCaptchas, setIsLoadingCaptchas] = useState(false);

  // 获取网站信息
  const fetchSite = useCallback(async () => {
    try {
      const data = await api.fetchSite();
      console.log("Fetched site data:", data.site);
      if (data.success && data.site) {
        // 确保验证码相关字段有默认值
        const siteWithDefaults = {
          ...data.site,
          isOpenVerifyArticle: data.site.isOpenVerifyArticle ?? false,
          verificationCode: data.site.verificationCode ?? "",
          verificationCodeExpirationTime:
            data.site.verificationCodeExpirationTime ?? 24,
          wechatGroupName: data.site.wechatGroupName ?? "",
          wechatKeyword: data.site.wechatKeyword ?? "",
          googleTagManagerId: data.site.googleTagManagerId ?? "",
          googleAdsenseId: data.site.googleAdsenseId ?? "",
          isOpenGtm: data.site.isOpenGtm ?? false,
          isOpenAdsense: data.site.isOpenAdsense ?? false,
        };
        console.log("Site with defaults:", siteWithDefaults);
        setSite(siteWithDefaults);
        setEditedSite(siteWithDefaults as EditableSite);
      }
    } catch (error) {
      console.error("获取网站信息失败:", error);
      messageApi.error("获取网站信息失败");
    }
  }, [messageApi]);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  // 处理输入变化
  const handleInputChange = useCallback((field: string, value: any) => {
    console.log("handleInputChange:", field, value, typeof value);
    setEditedSite((prev) => {
      console.log("Previous state:", prev);
      const fields = field.split(".");
      if (fields.length === 1) {
        if (field === "visitCount" || field === "likeCount") {
          const numValue = value === "" ? null : Number(value);
          return { ...prev, [field]: numValue };
        }
        if (field === "isOpenVerifyArticle") {
          const boolValue = value === true;
          console.log(
            "Setting isOpenVerifyArticle to:",
            boolValue,
            typeof boolValue
          );
          return { ...prev, isOpenVerifyArticle: boolValue };
        }
        if (field === "isOpenGtm" || field === "isOpenAdsense") {
          const boolValue = value === true;
          console.log(
            "Setting isOpenGtm or isOpenAdsense to:",
            boolValue,
            typeof boolValue
          );
          return { ...prev, [field]: boolValue };
        }
        return { ...prev, [field]: value };
      }

      const [parentField, childField] = fields;
      if (parentField === "author" || parentField === "seo") {
        return {
          ...prev,
          [parentField]: {
            ...prev[parentField],
            [childField]: value,
          },
        };
      }
      return prev;
    });
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback(
    async (field: string, file: File) => {
      if (!file.type.startsWith("image/")) {
        messageApi.error("请选择图片文件");
        return;
      }

      try {
        setFileState((prev) => ({
          ...prev,
          selectedFiles: { ...prev.selectedFiles, [field]: file },
          previewUrls: {
            ...prev.previewUrls,
            [field]: URL.createObjectURL(file),
          },
        }));
      } catch (error: any) {
        console.error("处理图片失败:", error);
        messageApi.error(error.message || "处理图片时出错");
      }
    },
    [messageApi]
  );

  // 上传文件
  const uploadFile = useCallback(async (field: string, file: File) => {
    try {
      setFileState((prev) => ({
        ...prev,
        isUploading: { ...prev.isUploading, [field]: true },
      }));

      const data = await api.uploadFile(file);

      setEditedSite((prev) => {
        if (field.startsWith("author.")) {
          const authorField = field.split(".")[1];
          return {
            ...prev,
            author: {
              ...prev.author,
              [authorField]: data.url,
            },
          };
        }
        return {
          ...prev,
          [field]: data.url,
        };
      });

      return data.url;
    } catch (error: any) {
      throw new Error(`上传${field}失败：${error.message}`);
    } finally {
      setFileState((prev) => ({
        ...prev,
        isUploading: { ...prev.isUploading, [field]: false },
      }));
    }
  }, []);

  // 保存站点信息
  const handleSave = useCallback(async () => {
    try {
      const imageFields = [
        "favicon",
        "qrcode",
        "appreciationCode",
        "wechatGroup",
        "backgroundImage",
        "author.avatar",
      ];

      // 上传所有图片
      const uploadPromises = imageFields
        .filter((field) => fileState.selectedFiles[field])
        .map((field) => uploadFile(field, fileState.selectedFiles[field]));

      if (uploadPromises.length > 0) {
        messageApi.info("正在上传图片...");
        await Promise.all(uploadPromises);
      }

      // 准备保存数据
      console.log("Preparing save data, editedSite:", editedSite);
      const finalSiteData = {
        ...editedSite,
        visitCount: editedSite.visitCount ?? 0,
        likeCount: editedSite.likeCount ?? 0,
        isOpenVerifyArticle: editedSite.isOpenVerifyArticle === true,
        verificationCode: editedSite.verificationCode || "",
        verificationCodeExpirationTime:
          editedSite.verificationCodeExpirationTime || 24,
        author: {
          ...editedSite.author,
          education: editedSite.author?.education || [],
        },
        seo: {
          keywords: Array.isArray(editedSite.seo?.keywords)
            ? editedSite.seo.keywords
            : [],
          description: editedSite.seo?.description || "",
        },
      };

      const data = await api.saveSite(finalSiteData);

      if (data.success) {
        messageApi.success("网站信息更新成功");
        setFileState({
          selectedFiles: {},
          previewUrls: {},
          isUploading: {},
        });
        setIsEditing(false);
        await fetchSite();
      } else if (data.errors) {
        messageApi.error(data.errors.join("、"));
      }
    } catch (error: any) {
      console.error("更新网站信息失败:", error);
      messageApi.error(error.message || "更新网站信息失败");
    }
  }, [editedSite, fileState.selectedFiles, uploadFile, messageApi, fetchSite]);

  // 取消编辑
  const handleCancel = useCallback(() => {
    setEditedSite(site as EditableSite);
    setIsEditing(false);
    setFileState({
      selectedFiles: {},
      previewUrls: {},
      isUploading: {},
    });
  }, [site]);

  // 渲染图片上传组件
  const renderImageUpload = useCallback(
    (field: string, label: string, value: string) => (
      <Form.Item label={label} className="mb-4">
        <Input
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          disabled={!isEditing}
          className="mb-2"
        />
        {isEditing && (
          <Upload
            beforeUpload={(file) => {
              handleFileSelect(field, file);
              return false;
            }}
            showUploadList={false}
          >
            <Button
              icon={<UploadOutlined />}
              disabled={fileState.isUploading[field]}
            >
              选择图片
            </Button>
          </Upload>
        )}
        {value && (
          <div className="mt-2">
            <Image
              src={value}
              alt={label}
              width={100}
              height={100}
              className="rounded border"
              priority={false}
              unoptimized={true}
            />
          </div>
        )}
      </Form.Item>
    ),
    [isEditing, handleInputChange, handleFileSelect, fileState.isUploading]
  );

  // Tab 配置
  const tabItems = useMemo(
    () => [
      {
        key: "basic",
        label: "基本信息",
        children: (
          <Form layout="vertical" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item label="网站标题">
                <Input
                  value={editedSite.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={!isEditing}
                />
              </Form.Item>
              {renderImageUpload("favicon", "网站图标", editedSite.favicon)}
            </div>

            <Form.Item label="网站描述">
              <Input.TextArea
                value={editedSite.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                disabled={!isEditing}
                rows={4}
              />
            </Form.Item>

            {renderImageUpload(
              "backgroundImage",
              "首页背景图",
              editedSite.backgroundImage
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderImageUpload("qrcode", "二维码", editedSite.qrcode)}
              {renderImageUpload(
                "appreciationCode",
                "赞赏码",
                editedSite.appreciationCode
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderImageUpload(
                "wechatGroup",
                "微信公众号图片",
                editedSite.wechatGroup
              )}
              <Form.Item label="微信公众号名称">
                <Input
                  value={editedSite.wechatGroupName || ""}
                  onChange={(e) =>
                    handleInputChange("wechatGroupName", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="请输入微信公众号名称"
                />
              </Form.Item>
              <Form.Item label="微信公众号关键词">
                <Input
                  value={editedSite.wechatKeyword || ""}
                  onChange={(e) =>
                    handleInputChange("wechatKeyword", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="请输入微信公众号关键词"
                />
              </Form.Item>
              <Form.Item label="ICP备案号">
                <Input
                  value={editedSite.icp || ""}
                  onChange={(e) => handleInputChange("icp", e.target.value)}
                  disabled={!isEditing}
                />
              </Form.Item>
            </div>
          </Form>
        ),
      },
      {
        key: "author",
        label: "作者信息",
        children: (
          <Form layout="vertical" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item label="作者名称">
                <Input
                  value={editedSite.author?.name}
                  onChange={(e) =>
                    handleInputChange("author.name", e.target.value)
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
              {renderImageUpload(
                "author.avatar",
                "作者头像",
                editedSite.author?.avatar || ""
              )}
            </div>

            <Form.Item label="作者简介">
              <Input.TextArea
                value={editedSite.author?.bio}
                onChange={(e) =>
                  handleInputChange("author.bio", e.target.value)
                }
                disabled={!isEditing}
                rows={2}
              />
            </Form.Item>

            <Form.Item label="作者描述">
              <Input.TextArea
                value={editedSite.author?.description}
                onChange={(e) =>
                  handleInputChange("author.description", e.target.value)
                }
                disabled={!isEditing}
                rows={4}
              />
            </Form.Item>
          </Form>
        ),
      },
      {
        key: "seo",
        label: "SEO设置",
        children: (
          <Form layout="vertical" className="space-y-6">
            <Form.Item label="SEO关键词">
              <Input
                value={
                  Array.isArray(editedSite.seo?.keywords)
                    ? editedSite.seo.keywords.join(",")
                    : ""
                }
                onChange={(e) =>
                  handleInputChange("seo.keywords", e.target.value.split(","))
                }
                disabled={!isEditing}
                placeholder="用逗号分隔多个关键词"
              />
            </Form.Item>

            <Form.Item label="SEO描述">
              <Input.TextArea
                value={editedSite.seo?.description}
                onChange={(e) =>
                  handleInputChange("seo.description", e.target.value)
                }
                disabled={!isEditing}
                rows={4}
              />
            </Form.Item>
          </Form>
        ),
      },
      {
        key: "verification",
        label: "验证设置",
        children: (
          <Form layout="vertical" className="space-y-6">
            <Form.Item label="开启文章验证">
              <Switch
                checked={editedSite.isOpenVerifyArticle === true}
                onChange={(checked) => {
                  console.log("Switch onChange:", checked, typeof checked);
                  handleInputChange("isOpenVerifyArticle", checked);
                  if (checked && !editedSite.verificationCode) {
                    // 如果开启验证且没有验证码，自动生成一个
                    api.generateCaptcha().then((data) => {
                      if (data.success) {
                        handleInputChange("verificationCode", data.captcha.id);
                        fetchCaptchaDetail(data.captcha.id);
                      } else {
                        messageApi.error("生成验证码失败");
                      }
                    });
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
                  <div className="bg-white rounded-lg border">
                    {isLoadingCaptchas ? (
                      <div className="p-4 text-center">
                        <Spin tip="加载中..." />
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
                              <tr key={captcha.id} className="hover:bg-gray-50">
                                <td className="hidden sm:table-cell px-4 py-3 text-sm font-mono">
                                  <div
                                    className="max-w-[120px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                                    title={captcha.id}
                                  >
                                    {captcha.id}
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
                                  {format(
                                    captcha.createdAt,
                                    "yyyy-MM-dd HH:mm:ss"
                                  )}
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
                                  {format(
                                    captcha.expiresAt,
                                    "yyyy-MM-dd HH:mm:ss"
                                  )}
                                </td>
                                <td className="hidden sm:table-cell px-4 py-3 text-sm">
                                  {captcha.activatedAt
                                    ? `${
                                        editedSite.verificationCodeExpirationTime ||
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
                                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                                        captcha.status === "valid"
                                          ? "bg-green-50 text-green-700"
                                          : captcha.status === "used"
                                          ? "bg-gray-50 text-gray-700"
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
        ),
      },
      {
        key: "analytics",
        label: "统计分析",
        children: (
          <Form layout="vertical" className="space-y-6">
            <Form.Item label="Google Tag Manager">
              <div className="space-y-4">
                <div>
                  <Switch
                    checked={editedSite.isOpenGtm === true}
                    onChange={(checked) =>
                      handleInputChange("isOpenGtm", checked)
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "cursor-not-allowed" : ""}
                  />
                  <span className="ml-2">启用 Google Tag Manager</span>
                </div>
                {editedSite.isOpenGtm && (
                  <Input
                    value={editedSite.googleTagManagerId}
                    onChange={(e) =>
                      handleInputChange("googleTagManagerId", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="请输入 GTM ID，格式如：GTM-XXXXXXX"
                  />
                )}
              </div>
            </Form.Item>

            <Form.Item label="Google AdSense">
              <div className="space-y-4">
                <div>
                  <Switch
                    checked={editedSite.isOpenAdsense === true}
                    onChange={(checked) =>
                      handleInputChange("isOpenAdsense", checked)
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "cursor-not-allowed" : ""}
                  />
                  <span className="ml-2">启用 Google AdSense</span>
                </div>
                {editedSite.isOpenAdsense && (
                  <Input
                    value={editedSite.googleAdsenseId}
                    onChange={(e) =>
                      handleInputChange("googleAdsenseId", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="请输入 AdSense ID，格式如：6315396465673433"
                  />
                )}
              </div>
            </Form.Item>
          </Form>
        ),
      },
    ],
    [
      editedSite,
      isEditing,
      handleInputChange,
      renderImageUpload,
      captchas,
      isLoadingCaptchas,
    ]
  );

  // 获取验证码详情
  const fetchCaptchaDetail = useCallback(
    async (id: string) => {
      try {
        const data = await api.getCaptchaDetail(id);
        if (data.success && data.captcha) {
          setCaptchaDetail({
            id: data.captcha.id,
            code: data.captcha.code,
            createdAt: new Date(data.captcha.createdAt),
            expiresAt: new Date(data.captcha.expiresAt),
            isUsed: data.captcha.isUsed,
          });
        }
      } catch (error) {
        console.error("获取验证码详情失败:", error);
        messageApi.error("获取验证码详情失败");
      }
    },
    [messageApi]
  );

  // 当验证码ID变化时获取详情
  useEffect(() => {
    if (editedSite.verificationCode) {
      fetchCaptchaDetail(editedSite.verificationCode);
    } else {
      setCaptchaDetail(null);
    }
  }, [editedSite.verificationCode, fetchCaptchaDetail]);

  // 获取所有验证码
  const fetchAllCaptchas = useCallback(async () => {
    try {
      setIsLoadingCaptchas(true);
      const data = await api.getAllCaptchas();
      if (data.success) {
        setCaptchas(
          data.captchas.map((captcha: any) => ({
            ...captcha,
            createdAt: new Date(captcha.createdAt),
            expiresAt: new Date(captcha.expiresAt),
            activatedAt: captcha.activatedAt
              ? new Date(captcha.activatedAt)
              : undefined,
          }))
        );
      }
    } catch (error) {
      console.error("获取验证码列表失败:", error);
      messageApi.error("获取验证码列表失败");
    } finally {
      setIsLoadingCaptchas(false);
    }
  }, [messageApi]);

  // 当验证设置改变时刷新验证码列表
  useEffect(() => {
    if (activeTab === "verification") {
      fetchAllCaptchas();
    }
  }, [activeTab, fetchAllCaptchas]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {contextHolder}

      <div className="flex justify-between items-center mb-6">
        <Typography.Title level={2}>网站信息管理</Typography.Title>
        <div>
          {!isEditing ? (
            <Button
              type="primary"
              onClick={() => {
                console.log("Entering edit mode");
                setIsEditing(true);
                // 确保编辑状态下的初始值
                setEditedSite((prev) => ({
                  ...prev,
                  isOpenVerifyArticle: prev.isOpenVerifyArticle === true,
                }));
              }}
            >
              编辑
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} className="mr-2">
                取消
              </Button>
              <Button type="primary" onClick={handleSave}>
                保存
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          {isEditing ? (
            <div>
              <div className="text-sm text-gray-500 mb-1">访问人数</div>
              <Input
                type="number"
                value={
                  editedSite.visitCount === null ? "" : editedSite.visitCount
                }
                onChange={(e) =>
                  handleInputChange("visitCount", e.target.value)
                }
              />
            </div>
          ) : (
            <Statistic title="访问人数" value={site.visitCount} />
          )}
        </Card>
        <Card>
          {isEditing ? (
            <div>
              <div className="text-sm text-gray-500 mb-1">点赞数</div>
              <Input
                type="number"
                value={
                  editedSite.likeCount === null ? "" : editedSite.likeCount
                }
                onChange={(e) => handleInputChange("likeCount", e.target.value)}
              />
            </div>
          ) : (
            <Statistic title="点赞数" value={site.likeCount} />
          )}
        </Card>
        <Card>
          {isEditing ? (
            <div>
              <div className="text-sm text-gray-500 mb-1">创建时间</div>
              <DatePicker
                showTime
                value={dayjs(editedSite.createdAt)}
                onChange={(date) =>
                  handleInputChange("createdAt", date?.toDate() || new Date())
                }
              />
            </div>
          ) : (
            <Statistic
              title="创建时间"
              value={format(new Date(site.createdAt), "yyyy年MM月dd日")}
            />
          )}
        </Card>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}
