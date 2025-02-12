'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article, ArticleStatus, ArticleCategory } from '@/app/model/article';
import Link from 'next/link';
import CategoryModal from '@/components/admin/CategoryModal';
import { Table, Input, Select, Button, Space, message as antMessage, Tag } from 'antd';
import { PlusOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;

// 表格列配置
const getColumns = (categories: ArticleCategory[], handleDelete: (id: string) => void): ColumnsType<Article> => [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    render: (text: string, record: Article) => (
      <Link href={`/admin/articles/edit/${record._id}`} className="text-blue-500 hover:text-blue-600">
        {text}
      </Link>
    ),
  },
  {
    title: '分类',
    dataIndex: 'categoryId',
    key: 'category',
    render: (categoryId: string) => categories.find(c => c._id === categoryId)?.name || '-',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: ArticleStatus) => (
      <Tag color={status === ArticleStatus.PUBLISHED ? 'success' : 'warning'}>
        {status === ArticleStatus.PUBLISHED ? '已发布' : '草稿'}
      </Tag>
    ),
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
  },
  {
    title: '操作',
    key: 'action',
    render: (_: any, record: Article) => (
      <Space size="middle">
        <Link href={`/admin/articles/edit/${record._id}`} className="text-blue-500 hover:text-blue-600">
          编辑
        </Link>
        <Button type="link" danger onClick={() => handleDelete(record._id!)}>
          删除
        </Button>
      </Space>
    ),
  },
];

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 获取文章列表
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('获取文章列表失败');
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('获取文章列表失败:', error);
      antMessage.error('获取文章列表失败');
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
      antMessage.error('获取分类列表失败');
    }
  }, []);

  // 删除文章
  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      antMessage.success('删除成功');
      fetchArticles();
    } catch (error) {
      antMessage.error('删除失败');
    }
  }, [fetchArticles]);

  // 处理搜索和筛选
  useEffect(() => {
    let filtered = [...articles];

    // 应用分类筛选
    if (categoryFilter) {
      filtered = filtered.filter(article => article.categoryId === categoryFilter);
    }

    // 应用状态筛选
    if (statusFilter) {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    // 应用搜索（只搜索标题）
    if (searchText.trim()) {
      const searchRegex = new RegExp(searchText.trim(), 'i');
      filtered = filtered.filter(article => 
        searchRegex.test(article.title || '')
      );
    }

    setFilteredArticles(filtered);
  }, [articles, searchText, statusFilter, categoryFilter]);

  // 初始化加载
  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [fetchCategories, fetchArticles]);

  return (
    <div className="p-6">
      {/* 头部 */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">技术文档管理</h1>
        <Space>
          <Button
            type="primary"
            icon={<ApartmentOutlined />}
            onClick={() => setShowCategoryModal(true)}
            style={{ background: '#22c55e' }}
          >
            管理分类
          </Button>
          <Link href="/admin/articles/new" passHref>
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#3b82f6' }}>
              新建文档
            </Button>
          </Link>
        </Space>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-4 flex gap-4">
        <Search
          placeholder="搜索文章标题"
          allowClear
          style={{ width: 300 }}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <Select
          style={{ width: 200 }}
          value={categoryFilter}
          onChange={setCategoryFilter}
          placeholder="选择分类"
          allowClear
        >
          <Select.Option value="">全部分类</Select.Option>
          {categories.map(category => (
            <Select.Option key={category._id} value={category._id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
        <Select
          style={{ width: 200 }}
          value={statusFilter}
          onChange={value => setStatusFilter(value)}
          placeholder="选择状态"
          allowClear
        >
          <Select.Option value="">全部状态</Select.Option>
          <Select.Option value={ArticleStatus.PUBLISHED}>已发布</Select.Option>
          <Select.Option value={ArticleStatus.DRAFT}>草稿</Select.Option>
        </Select>
      </div>

      {/* 文章列表 */}
      <Table
        columns={getColumns(categories, handleDelete)}
        dataSource={filteredArticles}
        rowKey="_id"
        loading={loading}
        pagination={{
          total: filteredArticles.length,
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true
        }}
      />

      {/* 分类管理模态框 */}
      {showCategoryModal && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategoriesChange={fetchCategories}
        />
      )}
    </div>
  );
};

export default ArticlesPage;