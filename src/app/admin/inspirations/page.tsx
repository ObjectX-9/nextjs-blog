'use client';

import { useState, useEffect } from 'react';
import { IInspiration } from '@/app/model/inspiration';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function InspirationManagement() {
  const [inspirations, setInspirations] = useState<IInspiration[]>([]);
  const [loading, setLoading] = useState(true);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">灵感笔记管理</h1>
        <button
          onClick={() => router.push('/admin/inspirations/new')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          新建笔记
        </button>
      </div>

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
              <p className="text-gray-600 mb-4 line-clamp-3">{inspiration.content}</p>
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
