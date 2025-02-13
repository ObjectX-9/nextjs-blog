"use client";

import { useState, useEffect } from "react";
import { IStack } from "@/app/model/stack";
import Image from 'next/image';
import { Button, Card, Form, Input, Modal, Upload, message, Space, Typography, Layout, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, LinkOutlined, UploadOutlined, GithubOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

interface StackWithId extends IStack {
  _id: string;
}

export default function StacksAdmin() {
  const [stacks, setStacks] = useState<StackWithId[]>([]);
  const [editingStack, setEditingStack] = useState<Partial<StackWithId> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStacks();
  }, []);

  useEffect(() => {
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
    try {
      const values = await form.validateFields();
      setIsUploading(true);

      let iconUrl = editingStack?.iconSrc || '';

      // Upload new image if selected
      if (selectedFile) {
        iconUrl = await uploadImage(selectedFile);
      }

      const method = editingStack?._id ? 'PUT' : 'POST';
      const response = await fetch('/api/stacks', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingStack,
          ...values,
          iconSrc: iconUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingStack?._id ? 'update' : 'create'} stack`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchStacks();
        setEditingStack(null);
        setSelectedFile(null);
        setPreviewUrl("");
        form.resetFields();
        message.success(`${editingStack?._id ? '更新' : '创建'}成功`);
      } else {
        throw new Error(data.error || `Failed to ${editingStack?._id ? 'update' : 'create'} stack`);
      }
    } catch (error) {
      console.error('Error saving stack:', error);
      message.error('保存失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddStack = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    form.resetFields();
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
    form.setFieldsValue(stack);
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
      message.error('获取数据失败，请刷新重试');
    }
  };

  const handleDeleteStack = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个技术栈吗？此操作不可恢复。',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
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
            message.success('删除成功');
          } else {
            throw new Error(data.error || 'Failed to delete stack');
          }
        } catch (error) {
          console.error('Error deleting stack:', error);
          message.error('删除失败，请重试');
        }
      },
    });
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Title level={2} className="!mb-0">技术栈管理</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddStack}
              size="large"
            >
              添加技术栈
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            {stacks.map((stack) => (
              <Col xs={24} sm={12} lg={8} key={stack._id}>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Tooltip title="编辑" key="edit">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => handleEditStack(stack)}
                      >
                        编辑
                      </Button>
                    </Tooltip>,
                    <Tooltip title="删除" key="delete">
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteStack(stack._id)}
                      >
                        删除
                      </Button>
                    </Tooltip>
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <Image
                        src={stack.iconSrc}
                        alt={stack.title}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    }
                    title={
                      <Text strong className="text-lg">
                        {stack.title}
                      </Text>
                    }
                    description={
                      <div className="space-y-2">
                        <Paragraph 
                          ellipsis={{ rows: 2 }} 
                          className="text-gray-600"
                        >
                          {stack.description}
                        </Paragraph>
                        <a
                          href={stack.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:text-blue-600"
                        >
                          {stack.link.includes('github.com') ? (
                            <GithubOutlined className="mr-1" />
                          ) : (
                            <LinkOutlined className="mr-1" />
                          )}
                          <Text ellipsis>
                            {stack.link}
                          </Text>
                        </a>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Modal
            title={
              <Title level={4} className="!mb-0">
                {editingStack?._id ? "编辑技术栈" : "添加技术栈"}
              </Title>
            }
            open={!!editingStack}
            onCancel={() => {
              setEditingStack(null);
              form.resetFields();
            }}
            footer={[
              <Button 
                key="cancel" 
                onClick={() => {
                  setEditingStack(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={isUploading}
                onClick={handleSaveStack}
              >
                保存
              </Button>
            ]}
            width={720}
            destroyOnClose
            centered
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={editingStack || {}}
              className="mt-6"
            >
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input placeholder="请输入技术栈标题" />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="描述"
                rules={[{ required: true, message: '请输入描述' }]}
              >
                <Input.TextArea
                  placeholder="请输入技术栈描述"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
              
              <Form.Item
                name="link"
                label="链接"
                rules={[
                  { required: true, message: '请输入链接' },
                  { type: 'url', message: '请输入有效的URL' }
                ]}
              >
                <Input 
                  placeholder="请输入技术栈相关链接" 
                  prefix={<LinkOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item 
                label="图标"
                required
                tooltip="支持 PNG、JPG、GIF 格式，最大 10MB"
              >
                <Upload.Dragger
                  accept="image/png,image/jpeg,image/gif"
                  beforeUpload={(file) => {
                    if (file.size > 10 * 1024 * 1024) {
                      message.error('图片大小不能超过10MB');
                      return false;
                    }
                    handleFileSelect(file);
                    return false;
                  }}
                  showUploadList={false}
                >
                  {(previewUrl || editingStack?.iconSrc) ? (
                    <div className="p-4">
                      <Image
                        src={previewUrl || editingStack?.iconSrc || ""}
                        alt="Stack icon preview"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain mx-auto mb-4"
                      />
                      <Button icon={<UploadOutlined />}>更换图片</Button>
                    </div>
                  ) : (
                    <div className="p-8">
                      <p className="text-gray-500">
                        <UploadOutlined className="text-3xl mb-3" />
                        <br />
                        点击或拖拽上传图片
                      </p>
                      <p className="text-gray-400 text-sm">支持 PNG、JPG、GIF 格式，最大 10MB</p>
                    </div>
                  )}
                </Upload.Dragger>
                {(previewUrl || editingStack?.iconSrc) && (
                  <Button 
                    type="link" 
                    danger 
                    onClick={handleRemoveFile}
                    className="mt-2"
                  >
                    移除图片
                  </Button>
                )}
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
}
