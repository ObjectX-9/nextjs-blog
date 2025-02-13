"use client";

import { useState, useEffect, useRef } from "react";
import { ISocialLink } from "@/app/model/social-link";
import Image from "next/image";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  message,
  Typography,
  Layout,
  Space,
  Upload,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;

interface SocialLinkWithId extends ISocialLink {
  _id: string;
}

export default function SocialLinksManagementPage() {
  const [items, setItems] = useState<SocialLinkWithId[]>([]);
  const [editingItem, setEditingItem] =
    useState<Partial<SocialLinkWithId> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchSocialLinks = async () => {
    try {
      const response = await fetch("/api/social-links");
      if (!response.ok) {
        throw new Error("Failed to fetch social links");
      }
      const data = await response.json();
      if (data.success) {
        setItems(data.socialLinks);
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
      message.error("获取数据失败，请刷新重试");
    }
  };

  const handleFileSelect = (file: File) => {
    if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
      message.error("请选择 PNG、JPG 或 GIF 格式的图片");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error("图片大小不能超过10MB");
      return false;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return false;
  };

  const uploadIcon = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload?path=/images/socialLinkIcon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading icon:", error);
      throw error;
    }
  };

  const handleSaveItem = async () => {
    try {
      const values = await form.validateFields();
      let iconUrl = editingItem?.icon;

      if (selectedFile) {
        try {
          iconUrl = (await uploadIcon()) as string;
          if (!iconUrl) {
            throw new Error("图标上传失败");
          }
        } catch (error) {
          message.error("图标上传失败，请重试");
          return;
        }
      }

      const method = editingItem?._id ? "PUT" : "POST";
      const response = await fetch("/api/social-links", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editingItem,
          ...values,
          icon: iconUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingItem?._id ? "update" : "create"} social link`
        );
      }

      const data = await response.json();
      if (data.success) {
        await fetchSocialLinks();
        setEditingItem(null);
        setSelectedFile(null);
        setPreviewUrl("");
        form.resetFields();
        message.success(`${editingItem?._id ? "更新" : "创建"}成功`);
      } else {
        throw new Error(
          data.error ||
            `Failed to ${editingItem?._id ? "update" : "create"} social link`
        );
      }
    } catch (error) {
      console.error("Error saving social link:", error);
      message.error("保存失败，请重试");
    }
  };

  const handleAddItem = () => {
    form.resetFields();
    setEditingItem({
      name: "",
      icon: "",
      url: "",
      bgColor: "#ffffff",
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleEditItem = (item: SocialLinkWithId) => {
    form.setFieldsValue(item);
    setEditingItem(item);
    setSelectedFile(null);
    setPreviewUrl(item.icon || "");
  };

  const handleDeleteItem = async (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个社交链接吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await fetch(`/api/social-links?id=${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete social link");
          }

          const data = await response.json();
          if (data.success) {
            await fetchSocialLinks();
            message.success("删除成功");
          } else {
            throw new Error(data.error || "Failed to delete social link");
          }
        } catch (error) {
          console.error("Error deleting social link:", error);
          message.error("删除失败，请重试");
        }
      },
    });
  };

  return (
    <Layout className="min-h-screen bg-white">
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Title level={2} className="!mb-0">
              社交链接管理
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
              size="large"
            >
              添加链接
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item._id}
                size="small"
                className="w-full"
                actions={[
                  <Button
                    key="edit"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditItem(item)}
                  >
                    编辑
                  </Button>,
                  <Button
                    key="delete"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteItem(item._id)}
                  >
                    删除
                  </Button>,
                ]}
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text strong className="text-base block mb-1">
                      {item.name}
                    </Text>
                    <div className="flex items-center text-gray-500 text-sm">
                      <LinkOutlined className="mr-1" />
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 truncate"
                      >
                        {new URL(item.url).hostname}
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Modal
            title={
              <Title level={4} className="!mb-0">
                {editingItem?._id ? "编辑社交链接" : "添加社交链接"}
              </Title>
            }
            open={!!editingItem}
            onCancel={() => {
              setEditingItem(null);
              form.resetFields();
            }}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setEditingItem(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={handleSaveItem}>
                保存
              </Button>,
            ]}
            width={720}
            destroyOnClose
            centered
          >
            <Form form={form} layout="vertical" className="mt-6">
              <Form.Item
                name="name"
                label="名称"
                rules={[{ required: true, message: "请输入名称" }]}
              >
                <Input placeholder="请输入名称" />
              </Form.Item>

              <Form.Item
                label="图标"
                required
                tooltip="支持 PNG、JPG、GIF 格式，最大 10MB"
              >
                <Upload.Dragger
                  accept="image/png,image/jpeg,image/gif"
                  showUploadList={false}
                  beforeUpload={handleFileSelect}
                  className="w-full"
                >
                  {previewUrl || editingItem?.icon ? (
                    <div className="flex items-center gap-4 p-4">
                      <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
                        <Image
                          src={previewUrl || editingItem?.icon || ""}
                          alt="图标预览"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-blue-500">点击更换图片</div>
                        <div className="mt-1 text-xs text-gray-500">
                          支持 PNG、JPG、GIF 格式，最大 10MB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-blue-500">
                        <UploadOutlined className="text-xl mb-2" />
                        <br />
                        点击选择图片或拖拽到此处
                      </p>
                      <p className="text-xs text-gray-500">
                        支持 PNG、JPG、GIF 格式，最大 10MB
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>

              <Form.Item
                name="url"
                label="链接"
                rules={[
                  { required: true, message: "请输入链接" },
                  { type: "url", message: "请输入有效的URL" },
                ]}
              >
                <Input
                  placeholder="请输入链接地址"
                  prefix={<LinkOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item
                name="bgColor"
                label="背景颜色"
                rules={[{ required: true, message: "请选择背景颜色" }]}
              >
                <Input
                  type="color"
                  className="w-12 h-10"
                  placeholder="请选择背景颜色"
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
}
