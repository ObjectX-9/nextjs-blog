"use client";

import { useState, useEffect } from "react";
import { IStack } from "@/app/model/stack";

interface StackWithId extends IStack {
  _id: string;
}

export default function StacksAdmin() {
  const [stacks, setStacks] = useState<StackWithId[]>([]);
  const [editingStack, setEditingStack] = useState<Partial<StackWithId> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchStacks();
  }, []);

  useEffect(() => {
    // Clean up preview URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', 'stackIcon');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No URL returned from upload');
    }

    return data.url;
  };

  const handleSaveStack = async () => {
    if (!editingStack) return;

    setIsUploading(true);
    try {
      let iconUrl = editingStack.iconSrc;

      // Upload new image if selected
      if (selectedFile) {
        iconUrl = await uploadImage(selectedFile);
      }

      const method = editingStack._id ? 'PUT' : 'POST';
      const response = await fetch('/api/stacks', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingStack,
          iconSrc: iconUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingStack._id ? 'update' : 'create'} stack`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchStacks();
        setEditingStack(null);
        setSelectedFile(null);
        setPreviewUrl("");
      } else {
        throw new Error(data.error || `Failed to ${editingStack._id ? 'update' : 'create'} stack`);
      }
    } catch (error) {
      console.error('Error saving stack:', error);
      alert('保存失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddStack = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingStack({
      title: "",
      description: "",
      link: "",
      iconSrc: "",
    });
  };

  const handleEditStack = (stack: StackWithId) => {
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingStack({ ...stack });
  };

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

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold">技术栈管理</h1>
        <button
          onClick={handleAddStack}
          className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm md:text-base"
        >
          添加技术栈
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stacks.map((stack) => (
          <div key={stack._id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={stack.iconSrc}
                  alt={stack.title}
                  className="w-8 h-8 object-contain"
                />
                <h3 className="font-semibold text-sm md:text-base">{stack.title}</h3>
              </div>
              <div className="flex space-x-2 w-full md:w-auto">
                <button
                  onClick={() => handleEditStack(stack)}
                  className="flex-1 md:flex-none px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteStack(stack._id)}
                  className="flex-1 md:flex-none px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
            <p className="mt-3 text-gray-600 text-sm line-clamp-2">{stack.description}</p>
            <a
              href={stack.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-blue-500 text-sm block hover:underline break-all"
            >
              {stack.link}
            </a>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingStack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-40">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto relative z-50">
            <div className="sticky top-0 bg-white p-4 md:p-6 border-b z-10">
              <h2 className="text-lg md:text-xl font-semibold">
                {editingStack._id ? "编辑技术栈" : "添加技术栈"}
              </h2>
            </div>
            
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-base"
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
                  className="w-full px-3 py-2 border rounded-lg text-base min-h-[100px]"
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
                  className="w-full px-3 py-2 border rounded-lg text-base"
                  value={editingStack.link}
                  onChange={(e) =>
                    setEditingStack({ ...editingStack, link: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  图标
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {(previewUrl || editingStack.iconSrc) && (
                    <div className="mb-4">
                      <img
                        src={previewUrl || editingStack.iconSrc}
                        alt="Stack icon preview"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center text-sm text-gray-600">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert('图片大小不能超过10MB');
                            return;
                          }
                          handleFileSelect(file);
                        }
                      }}
                      className="hidden"
                      id="icon-upload"
                    />
                    {!selectedFile && !editingStack.iconSrc ? (
                      <>
                        <label
                          htmlFor="icon-upload"
                          className="cursor-pointer text-blue-500 hover:text-blue-600"
                        >
                          点击选择图片或拖拽到此处
                        </label>
                        <p className="mt-1 text-gray-500">支持 PNG、JPG、GIF 格式，最大 10MB</p>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-600"
                      >
                        移除图片
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 md:p-6 border-t flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 md:justify-end z-10">
              <button
                onClick={() => setEditingStack(null)}
                className="w-full md:w-auto px-4 py-2 border rounded-lg hover:bg-gray-50 text-base"
              >
                取消
              </button>
              <button
                onClick={handleSaveStack}
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
