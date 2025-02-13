"use client";

import { useState, useEffect } from "react";
import { IDemo, IDemoCategory } from "@/app/model/demo";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import {
  Button,
  Input,
  Select,
  Tabs,
  Card,
  Upload,
  Tag,
  Space,
  Modal,
  message,
  Form,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

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
    url: "",
    tags: [],
    completed: false,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showAddDemo, setShowAddDemo] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingDemo, setEditingDemo] = useState<EditingDemo | null>(null);
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
        lastModified: file.lastModified,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "images/demos"); // 指定上传路径

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
        console.log("压缩进度：", progress);
      },
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("压缩失败:", error);
      throw error;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const validTypes = ["image/gif", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("请上传PNG、JPG或GIF格式的图片！");
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
      alert("上传失败，请重试！");
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
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类及其所有demo吗？此操作不可恢复。',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setIsUpdating(true);
        try {
          const response = await fetch(`/api/demos/categories?id=${categoryId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete category");
          }

          await fetchCategories();
          message.success('分类删除成功');
        } catch (error) {
          console.error("Error deleting category:", error);
          message.error('删除分类失败，请重试');
        } finally {
          setIsUpdating(false);
        }
      },
    });
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
          url: "",
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
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个demo吗？此操作不可恢复。',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setIsUpdating(true);
        try {
          const response = await fetch(`/api/demos?id=${demoId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete demo");
          }

          await fetchCategories();
          message.success('Demo删除成功');
        } catch (error) {
          console.error("Error deleting demo:", error);
          message.error('删除Demo失败，请重试');
        } finally {
          setIsUpdating(false);
        }
      },
    });
  };

  const handleUpdateDemo = async (
    demoId: string,
    updatedDemo: Partial<IDemo>
  ) => {
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Demo 管理</h1>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          if (key === "add") {
            setShowAddDemo(true);
          }
        }}
        items={[
          {
            key: "demos",
            label: "Demo列表",
          },
          {
            key: "categories",
            label: "分类管理",
          },
          {
            key: "add",
            label: "添加Demo",
          },
        ]}
      />

      {/* Categories Management */}
      {activeTab === "categories" && (
        <Card className="mt-4">
          <h2 className="text-xl font-bold mb-4">分类管理</h2>
          <Space.Compact block className="mb-4">
            <Input
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              placeholder="分类名称"
            />
            <Input
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              placeholder="分类描述"
            />
            <Button
              type="primary"
              onClick={handleAddCategory}
              disabled={isUpdating}
              icon={isUpdating ? <LoadingOutlined /> : <PlusOutlined />}
            >
              添加分类
            </Button>
          </Space.Compact>

          <Space direction="vertical" style={{ width: "100%" }}>
            {categories.map((category) => (
              <Card
                key={category._id?.toString()}
                className="w-full"
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      handleDeleteCategory(category._id?.toString() || "")
                    }
                  />
                }
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <Tag color="blue">{category.demos?.length || 0} 个demo</Tag>
                </div>
                <p className="text-gray-600 mt-1">{category.description}</p>
              </Card>
            ))}
          </Space>
        </Card>
      )}

      {/* Add Demo Form */}
      {activeTab === "add" && (
        <Card className="mt-4">
          <h2 className="text-xl font-bold mb-4">添加新Demo</h2>
          <Form layout="vertical">
            <Form.Item label="选择分类">
              <Select
                value={selectedCategoryId}
                onChange={(value) => setSelectedCategoryId(value)}
                style={{ width: "100%" }}
              >
                {categories.map((category) => (
                  <Select.Option
                    key={category._id?.toString()}
                    value={category._id?.toString()}
                  >
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="名称">
              <Input
                value={newDemo.name}
                onChange={(e) =>
                  setNewDemo({ ...newDemo, name: e.target.value })
                }
                placeholder="输入Demo名称"
              />
            </Form.Item>

            <Form.Item label="描述">
              <Input.TextArea
                value={newDemo.description}
                onChange={(e) =>
                  setNewDemo({ ...newDemo, description: e.target.value })
                }
                placeholder="详细描述Demo的功能和特点"
                rows={4}
              />
            </Form.Item>

            <Form.Item label="URL">
              <Input
                type="url"
                value={newDemo.url}
                onChange={(e) =>
                  setNewDemo({ ...newDemo, url: e.target.value })
                }
                placeholder="输入Demo的URL地址"
              />
            </Form.Item>

            <Form.Item label="上传图片">
              <Upload.Dragger
                name="file"
                beforeUpload={(file) => {
                  const validTypes = ["image/gif", "image/jpeg", "image/png"];
                  if (!validTypes.includes(file.type)) {
                    message.error("请上传PNG、JPG或GIF格式的图片！");
                    return Upload.LIST_IGNORE;
                  }
                  handleFileChange({ target: { files: [file] } } as any);
                  return false;
                }}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
                <p className="ant-upload-hint">
                  支持 PNG、JPG、GIF 格式，最大 10MB
                </p>
              </Upload.Dragger>

              {previewUrl && (
                <div className="mt-4">
                  <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-500">
                      {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                    </p>
                  )}
                </div>
              )}

              {isUploading && (
                <div className="mt-4 text-center">
                  <Spin tip="上传中..." />
                </div>
              )}
            </Form.Item>

            <Form.Item label="标签">
              <Space wrap>
                {newDemo.tags?.map((tag) => (
                  <Tag key={tag} closable onClose={() => handleRemoveTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPressEnter={handleAddTag}
                placeholder="输入标签后按回车添加"
                style={{ marginTop: 8 }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                onClick={handleAddDemo}
                disabled={isUpdating}
                loading={isUpdating}
              >
                添加Demo
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* Demo List */}
      {activeTab === "demos" && (
        <div className="space-y-4 mt-4">
          {categories.map((category) => (
            <Card
              key={category._id?.toString()}
              title={category.name}
              className="mb-4"
            >
              <div className="space-y-4">
                {category.demos?.map((demo) => (
                  <Card
                    key={demo._id?.toString()}
                    size="small"
                    className="w-full"
                    extra={
                      <Space>
                        <Button
                          type="text"
                          onClick={() => {
                            setEditingDemo({
                              categoryId: category._id?.toString() || "",
                              newCategoryId: category._id?.toString() || "",
                              demoId: demo._id?.toString() || "",
                              demo: { ...demo },
                            });
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          type="text"
                          danger
                          onClick={() =>
                            handleDeleteDemo(demo._id?.toString() || "")
                          }
                        >
                          删除
                        </Button>
                      </Space>
                    }
                  >
                    <div className="flex gap-4">
                      {demo.gifUrl && (
                        <div className="relative w-32 h-24 flex-shrink-0">
                          <Image
                            src={demo.gifUrl}
                            alt={demo.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{demo.name}</h3>
                        <p className="text-gray-600 mt-1">{demo.description}</p>
                        <div className="mt-2">
                          {demo.tags?.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                        {demo.url && (
                          <a
                            href={demo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
                          >
                            查看Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Demo Modal */}
      <Modal
        title="编辑Demo"
        open={!!editingDemo}
        onOk={() => {
          if (editingDemo) {
            handleUpdateDemo(editingDemo.demoId, editingDemo.demo);
          }
        }}
        onCancel={() => setEditingDemo(null)}
        confirmLoading={isUpdating}
        okText="保存"
        cancelText="取消"
        width={720}
        destroyOnClose
        maskClosable={false}
        bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
      >
        {editingDemo && (
          <Form layout="vertical" preserve={false}>
            <Form.Item 
              label="选择分类" 
              required
              tooltip="更改分类将会移动此Demo到新的分类下"
            >
              <Select
                value={editingDemo.newCategoryId}
                onChange={(value) =>
                  setEditingDemo({
                    ...editingDemo,
                    newCategoryId: value,
                  })
                }
                showSearch
                optionFilterProp="children"
                placeholder="请选择分类"
              >
                {categories.map((category) => (
                  <Select.Option
                    key={category._id?.toString()}
                    value={category._id?.toString()}
                  >
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              label="名称" 
              required
              tooltip="Demo的显示名称"
            >
              <Input
                value={editingDemo.demo.name}
                onChange={(e) =>
                  setEditingDemo({
                    ...editingDemo,
                    demo: { ...editingDemo.demo, name: e.target.value },
                  })
                }
                placeholder="请输入Demo名称"
                maxLength={50}
                showCount
              />
            </Form.Item>

            <Form.Item 
              label="描述"
              tooltip="详细描述Demo的功能和特点"
            >
              <Input.TextArea
                value={editingDemo.demo.description}
                onChange={(e) =>
                  setEditingDemo({
                    ...editingDemo,
                    demo: { ...editingDemo.demo, description: e.target.value },
                  })
                }
                placeholder="请输入Demo描述"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item 
              label="URL"
              tooltip="Demo的访问地址"
            >
              <Input
                value={editingDemo.demo.url}
                onChange={(e) =>
                  setEditingDemo({
                    ...editingDemo,
                    demo: { ...editingDemo.demo, url: e.target.value },
                  })
                }
                placeholder="请输入Demo URL"
                type="url"
              />
            </Form.Item>

            <Form.Item 
              label="标签"
              tooltip="使用标签更好地分类和查找Demo"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space wrap>
                  {editingDemo.demo.tags?.map((tag) => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => {
                        setEditingDemo({
                          ...editingDemo,
                          demo: {
                            ...editingDemo.demo,
                            tags: editingDemo.demo.tags?.filter((t) => t !== tag),
                          },
                        });
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onPressEnter={() => {
                    if (
                      tagInput.trim() &&
                      !editingDemo.demo.tags?.includes(tagInput.trim())
                    ) {
                      setEditingDemo({
                        ...editingDemo,
                        demo: {
                          ...editingDemo.demo,
                          tags: [
                            ...(editingDemo.demo.tags || []),
                            tagInput.trim(),
                          ],
                        },
                      });
                      setTagInput("");
                    }
                  }}
                  placeholder="输入标签后按回车添加"
                  maxLength={20}
                />
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
