"use client";

import { useState } from "react";
import { socialLinks, SocialLink } from "@/config/social-links";

export default function SocialLinksManagementPage() {
  const [items, setItems] = useState<SocialLink[]>(socialLinks);
  const [editingItem, setEditingItem] = useState<SocialLink | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const saveToAPI = async (newItems: SocialLink[]) => {
    try {
      const response = await fetch("/api/social-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ socialLinks: newItems }),
      });

      if (!response.ok) {
        throw new Error("Failed to save social links");
      }

      const data = await response.json();
      if (data.success) {
        setItems(newItems);
        setEditingItem(null);
        setEditingIndex(null);
      } else {
        throw new Error("Failed to save social links");
      }
    } catch (error) {
      console.error("Error saving social links:", error);
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
    setEditingIndex(null);
  };

  const handleEditItem = (item: SocialLink, index: number) => {
    setEditingItem({ ...item });
    setEditingIndex(index);
  };

  const handleDeleteItem = (index: number) => {
    if (confirm("确定要删除这个社交链接吗？")) {
      const newItems = [...items];
      newItems.splice(index, 1);
      saveToAPI(newItems);
    }
  };

  const handleSaveItem = () => {
    if (!editingItem) return;

    const newItems = [...items];
    if (editingIndex !== null) {
      newItems[editingIndex] = editingItem;
    } else {
      newItems.push(editingItem);
    }
    saveToAPI(newItems);
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
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white w-full">
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
                    onClick={() => handleEditItem(item, index)}
                    className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteItem(index)}
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
              {editingIndex !== null ? "编辑社交链接" : "添加社交链接"}
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
                  setEditingIndex(null);
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
