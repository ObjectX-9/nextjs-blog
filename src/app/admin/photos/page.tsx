/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { IPhoto, IPhotoDB } from "@/app/model/photo";

export default function PhotosManagementPage() {
  const [photos, setPhotos] = useState<IPhotoDB[]>([]);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<{
    photo: IPhotoDB;
  } | null>(null);
  const [newPhoto, setNewPhoto] = useState<IPhoto>({
    src: "",
    width: 4,
    height: 3,
    title: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Fetch photos on mount
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      const data = await response.json();
      if (data.success) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      alert("获取相册失败，请重试。");
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error("No URL returned from upload");
      }
      return data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
        URL.revokeObjectURL(img.src); // Clean up
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
        URL.revokeObjectURL(img.src); // Clean up
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    try {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      setNewPhoto((prev) => ({
        ...prev,
        width: dimensions.width,
        height: dimensions.height,
      }));
    } catch (error) {
      console.error("Error getting image dimensions:", error);
      alert("获取图片尺寸失败");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAddPhoto = async () => {
    if (!selectedFile) {
      alert("请选择要上传的图片");
      return;
    }

    if (!newPhoto.title) {
      alert("请输入照片标题");
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadFile(selectedFile);
      const photoToAdd = {
        ...newPhoto,
        src: url,
      };

      const response = await fetch("/api/photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photo: photoToAdd }),
      });

      if (!response.ok) {
        throw new Error("Failed to add photo");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to add photo");
      }

      await fetchPhotos();
      setShowAddPhoto(false);
      setSelectedFile(null);
      setPreviewUrl("");
      setNewPhoto({
        src: "",
        width: 4,
        height: 3,
        title: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error adding photo:", error);
      alert("添加照片失败，请重试。");
    } finally {
      setIsUploading(false);
    }
  };

  const resetFileInput = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleEditPhoto = async () => {
    if (editingPhoto && editingPhoto.photo.src && editingPhoto.photo.title) {
      try {
        const response = await fetch(`/api/photos/${editingPhoto.photo._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo: editingPhoto.photo }),
        });

        if (!response.ok) {
          throw new Error("Failed to update photo");
        }

        await fetchPhotos();
        setEditingPhoto(null);
      } catch (error) {
        console.error("Error updating photo:", error);
        alert("更新照片失败，请重试。");
      }
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm("确定要删除这张照片吗？")) {
      try {
        const response = await fetch(`/api/photos/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete photo");
        }

        await fetchPhotos();
      } catch (error) {
        console.error("Error deleting photo:", error);
        alert("删除照片失败，请重试。");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">相册管理</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowAddPhoto(true)}
        >
          添加照片
        </button>
      </div>

      {/* 照片列表 */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">预览</th>
              <th className="p-4 text-left">标题</th>
              <th className="p-4 text-left">地点</th>
              <th className="p-4 text-left">日期</th>
              <th className="p-4 text-left">尺寸</th>
              <th className="p-4 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((photo, index) => (
              <tr key={photo._id!.toString()} className="border-t">
                <td className="p-4">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="p-4">
                  <span
                    className="block max-w-[200px] truncate"
                    title={photo.title}
                  >
                    {photo.title}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className="block max-w-[150px] truncate"
                    title={photo.location}
                  >
                    {photo.location}
                  </span>
                </td>
                <td className="p-4">{photo.date}</td>
                <td className="p-4">
                  {photo.width}x{photo.height}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                      onClick={() => setEditingPhoto({ photo: { ...photo } })}
                    >
                      编辑
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                      onClick={() => handleDeletePhoto(photo._id!.toString())}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 添加照片模态框 */}
      {showAddPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">添加照片</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">图片</label>
                <div
                  onClick={() =>
                    !isUploading &&
                    document.getElementById("file-upload")?.click()
                  }
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isUploading
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
                  }`}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={isUploading}
                  />

                  <div className="text-center">
                    {!previewUrl ? (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium text-blue-600">
                            点击选择图片或拖拽到此处
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            支持 PNG、JPG、GIF 格式，最大 10MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="relative group">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-lg object-contain"
                        />
                        {!isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resetFileInput();
                              }}
                              className="bg-white text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-100"
                            >
                              重新选择
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                        <div className="text-center">
                          <svg
                            className="animate-spin h-8 w-8 text-blue-500 mx-auto"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            正在上传...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newPhoto.title}
                  onChange={(e) =>
                    setNewPhoto({ ...newPhoto, title: e.target.value })
                  }
                  placeholder="请输入标题"
                  disabled={isUploading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">地点</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newPhoto.location}
                  onChange={(e) =>
                    setNewPhoto({ ...newPhoto, location: e.target.value })
                  }
                  placeholder="请输入地点"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">宽度</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded bg-gray-50"
                    value={newPhoto.width}
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">高度</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded bg-gray-50"
                    value={newPhoto.height}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowAddPhoto(false)}
                disabled={isUploading}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddPhoto}
                disabled={isUploading || !selectedFile || !newPhoto.title}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑照片模态框 */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <h2 className="text-xl font-bold mb-4">编辑照片</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  图片链接
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editingPhoto.photo.src}
                  onChange={(e) =>
                    setEditingPhoto({
                      ...editingPhoto,
                      photo: { ...editingPhoto.photo, src: e.target.value },
                    })
                  }
                  placeholder="请输入图片链接"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">标题</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editingPhoto.photo.title}
                  onChange={(e) =>
                    setEditingPhoto({
                      ...editingPhoto,
                      photo: { ...editingPhoto.photo, title: e.target.value },
                    })
                  }
                  placeholder="请输入标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">地点</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editingPhoto.photo.location}
                  onChange={(e) =>
                    setEditingPhoto({
                      ...editingPhoto,
                      photo: {
                        ...editingPhoto.photo,
                        location: e.target.value,
                      },
                    })
                  }
                  placeholder="请输入地点"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">宽度</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={editingPhoto.photo.width}
                    onChange={(e) =>
                      setEditingPhoto({
                        ...editingPhoto,
                        photo: {
                          ...editingPhoto.photo,
                          width: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">高度</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={editingPhoto.photo.height}
                    onChange={(e) =>
                      setEditingPhoto({
                        ...editingPhoto,
                        photo: {
                          ...editingPhoto.photo,
                          height: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setEditingPhoto(null)}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleEditPhoto}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
