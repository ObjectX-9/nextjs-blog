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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import dayjs from "dayjs";
import Image from "next/image";

// 类型定义
interface SiteWithId extends ISite {
  _id?: string;
}

interface EditableSite extends Omit<ISite, "visitCount" | "likeCount"> {
  _id?: string;
  visitCount: number | null;
  likeCount: number | null;
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
};

export default function SiteManagementPage() {
  // 状态管理
  const [site, setSite] = useState<SiteWithId>(defaultSite);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editedSite, setEditedSite] = useState<EditableSite>(defaultSite as EditableSite);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [fileState, setFileState] = useState<FileState>({
    selectedFiles: {},
    previewUrls: {},
    isUploading: {},
  });

  // 获取网站信息
  const fetchSite = useCallback(async () => {
    try {
      const data = await api.fetchSite();
      if (data.success && data.site) {
        setSite(data.site);
        setEditedSite(data.site as EditableSite);
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
    setEditedSite((prev) => {
      const fields = field.split(".");
      if (fields.length === 1) {
        if (field === "visitCount" || field === "likeCount") {
          const numValue = value === "" ? null : Number(value);
          return { ...prev, [field]: numValue };
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
  const handleFileSelect = useCallback(async (field: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      messageApi.error("请选择图片文件");
      return;
    }

    try {
      setFileState((prev) => ({
        ...prev,
        selectedFiles: { ...prev.selectedFiles, [field]: file },
        previewUrls: { ...prev.previewUrls, [field]: URL.createObjectURL(file) },
      }));
    } catch (error: any) {
      console.error("处理图片失败:", error);
      messageApi.error(error.message || "处理图片时出错");
    }
  }, [messageApi]);

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
      const finalSiteData = {
        ...editedSite,
        visitCount: editedSite.visitCount ?? 0,
        likeCount: editedSite.likeCount ?? 0,
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
  const renderImageUpload = useCallback((field: string, label: string, value: string) => (
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
          <Button icon={<UploadOutlined />} disabled={fileState.isUploading[field]}>
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
  ), [isEditing, handleInputChange, handleFileSelect, fileState.isUploading]);

  // Tab 配置
  const tabItems = useMemo(() => [
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
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={!isEditing}
              rows={4}
            />
          </Form.Item>

          {renderImageUpload("backgroundImage", "首页背景图", editedSite.backgroundImage)}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderImageUpload("qrcode", "二维码", editedSite.qrcode)}
            {renderImageUpload("appreciationCode", "赞赏码", editedSite.appreciationCode)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderImageUpload("wechatGroup", "微信公众号图片", editedSite.wechatGroup)}
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
                onChange={(e) => handleInputChange("author.name", e.target.value)}
                disabled={!isEditing}
              />
            </Form.Item>
            {renderImageUpload("author.avatar", "作者头像", editedSite.author?.avatar || "")}
          </div>

          <Form.Item label="作者简介">
            <Input.TextArea
              value={editedSite.author?.bio}
              onChange={(e) => handleInputChange("author.bio", e.target.value)}
              disabled={!isEditing}
              rows={2}
            />
          </Form.Item>

          <Form.Item label="作者描述">
            <Input.TextArea
              value={editedSite.author?.description}
              onChange={(e) => handleInputChange("author.description", e.target.value)}
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
              value={Array.isArray(editedSite.seo?.keywords) ? editedSite.seo.keywords.join(",") : ""}
              onChange={(e) => handleInputChange("seo.keywords", e.target.value.split(","))}
              disabled={!isEditing}
              placeholder="用逗号分隔多个关键词"
            />
          </Form.Item>

          <Form.Item label="SEO描述">
            <Input.TextArea
              value={editedSite.seo?.description}
              onChange={(e) => handleInputChange("seo.description", e.target.value)}
              disabled={!isEditing}
              rows={4}
            />
          </Form.Item>
        </Form>
      ),
    },
  ], [editedSite, isEditing, handleInputChange, renderImageUpload]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {contextHolder}

      <div className="flex justify-between items-center mb-6">
        <Typography.Title level={2}>网站信息管理</Typography.Title>
        <div>
          {!isEditing ? (
            <Button type="primary" onClick={() => setIsEditing(true)}>
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
                value={editedSite.visitCount === null ? "" : editedSite.visitCount}
                onChange={(e) => handleInputChange("visitCount", e.target.value)}
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
                value={editedSite.likeCount === null ? "" : editedSite.likeCount}
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
                onChange={(date) => handleInputChange("createdAt", date?.toDate() || new Date())}
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
