'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Article, ArticleStatus, ArticleCategory } from '@/app/model/article';
import { Input, Button, Select, InputNumber, Space, Tag, Typography, Form, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const EditArticlePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [article, setArticle] = useState<Article>({
    title: '',
    content: '',
    ossPath: '',
    status: ArticleStatus.DRAFT,
    createdAt: new Date().toISOString(),
  });
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // 获取文章数据
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles?id=${params.id}`);
        const data = await response.json();
        setArticle(data);
        if (data.tags) {
          setTags(data.tags);
        }
      } catch (error) {
        message.error('获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/articles/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        message.error('获取分类失败');
      }
    };

    fetchArticle();
    fetchCategories();
  }, [params.id]);

  // 保存文章
  const handleSave = async (status?: ArticleStatus) => {
    try {
      setSaving(true);
      const updatedArticle = {
        ...article,
        tags,
        status: status || article.status,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/articles?id=${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      message.success('保存成功');
      if (status === ArticleStatus.PUBLISHED) {
        router.push('/admin/articles');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 添加标签
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Title level={2} style={{ margin: 0 }}>编辑文章</Title>
        <Space>
          <Button
            onClick={() => handleSave()}
            loading={saving}
            type="primary"
          >
            保存草稿
          </Button>
          <Button
            onClick={() => handleSave(ArticleStatus.PUBLISHED)}
            loading={saving}
            type="primary"
            className="bg-green-500 hover:bg-green-600"
          >
            发布文章
          </Button>
        </Space>
      </div>

      <Form layout="vertical" className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Form.Item label="文章标题" required>
              <Input
                value={article.title}
                onChange={e => setArticle({ ...article, title: e.target.value })}
                placeholder="请输入文章标题"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item label="排序">
              <InputNumber
                className="w-full"
                value={article.order}
                onChange={value => setArticle({ ...article, order: value || undefined })}
                placeholder="数字越小越靠前"
              />
            </Form.Item>
          </div>
          <div className="col-span-3">
            <Form.Item label="文章分类">
              <Select
                value={article.categoryId || undefined}
                onChange={value => setArticle({ ...article, categoryId: value })}
                placeholder="请选择分类"
              >
                {categories.map(category => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>

        {/* 标签管理 */}
        <Form.Item label="文章标签">
          <Space direction="vertical" className="w-full">
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
            <Space.Compact className="w-full">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onPressEnter={handleAddTag}
                placeholder="输入标签名称并按回车添加"
              />
              <Button icon={<PlusOutlined />} onClick={handleAddTag}>
                添加标签
              </Button>
            </Space.Compact>
          </Space>
        </Form.Item>

        {/* 文章摘要 */}
        <Form.Item label="文章摘要">
          <TextArea
            value={article.summary || ''}
            onChange={e => setArticle({ ...article, summary: e.target.value })}
            rows={3}
            placeholder="请输入文章摘要"
          />
        </Form.Item>

        {/* 封面图片 */}
        <Form.Item label="封面图片">
          <Input
            value={article.coverImage || ''}
            onChange={e => setArticle({ ...article, coverImage: e.target.value })}
            placeholder="请输入封面图片URL"
          />
        </Form.Item>

        {/* 文章内容编辑按钮 */}
        <Form.Item
          label={
            <div className="flex justify-between items-center w-full">
              <span>文章内容</span>
              <Link
                href={`/admin/articles/edit/${params.id}/content`}
                className="text-blue-500 hover:text-blue-600"
              >
                <Space>
                  <EditOutlined />
                  编辑内容
                </Space>
              </Link>
            </div>
          }
        >
          <div className="p-4 bg-gray-50 rounded-lg">
            {article.content ? (
              <div className="prose max-w-none">
                <Text className="line-clamp-3 text-gray-600">
                  {article.content}
                </Text>
              </div>
            ) : (
              <Text type="secondary">暂无内容</Text>
            )}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditArticlePage;
