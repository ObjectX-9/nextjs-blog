'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IInspiration } from '@/app/model/inspiration';
import Image from 'next/image';
import { Form, Input, Select, Upload, Button, Spin, Card, message, Space, InputNumber, Typography } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined, LinkOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { DouyinVideoPreview } from '@/components/DouyinVideoPreview';
import { IInspirationVideo } from '@/app/model/inspiration';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';

const { TextArea } = Input;

interface Link {
  title: string;
  url: string;
  icon?: string;
}

export default function EditInspiration({ params }: { params: { id: string } }) {
  const [form] = Form.useForm();
  const [inspiration, setInspiration] = useState<IInspiration | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<IInspirationVideo[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [uploading, setUploading] = useState(false);
  const [douyinUrl, setDouyinUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        const response = await fetch(`/api/inspirations/${params.id}`);
        const result = await response.json();
        console.log('result', result)
        const data = result.data || result; // 兼容包装和非包装格式
        setInspiration(data);
        if (data.images) {
          setImages(data.images);
        }
        if (data.videos) {
          setVideos(data.videos);
        }
        if (data.links) {
          setLinks(data.links);
        }
        // 设置表单初始值
        form.setFieldsValue({
          title: data.title,
          content: data.content,
          status: data.status,
          tags: data.tags?.join(', '),
          views: data.views || 0,
          likes: data.likes || 0
        });
      } catch (error) {
        console.error('Error fetching inspiration:', error);
        message.error('获取笔记失败');
      } finally {
        setLoading(false);
      }
    };

    fetchInspiration();
  }, [params.id, form]);

  const handleImageUpload = async (file: RcFile) => {
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
    const updatedInspiration = {
      title: values.title,
      content: values.content,
      status: values.status,
      tags: values.tags?.split(',').map((tag: string) => tag.trim()).filter(Boolean) || [],
      images: images,
      videos: videos,
      links: links.filter(link => link.title && link.url),
      views: values.views,
      likes: values.likes
    };

    try {
      const response = await fetch(`/api/inspirations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInspiration),
      });

      if (response.ok) {
        message.success('保存成功');
        router.push('/admin/inspirations');
      }
    } catch (error) {
      console.error('Error updating inspiration:', error);
      message.error('保存失败');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!inspiration) {
    return <div>笔记不存在</div>;
  }

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 h-[100vh] overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">编辑灵感笔记</h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
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
                disabled={uploading}
              >
                {uploadButton}
              </Upload>

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

            <Form.Item label="链接">
              <div className="space-y-4">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="链接标题"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...links];
                        newLinks[index].title = e.target.value;
                        setLinks(newLinks);
                      }}
                    />
                    <Input
                      placeholder="链接URL"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...links];
                        newLinks[index].url = e.target.value;
                        setLinks(newLinks);
                      }}
                    />
                    <Input
                      placeholder="图标URL（可选）"
                      value={link.icon}
                      onChange={(e) => {
                        const newLinks = [...links];
                        newLinks[index].icon = e.target.value;
                        setLinks(newLinks);
                      }}
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
                  onClick={() => setLinks([...links, { title: '', url: '', icon: '' }])}
                  block
                  icon={<LinkOutlined />}
                >
                  添加链接
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              label="内容"
              name="content"
              rules={[{ required: true, message: '请输入内容' }]}
            >
              <TextArea rows={8} />
            </Form.Item>

            <Form.Item
              label="标签"
              name="tags"
              help="用逗号分隔多个标签"
            >
              <Input />
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

            <Space size="large" className="w-full mb-4">
              <Form.Item
                label="浏览量"
                name="views"
                initialValue={0}
              >
                <InputNumber min={0} />
              </Form.Item>

              <Form.Item
                label="点赞数"
                name="likes"
                initialValue={0}
              >
                <InputNumber min={0} />
              </Form.Item>
            </Space>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  保存
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
