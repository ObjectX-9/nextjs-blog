"use client";

import { useState } from "react";
import { stackList } from "@/config/stacks";

interface StackItem {
  title: string;
  description: string;
  link: string;
  iconSrc: string;
}

export default function StacksAdmin() {
  const [stacks, setStacks] = useState<StackItem[]>(stackList);
  const [editingStack, setEditingStack] = useState<StackItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const saveToAPI = async (newStacks: StackItem[]) => {
    try {
      const response = await fetch('/api/stacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stacks: newStacks }),
      });

      if (!response.ok) {
        throw new Error('Failed to save stacks');
      }

      const data = await response.json();
      if (data.success) {
        setStacks(newStacks);
      } else {
        throw new Error('Failed to save stacks');
      }
    } catch (error) {
      console.error('Error saving stacks:', error);
      alert('保存失败，请重试');
    }
  };

  const handleAddStack = () => {
    setEditingStack({
      title: "",
      description: "",
      link: "",
      iconSrc: "",
    });
    setEditingIndex(null);
  };

  const handleEditStack = (stack: StackItem, index: number) => {
    setEditingStack({ ...stack });
    setEditingIndex(index);
  };

  const handleDeleteStack = async (index: number) => {
    if (confirm('确定要删除这个技术栈吗？')) {
      const newStacks = [...stacks];
      newStacks.splice(index, 1);
      await saveToAPI(newStacks);
    }
  };

  const handleSaveStack = async () => {
    if (!editingStack) return;

    const newStacks = [...stacks];
    if (editingIndex !== null) {
      newStacks[editingIndex] = editingStack;
    } else {
      newStacks.push(editingStack);
    }

    await saveToAPI(newStacks);
    setEditingStack(null);
    setEditingIndex(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">技术栈管理</h1>
        <button
          onClick={handleAddStack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          添加技术栈
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stacks.map((stack, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={stack.iconSrc}
                  alt={stack.title}
                  className="w-8 h-8"
                />
                <h3 className="font-semibold">{stack.title}</h3>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditStack(stack, index)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteStack(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
            <p className="mt-2 text-gray-600 text-sm">{stack.description}</p>
            <a
              href={stack.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-blue-500 text-sm block hover:underline"
            >
              {stack.link}
            </a>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingStack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingIndex !== null ? "编辑技术栈" : "添加技术栈"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editingStack.title}
                  onChange={(e) =>
                    setEditingStack({ ...editingStack, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={editingStack.description}
                  onChange={(e) =>
                    setEditingStack({
                      ...editingStack,
                      description: e.target.value,
                    })
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
                  value={editingStack.link}
                  onChange={(e) =>
                    setEditingStack({ ...editingStack, link: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  图标链接
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editingStack.iconSrc}
                  onChange={(e) =>
                    setEditingStack({ ...editingStack, iconSrc: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setEditingStack(null);
                    setEditingIndex(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveStack}
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
