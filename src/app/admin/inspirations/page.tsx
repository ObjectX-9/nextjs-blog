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
                      <path d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z" fill="#00AEEC"/>
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
                    <path d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z" fill="#00AEEC"/>
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
