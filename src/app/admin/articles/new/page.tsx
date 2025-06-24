'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArticleStatus, ArticleCountByCategory } from '@/app/model/article';
import { Button, Modal, Input, Select, Space, Typography, message, Spin } from 'antd';
import { articlesService } from '@/app/business/articles';
import "@/styles/markdown.css";

const { Title } = Typography;
const { Option } = Select;

// 动态导入 MarkdownEditor，禁用 SSR
const MarkdownEditor = dynamic(
  () => import('@/components/customMdRender/components/MarkdownEditor').then(mod => ({ default: mod.MarkdownEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" tip="正在加载编辑器..." />
      </div>
    )
  }
);

const initialContent = `# 开始编写你的技术文档...`;

// 从 Markdown 内容中提取标题
function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : '新文档';
}

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [categories, setCategories] = useState<ArticleCountByCategory[]>([]);
  const [articleSettings, setArticleSettings] = useState({
    title: '',
    categoryId: '',
    status: ArticleStatus.DRAFT
  });

  // 加载分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await articlesService.getArticleCountByCategory();
        setCategories(response || []);
      } catch (error) {
        message.error('获取分类失败');
      }
    };
    fetchCategories();
  }, []);

  // 打开设置对话框
  const handleSave = useCallback(() => {
    const title = extractTitle(content);
    setArticleSettings(prev => ({ ...prev, title }));
    setShowSettingsDialog(true);
  }, [content]);

  // 保存文章
  const saveArticle = async () => {
    try {
      setLoading(true);

      // 1. 上传 Markdown 内容到 OSS
      const markdownBlob = new Blob([content], { type: 'text/markdown' });
      const formData = new FormData();
      formData.append('file', markdownBlob, `${Date.now()}.md`);
      formData.append('type', 'tech'); // 指定文章类型

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || '上传文件失败');
      }

      const { url: ossPath } = await uploadResponse.json();

      // 2. 保存文章信息
      const response = await articlesService.createArticle({
        title: articleSettings.title,
        content,
        ossPath,
        categoryId: articleSettings.categoryId,
        status: articleSettings.status,
        createdAt: new Date().toISOString(),
      });

      if (response) {
        // 3. 跳转到文章列表页
        router.push('/admin/articles');
        message.success('保存成功');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
        <Title level={4} style={{ margin: 0 }}>新建文章</Title>
        <Space>
          <Button onClick={() => router.push('/admin/articles')} disabled={loading}>
            取消
          </Button>
          <Button type="primary" onClick={handleSave} loading={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </Space>
      </div>

      {/* 设置对话框 */}
      <Modal
        title="文章设置"
        open={showSettingsDialog}
        onCancel={() => setShowSettingsDialog(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowSettingsDialog(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setShowSettingsDialog(false);
              saveArticle();
            }}
          >
            确认并保存
          </Button>
        ]}
        width={500}
      >
        <div className="space-y-4">
          <div>
            <Typography.Text>文章标题</Typography.Text>
            <Input
              value={articleSettings.title}
              onChange={(e) => setArticleSettings(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Typography.Text>文章分类</Typography.Text>
            <Select
              value={articleSettings.categoryId}
              onChange={(value) => setArticleSettings(prev => ({ ...prev, categoryId: value }))}
              className="w-full mt-1"
              placeholder="请选择分类"
            >
              {categories.map(category => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Typography.Text>文章状态</Typography.Text>
            <Select
              value={articleSettings.status}
              onChange={(value) => setArticleSettings(prev => ({ ...prev, status: value }))}
              className="w-full mt-1"
            >
              <Option value={ArticleStatus.DRAFT}>草稿</Option>
              <Option value={ArticleStatus.PUBLISHED}>发布</Option>
            </Select>
          </div>
        </div>
      </Modal>

      <div className="flex-1 h-[calc(100vh-57px)]">
        <MarkdownEditor
          initialContent={content}
          onChange={setContent}
        />
      </div>
    </div>
  );
}
