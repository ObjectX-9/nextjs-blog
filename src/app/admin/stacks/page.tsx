"use client";

import { useState, useEffect } from "react";
import { IStack } from "@/app/model/stack";

interface StackWithId extends IStack {
  _id: string;
}

export default function StacksAdmin() {
  const [stacks, setStacks] = useState<StackWithId[]>([]);
  const [editingStack, setEditingStack] = useState<Partial<StackWithId> | null>(null);

  useEffect(() => {
    fetchStacks();
  }, []);

  const fetchStacks = async () => {
    try {
      const response = await fetch('/api/stacks');
      if (!response.ok) {
        throw new Error('Failed to fetch stacks');
      }
      const data = await response.json();
      if (data.success) {
        setStacks(data.stacks);
      }
    } catch (error) {
      console.error('Error fetching stacks:', error);
      alert('获取数据失败，请刷新重试');
    }
  };

  const handleAddStack = () => {
    setEditingStack({
      title: "",
      description: "",
      link: "",
      iconSrc: "",
    });
  };

  const handleEditStack = (stack: StackWithId) => {
    setEditingStack({ ...stack });
  };

  const handleDeleteStack = async (id: string) => {
    if (confirm('确定要删除这个技术栈吗？')) {
      try {
        const response = await fetch(`/api/stacks?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete stack');
        }

        const data = await response.json();
        if (data.success) {
          await fetchStacks();
        } else {
          throw new Error(data.error || 'Failed to delete stack');
        }
      } catch (error) {
        console.error('Error deleting stack:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleSaveStack = async () => {
    if (!editingStack) return;

    try {
      const method = editingStack._id ? 'PUT' : 'POST';
      const response = await fetch('/api/stacks', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStack),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingStack._id ? 'update' : 'create'} stack`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchStacks();
        setEditingStack(null);
      } else {
        throw new Error(data.error || `Failed to ${editingStack._id ? 'update' : 'create'} stack`);
      }
    } catch (error) {
      console.error('Error saving stack:', error);
      alert('保存失败，请重试');
    }
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
        {stacks.map((stack) => (
          <div key={stack._id} className="border rounded-lg p-4">
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
                  onClick={() => handleEditStack(stack)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteStack(stack._id)}
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
              {editingStack._id ? "编辑技术栈" : "添加技术栈"}
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
