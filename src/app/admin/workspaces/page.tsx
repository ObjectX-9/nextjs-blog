"use client";

import { useState, useEffect } from "react";

interface WorkspaceItem {
  _id: string;
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

export default function WorkspacesPage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [editingItem, setEditingItem] = useState<WorkspaceItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchWorkspaceItems();
  }, []);

  const fetchWorkspaceItems = async () => {
    try {
      const response = await fetch("/api/workspaces");
      const data = await response.json();
      if (data.success) {
        setItems(data.workspaceItems);
      } else {
        throw new Error("Failed to fetch workspace items");
      }
    } catch (error) {
      console.error("Error fetching workspace items:", error);
      alert("获取工作空间列表失败，请刷新重试");
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;

    try {
      const method = editingItem._id ? "PUT" : "POST";
      const response = await fetch("/api/workspaces", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingItem),
      });

      const data = await response.json();
      if (data.success) {
        await fetchWorkspaceItems();
        setEditingItem(null);
        setEditingIndex(null);
      } else {
        throw new Error(data.error || "Failed to save workspace item");
      }
    } catch (error) {
      console.error("Error saving workspace item:", error);
      alert("保存失败，请重试");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("确定要删除这个工作空间吗？")) return;

    try {
      const response = await fetch(`/api/workspaces?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchWorkspaceItems();
      } else {
        throw new Error(data.error || "Failed to delete workspace item");
      }
    } catch (error) {
      console.error("Error deleting workspace item:", error);
      alert("删除失败，请重试");
    }
  };

  const handleAddItem = () => {
    setEditingItem({
      _id: "",
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

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b space-y-4 md:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold">工作空间管理</h1>
        <button
          onClick={handleAddItem}
          className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm md:text-base"
        >
          添加工作空间
        </button>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="space-y-4 w-full">
          {items.map((item, index) => (
            <div
              key={item._id}
              className="border rounded-lg p-4 bg-white w-full shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-start w-full space-y-4 md:space-y-0">
                <div className="flex flex-col flex-grow space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="font-bold text-base md:text-lg">{item.product}</h3>
                    <span className="text-gray-600 text-sm md:text-base">{item.specs}</span>
                  </div>
                  <div className="text-gray-600 text-sm md:text-base">
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                      <span>购买地址：</span>
                      <span className="break-all">{item.buyAddress}</span>
                    </div>
                    {item.buyLink && (
                      <a
                        href={item.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline mt-1 inline-block break-all"
                      >
                        购买链接
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex w-full md:w-auto gap-2 mt-2 md:mt-0 md:ml-4">
                  <button
                    onClick={() => handleEditItem(item, index)}
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

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 md:p-6 border-b">
              <h2 className="text-lg md:text-xl font-semibold">
                {editingIndex !== null ? "编辑工作空间" : "添加工作空间"}
              </h2>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-base"
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
                  className="w-full px-3 py-2 border rounded-lg text-base"
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
                  className="w-full px-3 py-2 border rounded-lg text-base"
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
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  placeholder="http:// 或 https://"
                  value={editingItem.buyLink}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, buyLink: e.target.value })
                  }
                />
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
        </div>
      )}
    </div>
  );
}
