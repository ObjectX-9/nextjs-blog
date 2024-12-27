'use client';

import { useState, useEffect } from 'react';
import { IInspiration } from '@/app/model/inspiration';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
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

        uploadedUrls.push(data.url);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* 弹窗头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">快速发送灵感笔记</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="p-6">
          <textarea
            placeholder="写下你的想法..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />

          {/* 图片预览区域 */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 操作按钮区域 */}
          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="image-upload"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => document.getElementById('image-upload')?.click()}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                添加图片
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${isSubmitting || !content.trim()
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white transition-colors'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
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
      }
    } catch (error) {
      console.error('Error creating inspiration:', error);
    }
  };

  // 删除灵感笔记
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条灵感笔记吗？')) return;

    try {
      await fetch(`/api/inspirations/${id}`, {
        method: 'DELETE',
      });
      fetchInspirations();
    } catch (error) {
      console.error('Error deleting inspiration:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[100vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">灵感笔记管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setQuickPostOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            快速发送
          </button>
          <button
            onClick={() => router.push('/admin/inspirations/new')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            新建笔记
          </button>
        </div>
      </div>

      <QuickInspirationDialog
        open={quickPostOpen}
        onOpenChange={setQuickPostOpen}
        onSubmit={handleQuickPost}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inspirations.map((inspiration) => (
          <div
            key={inspiration._id?.toString()}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {inspiration.title}
                </h2>
                <span className={`px-2 py-1 rounded text-sm ${inspiration.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {inspiration.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
              {inspiration.images && inspiration.images.length > 0 && (
                <div className="relative h-48 w-full">
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
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-5 h-5" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z" fill="#00AEEC" />
                    </svg>
                    <span>BV号: {inspiration.bilibili.bvid}</span>
                    {inspiration.bilibili.title && (
                      <span className="truncate">标题: {inspiration.bilibili.title}</span>
                    )}
                  </div>
                </div>
              )}
              <p className="text-gray-600 mb-4 line-clamp-3">{inspiration.content}</p>
              {inspiration.bilibili && (
                <div className="mb-4 flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-5 h-5" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z" fill="#00AEEC" />
                  </svg>
                  <span>BV号: {inspiration.bilibili.bvid}</span>
                  {inspiration.bilibili.title && (
                    <span className="truncate">标题: {inspiration.bilibili.title}</span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {inspiration.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>浏览: {inspiration.views}</span>
                <span>点赞: {inspiration.likes}</span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => router.push(`/admin/inspirations/${inspiration._id}/edit`)}
                  className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded border border-blue-500 hover:border-blue-600 transition duration-200"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(inspiration._id?.toString() || '')}
                  className="text-red-500 hover:text-red-600 px-3 py-1 rounded border border-red-500 hover:border-red-600 transition duration-200"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
