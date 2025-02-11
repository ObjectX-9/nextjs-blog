'use client';

import { useState, useEffect } from 'react';
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
  const [showSidebar, setShowSidebar] = useState(true);

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
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
        <h1 className="text-xl font-semibold">新建文章</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-gray-600 hover:text-gray-800"
            title={showSidebar ? '隐藏目录' : '显示目录'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
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
      <div className="flex-1 h-[calc(100vh-57px)]">

        <MarkdownEditor
          initialContent={content}
          onChange={setContent}
        />
      </div>

      {/* 右侧固定目录 */}
      <div className={`fixed top-0 right-0 w-[20vw] h-screen bg-white shadow-xl transition-all duration-300 z-50 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="sticky top-0 h-screen overflow-y-auto bg-gradient-to-b from-white to-gray-50">
          <div className="p-6 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              目录
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-6 space-y-2">
            {content.split('\n')
              .filter(line => line.startsWith('#'))
              .map((heading, index) => {
                const level = heading.match(/^#+/)?.[0].length || 1;
                const text = heading.replace(/^#+\s+/, '');
                return (
                  <div
                    key={index}
                    className={`group flex items-center py-2 ${level === 1 ? 'text-gray-900 font-medium' : 'text-gray-600'} hover:text-blue-600 hover:bg-blue-50/50 rounded-lg cursor-pointer text-sm transition-all duration-200 ease-in-out`}
                    style={{ paddingLeft: `${(level - 1) * 1.25}rem` }}
                    onClick={() => {
                      const element = document.getElementById(text.toLowerCase().replace(/\s+/g, '-'));
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title={text}
                  >
                    <div className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-blue-500 mr-2 transition-colors duration-200"></div>
                    <span className="truncate">{text}</span>
                  </div>
                );
              })}
          </nav>
        </div>
      </div>
    </div>
  );
}
