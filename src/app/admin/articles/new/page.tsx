'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Article, ArticleStatus } from '@/app/model/article';
import { MarkdownEditor } from '@/components/customMdRender/components/MarkdownEditor';

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
      const title = extractTitle(content);
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          ossPath,
          status: ArticleStatus.DRAFT,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存文章失败');
      }

      // 3. 跳转到文章列表页
      router.push('/admin/articles');
    } catch (error: any) {
      console.error('保存文章失败:', error);
      alert(error.message || '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-semibold">新建文章</h1>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={saveArticle}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
      <div className="flex-1">
        <MarkdownEditor
          initialContent={content}
          onChange={setContent}
        />
      </div>
    </div>
  );
}
