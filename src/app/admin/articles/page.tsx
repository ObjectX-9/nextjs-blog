'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article, ArticleStatus, ArticleCategory } from '@/app/model/article';
import Link from 'next/link';
import CategoryModal from '@/components/admin/CategoryModal';

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const handleCategoriesChange = () => {
    // 刷新分类列表
    fetchCategories();
  };

  // 获取文章列表
  const fetchArticles = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      const url = new URL('/api/articles', window.location.origin);
      if (category) {
        url.searchParams.set('categoryId', category);
      }
      const response = await fetch(url);
      const data = await response.json();
      console.log('API Response:', data);
      setArticles(data.articles || []);
    } catch (error) {
      console.error('获取文章列表失败:', error);
      showToast('获取文章列表失败', 'error');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/articles/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      showToast('获取分类列表失败', 'error');
    }
  }, []);

  // 删除文章
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      showToast('删除成功', 'success');
      fetchArticles(categoryFilter);
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  // 简单的 Toast 组件
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

  // 筛选文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchText.toLowerCase()) ||
      article.content.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchArticles(categoryFilter);
  }, [categoryFilter, fetchArticles]);

  return (
    <div className="p-6">
      {/* 头部 */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">技术文档管理</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            管理分类
          </button>

          {/* 分类管理模态框 */}
          <CategoryModal
            isOpen={showCategoryModal}
            onClose={() => setShowCategoryModal(false)}
            onCategoriesChange={handleCategoriesChange}
          />
          <Link
            href="/admin/articles/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            新建文档
          </Link>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-4 flex gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索文章标题或内容"
            className="w-[300px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {searchText && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchText('')}
            >
              ×
            </button>
          )}
        </div>
        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">全部分类</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as ArticleStatus | '')}
        >
          <option value="">全部状态</option>
          <option value={ArticleStatus.PUBLISHED}>已发布</option>
          <option value={ArticleStatus.DRAFT}>草稿</option>
        </select>
      </div>

      {/* 文章列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">更新时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>加载中...</span>
                  </div>
                </td>
              </tr>
            ) : filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              filteredArticles.map(article => (
                <tr key={article._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/articles/edit/${article._id}`} className="text-blue-500 hover:text-blue-600">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {categories.find(c => c._id === article.categoryId)?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${article.status === ArticleStatus.PUBLISHED
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                      }`}>
                      {article.status === ArticleStatus.PUBLISHED ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/articles/edit/${article._id}`}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(article._id!)}
                        className="text-red-500 hover:text-red-600"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分类管理模态框 */}
      {showCategoryModal && <CategoryModal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} onCategoriesChange={handleCategoriesChange} />}
    </div>
  );
};

export default ArticlesPage;