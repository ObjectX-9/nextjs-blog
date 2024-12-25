"use client";

import { useState, useEffect } from "react";
import { IDemo, IDemoCategory } from "@/app/model/demo";
import Image from 'next/image';
import imageCompression from "browser-image-compression";
import { ObjectId } from '@/app/utils/objectId';

interface EditingDemo {
  categoryId: string;
  newCategoryId: string;
  demoId: string;
  demo: Partial<IDemo>;
}

interface ActionModalDemo {
  categoryId: string;
  demoId: string;
  demo: IDemo;
  categoryName: string;
}

export default function DemosManagementPage() {
  const [categories, setCategories] = useState<IDemoCategory[]>([]);
  const [activeTab, setActiveTab] = useState("demos");
  const [newCategory, setNewCategory] = useState<Partial<IDemoCategory>>({
    name: "",
    description: "",
  });
  const [newDemo, setNewDemo] = useState<Partial<IDemo>>({
    name: "",
    description: "",
    gifUrl: "",
    tags: [],
    completed: false,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showAddDemo, setShowAddDemo] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingDemo, setEditingDemo] = useState<EditingDemo | null>(null);
  const [actionModalDemo, setActionModalDemo] = useState<ActionModalDemo | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/demos/categories");
      const data = await response.json();
      if (data?.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCategoryId(data.categories[0]._id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "images/demos"); // 指定上传路径

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Upload response error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error("No URL returned from upload");
      }
      return data.url;
    } catch (error: any) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1.9,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type as string,
      initialQuality: 0.8,
      onProgress: (progress: number) => {
        console.log('压缩进度：', progress);
      }
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('压缩失败:', error);
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const validTypes = ['image/gif', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('请上传PNG、JPG或GIF格式的图片！');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // 如果文件大于2MB，进行压缩
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) {
        fileToUpload = await compressImage(file);
      }
      
      const url = await uploadFile(fileToUpload);
      setNewDemo({ ...newDemo, gifUrl: url });
    } catch (error) {
      alert('上传失败，请重试！');
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.name?.trim()) {
      setIsUpdating(true);
      try {
        const response = await fetch("/api/demos/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCategory),
        });

        if (!response.ok) {
          throw new Error("Failed to create category");
        }

        await fetchCategories();
        setNewCategory({ name: "", description: "" });
      } catch (error) {
        console.error("Error creating category:", error);
        alert("Failed to create category. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("确定要删除这个分类及其所有demo吗？")) {
      setIsUpdating(true);
      try {
        const response = await fetch(`/api/demos/categories?id=${categoryId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete category");
        }

        await fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleAddDemo = async () => {
    if (newDemo.name?.trim() && selectedCategoryId) {
      setIsUpdating(true);
      try {
        const response = await fetch("/api/demos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newDemo,
            categoryId: selectedCategoryId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create demo");
        }

        await fetchCategories();
        setNewDemo({
          name: "",
          description: "",
          gifUrl: "",
          tags: [],
          completed: false,
        });
        setShowAddDemo(false);
        setActiveTab("demos");
        setPreviewUrl("");
        setSelectedFile(null);
      } catch (error) {
        console.error("Error creating demo:", error);
        alert("Failed to create demo. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteDemo = async (demoId: string) => {
    if (confirm("确定要删除这个demo吗？")) {
      setIsUpdating(true);
      try {
        const response = await fetch(`/api/demos?id=${demoId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete demo");
        }

        await fetchCategories();
      } catch (error) {
        console.error("Error deleting demo:", error);
        alert("Failed to delete demo. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleUpdateDemo = async (demoId: string, updatedDemo: Partial<IDemo>) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/demos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: demoId, ...updatedDemo }),
      });

      if (!response.ok) {
        throw new Error("Failed to update demo");
      }

      await fetchCategories();
      setEditingDemo(null);
    } catch (error) {
      console.error("Error updating demo:", error);
      alert("Failed to update demo. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newDemo.tags?.includes(tagInput.trim())) {
      setNewDemo({
        ...newDemo,
        tags: [...(newDemo.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewDemo({
      ...newDemo,
      tags: newDemo.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 h-screen overflow-hidden">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Demo 管理</h1>

      {/* Tabs */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-2 sm:space-x-4 min-w-max">
          <button
            onClick={() => setActiveTab("demos")}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded ${
              activeTab === "demos"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Demo列表
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded ${
              activeTab === "categories"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            分类管理
          </button>
          <button
            onClick={() => {
              setActiveTab("add");
              setShowAddDemo(true);
            }}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded ${
              activeTab === "add"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            添加Demo
          </button>
        </div>
      </div>

      {/* Categories Management */}
      {activeTab === "categories" && (
        <div className="bg-white p-3 sm:p-6 rounded-xl shadow-lg overflow-y-auto max-h-[calc(100vh-180px)]">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">分类管理</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="分类名称"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
            </div>
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                placeholder="分类描述"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
            </div>
            <button
              onClick={handleAddCategory}
              disabled={isUpdating}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors duration-200 font-medium flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  添加分类
                </>
              )}
            </button>
          </div>
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category._id?.toString()}
                className="flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 bg-white group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{category.name}</h3>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm sm:text-base font-medium">
                      {category.demos?.length || 0} 个demo
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{category.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category._id?.toString() || "")}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Demo Form */}
      {activeTab === "add" && (
        <div className="bg-white p-3 sm:p-6 rounded-xl shadow-lg mb-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">添加新Demo</h2>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                选择分类
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
              >
                {categories.map((category) => (
                  <option key={category._id?.toString()} value={category._id?.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">名称</label>
              <input
                type="text"
                value={newDemo.name}
                onChange={(e) => setNewDemo({ ...newDemo, name: e.target.value })}
                className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                placeholder="输入Demo名称"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">描述</label>
              <textarea
                value={newDemo.description}
                onChange={(e) =>
                  setNewDemo({ ...newDemo, description: e.target.value })
                }
                className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 min-h-[120px] resize-y"
                placeholder="详细描述Demo的功能和特点"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                上传图片
              </label>
              <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-4 sm:px-6 py-8 sm:py-10 hover:border-indigo-500 transition-colors duration-200">
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label
                      htmlFor="gif-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span className="inline-flex items-center px-3 py-2 border border-indigo-500 text-sm rounded-lg hover:bg-indigo-50 transition-colors duration-200">
                        选择图片
                        <input
                          type="file"
                          accept=".gif,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          id="gif-upload"
                        />
                      </span>
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">或将文件拖放到此处</p>
                  <p className="text-xs text-gray-400 mt-1">支持 PNG、JPG、GIF 格式，最大 10MB</p>
                </div>
              </div>
              {previewUrl && (
                <div className="mt-4">
                  <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                    </p>
                  )}
                </div>
              )}
              {isUploading && (
                <div className="mt-2">
                  <div className="flex items-center text-sm text-indigo-600">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    上传中...
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">标签</label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {newDemo.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-indigo-800 focus:outline-none"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent pl-4 pr-24 py-2.5 text-sm transition duration-200"
                    placeholder="输入标签后按回车或点击添加"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-3 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={newDemo.completed}
                  onChange={(e) =>
                    setNewDemo({ ...newDemo, completed: e.target.checked })
                  }
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-5 h-5"
                />
                <span className="text-sm text-gray-700">已完成</span>
              </label>
            </div>
            <button
              onClick={handleAddDemo}
              disabled={isUpdating}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  添加中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  添加Demo
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Demos List */}
      {activeTab === "demos" && (
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-[calc(100vh-180px)]">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              选择分类
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
            >
              {categories.map((category) => (
                <option key={category._id?.toString()} value={category._id?.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-6">
            {categories
              .find((c) => c._id?.toString() === selectedCategoryId)
              ?.demos?.map((demo) => (
                <div 
                  key={demo._id?.toString()} 
                  className="border border-gray-200 p-5 rounded-xl hover:shadow-md transition duration-300 ease-in-out bg-white"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{demo.name}</h3>
                      <p className="text-gray-600 mb-3 leading-relaxed">{demo.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {demo.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-blue-100 transition-colors"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-blue-800 focus:outline-none"
                            >
                              <span className="text-lg">×</span>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {demo.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {demo.likes}
                        </span>
                        <span className={`flex items-center gap-1 ${demo.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {demo.completed ? "已完成" : "进行中"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setEditingDemo({
                            demoId: demo._id?.toString() || "",
                            categoryId: selectedCategoryId,
                            newCategoryId: selectedCategoryId,
                            demo: { 
                              ...demo,
                              categoryId: new ObjectId(selectedCategoryId)
                            },
                          })
                        }
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition duration-150 ease-in-out"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteDemo(demo._id?.toString() || "")}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition duration-150 ease-in-out"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">编辑Demo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  选择分类
                </label>
                <select
                  value={editingDemo.newCategoryId}
                  onChange={(e) =>
                    setEditingDemo({
                      ...editingDemo,
                      newCategoryId: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                >
                  {categories.map((category) => (
                    <option
                      key={category._id?.toString()}
                      value={category._id?.toString()}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">名称</label>
                <input
                  type="text"
                  value={editingDemo.demo.name}
                  onChange={(e) =>
                    setEditingDemo({
                      ...editingDemo,
                      demo: { ...editingDemo.demo, name: e.target.value },
                    })
                  }
                  className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">描述</label>
                <textarea
                  value={editingDemo.demo.description}
                  onChange={(e) =>
                    setEditingDemo({
                      ...editingDemo,
                      demo: { ...editingDemo.demo, description: e.target.value },
                    })
                  }
                  className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  GIF URL
                </label>
                <input
                  type="text"
                  value={editingDemo.demo.gifUrl}
                  onChange={(e) =>
                    setEditingDemo({
                      ...editingDemo,
                      demo: { ...editingDemo.demo, gifUrl: e.target.value },
                    })
                  }
                  className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingDemo.demo.completed}
                    onChange={(e) =>
                      setEditingDemo({
                        ...editingDemo,
                        demo: {
                          ...editingDemo.demo,
                          completed: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="ml-2 text-sm text-gray-600">已完成</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setEditingDemo(null)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={() =>
                    handleUpdateDemo(editingDemo.demoId, {
                      ...editingDemo.demo,
                      categoryId: new ObjectId(editingDemo.newCategoryId || editingDemo.categoryId),
                    })
                  }
                  disabled={isUpdating}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isUpdating ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
