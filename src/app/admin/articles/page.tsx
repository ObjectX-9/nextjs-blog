'use client';

import { useState, useEffect } from 'react';
import { Article, ArticleStatus, ArticleCategory } from '@/app/model/article';
import Link from 'next/link';

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles');
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('获取文章列表失败', 'error');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/articles/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      showToast('获取分类列表失败', 'error');
    }
  };

  // 删除文章
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      showToast('删除成功', 'success');
      fetchArticles();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  // 保存分类
  const handleSaveCategory = async (category: Partial<ArticleCategory>) => {
    try {
      const method = category._id ? 'PUT' : 'POST';
      const response = await fetch('/api/articles/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) {
        throw new Error('保存分类失败');
      }
      
      showToast('保存成功', 'success');
      fetchCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      showToast('保存分类失败', 'error');
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/categories?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除分类失败');
      }
      
      showToast('删除成功', 'success');
      fetchCategories();
    } catch (error) {
      showToast('删除分类失败', 'error');
    }
  };

  // 简单的 Toast 组件
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

  // 筛选文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchText.toLowerCase()) ||
      article.content.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || article.status === statusFilter;
    const matchesCategory = !categoryFilter || article.categoryId === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  // 分类管理模态框
  const CategoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <h2 className="text-xl font-bold mb-4">
          {editingCategory ? '编辑分类' : '新建分类'}
        </h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveCategory({
            _id: editingCategory?._id,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
          });
        }}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">分类名称</label>
            <input
              type="text"
              name="name"
              defaultValue={editingCategory?.name}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              name="description"
              defaultValue={editingCategory?.description}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowCategoryModal(false);
                setEditingCategory(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );

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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      article.status === ArticleStatus.PUBLISHED
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
      {showCategoryModal && <CategoryModal />}
    </div>
  );
};

export default ArticlesPage;