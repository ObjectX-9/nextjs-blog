import { useState, useCallback } from "react";
import { message } from "antd";
import { SiteWithId, EditableSite, CaptchaDetail, FileState } from "../types";
import { api } from "../api";

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

  // 获取网站信息
  const fetchSite = useCallback(async () => {
    try {
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
      }
    } catch (error) {
      console.error("获取网站信息失败:", error);
      messageApi.error("获取网站信息失败");
    }
  }, [messageApi]);

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
    if (!file.type.startsWith("image/")) {
      messageApi.error("请选择图片文件");
      return;
    }

    setFileState((prev) => ({
      ...prev,
      selectedFiles: { ...prev.selectedFiles, [field]: file },
      previewUrls: {
        ...prev.previewUrls,
        [field]: URL.createObjectURL(file),
      },
    }));
  }, [messageApi]);

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

      const uploadPromises = imageFields
        .filter((field) => fileState.selectedFiles[field])
        .map((field) => uploadFile(field, fileState.selectedFiles[field]));

      if (uploadPromises.length > 0) {
        messageApi.info("正在上传图片...");
        await Promise.all(uploadPromises);
      }

      const finalSiteData = {
        ...editedSite,
        visitCount: editedSite.visitCount ?? 0,
        likeCount: editedSite.likeCount ?? 0,
        isOpenVerifyArticle: editedSite.isOpenVerifyArticle === true,
        verificationCodeExpirationTime: editedSite.verificationCodeExpirationTime || 24,
        author: {
          ...editedSite.author,
          education: editedSite.author?.education || [],
        },
        seo: {
          keywords: Array.isArray(editedSite.seo?.keywords) ? editedSite.seo.keywords : [],
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
      const data = await api.getAllCaptchas();
      if (data.success) {
        setCaptchas(
          data.captchas.map((captcha: any) => ({
            ...captcha,
            createdAt: new Date(captcha.createdAt),
            expiresAt: new Date(captcha.expiresAt),
            activatedAt: captcha.activatedAt ? new Date(captcha.activatedAt) : undefined,
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
