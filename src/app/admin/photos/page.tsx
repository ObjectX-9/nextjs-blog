"use client";

import { useState, useEffect } from "react";
import { IPhoto } from "@/app/model/photo";
import { photosBusiness } from "@/app/business/photos";
import imageCompression from "browser-image-compression";
import { Button, Table, Modal, Input, Upload, message, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import Image from 'next/image';

export default function PhotosManagementPage() {
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<{
    photo: IPhoto;
  } | null>(null);
  const [newPhoto, setNewPhoto] = useState<IPhoto>({
    src: "",
    width: 4,
    height: 3,
    title: "",
    location: "",
    exif: {},
    date: new Date().toISOString().split("T")[0],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const photos = await photosBusiness.getPhotos();
      setPhotos(photos);
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
      let compressedFile = await imageCompression(file, options);

      let quality = 0.8;
      while (compressedFile.size > 1.9 * 1024 * 1024 && quality > 0.1) {
        quality -= 0.1;
        options.initialQuality = quality;
        console.log(`尝试使用质量 ${quality.toFixed(2)} 重新压缩`);
        compressedFile = await imageCompression(file, options);
      }

      const resultFile = new File(
        [compressedFile],
        file.name,
        { type: file.type }
      );

      console.log("原始文件大小:", (file.size / 1024 / 1024).toFixed(2), "MB");
      console.log("压缩后文件大小:", (resultFile.size / 1024 / 1024).toFixed(2), "MB");
      console.log("最终压缩质量:", quality.toFixed(2));

      if (resultFile.size > 2 * 1024 * 1024) {
        throw new Error("无法将图片压缩到2MB以下，请选择较小的图片");
      }

      return resultFile;
    } catch (error: any) {
      console.error("压缩图片时出错:", error);
      throw new Error(error.message || "图片压缩失败");
    }
  };

  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    try {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      const dimensions = await getImageDimensions(file);
      setNewPhoto((prev) => ({
        ...prev,
        width: dimensions.width,
        height: dimensions.height,
      }));
    } catch (error: any) {
      console.error("Error processing image:", error);
      alert(error.message || "处理图片时出错");
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
      setIsCompressing(true);
      setIsUploading(true);

      let fileToUpload = selectedFile;
      if (selectedFile.size > 1.9 * 1024 * 1024) {
        try {
          fileToUpload = await compressImage(selectedFile);
        } catch (error: any) {
          throw new Error(`图片压缩失败: ${error.message}`);
        }
      }

      const url = await uploadFile(fileToUpload);
      console.log("文件上传成功:", url);

      const photoToAdd = {
        ...newPhoto,
        src: url,
      };

      await photosBusiness.createPhoto(photoToAdd);

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
        exif: {},
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      console.error("Error adding photo:", error);
      alert(error.message || "添加照片失败，请重试。");
    } finally {
      setIsCompressing(false);
      setIsUploading(false);
    }
  };

  const handleEditPhoto = async () => {
    if (editingPhoto && editingPhoto.photo.src && editingPhoto.photo.title) {
      try {
        await photosBusiness.updatePhoto(editingPhoto.photo);
        await fetchPhotos();
        setEditingPhoto(null);
      } catch (error: any) {
        console.error("Error updating photo:", error);
        alert("更新照片失败，请重试。");
      }
    }
  };

  const handleDeletePhoto = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这张照片吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await photosBusiness.deletePhoto(id);
          await fetchPhotos();
          message.success('删除成功');
        } catch (error: any) {
          console.error("Error deleting photo:", error);
          message.error(error.message || "删除照片失败，请重试");
        }
      },
    });
  };

  const columns = [
    {
      title: '预览',
      dataIndex: 'src',
      key: 'src',
      render: (src: string) => (
        <Image
          src={src}
          alt="预览"
          width={64}
          height={64}
          className="w-16 h-16 object-cover rounded"
          priority
        />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '尺寸',
      key: 'size',
      render: (record: IPhoto) => `${record.width}x${record.height}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: IPhoto) => (
        <Space direction="vertical" size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditingPhoto({ photo: { ...record } })}
            size="small"
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePhoto(record._id!.toString())}
            size="small"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      handleFileSelect(file);
      return false;
    },
    showUploadList: false,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">相册管理</h1>
        <Button type="primary" onClick={() => setShowAddPhoto(true)}>
          添加照片
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={photos}
        rowKey={(record) => record._id!.toString()}
        pagination={false}
      />

      {/* Add Photo Modal */}
      <Modal
        title="添加照片"
        open={showAddPhoto}
        onCancel={() => setShowAddPhoto(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddPhoto(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAddPhoto}
            disabled={isUploading || isCompressing || !selectedFile || !newPhoto.title}
            loading={isUploading || isCompressing}
          >
            确定
          </Button>,
        ]}
        width={500}
      >
        <div className="space-y-4">
          <div>
            <Upload.Dragger {...uploadProps} disabled={isUploading || isCompressing}>
              {!previewUrl ? (
                <>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">点击选择图片或拖拽到此处</p>
                  <p className="ant-upload-hint">支持 PNG、JPG、GIF 格式，最大 10MB</p>
                </>
              ) : (
                <div className="relative">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={192}
                    height={192}
                    className="mx-auto max-h-48 rounded-lg object-contain"
                    priority
                  />
                  {(isUploading || isCompressing) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                      <div className="text-center">
                        <div className="ant-spin ant-spin-spinning">
                          <span className="ant-spin-dot">
                            <i className="ant-spin-dot-item"></i>
                            <i className="ant-spin-dot-item"></i>
                            <i className="ant-spin-dot-item"></i>
                            <i className="ant-spin-dot-item"></i>
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {isCompressing ? "正在压缩..." : "正在上传..."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Upload.Dragger>
          </div>

          <div>
            <Input
              placeholder="请输入标题"
              value={newPhoto.title}
              onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
              disabled={isUploading || isCompressing}
            />
          </div>
          <div>
            <Input
              placeholder="请输入地点"
              value={newPhoto.location}
              onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="宽度"
              value={newPhoto.width}
              readOnly
              disabled
            />
            <Input
              type="number"
              placeholder="高度"
              value={newPhoto.height}
              readOnly
              disabled
            />
          </div>
        </div>
      </Modal>

      {/* Edit Photo Modal */}
      <Modal
        title="编辑照片"
        open={!!editingPhoto}
        onCancel={() => setEditingPhoto(null)}
        footer={[
          <Button key="cancel" onClick={() => setEditingPhoto(null)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditPhoto}>
            确定
          </Button>,
        ]}
        width={500}
      >
        {editingPhoto && (
          <div className="space-y-4">
            <div>
              <Input
                placeholder="请输入图片链接"
                value={editingPhoto.photo.src}
                onChange={(e) =>
                  setEditingPhoto({
                    ...editingPhoto,
                    photo: { ...editingPhoto.photo, src: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Input
                placeholder="请输入标题"
                value={editingPhoto.photo.title}
                onChange={(e) =>
                  setEditingPhoto({
                    ...editingPhoto,
                    photo: { ...editingPhoto.photo, title: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Input
                placeholder="请输入地点"
                value={editingPhoto.photo.location}
                onChange={(e) =>
                  setEditingPhoto({
                    ...editingPhoto,
                    photo: { ...editingPhoto.photo, location: e.target.value },
                  })
                }
              />
            </div>
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="宽度"
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
              <Input
                type="number"
                placeholder="高度"
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
        )}
      </Modal>
    </div>
  );
}
