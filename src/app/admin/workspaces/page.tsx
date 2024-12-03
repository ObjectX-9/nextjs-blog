"use client";

import { useState, useEffect } from "react";
import { workspaceItems } from "@/config/workspace-items";

interface WorkspaceItem {
  id: number;
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

export default function WorkspacesPage() {
  const [items, setItems] = useState<WorkspaceItem[]>(workspaceItems);
  const [editingItem, setEditingItem] = useState<WorkspaceItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const saveToAPI = async (newItems: WorkspaceItem[]) => {
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItems),
      });

      if (!response.ok) {
        throw new Error("Failed to save workspace items");
      }

      const data = await response.json();
      if (data.success) {
        setItems(newItems);
        setEditingItem(null);
        setEditingIndex(null);
      } else {
        throw new Error("Failed to save workspace items");
      }
    } catch (error) {
      console.error("Error saving workspace items:", error);
      alert("保存失败，请重试");
    }
  };

  const handleAddItem = () => {
    const newId = Math.max(...items.map((item) => item.id), 0) + 1;
    setEditingItem({
      id: newId,
      product: "",
      specs: "",
      buyAddress: "",
      buyLink: "",
    });
    setEditingIndex(null);
  };

  const handleEditItem = (item: WorkspaceItem, index: number) => {
    setEditingItem({ ...item });
    setEditingIndex(index);
  };

  const handleDeleteItem = (index: number) => {
    if (confirm("确定要删除这个工作空间吗？")) {
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
        <h1 className="text-2xl font-bold">工作空间管理</h1>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          添加工作空间
        </button>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-4 w-full">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-white w-full"
            >
              <div className="flex justify-between items-start w-full">
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-lg">{item.product}</h3>
                    <span className="text-gray-600">{item.specs}</span>
                  </div>
                  <div className="mt-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>购买地址：</span>
                      <span>{item.buyAddress}</span>
                    </div>
                    {item.buyLink && (
                      <a
                        href={item.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline mt-1 inline-block"
                      >
                        购买链接
                      </a>
                    )}
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

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {editingIndex !== null ? "编辑工作空间" : "添加工作空间"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editingItem.product}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, product: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  规格
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editingItem.specs}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, specs: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  购买地址
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editingItem.buyAddress}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      buyAddress: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  购买链接
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  placeholder="http:// 或 https://"
                  value={editingItem.buyLink}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, buyLink: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
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
        </div>
      )}
    </div>
  );
}