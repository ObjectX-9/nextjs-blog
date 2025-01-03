'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { extractBilibiliInfo } from '@/app/utils/bilibili';

export default function NewInspiration() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [bilibiliInfo, setBilibiliInfo] = useState<{ bvid: string; page?: number } | null>(null);
  const [bilibiliError, setBilibiliError] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    if (bilibiliInfo) {
      alert('已添加视频，不能同时上传图片');
      return;
    }

    setUploading(true);
    const file = e.target.files[0];
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
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleBilibiliUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (!url) {
      setBilibiliInfo(null);
      setBilibiliError('');
      return;
    }

    if (images.length > 0) {
      alert('已上传图片，不能同时添加视频');
      return;
    }

    try {
      const info = extractBilibiliInfo(url);
      setBilibiliInfo(info);
      setBilibiliError('');
    } catch (error) {
      setBilibiliInfo(null);
      setBilibiliError((error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newInspiration = {
      title: formData.get('title'),
      content: formData.get('content'),
      status: formData.get('status'),
      tags: formData.get('tags')?.toString().split(',').map(tag => tag.trim()).filter(Boolean) || [],
      images: images,
      bilibili: bilibiliInfo
    };

    try {
      const response = await fetch('/api/inspirations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInspiration),
      });

      if (response.ok) {
        router.push('/admin/inspirations');
      }
    } catch (error) {
      console.error('Error creating inspiration:', error);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">新建灵感笔记</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片
                </label>
                <div className="mb-4">
                  <label
                    className={`flex justify-center items-center w-full h-32 px-4 transition bg-white border-2 ${bilibiliInfo
                        ? 'border-gray-200 cursor-not-allowed'
                        : 'border-gray-300 border-dashed cursor-pointer hover:border-blue-400'
                      } rounded-md appearance-none focus:outline-none`}>
                    <div className="flex flex-col items-center space-y-2">
                      <svg className={`w-6 h-6 ${bilibiliInfo ? 'text-gray-300' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        {bilibiliInfo ? (
                          <span className="text-gray-400">已添加视频，不能上传图片</span>
                        ) : (
                          <>
                            <span className="font-medium text-blue-600 hover:underline">选择图片</span>
                            <span className="text-gray-500"> 或拖拽文件到这里</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">支持 PNG, JPG, GIF 格式</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading || !!bilibiliInfo}
                    />
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group aspect-w-16 aspect-h-9 h-48">
                        <Image
                          src={image}
                          alt={`上传的图片 ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {uploading && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>正在上传...</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  B站视频链接
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    onChange={handleBilibiliUrlChange}
                    placeholder="输入B站视频链接，将自动解析BV号"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${images.length > 0
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300'
                      }`}
                    disabled={images.length > 0}
                  />
                  {images.length > 0 && (
                    <p className="text-gray-500 text-sm">已上传图片，不能添加视频</p>
                  )}
                  {bilibiliError && (
                    <p className="text-red-500 text-sm">{bilibiliError}</p>
                  )}
                  {bilibiliInfo && (
                    <div className="text-sm text-green-600">
                      已成功解析BV号: {bilibiliInfo.bvid}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  标签 (用逗号分隔)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  placeholder="技术, 生活, 想法"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  状态
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="draft"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">草稿</option>
                  <option value="published">发布</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                创建
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition duration-200"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
