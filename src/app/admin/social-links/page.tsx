"use client";

import { useState, useEffect } from "react";
import { ISocialLink } from "@/app/model/social-link";

interface SocialLinkWithId extends ISocialLink {
  _id: string;
}

export default function SocialLinksManagementPage() {
  const [items, setItems] = useState<SocialLinkWithId[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<SocialLinkWithId> | null>(null);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

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

  const handleAddItem = () => {
    setEditingItem({
      name: "",
      icon: "",
      url: "",
      bgColor: "#ffffff",
    });
  };

  const handleEditItem = (item: SocialLinkWithId) => {
    setEditingItem({ ...item });
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

  const handleSaveItem = async () => {
    if (!editingItem) return;

    try {
      const method = editingItem._id ? "PUT" : "POST";
      const response = await fetch("/api/social-links", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingItem),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingItem._id ? "update" : "create"} social link`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchSocialLinks();
        setEditingItem(null);
      } else {
        throw new Error(data.error || `Failed to ${editingItem._id ? "update" : "create"} social link`);
      }
    } catch (error) {
      console.error("Error saving social link:", error);
      alert("保存失败，请重试");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-6 border-b">
        <h1 className="text-2xl font-bold">社交链接管理</h1>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          添加链接
        </button>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-4 w-full">
          {items.map((item) => (
            <div key={item._id} className="border rounded-lg p-4 bg-white w-full">
              <div className="flex justify-between items-start w-full">
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center gap-4">
                    <span
                      className="w-8 h-8 flex items-center justify-center rounded"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      {item.icon}
                    </span>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                  </div>
                  <div className="mt-2 text-gray-600">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {item.url}
                    </a>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="px-4 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {editingItem._id ? "编辑社交链接" : "添加社交链接"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名称
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
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
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editingItem.icon}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, icon: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  链接
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
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
                    className="w-12 h-10 border rounded"
                    value={editingItem.bgColor}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, bgColor: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded"
                    value={editingItem.bgColor}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, bgColor: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setEditingItem(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
