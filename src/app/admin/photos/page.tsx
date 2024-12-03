"use client";

import { useState } from "react";
import { Photo, photos as initialPhotos } from "@/config/photos";

export default function PhotosManagementPage() {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<{
    index: number;
    photo: Photo;
  } | null>(null);
  const [newPhoto, setNewPhoto] = useState<Photo>({
    src: "",
    width: 4,
    height: 3,
    title: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePhotos = async (updatedPhotos: Photo[]) => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photos: updatedPhotos }),
      });

      if (!response.ok) {
        throw new Error("Failed to update photos");
      }

      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Error updating photos:", error);
      alert("更新相册失败，请重试。");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddPhoto = async () => {
    if (newPhoto.src && newPhoto.title) {
      const updatedPhotos = [...photos, { ...newPhoto }];
      await updatePhotos(updatedPhotos);
      setShowAddPhoto(false);
      setNewPhoto({
        src: "",
        width: 4,
        height: 3,
        title: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  };

  const handleEditPhoto = async () => {
    if (editingPhoto && editingPhoto.photo.src && editingPhoto.photo.title) {
      const updatedPhotos = [...photos];
      updatedPhotos[editingPhoto.index] = editingPhoto.photo;
      await updatePhotos(updatedPhotos);
      setEditingPhoto(null);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (confirm("确定要删除这张照片吗？")) {
      const updatedPhotos = photos.filter((_, i) => i !== index);
      await updatePhotos(updatedPhotos);
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
              <tr key={index} className="border-t">
                <td className="p-4">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="p-4">
                  <span className="block max-w-[200px] truncate" title={photo.title}>
                    {photo.title}
                  </span>
                </td>
                <td className="p-4">
                  <span className="block max-w-[150px] truncate" title={photo.location}>
                    {photo.location}
                  </span>
                </td>
                <td className="p-4">{photo.date}</td>
                <td className="p-4">{photo.width}x{photo.height}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                      onClick={() => setEditingPhoto({ index, photo: { ...photo } })}
                    >
                      编辑
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                      onClick={() => handleDeletePhoto(index)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <h2 className="text-xl font-bold mb-4">添加照片</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">图片链接</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newPhoto.src}
                  onChange={(e) => setNewPhoto({ ...newPhoto, src: e.target.value })}
                  placeholder="请输入图片链接"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">标题</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  placeholder="请输入标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">地点</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newPhoto.location}
                  onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
                  placeholder="请输入地点"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">宽度</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={newPhoto.width}
                    onChange={(e) => setNewPhoto({ ...newPhoto, width: Number(e.target.value) })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">高度</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={newPhoto.height}
                    onChange={(e) => setNewPhoto({ ...newPhoto, height: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowAddPhoto(false)}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleAddPhoto}
                disabled={isUpdating}
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
                <label className="block text-sm font-medium mb-1">图片链接</label>
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
                      photo: { ...editingPhoto.photo, location: e.target.value },
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
                        photo: { ...editingPhoto.photo, width: Number(e.target.value) },
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
                        photo: { ...editingPhoto.photo, height: Number(e.target.value) },
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
                disabled={isUpdating}
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
