'use client';

import { useState, useEffect } from 'react';
import { IInspiration } from '@/app/model/inspiration';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Modal, Card, Button, Input, Upload, Tag, Space, Spin, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, PictureOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';

const { TextArea } = Input;

// 快速发送灵感笔记的弹窗组件
const QuickInspirationDialog = ({ onSubmit, open, onOpenChange }: {
  onSubmit: (data: { content: string, images: string[] }) => Promise<void>,
  open: boolean,
  onOpenChange: (open: boolean) => void
}) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ content, images });
      setContent('');
      setImages([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting inspiration:', error);
      message.error('发送失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: RcFile) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'inspirations');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Invalid response format');
      }

      setImages((prev) => [...prev, data.url]);
      return false; // 阻止 Upload 组件默认上传行为
    } catch (error) {
      console.error('Error uploading images:', error);
      message.error('图片上传失败');
      return false;
    }
  };

  return (
    <Modal
      title="快速发送灵感笔记"
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={[
        <Button key="cancel" onClick={() => onOpenChange(false)}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmitting}
          disabled={!content.trim()}
          onClick={handleSubmit}
          icon={<SendOutlined />}
        >
          发送
        </Button>
      ]}
      width={600}
    >
      <TextArea
        placeholder="写下你的想法..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="mb-4"
      />

      <Upload
        listType="picture-card"
        fileList={images.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done',
          url: url,
        }))}
        beforeUpload={handleImageUpload}
        onRemove={(file) => {
          setImages(images.filter(url => url !== file.url));
          return true;
        }}
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
      </Upload>
    </Modal>
  );
};

export default function InspirationManagement() {
  const [inspirations, setInspirations] = useState<IInspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickPostOpen, setQuickPostOpen] = useState(false);
  const router = useRouter();

  // 获取灵感笔记列表
  const fetchInspirations = async () => {
    try {
      const response = await fetch('/api/inspirations');
      const data = await response.json();
      setInspirations(data.data);
    } catch (error) {
      console.error('Error fetching inspirations:', error);
      message.error('获取灵感笔记列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspirations();
  }, []);

  // 快速发送灵感笔记
  const handleQuickPost = async (data: { content: string, images: string[] }) => {
    try {
      const response = await fetch('/api/inspirations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.content,
          images: data.images,
          status: 'published',
        }),
      });

      if (response.ok) {
        fetchInspirations();
        message.success('发送成功');
      }
    } catch (error) {
      console.error('Error creating inspiration:', error);
      message.error('发送失败');
    }
  };

  // 删除灵感笔记
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/inspirations/${id}`, {
        method: 'DELETE',
      });
      fetchInspirations();
      message.success('删除成功');
    } catch (error) {
      console.error('Error deleting inspiration:', error);
      message.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[100vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">灵感笔记管理</h1>
        <Space>
          <Button onClick={() => setQuickPostOpen(true)} icon={<PlusOutlined />}>
            快速发送
          </Button>
          <Button
            type="primary"
            onClick={() => router.push('/admin/inspirations/new')}
            icon={<PlusOutlined />}
          >
            新建笔记
          </Button>
        </Space>
      </div>

      <QuickInspirationDialog
        open={quickPostOpen}
        onOpenChange={setQuickPostOpen}
        onSubmit={handleQuickPost}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inspirations.map((inspiration) => (
          <Card
            key={inspiration._id?.toString()}
            extra={
              <Tag color={inspiration.status === 'published' ? 'success' : 'default'}>
                {inspiration.status === 'published' ? '已发布' : '草稿'}
              </Tag>
            }
            actions={[
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => router.push(`/admin/inspirations/${inspiration._id}/edit`)}
              >
                编辑
              </Button>,
              <Popconfirm
                key="delete"
                title="确定要删除这条灵感笔记吗？"
                onConfirm={() => handleDelete(inspiration._id?.toString() || '')}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            ]}
          >
            <Card.Meta
              title={inspiration.title}
              description={
                <div>
                  {inspiration.images && inspiration.images.length > 0 && (
                    <div className="relative h-48 w-full mb-4">
                      <Image
                        src={inspiration.images[0]}
                        alt={inspiration.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {inspiration.bilibili && (
                    <div className="mb-4">
                      <div className="relative aspect-video w-full mb-2">
                        <iframe
                          src={`//player.bilibili.com/player.html?bvid=${inspiration.bilibili.bvid}&page=${inspiration.bilibili.page || 1}`}
                          scrolling="no"
                          style={{ border: 'none' }}
                          frameBorder="no"
                          allowFullScreen={true}
                          className="absolute inset-0 w-full h-full rounded-lg"
                        />
                      </div>
                      <Space className="text-sm text-gray-500">
                        <span>BV号: {inspiration.bilibili.bvid}</span>
                        {inspiration.bilibili.title && (
                          <span className="truncate">标题: {inspiration.bilibili.title}</span>
                        )}
                      </Space>
                    </div>
                  )}
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{inspiration.content}</p>
                  
                  <Space wrap className="mb-4">
                    {inspiration.tags?.map((tag, index) => (
                      <Tag key={index} color="blue">{tag}</Tag>
                    ))}
                  </Space>
                  
                  <Space className="text-sm text-gray-500">
                    <span>浏览: {inspiration.views}</span>
                    <span>点赞: {inspiration.likes}</span>
                  </Space>
                </div>
              }
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
