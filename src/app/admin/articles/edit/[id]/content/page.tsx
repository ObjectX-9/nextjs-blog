'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarkdownEditor } from '@/components/customMdRender/components/MarkdownEditor';
import '@/styles/markdown.css';

const EditArticleContent = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [initialContent, setInitialContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 获取文章内容
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles?id=${params.id}`);
        const data = await response.json();
        setInitialContent(data.content || '');
      } catch (error) {
        showToast('获取文章失败', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  // 保存内容
  const handleSave = async (content: string) => {
    try {
      setSaving(true);

      // 1. 上传 Markdown 文件到 OSS
      const markdownBlob = new Blob([content], { type: 'text/markdown' });
      const formData = new FormData();
      formData.append('file', markdownBlob, 'article.md');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('上传文件失败');
      }

      const { url: ossPath } = await uploadResponse.json();

      // 2. 更新文章内容
      const response = await fetch(`/api/articles?id=${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ossPath,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      showToast('保存成功', 'success');
      router.back();
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toast 提示
  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部工具栏 */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          返回
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const editor = document.querySelector('textarea');
              if (editor) {
                handleSave(editor.value);
              }
            }}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* Markdown编辑器 */}
      <div className="flex-1 overflow-hidden">
        <MarkdownEditor
          initialContent={initialContent}
          onChange={(content) => {
            // 这里可以处理内容变化
            console.log('Content changed:', content);
          }}
        />
      </div>
    </div>
  );
};

export default EditArticleContent;
