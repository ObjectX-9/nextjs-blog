'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Article, ArticleStatus, ArticleCategory } from '@/app/model/article';

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
        showToast('获取文章失败', 'error');
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
        showToast('获取分类失败', 'error');
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

      showToast('保存成功', 'success');
      if (status === ArticleStatus.PUBLISHED) {
        router.push('/admin/articles');
      }
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败', 'error');
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">编辑文章</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button
            onClick={() => handleSave(ArticleStatus.PUBLISHED)}
            disabled={saving}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '发布文章'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">文章标题</label>
            <input
              type="text"
              value={article.title}
              onChange={e => setArticle({ ...article, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入文章标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">文章分类</label>
            <select
              value={article.categoryId || ''}
              onChange={e => setArticle({ ...article, categoryId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择分类</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 标签管理 */}
        <div>
          <label className="block text-sm font-medium mb-1">文章标签</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddTag()}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入标签名称并按回车添加"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              添加标签
            </button>
          </div>
        </div>

        {/* 文章摘要 */}
        <div>
          <label className="block text-sm font-medium mb-1">文章摘要</label>
          <textarea
            value={article.summary || ''}
            onChange={e => setArticle({ ...article, summary: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="请输入文章摘要"
          />
        </div>

        {/* 封面图片 */}
        <div>
          <label className="block text-sm font-medium mb-1">封面图片</label>
          <input
            type="text"
            value={article.coverImage || ''}
            onChange={e => setArticle({ ...article, coverImage: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入封面图片URL"
          />
        </div>

        {/* 文章内容编辑按钮 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">文章内容</label>
            <Link
              href={`/admin/articles/edit/${params.id}/content`}
              className="text-blue-500 hover:text-blue-600"
            >
              编辑内容
            </Link>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            {article.content ? (
              <div className="prose max-w-none">
                <div className="line-clamp-3 text-gray-600">
                  {article.content}
                </div>
              </div>
            ) : (
              <div className="text-gray-400">暂无内容</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArticlePage;
