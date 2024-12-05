"use client";

import { useState, useEffect, useRef } from "react";
import { ISocialLink } from "@/app/model/social-link";
import Image from "next/image";

interface SocialLinkWithId extends ISocialLink {
  _id: string;
}

export default function SocialLinksManagementPage() {
  const [items, setItems] = useState<SocialLinkWithId[]>([]);
  const [editingItem, setEditingItem] =
    useState<Partial<SocialLinkWithId> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  useEffect(() => {
    // 清理预览URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchSocialLinks = async () => {
    try {
      const response = await fetch("/api/social-links");
      if (!response.ok) {
        throw new Error("Failed to fetch social links");
      }
      const data = await response.json();
      if (data.success) {
        setItems(data.socialLinks);
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
      alert("获取数据失败，请刷新重试");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
        alert("请选择 PNG、JPG 或 GIF 格式的图片");
        return;
      }

      // 验证文件大小（10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert("图片大小不能超过10MB");
        return;
      }

      setSelectedFile(file);
      // 创建预览URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadIcon = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload?path=/images/socialLinkIcon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading icon:", error);
      throw error;
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;

    try {
      let iconUrl = editingItem.icon;

      // 如果有选择新文件，先上传图标
      if (selectedFile) {
        try {
          iconUrl = (await uploadIcon()) as string;
          if (!iconUrl) {
            throw new Error("图标上传失败");
          }
        } catch (error) {
          alert("图标上传失败，请重试");
          return;
        }
      }

      const method = editingItem._id ? "PUT" : "POST";
      const response = await fetch("/api/social-links", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editingItem,
          icon: iconUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingItem._id ? "update" : "create"} social link`
        );
      }

      const data = await response.json();
      if (data.success) {
        await fetchSocialLinks();
        setEditingItem(null);
        setSelectedFile(null);
        setPreviewUrl("");
      } else {
        throw new Error(
          data.error ||
            `Failed to ${editingItem._id ? "update" : "create"} social link`
        );
      }
    } catch (error) {
      console.error("Error saving social link:", error);
      alert("保存失败，请重试");
    }
  };

  const handleAddItem = () => {
    setEditingItem({
      name: "",
      icon: "",
      url: "",
      bgColor: "#ffffff",
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleEditItem = (item: SocialLinkWithId) => {
    setEditingItem({ ...item });
    setSelectedFile(null);
    setPreviewUrl(item.icon || "");
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("确定要删除这个社交链接吗？")) {
      try {
        const response = await fetch(`/api/social-links?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete social link");
        }

        const data = await response.json();
        if (data.success) {
          await fetchSocialLinks();
        } else {
          throw new Error(data.error || "Failed to delete social link");
        }
      } catch (error) {
        console.error("Error deleting social link:", error);
        alert("删除失败，请重试");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b space-y-4 md:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold">社交链接管理</h1>
        <button
          onClick={handleAddItem}
          className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm md:text-base"
        >
          添加链接
        </button>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="space-y-4 w-full">
          {items.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg p-4 bg-white w-full shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-start w-full space-y-4 md:space-y-0">
                <div className="flex flex-col flex-grow space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                      <Image
                        src={item.icon}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-base md:text-lg">
                      {item.name}
                    </h3>
                  </div>
                  <div className="text-gray-600">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm md:text-base break-all"
                    >
                      {item.url}
                    </a>
                  </div>
                </div>
                <div className="flex w-full md:w-auto gap-2 mt-2 md:mt-0 md:ml-4">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="flex-1 md:flex-none px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="flex-1 md:flex-none px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white p-4 md:p-6 border-b z-10">
              <h2 className="text-lg md:text-xl font-semibold">
                {editingItem._id ? "编辑社交链接" : "添加社交链接"}
              </h2>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名称
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  图标
                </label>
                <div
                  className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl || editingItem?.icon ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
                        <Image
                          src={previewUrl || editingItem?.icon || ""}
                          alt="图标预览"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-blue-500 hover:text-blue-600">
                          点击更换图片
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          支持 PNG、JPG、GIF 格式，最大 10MB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-blue-500 hover:text-blue-600">
                        点击选择图片或拖拽到此处
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        支持 PNG、JPG、GIF 格式，最大 10MB
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  链接
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  value={editingItem.url}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, url: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  背景颜色
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border rounded-lg"
                    value={editingItem.bgColor}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        bgColor: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded-lg text-base"
                    value={editingItem.bgColor}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        bgColor: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white p-4 md:p-6 border-t flex flex-col md:flex-row md:justify-end space-y-2 md:space-y-0 md:space-x-2 z-10">
              <button
                onClick={() => setEditingItem(null)}
                className="w-full md:w-auto px-4 py-2 border rounded-lg hover:bg-gray-100 text-base"
              >
                取消
              </button>
              <button
                onClick={handleSaveItem}
                className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-base"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
