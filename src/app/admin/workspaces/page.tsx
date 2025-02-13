"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  message,
  Typography,
  Layout,
  Row,
  Col,
  Space,
  Tooltip,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ShopOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;

interface WorkspaceItem {
  _id: string;
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function WorkspacesPage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [editingItem, setEditingItem] = useState<WorkspaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchWorkspaceItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspaces`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.workspaceItems);
      } else {
        throw new Error("Failed to fetch workspace items");
      }
    } catch (error) {
      console.error("Error fetching workspace items:", error);
      message.error("获取工作空间列表失败，请刷新重试");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaceItems();
  }, [fetchWorkspaceItems]);

  const handleSaveItem = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const method = editingItem?._id ? "PUT" : "POST";
      const response = await fetch("/api/workspaces", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editingItem, ...values }),
      });

      const data = await response.json();
      if (data.success) {
        if (method === "POST") {
          setItems((prev) => [data.workspaceItem, ...prev]);
        } else {
          setItems((prev) =>
            prev.map((item) =>
              item._id === editingItem?._id ? { ...item, ...values } : item
            )
          );
        }
        setEditingItem(null);
        form.resetFields();
        message.success(`${method === "POST" ? "添加" : "更新"}成功`);
      } else {
        throw new Error(data.error || "Failed to save workspace item");
      }
    } catch (error) {
      console.error("Error saving workspace item:", error);
      message.error("保存失败，请重试");
    }
  }, [editingItem, form]);

  const handleDeleteItem = useCallback(async (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个工作空间吗？此操作不可恢复。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await fetch(`/api/workspaces?id=${id}`, {
            method: "DELETE",
          });

          const data = await response.json();
          if (data.success) {
            setItems((prev) => prev.filter((item) => item._id !== id));
            message.success("删除成功");
          } else {
            throw new Error(data.error || "Failed to delete workspace item");
          }
        } catch (error) {
          console.error("Error deleting workspace item:", error);
          message.error("删除失败，请重试");
        }
      },
    });
  }, []);

  const handleAddItem = useCallback(() => {
    form.resetFields();
    setEditingItem({
      _id: "",
      product: "",
      specs: "",
      buyAddress: "",
      buyLink: "",
    });
  }, [form]);

  const handleEditItem = useCallback(
    (item: WorkspaceItem) => {
      form.setFieldsValue(item);
      setEditingItem(item);
    },
    [form]
  );

  return (
    <Layout className="min-h-screen bg-white">
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Title level={2} className="!mb-0">
              工作空间管理
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
              size="large"
            >
              添加工作空间
            </Button>
          </div>

          <div className="space-y-4">
            <Spin spinning={isLoading}>
              <Row gutter={[16, 16]}>
                {items.map((item) => (
                  <Col xs={24} key={item._id}>
                    <Card
                      hoverable
                      size="small"
                      className="overflow-hidden"
                      actions={[
                        <Tooltip title="编辑" key="edit">
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditItem(item)}
                          >
                            编辑
                          </Button>
                        </Tooltip>,
                        <Tooltip title="删除" key="delete">
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteItem(item._id)}
                          >
                            删除
                          </Button>
                        </Tooltip>,
                      ]}
                    >
                      <div className="flex flex-col space-y-2">
                        <Space className="flex-wrap" size={[0, 8]}>
                          <Text strong className="text-base">
                            {item.product}
                          </Text>
                          <Text type="secondary" className="text-sm ml-2">
                            {item.specs}
                          </Text>
                        </Space>
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <ShopOutlined className="mt-1 text-gray-400 flex-shrink-0" />
                            <Text className="break-all">{item.buyAddress}</Text>
                          </div>
                          {item.buyLink && (
                            <div className="flex items-start gap-2">
                              <LinkOutlined className="mt-1 text-gray-400 flex-shrink-0" />
                              <a
                                href={item.buyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600"
                              >
                                {new URL(item.buyLink).hostname}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Spin>
          </div>

          <Modal
            title={
              <Title level={4} className="!mb-0">
                {editingItem?._id ? "编辑工作空间" : "添加工作空间"}
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
            <Form
              form={form}
              layout="vertical"
              initialValues={editingItem || {}}
              className="mt-6"
            >
              <Form.Item
                name="product"
                label="产品"
                rules={[{ required: true, message: "请输入产品名称" }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>

              <Form.Item
                name="specs"
                label="规格"
                rules={[{ required: true, message: "请输入产品规格" }]}
              >
                <Input placeholder="请输入产品规格" />
              </Form.Item>

              <Form.Item
                name="buyAddress"
                label="购买地址"
                rules={[{ required: true, message: "请输入购买地址" }]}
              >
                <Input
                  placeholder="请输入购买地址"
                  prefix={<ShopOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item
                name="buyLink"
                label="购买链接"
                rules={[{ type: "url", message: "请输入有效的URL" }]}
              >
                <Input
                  placeholder="http:// 或 https://"
                  prefix={<LinkOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
}
