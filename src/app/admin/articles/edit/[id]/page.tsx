'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Article, ArticleStatus } from '@/app/model/article';
import { MarkdownEditor } from '@/components/customMdRender/components/MarkdownEditor';

interface EditArticlePageProps {
  params: {
    id: string;
  };
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles?id=${params.id}`);
      if (!response.ok) {
        throw new Error('文章不存在');
      }
      const data = await response.json();
      setArticle(data);
      setContent(data.content || '');
      console.log('加载文章:', data);
    } catch (error) {
      console.error('获取文章失败:', error);
      showToast('获取文章失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;

    try {
      setSaving(true);

      // 1. 上传 Markdown 文件
      const markdownFile = new File([content], 'article.md', { type: 'text/markdown' });
      const formData = new FormData();
      formData.append('file', markdownFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('上传文件失败');
      }

      const { url: ossPath } = await uploadResponse.json();

      // 2. 更新文章信息
      const title = extractTitle(content);
      const response = await fetch(`/api/articles?id=${article._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...article,
          title,
          content,
          ossPath,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存文章失败');
      }

      showToast('保存成功', 'success');
      router.push('/admin/articles');
    } catch (error) {
      console.error('保存失败:', error);
      showToast((error as Error).message || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const extractTitle = (content: string): string => {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.slice(2).trim();
      }
    }
    return '无标题';
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } transition-opacity duration-500`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">文章不存在</h1>
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">编辑文章</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
              saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            } transition-colors`}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <MarkdownEditor
        initialContent={content}
        onChange={setContent}
      />
    </div>
  );
}
