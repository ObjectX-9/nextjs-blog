import { useState, useCallback } from "react";
import { message } from "antd";
import { SiteWithId, EditableSite, CaptchaDetail, FileState } from "../types";
import { api } from "../api";
import { useLocalCache } from "../../../hooks/useLocalCache";
import { verifyService } from "@/app/business/verify";

// 缓存键常量
const CACHE_KEYS = {
  SITE_INFO: 'admin_site_info',
};

// 缓存时间常量（30分钟）
const CACHE_DURATION = 30 * 60 * 1000;

// 默认值
export const defaultSite: SiteWithId = {
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
  verificationCodeExpirationTime: 24,
  workspaceBgUrl1: "",
  workspaceBgUrl2: "",
};

// 编辑时使用的默认值
export const defaultEditableSite: EditableSite = {
  ...defaultSite,
  visitCount: null,
  likeCount: null,
};

export const useSiteManagement = () => {
  const [site, setSite] = useState<SiteWithId>(defaultSite);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSite, setEditedSite] = useState<EditableSite>(defaultEditableSite);
  const [messageApi, contextHolder] = message.useMessage();
  const [fileState, setFileState] = useState<FileState>({
    selectedFiles: {},
    previewUrls: {},
    isUploading: {},
  });
  const [captchas, setCaptchas] = useState<CaptchaDetail[]>([]);
  const [isLoadingCaptchas, setIsLoadingCaptchas] = useState(false);

  // 使用本地缓存钩子
  const { getFromCache, setCache, clearCache } = useLocalCache(CACHE_DURATION);

  // 获取网站信息
  const fetchSite = useCallback(async () => {
    try {
      // 先尝试从缓存获取
      const cachedSite = getFromCache<SiteWithId>(CACHE_KEYS.SITE_INFO);
      if (cachedSite) {
        setSite(cachedSite);
        setEditedSite(cachedSite as EditableSite);
        return;
      }

      const data = await api.fetchSite();
      if (data.success && data.site) {
        const siteWithDefaults = {
          ...data.site,
          isOpenVerifyArticle: data.site.isOpenVerifyArticle ?? false,
          verificationCodeExpirationTime: data.site.verificationCodeExpirationTime ?? 24,
          wechatGroupName: data.site.wechatGroupName ?? "",
          wechatKeyword: data.site.wechatKeyword ?? "",
          googleTagManagerId: data.site.googleTagManagerId ?? "",
          googleAdsenseId: data.site.googleAdsenseId ?? "",
          isOpenGtm: data.site.isOpenGtm ?? false,
          isOpenAdsense: data.site.isOpenAdsense ?? false,
        };
        setSite(siteWithDefaults);
        setEditedSite(siteWithDefaults as EditableSite);

        // 缓存网站信息
        setCache(CACHE_KEYS.SITE_INFO, siteWithDefaults);
      }
    } catch (error) {
      messageApi.error("获取网站信息失败");
    }
  }, [messageApi, getFromCache, setCache]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setEditedSite((prev) => {
      const fields = field.split(".");
      if (fields.length === 1) {
        if (field === "visitCount" || field === "likeCount") {
          const numValue = value === "" ? null : Number(value);
          return { ...prev, [field]: numValue };
        }
        if (field === "isOpenVerifyArticle" || field === "isOpenGtm" || field === "isOpenAdsense") {
          const boolValue = value === true;
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

  const handleFileSelect = useCallback(async (field: string, file: File) => {
    try {
      if (!file) {
        messageApi.error('请选择文件');
        return;
      }

      if (!file.type.startsWith("image/")) {
        messageApi.error("请选择图片文件");
        return;
      }

      // 先清理之前的预览URL（如果存在）
      setFileState((prev) => {
        const oldPreviewUrl = prev.previewUrls[field];
        if (oldPreviewUrl) {
          URL.revokeObjectURL(oldPreviewUrl);
        }

        // 创建新的预览URL
        const previewUrl = URL.createObjectURL(file);

        return {
          ...prev,
          selectedFiles: { ...prev.selectedFiles, [field]: file },
          previewUrls: {
            ...prev.previewUrls,
            [field]: previewUrl,
          },
        };
      });
    } catch (error) {
      messageApi.error("处理图片时出错");
    }
  }, [messageApi]);

  const uploadFile = useCallback(async (field: string, file: File) => {
    try {
      setFileState((prev) => ({
        ...prev,
        isUploading: { ...prev.isUploading, [field]: true },
      }));

      const data = await api.uploadFile(file);

      if (!data.url) {
        throw new Error('上传响应中没有URL');
      }

      return data.url;
    } catch (error: any) {
      messageApi.error(`上传${field}失败：${error.message}`);
      throw error;
    } finally {
      setFileState((prev) => ({
        ...prev,
        isUploading: { ...prev.isUploading, [field]: false },
      }));
    }
  }, [messageApi]);

  const handleSave = useCallback(async () => {
    try {
      // 定义需要处理的图片字段
      const imageFields = [
        "favicon",
        "qrcode",
        "appreciationCode",
        "wechatGroup",
        "backgroundImage",
        "author.avatar",
        "workspaceBgUrl1",
        "workspaceBgUrl2",
      ] as const;

      type ImageField = typeof imageFields[number];

      // 类型保护函数
      const isValidImageField = (field: string): field is ImageField => {
        return imageFields.includes(field as ImageField);
      };

      // 上传所有选中的图片
      const uploadResults = await Promise.all(
        (Object.keys(fileState.selectedFiles) as string[])
          .filter(isValidImageField)
          .map(async (field) => {
            try {
              const url = await uploadFile(field, fileState.selectedFiles[field]);
              return { field, url };
            } catch (error) {
              throw error;
            }
          })
      );

      // 更新 editedSite 中的图片 URL
      const updatedSite = { ...editedSite };
      uploadResults.forEach(({ field, url }) => {
        if (field.startsWith("author.")) {
          const [_, authorField] = field.split(".");
          if (authorField === "avatar") {
            updatedSite.author = {
              ...updatedSite.author,
              avatar: url,
            };
          }
        } else {
          switch (field) {
            case "favicon":
              updatedSite.favicon = url;
              break;
            case "qrcode":
              updatedSite.qrcode = url;
              break;
            case "appreciationCode":
              updatedSite.appreciationCode = url;
              break;
            case "wechatGroup":
              updatedSite.wechatGroup = url;
              break;
            case "backgroundImage":
              updatedSite.backgroundImage = url;
              break;
            case "workspaceBgUrl1":
              updatedSite.workspaceBgUrl1 = url;
              break;
            case "workspaceBgUrl2":
              updatedSite.workspaceBgUrl2 = url;
              break;
          }
        }
      });

      // 准备最终的保存数据
      const finalSiteData = {
        ...updatedSite,
        visitCount: updatedSite.visitCount ?? 0,
        likeCount: updatedSite.likeCount ?? 0,
        isOpenVerifyArticle: updatedSite.isOpenVerifyArticle === true,
        verificationCodeExpirationTime: updatedSite.verificationCodeExpirationTime || 24,
        author: {
          ...updatedSite.author,
          education: updatedSite.author?.education || [],
        },
        seo: {
          keywords: Array.isArray(updatedSite.seo?.keywords) ? updatedSite.seo.keywords : [],
          description: updatedSite.seo?.description || "",
        },
      };

      const data = await api.saveSite(finalSiteData);

      if (data.success) {
        messageApi.success("网站信息更新成功");
        // 清理文件状态
        setFileState({
          selectedFiles: {},
          previewUrls: {},
          isUploading: {},
        });
        setIsEditing(false);

        // 清除缓存，确保下次获取最新数据
        clearCache(CACHE_KEYS.SITE_INFO);
        await fetchSite();
      } else if (data.errors) {
        messageApi.error(data.errors.join("、"));
      }
    } catch (error: any) {
      messageApi.error(error.message || "更新网站信息失败");
    }
  }, [editedSite, fileState.selectedFiles, uploadFile, messageApi, fetchSite, clearCache]);

  const handleCancel = useCallback(() => {
    setEditedSite(site as EditableSite);
    setIsEditing(false);
    setFileState({
      selectedFiles: {},
      previewUrls: {},
      isUploading: {},
    });
  }, [site]);

  const fetchAllCaptchas = useCallback(async () => {
    try {
      setIsLoadingCaptchas(true);

      const data = await verifyService.getAllCaptchas();

      if (data.success) {
        const formattedCaptchas = data.captchas.map((captcha: any) => ({
          ...captcha,
          createdAt: new Date(captcha.createdAt),
          expiresAt: new Date(captcha.expiresAt),
          activatedAt: captcha.activatedAt ? new Date(captcha.activatedAt) : undefined,
        }));

        setCaptchas(formattedCaptchas);
      } else {
        setCaptchas([]);
      }
    } catch (error) {
      messageApi.error("获取验证码列表失败");
      setCaptchas([]);
    } finally {
      setIsLoadingCaptchas(false);
    }
  }, [messageApi]);

  return {
    site,
    isEditing,
    editedSite,
    setEditedSite,
    messageApi,
    contextHolder,
    fileState,
    captchas,
    isLoadingCaptchas,
    fetchSite,
    handleInputChange,
    handleFileSelect,
    handleSave,
    handleCancel,
    fetchAllCaptchas,
    setIsEditing,
  };
};
