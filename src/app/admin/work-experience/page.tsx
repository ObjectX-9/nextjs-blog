"use client";

import { useState, useEffect } from "react";
import {
  IWorkExperience,
  IWorkExperienceBase,
} from "@/app/model/work-experience";

export default function WorkExperienceManagementPage() {
  const [items, setItems] = useState<IWorkExperience[]>([]);
  const [editingItem, setEditingItem] = useState<IWorkExperienceBase | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const fetchWorkExperiences = async () => {
    try {
      const response = await fetch("/api/work-experience");
      const data = await response.json();
      if (data.success) {
        setItems(data.workExperiences);
      } else {
        throw new Error("Failed to fetch work experiences");
      }
    } catch (error) {
      console.error("Error fetching work experiences:", error);
      alert("获取工作经历失败，请刷新重试");
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;

    try {
      const method = editingItem._id ? "PUT" : "POST";
      const response = await fetch("/api/work-experience", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingItem),
      });

      const data = await response.json();
      if (data.success) {
        await fetchWorkExperiences();
        setEditingItem(null);
        setEditingIndex(null);
      } else {
        throw new Error(data.error || `Failed to ${editingItem._id ? "update" : "create"} work experience`);
      }
    } catch (error) {
      console.error("Error saving work experience:", error);
      alert("保存失败，请重试");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("确定要删除这条工作经历吗？")) return;

    try {
      const response = await fetch(`/api/work-experience?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchWorkExperiences();
      } else {
        throw new Error(data.error || "Failed to delete work experience");
      }
    } catch (error) {
      console.error("Error deleting work experience:", error);
      alert("删除失败，请重试");
    }
  };

  const handleAddItem = () => {
    setEditingItem({
      _id: undefined,
      company: "",
      companyUrl: "",
      position: "",
      description: "",
      startDate: "",
      endDate: null,
    });
    setEditingIndex(null);
  };

  const handleEditItem = (item: IWorkExperience) => {
    setEditingItem({
      _id: item._id,
      company: item.company,
      companyUrl: item.companyUrl,
      position: item.position,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
    });
    setEditingIndex(items.findIndex((i) => i._id === item._id));
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b space-y-4 md:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold">工作经历管理</h1>
        <button
          onClick={handleAddItem}
          className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm md:text-base"
        >
          添加经历
        </button>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="space-y-4 w-full">
          {items.map((item, index) => (
            <div
              key={(item as any)._id}
              className="border rounded-lg p-4 bg-white w-full shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-start w-full space-y-4 md:space-y-0">
                <div className="flex flex-col flex-grow space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="font-bold text-base md:text-lg">
                      <a
                        href={item.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500"
                      >
                        {item.company}
                      </a>
                    </h3>
                    <span className="text-gray-600 text-sm md:text-base">{item.position}</span>
                  </div>
                  <div className="text-gray-600 text-sm md:text-base">
                    <p className="whitespace-pre-wrap">{item.description}</p>
                    <p className="mt-1">
                      {item.startDate} ~ {item.endDate || "至今"}
                    </p>
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
                    onClick={() => handleDeleteItem((item as any)._id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-[100]">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white p-4 md:p-6 border-b">
              <h2 className="text-lg md:text-xl font-semibold">
                {editingIndex !== null ? "编辑工作经历" : "添加工作经历"}
              </h2>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公司名称
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  value={editingItem.company}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, company: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公司网址
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  value={editingItem.companyUrl}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      companyUrl: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  职位
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  value={editingItem.position}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, position: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工作描述
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始时间
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  value={editingItem.startDate}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束时间
                </label>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                  <input
                    type="date"
                    className="w-full md:flex-1 px-3 py-2 border rounded-lg text-base"
                    value={editingItem.endDate || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        endDate: e.target.value,
                      })
                    }
                    disabled={editingItem.endDate === null}
                  />
                  <label className="flex items-center gap-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={editingItem.endDate === null}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          endDate: e.target.checked ? null : "",
                        })
                      }
                    />
                    <span className="text-sm text-gray-600">至今</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white p-4 md:p-6 border-t flex flex-col md:flex-row md:justify-end space-y-2 md:space-y-0 md:space-x-2">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setEditingIndex(null);
                }}
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
