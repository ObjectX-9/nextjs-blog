"use client";

import { useState, useEffect } from "react";
import { IPhoto } from "@/app/model/photo";
import { photosBusiness } from "@/app/business/photos";
import { exifBusiness } from "@/app/business/exif";
import imageCompression from "browser-image-compression";
import { Button, Table, Modal, Input, Upload, message, Space, Collapse, Drawer } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import Image from 'next/image';
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
    exif: {},
    imageAnalysis: undefined,
    date: new Date().toISOString().split("T")[0],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
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

  // 注意：EXIF信息现在只在上传时提取，不支持对已上传照片的后续提取

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

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    try {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // 获取图片尺寸
      const dimensions = await getImageDimensions(file);

      // 使用文件名作为默认标题
      const defaultTitle = file.name.replace(/\.[^/.]+$/, "");

      // 立即分析EXIF信息和影调信息
      message.info("正在分析EXIF信息和影调特征...");

      try {
        // 使用业务层方法提取EXIF信息
        const exifResult = await exifBusiness.extractExifFromFile(file);

        // 分析影调信息
        let imageAnalysis = null;
        try {
          message.info("正在进行影调分析...");
          const formData = new FormData();
          formData.append('file', file);

          const analysisResponse = await fetch('/api/image-analysis', {
            method: 'POST',
            body: formData
          });

          const analysisResult = await analysisResponse.json();
          if (analysisResult.success) {
            imageAnalysis = analysisResult.data.analysis;
            message.success("影调分析完成");
          } else {
            console.warn("影调分析失败:", analysisResult.error);
          }
        } catch (analysisError) {
          console.warn("影调分析出错:", analysisError);
        }

        if (exifResult.success && exifResult.exif) {
          // 更新照片信息，包含EXIF数据和影调分析
          setNewPhoto((prev) => ({
            ...prev,
            width: dimensions.width,
            height: dimensions.height,
            title: prev.title || defaultTitle,
            exif: exifResult.exif,
            imageAnalysis: imageAnalysis
          }));

          const analysisMsg = imageAnalysis
            ? `照片已选择，EXIF信息和影调分析完成（识别为：${imageAnalysis.toneAnalysis.type}）`
            : "照片已选择，EXIF信息分析完成";
          message.success(analysisMsg);
        } else {
          // EXIF分析失败，但仍然设置基本信息
          setNewPhoto((prev) => ({
            ...prev,
            width: dimensions.width,
            height: dimensions.height,
            title: prev.title || defaultTitle,
            exif: {},
            imageAnalysis: imageAnalysis
          }));

          const analysisMsg = imageAnalysis
            ? `照片已选择，影调分析完成（识别为：${imageAnalysis.toneAnalysis.type}），但EXIF信息分析失败: ${exifResult.error || '未知错误'}`
            : `照片已选择，但EXIF信息分析失败: ${exifResult.error || '未知错误'}`;
          message.warning(analysisMsg);
        }
      } catch (error) {
        console.error("分析出错:", error);

        // 分析失败，但仍然设置基本信息
        setNewPhoto((prev) => ({
          ...prev,
          width: dimensions.width,
          height: dimensions.height,
          title: prev.title || defaultTitle,
          exif: {},
          imageAnalysis: undefined
        }));

        message.warning("照片已选择，但信息分析失败");
      }

    } catch (error: any) {
      console.error("Error processing image:", error);
      message.error(error.message || "处理图片时出错");
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
      console.log("是否包含EXIF:", !!(photoToAdd.exif && Object.keys(photoToAdd.exif).length > 0));
      console.log("是否包含影调分析:", !!photoToAdd.imageAnalysis);
      if (photoToAdd.imageAnalysis) {
        console.log("影调分析类型:", photoToAdd.imageAnalysis.toneAnalysis.type);
      }

      const createdPhoto = await photosBusiness.createPhoto(photoToAdd);
      console.log("照片添加成功:", createdPhoto);

      // EXIF信息和影调分析已经在文件选择时分析完成，无需再次提取
      const hasExif = photoToAdd.exif && Object.keys(photoToAdd.exif).length > 0;
      const hasImageAnalysis = photoToAdd.imageAnalysis;

      if (hasExif && hasImageAnalysis) {
        message.success(`照片添加成功！包含EXIF信息和影调分析（${hasImageAnalysis.toneAnalysis.type}）`);
      } else if (hasImageAnalysis) {
        message.success(`照片添加成功！包含影调分析（${hasImageAnalysis.toneAnalysis.type}）`);
      } else if (hasExif) {
        message.success("照片添加成功，包含EXIF信息");
      } else {
        message.success("照片添加成功");
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
        exif: {},
        imageAnalysis: undefined,
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      console.error("Error adding photo:", error);
      message.error(error.message || "添加照片失败，请重试。");
    } finally {
      setIsCompressing(false);
      setIsUploading(false);
    }
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
      title: '分析信息',
      key: 'analysisInfo',
      render: (record: IPhoto) => (
        <div className="text-xs space-y-1">
          {/* EXIF信息 */}
          {record.exif ? (
            <div>
              {record.exif.Make && record.exif.Model && <div>📷 {record.exif.Make} {record.exif.Model}</div>}
              {record.exif.FocalLength && record.exif.Aperture && record.exif.ShutterSpeed && record.exif.ISO && (
                <div>
                  {record.exif.FocalLength} f/{record.exif.Aperture} {record.exif.ShutterSpeed} ISO{record.exif.ISO}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">无EXIF信息</span>
          )}

          {/* 影调分析信息 */}
          {record.imageAnalysis ? (
            <div className="mt-1 pt-1 border-t border-gray-200">
              <div className="text-blue-600 font-medium">
                🎨 {record.imageAnalysis.toneAnalysis.type}
              </div>
              <div className="text-gray-500">
                置信度: {Math.round(record.imageAnalysis.toneAnalysis.confidence * 100)}%
              </div>
              <div className="text-gray-500">
                记号: {record.imageAnalysis.toneAnalysis.notation}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 mt-1 pt-1 border-t border-gray-200">
              无影调分析
            </div>
          )}
        </div>
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
        <div>
          <h1 className="text-2xl font-bold">相册管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            上传时自动提取EXIF信息并进行专业影调分析，支持十大影调类型识别
          </p>
          <p className="text-xs text-blue-600 mt-1">
            🎨 自动分析：影调类型、色温、对比度、白平衡、亮度分布等专业摄影参数
          </p>
        </div>
        <Space>
          <Button type="primary" onClick={() => setShowAddPhoto(true)}>
            添加照片
          </Button>
        </Space>
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
        width={600}
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
                  <p className="ant-upload-hint">支持 PNG、JPG、GIF 格式，最大 10MB，选择后自动分析EXIF信息和影调特征</p>
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
            <label className="block text-sm font-medium mb-1 text-gray-700">
              拍摄地点 <span className="text-gray-400">{"如未填写将显示为未知地点"}</span>
            </label>
            <Input
              placeholder="请输入拍摄地点，如：北京天安门、西湖、家中等"
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
            <Input
              type="date"
              placeholder="拍摄日期"
              value={newPhoto.date}
              onChange={(e) => setNewPhoto({ ...newPhoto, date: e.target.value })}
            />
          </div>

          {/* EXIF信息和影调分析展示 */}
          {((newPhoto.exif && Object.keys(newPhoto.exif).length > 0) || newPhoto.imageAnalysis) && (
            <Collapse size="small">
              {newPhoto.exif && Object.keys(newPhoto.exif).length > 0 && (
                <Panel header="📸 EXIF 拍摄信息" key="exif">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {newPhoto.exif.Make && newPhoto.exif.Model && (
                      <div><strong>相机:</strong> {newPhoto.exif.Make} {newPhoto.exif.Model}</div>
                    )}
                    {newPhoto.exif.LensModel && (
                      <div><strong>镜头:</strong> {newPhoto.exif.LensModel}</div>
                    )}
                    {newPhoto.exif.FocalLength && (
                      <div><strong>焦距:</strong> {newPhoto.exif.FocalLength}</div>
                    )}
                    {newPhoto.exif.Aperture && (
                      <div><strong>光圈:</strong> f/{newPhoto.exif.Aperture}</div>
                    )}
                    {newPhoto.exif.ShutterSpeed && (
                      <div><strong>快门:</strong> {newPhoto.exif.ShutterSpeed}</div>
                    )}
                    {newPhoto.exif.ISO && (
                      <div><strong>ISO:</strong> {newPhoto.exif.ISO}</div>
                    )}
                    {newPhoto.exif.Flash && (
                      <div><strong>闪光灯:</strong> {newPhoto.exif.Flash}</div>
                    )}
                    {newPhoto.exif.WhiteBalance && (
                      <div><strong>白平衡:</strong> {newPhoto.exif.WhiteBalance}</div>
                    )}
                  </div>
                </Panel>
              )}
              {newPhoto.imageAnalysis && (
                <Panel header="🎨 影调分析结果" key="imageAnalysis">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <strong>影调类型:</strong>
                      <span className="text-blue-600 font-medium">{newPhoto.imageAnalysis.toneAnalysis.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>置信度:</strong>
                      <span>{Math.round(newPhoto.imageAnalysis.toneAnalysis.confidence * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>影调记号:</strong>
                      <span className="font-mono">{newPhoto.imageAnalysis.toneAnalysis.notation}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>平均亮度:</strong>
                      <span>{newPhoto.imageAnalysis.brightness.average}/255</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>亮度范围:</strong>
                      <span>{newPhoto.imageAnalysis.brightness.min}-{newPhoto.imageAnalysis.brightness.max}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">低调区域</div>
                        <div className="font-medium">{newPhoto.imageAnalysis.toneAnalysis.zones.low}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">中调区域</div>
                        <div className="font-medium">{newPhoto.imageAnalysis.toneAnalysis.zones.mid}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">高调区域</div>
                        <div className="font-medium">{newPhoto.imageAnalysis.toneAnalysis.zones.high}%</div>
                      </div>
                    </div>
                  </div>
                </Panel>
              )}
            </Collapse>
          )}
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
