"use client";

import { useState, useEffect, useCallback } from "react";
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

interface SiteWithId extends ISite {
  _id?: string;
}

// 用于编辑状态的接口
interface EditableSite extends Omit<ISite, "visitCount" | "likeCount"> {
  _id?: string;
  visitCount: number | null; // 允许为 null 以支持输入框清空
  likeCount: number | null; // 允许为 null 以支持输入框清空
}

// 默认的空站点数据
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

export default function SiteManagementPage() {
  const [site, setSite] = useState<SiteWithId>(defaultSite);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editedSite, setEditedSite] = useState<EditableSite>(
    defaultSite as EditableSite
  );
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>(
    {}
  );
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});

  // 获取网站信息
  const fetchSite = async () => {
    try {
      const response = await fetch("/api/site");
      const data = await response.json();
      if (data.success && data.site) {
        setSite(data.site);
        setEditedSite(data.site as EditableSite);
      }
    } catch (error) {
      console.error("获取网站信息失败:", error);
      messageApi.open({
        type: "error",
        content: "获取网站信息失败",
      });
    }
  };

  useEffect(() => {
    fetchSite();
  }, []);

  const handleInputChange = (
    field: string,
    value: string | string[] | number | object | Date
  ) => {
    if (!editedSite) return;

    const fields = field.split(".");
    if (fields.length === 1) {
      // 特殊处理数字类型的字段
      if (field === "visitCount" || field === "likeCount") {
        // 如果是空字符串，设置为 null
        const numValue = value === "" ? null : Number(value);
        setEditedSite((prev) => ({
          ...prev,
          [field]: numValue,
        }));
      } else {
        setEditedSite((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    } else if (fields.length === 2) {
      // 处理嵌套对象的情况
      const [parentField, childField] = fields;
      if (parentField === "author") {
        setEditedSite((prev) => ({
          ...prev,
          author: {
            ...prev.author,
            [childField]: value,
          },
        }));
      } else if (parentField === "seo") {
        setEditedSite((prev) => ({
          ...prev,
          seo: {
            ...prev.seo,
            [childField]: value,
          },
        }));
      }
    }
  };

  const handleFileSelect = async (field: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    try {
      setSelectedFiles((prev) => ({ ...prev, [field]: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => ({ ...prev, [field]: url }));
    } catch (error: any) {
      console.error("Error processing image:", error);
      alert(error.message || "处理图片时出错");
    }
  };

  const handleFileInputChange =
    (field: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFileSelect(field, file);
      }
    };

  const uploadFile = async (field: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `上传失败: ${response.status}`);
      }

      if (!data.url) {
        throw new Error(data.error || "上传失败：未获取到URL");
      }

      // 更新编辑状态中的图片URL
      if (field.startsWith("author.")) {
        const authorField = field.split(".")[1];
        setEditedSite((prev) => ({
          ...prev,
          author: {
            ...prev.author,
            [authorField]: data.url,
          },
        }));
      } else {
        setEditedSite((prev) => ({
          ...prev,
          [field]: data.url,
        }));
      }

      return data.url;
    } catch (error: any) {
      console.error(`Error uploading ${field}:`, error);
      throw new Error(`上传${field}失败：${error.message}`);
    }
  };

  const handleSave = async () => {
    if (!editedSite) return;

    try {
      // 检查是否有未上传的图片
      const imageFields = [
        "favicon",
        "qrcode",
        "appreciationCode",
        "wechatGroup",
        "backgroundImage",
      ];
      const authorImageFields = ["avatar"];
      let hasUploading = false;

      // 创建一个新的对象来存储最终要保存的数据
      let finalSiteData = { ...editedSite };

      // 处理数字字段，确保是数字类型
      if (
        typeof finalSiteData.visitCount === "string" ||
        finalSiteData.visitCount === null
      ) {
        finalSiteData.visitCount =
          finalSiteData.visitCount === null || finalSiteData.visitCount === ""
            ? 0
            : Number(finalSiteData.visitCount);
      }
      if (
        typeof finalSiteData.likeCount === "string" ||
        finalSiteData.likeCount === null
      ) {
        finalSiteData.likeCount =
          finalSiteData.likeCount === null || finalSiteData.likeCount === ""
            ? 0
            : Number(finalSiteData.likeCount);
      }

      // 先上传所有未上传的图片
      const uploadTasks = [];

      // 处理主要图片字段
      for (const field of imageFields) {
        if (selectedFiles[field]) {
          hasUploading = true;
          uploadTasks.push(
            uploadFile(field, selectedFiles[field])
              .then((url) => {
                finalSiteData = {
                  ...finalSiteData,
                  [field]: url,
                };
              })
              .catch((error) => {
                console.error(`Error uploading ${field}:`, error);
                throw new Error(`上传${field}失败：${error.message}`);
              })
          );
        }
      }

      // 处理作者相关的图片字段
      for (const field of authorImageFields) {
        const fullField = `author.${field}`;
        if (selectedFiles[fullField]) {
          hasUploading = true;
          uploadTasks.push(
            uploadFile(fullField, selectedFiles[fullField])
              .then((url) => {
                finalSiteData = {
                  ...finalSiteData,
                  author: {
                    ...finalSiteData.author,
                    [field]: url,
                  },
                };
              })
              .catch((error) => {
                console.error(`Error uploading ${fullField}:`, error);
                throw new Error(`上传${field}失败：${error.message}`);
              })
          );
        }
      }

      // 如果有图片正在上传，等待所有上传完成
      if (hasUploading) {
        messageApi.open({
          type: "info",
          content: "正在上传图片...",
        });
        await Promise.all(uploadTasks);
      }

      // 准备要保存的数据
      const siteToSave = {
        ...finalSiteData,
        author: {
          name: finalSiteData.author?.name || "",
          avatar: finalSiteData.author?.avatar || "",
          bio: finalSiteData.author?.bio || "",
          description: finalSiteData.author?.description || "",
          education: finalSiteData.author?.education || [],
        },
        seo: {
          keywords: Array.isArray(finalSiteData.seo?.keywords)
            ? finalSiteData.seo.keywords
            : [],
          description: finalSiteData.seo?.description || "",
        },
        title: finalSiteData.title || "",
        description: finalSiteData.description || "",
        favicon: finalSiteData.favicon || "",
        qrcode: finalSiteData.qrcode || "",
        appreciationCode: finalSiteData.appreciationCode || "",
        wechatGroup: finalSiteData.wechatGroup || "",
        backgroundImage: finalSiteData.backgroundImage || "",
        icp: finalSiteData.icp || "",
      };

      console.log("Saving site data:", siteToSave);

      // 保存站点信息
      const response = await fetch("/api/site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify(siteToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `保存失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        messageApi.open({
          type: "success",
          content: "网站信息更新成功",
        });
        // 清除选中的文件
        setSelectedFiles({});
        setPreviewUrls({});
        setIsEditing(false);
        // 保存成功后立即刷新数据
        await refreshSiteData();
      } else {
        // 处理后端返回的验证错误
        if (data.errors && Array.isArray(data.errors)) {
          messageApi.open({
            type: "error",
            content: data.errors.join("、"),
          });
        } else {
          throw new Error(data.error || "更新失败");
        }
      }
    } catch (error: any) {
      console.error("更新网站信息失败:", error);
      messageApi.open({
        type: "error",
        content: error.message || "更新网站信息失败",
      });
    }
  };

  const handleCancel = () => {
    setEditedSite(site as EditableSite);
    setIsEditing(false);
  };

  const refreshSiteData = useCallback(async () => {
    try {
      const response = await fetch("/api/site?" + new Date().getTime(), {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        throw new Error("获取数据失败");
      }

      const data = await response.json();
      if (data.success) {
        setSite(data.site);
        if (isEditing) {
          setEditedSite(data.site as EditableSite);
        }
      }
    } catch (error) {
      console.error("刷新站点数据失败:", error);
      messageApi.open({
        type: "error",
        content: "获取站点数据失败",
      });
    }
  }, [isEditing]);

  useEffect(() => {
    refreshSiteData();
  }, [refreshSiteData]);

  const renderImageUpload = (field: string, label: string, value: string) => (
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
          <Button icon={<UploadOutlined />} disabled={!!isUploading[field]}>
            选择图片
          </Button>
        </Upload>
      )}
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt={label}
            width={100}
            height={100}
            className="rounded border"
          />
        </div>
      )}
    </Form.Item>
  );

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

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "basic",
            label: "基本信息",
            children: (
              <Form layout="vertical" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item label="网站标题">
                    <Input
                      value={editedSite.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
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
                      handleInputChange(
                        "seo.keywords",
                        e.target.value.split(",")
                      )
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
        ]}
      />
    </div>
  );
}
