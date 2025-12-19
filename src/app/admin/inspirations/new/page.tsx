'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Form, Input, Select, Upload, Button, Card, message, Space, Alert, Typography } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined, LinkOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { DouyinVideoPreview } from '@/components/DouyinVideoPreview';
import { IInspirationVideo } from '@/app/model/inspiration';
import type { RcFile } from 'antd/es/upload';
import { extractBilibiliInfo } from '@/app/utils/bilibili';

const { TextArea } = Input;

export default function NewInspiration() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<IInspirationVideo[]>([]);
  const [links, setLinks] = useState<Array<{ title: string; url: string; icon?: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [bilibiliInfo, setBilibiliInfo] = useState<{ bvid: string; page?: number } | null>(null);
  const [bilibiliError, setBilibiliError] = useState<string>('');
  const [douyinUrl, setDouyinUrl] = useState('');

  const handleImageUpload = async (file: RcFile) => {
    if (bilibiliInfo) {
      message.warning('已添加视频，不能同时上传图片');
      return false;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'inspirations');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        setImages([...images, data.url]);
        message.success('图片上传成功');
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleBilibiliUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (!url) {
      setBilibiliInfo(null);
      setBilibiliError('');
      return;
    }

    if (images.length > 0) {
      message.warning('已上传图片，不能同时添加视频');
      return;
    }

    try {
      const info = extractBilibiliInfo(url);
      setBilibiliInfo(info);
      setBilibiliError('');
      message.success('成功解析BV号');
    } catch (error) {
      setBilibiliInfo(null);
      setBilibiliError((error as Error).message);
    }
  };

  const handleAddDouyinVideo = () => {
    if (!douyinUrl.trim()) {
      message.warning('请输入抖音视频链接');
      return;
    }
    if (!douyinUrl.includes('douyin.com') && !douyinUrl.includes('v.douyin.com')) {
      message.warning('请输入有效的抖音视频链接');
      return;
    }
    setVideos([...videos, { url: douyinUrl.trim(), isDouyin: true }]);
    setDouyinUrl('');
    message.success('抖音视频已添加');
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: any) => {
    const newInspiration = {
      title: values.title,
      content: values.content,
      status: values.status,
      tags: values.tags || [],
      images: images,
      videos: videos,
      bilibili: bilibiliInfo,
      links: links
    };

    try {
      const response = await fetch('/api/inspirations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInspiration),
      });

      if (response.ok) {
        message.success('创建成功');
        router.push('/admin/inspirations');
      }
    } catch (error) {
      console.error('Error creating inspiration:', error);
      message.error('创建失败');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">新建灵感笔记</h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ status: 'draft' }}
          >
            <Form.Item
              label="标题"
              name="title"
            >
              <Input placeholder="请输入标题（选填）" />
            </Form.Item>

            <Form.Item label="图片">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={handleImageUpload}
                disabled={uploading || !!bilibiliInfo}
              >
                {uploadButton}
              </Upload>

              {bilibiliInfo && (
                <Alert
                  message="已添加视频，不能上传图片"
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-16 aspect-h-9 h-48 relative">
                        <Image
                          src={image}
                          alt={`上传的图片 ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Form.Item>

            <Form.Item
              label="内容"
              name="content"
              rules={[{ required: true, message: '请输入内容' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item label="抖音视频">
              <div className="space-y-4">
                {videos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {videos.map((video, index) => (
                      <div key={index} className="relative aspect-video">
                        <DouyinVideoPreview url={video.url} />
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => removeVideo(index)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="粘贴抖音视频链接，如: https://v.douyin.com/xxxxx/"
                    value={douyinUrl}
                    onChange={(e) => setDouyinUrl(e.target.value)}
                    onPressEnter={handleAddDouyinVideo}
                  />
                  <Button
                    type="primary"
                    icon={<VideoCameraOutlined />}
                    onClick={handleAddDouyinVideo}
                  >
                    添加
                  </Button>
                </Space.Compact>
                <Typography.Text type="secondary" className="text-xs">
                  支持抖音分享链接，视频将在展示时自动解析
                </Typography.Text>
              </div>
            </Form.Item>

            <Form.Item
              label="B站视频链接"
              extra={bilibiliInfo && <span className="text-green-600">已成功解析BV号: {bilibiliInfo.bvid}</span>}
            >
              <Input
                onChange={handleBilibiliUrlChange}
                placeholder="输入B站视频链接，将自动解析BV号"
                disabled={images.length > 0}
                status={bilibiliError ? 'error' : undefined}
              />
              {images.length > 0 && (
                <div className="mt-1 text-gray-500 text-sm">已上传图片，不能添加视频</div>
              )}
              {bilibiliError && (
                <div className="mt-1 text-red-500 text-sm">{bilibiliError}</div>
              )}
            </Form.Item>

            <Form.Item
              label="标签"
              name="tags"
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="输入标签后按回车"
                tokenSeparators={[',']}
              />
            </Form.Item>

            <Form.Item label="链接">
              <div className="space-y-4">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...links];
                        newLinks[index].title = e.target.value;
                        setLinks(newLinks);
                      }}
                      placeholder="链接标题"
                      className="flex-1"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...links];
                        newLinks[index].url = e.target.value;
                        setLinks(newLinks);
                      }}
                      placeholder="链接地址"
                      className="flex-1"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setLinks(links.filter((_, i) => i !== index));
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => setLinks([...links, { title: '', url: '' }])}
                  block
                  icon={<LinkOutlined />}
                >
                  添加链接
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              label="状态"
              name="status"
            >
              <Select>
                <Select.Option value="draft">草稿</Select.Option>
                <Select.Option value="published">发布</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  创建
                </Button>
                <Button onClick={() => router.back()}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
