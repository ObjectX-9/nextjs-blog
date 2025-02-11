'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleCategory } from '@/app/model/article';
import { toast } from 'react-hot-toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChange: () => void;
}

export default function CategoryModal({ isOpen, onClose, onCategoriesChange }: CategoryModalProps) {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/articles/categories');
      if (!response.ok) throw new Error('获取分类列表失败');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('获取分类列表失败:', error);
      toast.error('获取分类列表失败');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // 添加分类
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('分类名称不能为空');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/articles/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '添加分类失败');
      }

      toast.success('添加分类成功');
      setNewCategoryName('');
      setNewCategoryDescription('');
      fetchCategories();
      onCategoriesChange();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 更新分类
  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      toast.error('分类名称不能为空');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/articles/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory._id,
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新分类失败');
      }

      toast.success('更新分类成功');
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryDescription('');
      fetchCategories();
      onCategoriesChange();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/articles/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除分类失败');
      }

      toast.success('删除分类成功');
      fetchCategories();
      onCategoriesChange();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 开始编辑分类
  const startEditing = (category: ArticleCategory) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  // 处理 ESC 键关闭
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // 添加键盘事件监听
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl m-4 p-6 overflow-y-auto max-h-[90vh]">
        {/* 标题 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold">管理分类</h2>
          <p className="text-sm text-gray-500 mt-1">
            在这里管理文章分类，包括添加、编辑和删除操作。
          </p>
        </div>

        {/* 添加/编辑表单 */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="分类名称"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="分类描述（可选）"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {editingCategory ? '更新分类' : '添加分类'}
            </button>
            {editingCategory && (
              <button
                onClick={cancelEditing}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                取消编辑
              </button>
            )}
          </div>
        </div>

        {/* 分类列表 */}
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {categories.map((category) => (
            <div
              key={category._id?.toString()}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="font-medium truncate">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-gray-500 truncate">{category.description}</div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => startEditing(category)}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id!.toString())}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 底部按钮 */}
        <div className="mt-6 flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
