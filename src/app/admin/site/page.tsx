"use client";

import { useState, useEffect, useCallback } from "react";
import { ISite } from "@/app/model/site";
import Image from 'next/image';

interface SiteWithId extends ISite {
  _id?: string;
}

// 用于编辑状态的接口
interface EditableSite extends Omit<ISite, 'visitCount' | 'likeCount'> {
  _id?: string;
  visitCount: number | null;  // 允许为 null 以支持输入框清空
  likeCount: number | null;   // 允许为 null 以支持输入框清空
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
    education: []
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
  const [editedSite, setEditedSite] = useState<EditableSite>(defaultSite as EditableSite);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
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
      setMessage({ type: 'error', text: '获取网站信息失败' });
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
        setEditedSite(prev => ({
          ...prev,
          [field]: numValue
        }));
      } else {
        setEditedSite(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else if (fields.length === 2) {
      // 处理嵌套对象的情况
      const [parentField, childField] = fields;
      if (parentField === 'author') {
        setEditedSite(prev => ({
          ...prev,
          author: {
            ...prev.author,
            [childField]: value
          }
        }));
      } else if (parentField === 'seo') {
        setEditedSite(prev => ({
          ...prev,
          seo: {
            ...prev.seo,
            [childField]: value
          }
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
      setSelectedFiles(prev => ({ ...prev, [field]: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [field]: url }));
    } catch (error: any) {
      console.error("Error processing image:", error);
      alert(error.message || "处理图片时出错");
    }
  };

  const handleFileInputChange = (field: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (!data.success || !data.url) {
        throw new Error(data.error || "上传失败：未获取到URL");
      }

      // 更新编辑状态中的图片URL
      if (field.startsWith('author.')) {
        const authorField = field.split('.')[1];
        setEditedSite(prev => ({
          ...prev,
          author: {
            ...prev.author,
            [authorField]: data.url
          }
        }));
      } else {
        setEditedSite(prev => ({
          ...prev,
          [field]: data.url
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
      const imageFields = ['favicon', 'qrcode', 'appreciationCode', 'wechatGroup', 'backgroundImage'];
      const authorImageFields = ['avatar'];
      let hasUploading = false;

      // 创建一个新的对象来存储最终要保存的数据
      let finalSiteData = { ...editedSite };

      // 处理数字字段，确保是数字类型
      if (typeof finalSiteData.visitCount === 'string' || finalSiteData.visitCount === null) {
        finalSiteData.visitCount = finalSiteData.visitCount === null || finalSiteData.visitCount === ""
          ? 0
          : Number(finalSiteData.visitCount);
      }
      if (typeof finalSiteData.likeCount === 'string' || finalSiteData.likeCount === null) {
        finalSiteData.likeCount = finalSiteData.likeCount === null || finalSiteData.likeCount === ""
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
              .then(url => {
                finalSiteData = {
                  ...finalSiteData,
                  [field]: url
                };
              })
              .catch(error => {
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
              .then(url => {
                finalSiteData = {
                  ...finalSiteData,
                  author: {
                    ...finalSiteData.author,
                    [field]: url
                  }
                };
              })
              .catch(error => {
                console.error(`Error uploading ${fullField}:`, error);
                throw new Error(`上传${field}失败：${error.message}`);
              })
          );
        }
      }

      // 如果有图片正在上传，等待所有上传完成
      if (hasUploading) {
        setMessage({ type: 'info', text: '正在上传图片...' });
        await Promise.all(uploadTasks);
      }

      // 准备要保存的数据
      const siteToSave = {
        ...finalSiteData,
        author: {
          name: finalSiteData.author?.name || '',
          avatar: finalSiteData.author?.avatar || '',
          bio: finalSiteData.author?.bio || '',
          description: finalSiteData.author?.description || '',
          education: finalSiteData.author?.education || []
        },
        seo: {
          keywords: Array.isArray(finalSiteData.seo?.keywords) ? finalSiteData.seo.keywords : [],
          description: finalSiteData.seo?.description || '',
        },
        title: finalSiteData.title || '',
        description: finalSiteData.description || '',
        favicon: finalSiteData.favicon || '',
        qrcode: finalSiteData.qrcode || '',
        appreciationCode: finalSiteData.appreciationCode || '',
        wechatGroup: finalSiteData.wechatGroup || '',
        backgroundImage: finalSiteData.backgroundImage || '',
        icp: finalSiteData.icp || '',
      };

      console.log('Saving site data:', siteToSave);

      // 保存站点信息
      const response = await fetch("/api/site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        body: JSON.stringify(siteToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `保存失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: '网站信息更新成功' });
        // 清除选中的文件
        setSelectedFiles({});
        setPreviewUrls({});
        setIsEditing(false);
        // 保存成功后立即刷新数据
        await refreshSiteData();
      } else {
        // 处理后端返回的验证错误
        if (data.errors && Array.isArray(data.errors)) {
          setMessage({ type: 'error', text: data.errors.join('、') });
        } else {
          throw new Error(data.error || "更新失败");
        }
      }
    } catch (error: any) {
      console.error("更新网站信息失败:", error);
      setMessage({ type: 'error', text: error.message || '更新网站信息失败' });
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
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (!response.ok) {
        throw new Error('获取数据失败');
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
      setMessage({ type: 'error', text: '获取站点数据失败' });
    }
  }, [isEditing]);

  useEffect(() => {
    refreshSiteData();
  }, [refreshSiteData]);

  const renderImageUpload = (field: string, label: string, value: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        {isEditing && (
          <div className="relative">
            <input
              type="file"
              id={`file-${field}`}
              className="hidden"
              accept="image/*"
              onChange={handleFileInputChange(field)}
              disabled={!!isUploading[field]}
            />
            {selectedFiles[field] ? (
              <div className="relative group">
                <Image
                  src={previewUrls[field]}
                  alt="Preview"
                  width={40}
                  height={40}
                  className="rounded border"
                />
                <button
                  onClick={() => uploadFile(field, selectedFiles[field])}
                  disabled={!!isUploading[field]}
                  className="mt-1 w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isUploading[field] ? "上传中..." : "上传"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => document.getElementById(`file-${field}`)?.click()}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                选择
              </button>
            )}
          </div>
        )}
      </div>
      {value && (
        <div className="mt-2">
          <Image
            src={value}
            alt={label}
            width={100}
            height={100}
            className="rounded border"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} sticky top-0 z-10`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
        <h1 className="text-2xl font-bold">网站信息管理</h1>
        <div className="space-x-2">
          {!isEditing ? (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              编辑
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onClick={handleCancel}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleSave}
              >
                保存
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Display */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 sticky top-20 bg-white z-10 py-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {isEditing ? (
                <input
                  type="number"
                  value={editedSite.visitCount === null ? "" : editedSite.visitCount}
                  onChange={(e) => handleInputChange("visitCount", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                site.visitCount
              )}
            </div>
            <div className="text-sm text-gray-500">访问人数</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {isEditing ? (
                <input
                  type="number"
                  value={editedSite.likeCount === null ? "" : editedSite.likeCount}
                  onChange={(e) => handleInputChange("likeCount", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                site.likeCount
              )}
            </div>
            <div className="text-sm text-gray-500">点赞数</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={new Date(editedSite.createdAt).toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange("createdAt", new Date(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                new Date(site.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              )}
            </div>
            <div className="text-sm text-gray-500">创建时间</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 sticky top-[calc(20vh+6rem)] bg-white z-10">
        <div className="flex space-x-1 border-b">
          {[
            { id: 'basic', name: '基本信息' },
            { id: 'author', name: '作者信息' },
            { id: 'seo', name: 'SEO设置' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 ${activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow h-[calc(100vh-28rem)] overflow-y-auto">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">网站标题</label>
                <input
                  type="text"
                  value={editedSite.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              {renderImageUpload("favicon", "网站图标", editedSite.favicon)}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">网站描述</label>
              <textarea
                value={editedSite.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {renderImageUpload("backgroundImage", "首页背景图", editedSite.backgroundImage)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderImageUpload("qrcode", "二维码", editedSite.qrcode)}
              {renderImageUpload("appreciationCode", "赞赏码", editedSite.appreciationCode)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderImageUpload("wechatGroup", "微信群图片", editedSite.wechatGroup)}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">ICP备案号</label>
                <input
                  type="text"
                  value={editedSite.icp || ""}
                  onChange={(e) => handleInputChange("icp", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Author Tab */}
        {activeTab === 'author' && (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">作者名称</label>
                <input
                  type="text"
                  value={editedSite.author.name}
                  onChange={(e) => handleInputChange("author.name", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              {renderImageUpload("author.avatar", "作者头像", editedSite.author.avatar)}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">一句话描述</label>
              <input
                type="text"
                value={editedSite.author.description}
                onChange={(e) => handleInputChange("author.description", e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">作者简介</label>
              <textarea
                value={editedSite.author.bio}
                onChange={(e) => handleInputChange("author.bio", e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">教育经历</label>
                {isEditing && (
                  <button
                    onClick={() => {
                      setEditedSite(prev => ({
                        ...prev,
                        author: {
                          ...prev.author,
                          education: [
                            ...(prev.author.education || []),
                            {
                              school: "",
                              major: "",
                              degree: "",
                              certifications: [],
                              startDate: "",
                              endDate: ""
                            }
                          ]
                        }
                      }));
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    添加教育经历
                  </button>
                )}
              </div>

              {editedSite.author.education?.map((edu, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">教育经历 #{index + 1}</h3>
                    {isEditing && (
                      <button
                        onClick={() => {
                          setEditedSite(prev => ({
                            ...prev,
                            author: {
                              ...prev.author,
                              education: prev.author.education?.filter((_, i) => i !== index) || []
                            }
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        删除
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">学校</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const newEducation = [...(editedSite.author.education || [])];
                          newEducation[index] = { ...edu, school: e.target.value };
                          handleInputChange("author.education", newEducation);
                        }}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">专业</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => {
                          const newEducation = [...(editedSite.author.education || [])];
                          newEducation[index] = { ...edu, major: e.target.value };
                          handleInputChange("author.education", newEducation);
                        }}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">学位</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEducation = [...(editedSite.author.education || [])];
                          newEducation[index] = { ...edu, degree: e.target.value };
                          handleInputChange("author.education", newEducation);
                        }}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">证书（用逗号分隔）</label>
                      <input
                        type="text"
                        value={edu.certifications?.join(", ")}
                        onChange={(e) => {
                          const newEducation = [...(editedSite.author.education || [])];
                          newEducation[index] = {
                            ...edu,
                            certifications: e.target.value.split(",").map(cert => cert.trim())
                          };
                          handleInputChange("author.education", newEducation);
                        }}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">开始时间</label>
                      <input
                        type="date"
                        value={edu.startDate?.split('T')[0]}
                        onChange={(e) => {
                          const newEducation = [...(editedSite.author.education || [])];
                          newEducation[index] = { ...edu, startDate: e.target.value };
                          handleInputChange("author.education", newEducation);
                        }}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">结束时间</label>
                      <input
                        type="date"
                        value={edu.endDate?.split('T')[0]}
                        onChange={(e) => {
                          const newEducation = [...(editedSite.author.education || [])];
                          newEducation[index] = { ...edu, endDate: e.target.value };
                          handleInputChange("author.education", newEducation);
                        }}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">SEO关键词（用逗号分隔）</label>
              <input
                type="text"
                value={editedSite.seo.keywords.join(", ")}
                onChange={(e) => handleInputChange("seo.keywords", e.target.value.split(",").map((k) => k.trim()))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">SEO描述</label>
              <textarea
                value={editedSite.seo.description}
                onChange={(e) => handleInputChange("seo.description", e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
