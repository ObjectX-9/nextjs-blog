"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface WorkspaceItem {
  _id: string;
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export default function WorkspacesPage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [editingItem, setEditingItem] = useState<WorkspaceItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchWorkspaceItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/workspaces?page=${pagination.page}&limit=${pagination.limit}`
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data.workspaceItems);
        setPagination((prev) => ({ ...prev, total: data.pagination.total }));
      } else {
        throw new Error("Failed to fetch workspace items");
      }
    } catch (error) {
      console.error("Error fetching workspace items:", error);
      alert("获取工作空间列表失败，请刷新重试");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchWorkspaceItems();
  }, [fetchWorkspaceItems]);

  const handleSaveItem = useCallback(async () => {
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
        // Optimistic update
        if (method === "POST") {
          setItems((prev) => [data.workspaceItem, ...prev]);
        } else {
          setItems((prev) =>
            prev.map((item) =>
              item._id === editingItem._id ? { ...item, ...editingItem } : item
            )
          );
        }
        setEditingItem(null);
        setEditingIndex(null);
      } else {
        throw new Error(data.error || "Failed to save workspace item");
      }
    } catch (error) {
      console.error("Error saving workspace item:", error);
      alert("保存失败，请重试");
    }
  }, [editingItem]);

  const handleDeleteItem = useCallback(async (id: string) => {
    if (!confirm("确定要删除这个工作空间吗？")) return;

    try {
      const response = await fetch(`/api/workspaces?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        // Optimistic update
        setItems((prev) => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(data.error || "Failed to delete workspace item");
      }
    } catch (error) {
      console.error("Error deleting workspace item:", error);
      alert("删除失败，请重试");
    }
  }, []);

  const handleAddItem = useCallback(() => {
    setEditingItem({
      _id: "",
      product: "",
      specs: "",
      buyAddress: "",
      buyLink: "",
    });
    setEditingIndex(null);
  }, []);

  const handleEditItem = useCallback((item: WorkspaceItem, index: number) => {
    setEditingItem({ ...item });
    setEditingIndex(index);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

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
        {isLoading ? (
          <div className="text-center text-gray-600">加载中...</div>
        ) : (
          <div className="space-y-4 w-full">
            {items.map((item, index) => (
              <div
                key={item._id}
                className="border rounded-lg p-4 bg-white w-full shadow-sm"
              >
                <div className="flex flex-col md:flex-row justify-between items-start w-full space-y-4 md:space-y-0">
                  <div className="flex flex-col flex-grow space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <h3 className="font-bold text-base md:text-lg">
                        {item.product}
                      </h3>
                      <span className="text-gray-600 text-sm md:text-base">
                        {item.specs}
                      </span>
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
        )}
      </div>

      <div className="p-4 md:p-6 border-t flex justify-between items-center">
        <div className="text-gray-600">
          共 {pagination.total} 条记录，当前第 {pagination.page} 页
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
          >
            上一页
          </button>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
          >
            下一页
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white p-4 md:p-6 border-b z-10">
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
