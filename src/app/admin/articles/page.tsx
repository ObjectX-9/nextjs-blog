'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Article, ArticleStatus, ArticleCountByCategory, PaginatedArticles } from '@/app/model/article';
import Link from 'next/link';
import CategoryModal from '@/components/admin/CategoryModal';
import { Table, Input, Select, Button, Space, message as antMessage, Tag } from 'antd';
import { PlusOutlined, ApartmentOutlined, HolderOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { articlesService } from '@/app/business/articles';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


// 拖拽行组件
interface DragableRowProps {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  'data-row-key'?: string;
}

const DragableRow: React.FC<DragableRowProps> = ({ index, moveRow, className, style, children, ...restProps }) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop<
    { index: number },
    void,
    { handlerId: unknown }
  >({
    accept: 'row',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag<
    { index: number },
    void,
    { isDragging: boolean }
  >({
    type: 'row',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      className={className}
      style={{ cursor: 'move', opacity, ...style }}
      data-handler-id={handlerId}
      {...restProps}
    >
      {children}
    </tr>
  );
};

// 缓存管理类
class ArticleCache {
  private cache = new Map<string, { data: PaginatedArticles; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存时间

  // 生成缓存键
  private getCacheKey(params: any): string {
    return JSON.stringify(params);
  }

  // 获取缓存数据
  get(params: any): PaginatedArticles | null {
    const key = this.getCacheKey(params);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // 设置缓存数据
  set(params: any, data: PaginatedArticles): void {
    const key = this.getCacheKey(params);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 清空缓存
  clear(): void {
    this.cache.clear();
  }

  // 根据模式清除缓存
  clearByPattern(pattern: RegExp): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

const articleCache = new ArticleCache();

const { Search } = Input;

// 表格列配置
const getColumns = (
  categories: ArticleCountByCategory[],
  handleDelete: (id: string) => void,
  canSort: boolean
): ColumnsType<Article> => {
  const baseColumns: ColumnsType<Article> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Article) => (
        <Space>
          {canSort && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
          <Link href={`/admin/articles/edit/${record._id}`} className="text-blue-500 hover:text-blue-600">
            {text}
          </Link>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'category',
      render: (categoryId: string) => categories.find(c => c.categoryId === categoryId)?.categoryName || '-',
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
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 100,
      render: (order: number) => order || 0,
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
          <Button type="link" danger onClick={() => handleDelete(record._id!.toString())}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return baseColumns;
};

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [originalArticles, setOriginalArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCountByCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'order'>('order');

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 防抖搜索
  const [searchDebounced, setSearchDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // 判断是否可以排序
  const canSort = useMemo(() => {
    return sortBy === 'order' && !searchDebounced && !statusFilter && categoryFilter !== '';
  }, [sortBy, searchDebounced, statusFilter, categoryFilter]);

  // 获取文章列表（带缓存）
  const fetchArticles = useCallback(async (params?: any) => {
    // 如果没有传入参数，构建当前参数
    const requestParams = params || {
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sortBy,
      ...(statusFilter && { status: statusFilter }),
      ...(categoryFilter && { categoryId: categoryFilter }),
      ...(searchDebounced && { search: searchDebounced }),
    };

    try {
      setLoading(true);

      // 先尝试从缓存获取
      const cached = articleCache.get(requestParams);
      if (cached) {
        console.log('💾 从缓存获取数据:', {
          itemsCount: cached.items?.length || 0,
          pagination: cached.pagination,
          requestParams
        });
        setArticles(cached.items || []);
        setOriginalArticles(cached.items || []);
        setPagination(prev => ({
          ...prev,
          total: cached.pagination.total || 0,
        }));
        setLoading(false);
        return;
      }

      const response = await articlesService.getArticles(requestParams);
      // 缓存数据
      articleCache.set(requestParams, response);

      setArticles(response.items || []);
      setOriginalArticles(response.items || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total || 0,
      }));
    } catch (error) {
      antMessage.error('获取文章列表失败');
      setArticles([]);
      setOriginalArticles([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await articlesService.getArticleCountByCategory();
      setCategories(response || []);
    } catch (error) {
      antMessage.error('获取分类列表失败');
    }
  }, []);

  // 删除文章
  const handleDelete = useCallback(async (id: string) => {
    try {
      await articlesService.deleteArticle(id);
      antMessage.success('删除成功');

      // 清理缓存
      articleCache.clear();

      // 构建当前页请求参数，重新获取当前页数据
      const refreshParams: any = {
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: sortBy
      };

      if (statusFilter) {
        refreshParams.status = statusFilter;
      }
      if (categoryFilter) {
        refreshParams.categoryId = categoryFilter;
      }
      if (searchDebounced) {
        refreshParams.search = searchDebounced;
      }

      fetchArticles(refreshParams);
    } catch (error) {
      antMessage.error('删除失败');
    }
  }, [fetchArticles, pagination.current, pagination.pageSize, statusFilter, categoryFilter, searchDebounced, sortBy]);

  // 处理拖拽排序
  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (!canSort) return;

      const draggedRow = articles[dragIndex];
      const newArticles = [...articles];
      newArticles.splice(dragIndex, 1);
      newArticles.splice(hoverIndex, 0, draggedRow);

      setArticles(newArticles);
    },
    [articles, canSort]
  );

  // 保存排序
  const saveOrder = useCallback(async () => {
    if (!canSort || JSON.stringify(articles) === JSON.stringify(originalArticles)) {
      return;
    }

    try {
      setLoading(true);

      // 重新计算order值
      const updatedArticles = articles.map((article, index) => ({
        _id: article._id!,
        order: index + 1
      }));

      await articlesService.updateArticlesOrder(updatedArticles);
      antMessage.success('排序保存成功');

      // 清理缓存并重新获取数据
      articleCache.clear();
      setOriginalArticles([...articles]);

      const refreshParams: any = {
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: sortBy,
        categoryId: categoryFilter
      };

      fetchArticles(refreshParams);
    } catch (error) {
      antMessage.error('排序保存失败');
      // 恢复原始顺序
      setArticles([...originalArticles]);
    } finally {
      setLoading(false);
    }
  }, [articles, originalArticles, canSort, pagination.current, pagination.pageSize, sortBy, categoryFilter, fetchArticles]);

  // 重置排序
  const resetOrder = useCallback(() => {
    setArticles([...originalArticles]);
  }, [originalArticles]);

  // 处理分页变化
  const handleTableChange = useCallback((paginationConfig: { current: number; pageSize: number }) => {
    const { current: newCurrent, pageSize: newPageSize } = paginationConfig;

    // 先更新分页状态
    setPagination(prev => ({
      ...prev,
      current: newCurrent,
      pageSize: newPageSize,
    }));

    // 立即构建新的请求参数并获取数据
    const newParams: any = {
      page: newCurrent,
      limit: newPageSize,
      sortBy: sortBy
    };

    // 添加当前的筛选条件
    if (statusFilter) {
      newParams.status = statusFilter;
    }
    if (categoryFilter) {
      newParams.categoryId = categoryFilter;
    }
    if (searchDebounced) {
      newParams.search = searchDebounced;
    }

    fetchArticles(newParams);
  }, [statusFilter, categoryFilter, searchDebounced, fetchArticles, sortBy]);

  // 处理筛选条件变化
  useEffect(() => {
    // 重置到第一页并立即请求数据
    const resetParams: any = {
      page: 1,
      limit: pagination.pageSize,
      sortBy: sortBy
    };

    if (statusFilter) {
      resetParams.status = statusFilter;
    }
    if (categoryFilter) {
      resetParams.categoryId = categoryFilter;
    }
    if (searchDebounced) {
      resetParams.search = searchDebounced;
    }

    setPagination(prev => ({ ...prev, current: 1 }));
    fetchArticles(resetParams);
  }, [statusFilter, categoryFilter, searchDebounced, fetchArticles, pagination.pageSize, sortBy]);

  // 首次加载数据
  useEffect(() => {
    fetchArticles();
  }, []);

  // 初始化加载分类
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 检查是否有未保存的排序变化
  const hasOrderChanges = useMemo(() => {
    return JSON.stringify(articles) !== JSON.stringify(originalArticles);
  }, [articles, originalArticles]);

  return (
    <DndProvider backend={HTML5Backend}>
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
        <div className="mb-4 flex gap-4 flex-wrap items-center">
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
            {categories?.map(category => (
              <Select.Option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
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
          <Select
            style={{ width: 200 }}
            value={sortBy}
            onChange={value => setSortBy(value)}
            placeholder="排序方式"
          >
            <Select.Option value="latest">按时间排序</Select.Option>
            <Select.Option value="order">按自定义排序</Select.Option>
          </Select>
        </div>

        {/* 排序提示和操作 */}
        {canSort && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-blue-700">
                <HolderOutlined className="mr-2" />
                当前可进行拖拽排序，拖拽行可调整文章顺序
              </div>
              <Space>
                {hasOrderChanges && (
                  <>
                    <Button onClick={resetOrder} size="small">
                      重置
                    </Button>
                    <Button
                      type="primary"
                      onClick={saveOrder}
                      size="small"
                      loading={loading}
                    >
                      保存排序
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        )}

        {/* 文章列表 */}
        <Table
          columns={getColumns(categories, handleDelete, canSort)}
          dataSource={articles}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total, range) => {
              const currentPageCount = articles.length;
              return `第 ${range[0]}-${range[1]} 条，共 ${total} 条 (当前页: ${currentPageCount} 条)`;
            },
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, pageSize) => {
              handleTableChange({ current: page, pageSize });
            },
            onShowSizeChange: (current, size) => {
              handleTableChange({ current, pageSize: size });
            },
          }}
          components={canSort ? {
            body: {
              row: (props: any) => {
                const index = articles.findIndex(x => x._id === props['data-row-key']);
                return <DragableRow index={index} moveRow={moveRow} {...props} />;
              },
            },
          } : undefined}
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
    </DndProvider>
  );
};

export default ArticlesPage;