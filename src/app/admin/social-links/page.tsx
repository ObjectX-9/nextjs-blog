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
            <div key={item._id} className="border rounded-lg p-4 bg-white w-full shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start w-full space-y-4 md:space-y-0">
                <div className="flex flex-col flex-grow space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm md:text-base"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      {item.icon}
                    </span>
                    <h3 className="font-bold text-base md:text-lg">{item.name}</h3>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 md:p-6 border-b">
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
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-base"
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
                      setEditingItem({ ...editingItem, bgColor: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded-lg text-base"
                    value={editingItem.bgColor}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, bgColor: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white p-4 md:p-6 border-t flex flex-col md:flex-row md:justify-end space-y-2 md:space-y-0 md:space-x-2">
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
