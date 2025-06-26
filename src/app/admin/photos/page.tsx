"use client";

import { useState, useEffect } from "react";
import { IPhoto } from "@/app/model/photo";
import { photosBusiness } from "@/app/business/photos";
import imageCompression from "browser-image-compression";
import { Button, Table, Modal, Input, Upload, message, Space, Collapse, Tag, Progress, Drawer } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, SyncOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import Image from 'next/image';
import {
  extractCompleteMetadata,
  extractExifFromFile,
  getDateFromExif,
  generateTagsFromMetadata,
  generateTagsFromExif
} from '@/utils/exif';
import PhotoInfo from '@/app/album/components/PhotoInfo';

const { Panel } = Collapse;

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
    date: new Date().toISOString().split("T")[0],
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isExtractingExif, setIsExtractingExif] = useState(false);
  const [isBatchExtracting, setIsBatchExtracting] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // 新增状态：照片详情展示
  const [showPhotoInfo, setShowPhotoInfo] = useState(false);
  const [selectedPhotoForInfo, setSelectedPhotoForInfo] = useState<IPhoto | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const photos = await photosBusiness.getPhotos();
      setPhotos(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      message.error("获取相册失败，请重试。");
    }
  };

  // 显示照片详细信息
  const showPhotoDetails = (photo: IPhoto) => {
    setSelectedPhotoForInfo(photo);
    setShowPhotoInfo(true);
  };

  // 批量提取EXIF信息
  const handleBatchExtractExif = async () => {
    const photosWithoutExif = photos.filter(photo => !photo.exif || Object.keys(photo.exif).length === 0);

    if (photosWithoutExif.length === 0) {
      message.info("所有照片都已有EXIF信息");
      return;
    }

    Modal.confirm({
      title: '批量提取EXIF信息',
      content: `发现 ${photosWithoutExif.length} 张照片没有EXIF信息，是否为这些照片提取EXIF信息？此操作可能需要一些时间。`,
      okText: '开始提取',
      cancelText: '取消',
      onOk: async () => {
        setIsBatchExtracting(true);
        setBatchProgress({ current: 0, total: photosWithoutExif.length });

        try {
          const photoIds = photosWithoutExif.map(photo => photo._id);

          // 分批处理，每批5张照片
          const batchSize = 5;
          let successCount = 0;
          let errorCount = 0;

          for (let i = 0; i < photoIds.length; i += batchSize) {
            const batch = photoIds.slice(i, i + batchSize);

            try {
              const response = await fetch('/api/photos/extract-exif', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ photoIds: batch }),
              });

              const result = await response.json();

              if (result.success) {
                successCount += result.summary.success;
                errorCount += result.summary.errors;
              }

              setBatchProgress({
                current: Math.min(i + batchSize, photoIds.length),
                total: photoIds.length
              });

              // 稍作延迟，避免服务器过载
              await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
              console.error('Batch processing error:', error);
              errorCount += batch.length;
            }
          }

          // 刷新照片列表
          await fetchPhotos();

          message.success(`EXIF提取完成！成功: ${successCount}，失败: ${errorCount}`);
        } catch (error) {
          console.error('Error in batch EXIF extraction:', error);
          message.error('批量提取EXIF信息失败');
        } finally {
          setIsBatchExtracting(false);
          setBatchProgress({ current: 0, total: 0 });
        }
      },
    });
  };

  // 单张照片提取EXIF信息
  const handleSingleExtractExif = async (photoId: string) => {
    try {
      const response = await fetch('/api/photos/extract-exif', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoId }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('EXIF信息提取成功');
        await fetchPhotos();
      } else {
        message.error(result.error || '提取EXIF信息失败');
      }
    } catch (error) {
      console.error('Error extracting EXIF:', error);
      message.error('提取EXIF信息失败');
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "images/photos");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Upload response error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error || `Upload failed with status: ${response.status}`
        );
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
      setIsExtractingExif(true);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // 获取图片尺寸
      const dimensions = await getImageDimensions(file);

      // 提取完整元数据
      let metadata: {
        exif: any;
        gps?: any;
        technical?: any;
        fileMetadata?: any;
        analysis?: any;
      } = {
        exif: {},
      };
      let exifDate = null;
      let autoTags: string[] = [];

      try {
        // 使用新的完整元数据提取功能
        metadata = await extractCompleteMetadata(file);
        exifDate = await getDateFromExif(file);
        autoTags = generateTagsFromMetadata(metadata.exif, metadata.gps, metadata.analysis);
        console.log('提取的完整元数据:', metadata);
        message.success("成功提取照片元数据和EXIF信息");
      } catch (error) {
        console.warn('元数据提取失败:', error);
        // 降级到基础EXIF提取
        try {
          const basicExif = await extractExifFromFile(file);
          metadata.exif = basicExif;
          autoTags = generateTagsFromExif(basicExif);
          message.warning("部分元数据提取失败，已提取基础EXIF信息");
        } catch (exifError) {
          console.warn('基础EXIF提取也失败:', exifError);
          message.warning("无法提取照片元数据，将使用默认值");
        }
      }

      // 自动填充照片信息
      setNewPhoto((prev) => ({
        ...prev,
        width: dimensions.width,
        height: dimensions.height,
        date: exifDate || prev.date,
        exif: Object.keys(metadata.exif).length > 0 ? metadata.exif : undefined,
        gps: metadata.gps,
        technical: metadata.technical,
        fileMetadata: metadata.fileMetadata,
        analysis: metadata.analysis,
        tags: autoTags.length > 0 ? autoTags : prev.tags,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""), // 使用文件名作为默认标题
      }));

    } catch (error: any) {
      console.error("Error processing image:", error);
      message.error(error.message || "处理图片时出错");
    } finally {
      setIsExtractingExif(false);
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
      message.error("请选择要上传的图片");
      return;
    }

    if (!newPhoto.title) {
      message.error("请输入照片标题");
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

      // 准备提交的照片数据，如果没有地点则提供默认值
      const photoToAdd = {
        ...newPhoto,
        src: url,
        location: newPhoto.location.trim() || "未知地点",
      };

      console.log("准备提交的照片数据:", photoToAdd);
      const createdPhoto = await photosBusiness.createPhoto(photoToAdd);
      console.log("照片添加成功:", createdPhoto);

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
        exif: undefined,
        gps: undefined,
        technical: undefined,
        fileMetadata: undefined,
        analysis: undefined,
        tags: undefined,
      });
      message.success("照片添加成功");
    } catch (error: any) {
      console.error("Error adding photo:", error);
      message.error(error.message || "添加照片失败，请重试。");
    } finally {
      setIsCompressing(false);
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
        const updatedPhoto = await photosBusiness.updatePhoto(editingPhoto.photo);
        console.log("照片更新成功:", updatedPhoto);

        await fetchPhotos();
        setEditingPhoto(null);
        message.success("照片更新成功");
      } catch (error: any) {
        console.error("Error updating photo:", error);
        message.error("更新照片失败，请重试。");
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
      title: 'EXIF信息',
      key: 'exif',
      render: (record: IPhoto) => (
        record.exif ? (
          <div className="text-xs">
            {record.exif.camera && <div>📷 {record.exif.camera}</div>}
            {record.exif.focalLength && record.exif.aperture && record.exif.shutterSpeed && record.exif.iso && (
              <div>
                {record.exif.focalLength} f/{record.exif.aperture} {record.exif.shutterSpeed} ISO{record.exif.iso}
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">无EXIF信息</span>
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: IPhoto) => (
        <Space direction="vertical" size="small">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => showPhotoDetails(record)}
            size="small"
          >
            详情
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditingPhoto({ photo: { ...record } })}
            size="small"
          >
            编辑
          </Button>
          {(!record.exif || Object.keys(record.exif).length === 0) && (
            <Button
              icon={<SyncOutlined />}
              onClick={() => handleSingleExtractExif(record._id!.toString())}
              size="small"
            >
              提取EXIF
            </Button>
          )}
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

  const photosWithoutExif = photos.filter(photo => !photo.exif || Object.keys(photo.exif).length === 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">相册管理</h1>
          {photosWithoutExif.length > 0 && (
            <p className="text-sm text-orange-600 mt-1">
              发现 {photosWithoutExif.length} 张照片缺少EXIF信息
            </p>
          )}
        </div>
        <Space>
          {photosWithoutExif.length > 0 && (
            <Button
              icon={<SyncOutlined />}
              onClick={handleBatchExtractExif}
              loading={isBatchExtracting}
            >
              批量提取EXIF
            </Button>
          )}
          <Button type="primary" onClick={() => setShowAddPhoto(true)}>
            添加照片
          </Button>
        </Space>
      </div>

      {/* 批量处理进度 */}
      {isBatchExtracting && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">正在批量提取EXIF信息...</span>
            <span className="text-sm text-gray-600">
              {batchProgress.current} / {batchProgress.total}
            </span>
          </div>
          <Progress
            percent={Math.round((batchProgress.current / batchProgress.total) * 100)}
            status="active"
          />
        </div>
      )}

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
            disabled={isUploading || isCompressing || isExtractingExif || !selectedFile || !newPhoto.title}
            loading={isUploading || isCompressing}
          >
            确定
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <Upload.Dragger {...uploadProps} disabled={isUploading || isCompressing || isExtractingExif}>
              {!previewUrl ? (
                <>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">点击选择图片或拖拽到此处</p>
                  <p className="ant-upload-hint">支持 PNG、JPG、GIF 格式，最大 10MB，自动提取EXIF信息</p>
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
                  {(isUploading || isCompressing || isExtractingExif) && (
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
                          {isExtractingExif ? "正在提取EXIF信息..." :
                            isCompressing ? "正在压缩..." : "正在上传..."}
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
            <label className="block text-sm font-medium mb-1 text-gray-700">
              拍摄地点 <span className="text-gray-400">{"如未填写将显示为未知地点"}</span>
            </label>
            <Input
              placeholder="请输入拍摄地点，如：北京天安门、西湖、家中等"
              value={newPhoto.location}
              onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
            />
          </div>
          <div>
            <Input
              placeholder="请输入描述"
              value={newPhoto.description || ''}
              onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
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
            <Input
              type="date"
              placeholder="拍摄日期"
              value={newPhoto.date}
              onChange={(e) => setNewPhoto({ ...newPhoto, date: e.target.value })}
            />
          </div>

          {/* 标签显示 */}
          {newPhoto.tags && newPhoto.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">自动生成标签:</label>
              <div className="flex flex-wrap gap-2">
                {newPhoto.tags.map((tag, index) => (
                  <Tag key={index} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* 元数据信息展示 */}
          {(newPhoto.exif && Object.keys(newPhoto.exif).length > 0) || newPhoto.gps || newPhoto.analysis ? (
            <Collapse size="small">
              {/* EXIF 信息 */}
              {newPhoto.exif && Object.keys(newPhoto.exif).length > 0 && (
                <Panel header="📸 EXIF 拍摄信息" key="exif">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {newPhoto.exif.camera && (
                      <div><strong>相机:</strong> {newPhoto.exif.camera}</div>
                    )}
                    {newPhoto.exif.lens && (
                      <div><strong>镜头:</strong> {newPhoto.exif.lens}</div>
                    )}
                    {newPhoto.exif.focalLength && (
                      <div><strong>焦距:</strong> {newPhoto.exif.focalLength}</div>
                    )}
                    {newPhoto.exif.aperture && (
                      <div><strong>光圈:</strong> f/{newPhoto.exif.aperture}</div>
                    )}
                    {newPhoto.exif.shutterSpeed && (
                      <div><strong>快门:</strong> {newPhoto.exif.shutterSpeed}</div>
                    )}
                    {newPhoto.exif.iso && (
                      <div><strong>ISO:</strong> {newPhoto.exif.iso}</div>
                    )}
                    {newPhoto.exif.flash && (
                      <div><strong>闪光灯:</strong> {newPhoto.exif.flash}</div>
                    )}
                    {newPhoto.exif.whiteBalance && (
                      <div><strong>白平衡:</strong> {newPhoto.exif.whiteBalance}</div>
                    )}
                    {newPhoto.exif.filmSimulation && (
                      <div><strong>胶片模拟:</strong> {newPhoto.exif.filmSimulation}</div>
                    )}
                  </div>
                </Panel>
              )}

              {/* GPS 位置信息 */}
              {newPhoto.gps && (newPhoto.gps.latitude || newPhoto.gps.longitude) && (
                <Panel header="📍 位置信息" key="gps">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {newPhoto.gps.latitude && (
                      <div><strong>纬度:</strong> {newPhoto.gps.latitude.toFixed(6)}°</div>
                    )}
                    {newPhoto.gps.longitude && (
                      <div><strong>经度:</strong> {newPhoto.gps.longitude.toFixed(6)}°</div>
                    )}
                    {newPhoto.gps.altitude && (
                      <div><strong>海拔:</strong> {newPhoto.gps.altitude.toFixed(2)}m</div>
                    )}
                  </div>
                </Panel>
              )}

              {/* 文件信息 */}
              {newPhoto.fileMetadata && (
                <Panel header="📁 文件信息" key="fileInfo">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {newPhoto.fileMetadata.format && (
                      <div><strong>格式:</strong> {newPhoto.fileMetadata.format}</div>
                    )}
                    {newPhoto.fileMetadata.fileSize && (
                      <div><strong>大小:</strong> {(newPhoto.fileMetadata.fileSize / 1024 / 1024).toFixed(2)}MB</div>
                    )}
                    {newPhoto.fileMetadata.mimeType && (
                      <div><strong>MIME:</strong> {newPhoto.fileMetadata.mimeType}</div>
                    )}
                  </div>
                </Panel>
              )}

              {/* 图像分析 */}
              {newPhoto.analysis && (
                <Panel header="🎨 图像分析" key="analysis">
                  <div className="space-y-2 text-sm">
                    {newPhoto.analysis.averageBrightness !== undefined && (
                      <div><strong>平均亮度:</strong> {(newPhoto.analysis.averageBrightness * 100).toFixed(0)}%</div>
                    )}
                    {newPhoto.analysis.scene && (
                      <div><strong>场景分类:</strong> {newPhoto.analysis.scene}</div>
                    )}
                    {newPhoto.analysis.dominantColors && newPhoto.analysis.dominantColors.length > 0 && (
                      <div>
                        <strong>主色调:</strong>
                        <div className="flex gap-1 mt-1">
                          {newPhoto.analysis.dominantColors.slice(0, 5).map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
              )}
            </Collapse>
          ) : null}
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
            <div>
              <Input
                placeholder="请输入描述"
                value={editingPhoto.photo.description || ''}
                onChange={(e) =>
                  setEditingPhoto({
                    ...editingPhoto,
                    photo: { ...editingPhoto.photo, description: e.target.value },
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

      {/* Photo Info Drawer */}
      <Drawer
        title="照片详细信息"
        placement="right"
        onClose={() => setShowPhotoInfo(false)}
        open={showPhotoInfo}
        width={500}
      >
        {selectedPhotoForInfo && (
          <PhotoInfo photo={selectedPhotoForInfo} />
        )}
      </Drawer>
    </div>
  );
}
