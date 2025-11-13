'use client';

import { useState, useEffect, useCallback } from 'react';
import { IExternalArticle, IExternalArticleCategory } from '@/app/model/external-article';
import { externalArticlesService } from '@/app/business/external-articles';
import { externalArticleCategoriesService } from '@/app/business/external-article-categories';
import { message, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Card, ColorPicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, FolderOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function ExternalArticlesAdminPage() {
  const [articles, setArticles] = useState<IExternalArticle[]>([]);
  const [categories, setCategories] = useState<IExternalArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<IExternalArticle | null>(null);
  const [editingCategory, setEditingCategory] = useState<IExternalArticleCategory | null>(null);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const data = await externalArticleCategoriesService.getCategories();
      setCategories(data);
    } catch (error) {
      message.error('获取分类失败: ' + error);
    }
  }, []);

  // 获取外部文章列表
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await externalArticlesService.getExternalArticles({
        page: 1,
        limit: 100
      });
      setArticles(data.items);
    } catch (error) {
      message.error('获取外部文章失败: ' + error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [fetchCategories, fetchArticles]);

  // 打开新增/编辑弹窗
  const openModal = (article?: IExternalArticle) => {
    setEditingArticle(article || null);
    setModalVisible(true);
    if (article) {
      form.setFieldsValue(article);
    } else {
      form.resetFields();
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setEditingArticle(null);
    form.resetFields();
  };

  // 打开分类弹窗
  const openCategoryModal = (category?: IExternalArticleCategory) => {
    setEditingCategory(category || null);
    setCategoryModalVisible(true);
    if (category) {
      categoryForm.setFieldsValue(category);
    } else {
      categoryForm.resetFields();
    }
  };

  // 关闭分类弹窗
  const closeCategoryModal = () => {
    setCategoryModalVisible(false);
    setEditingCategory(null);
    categoryForm.resetFields();
  };

  // 保存外部文章
  const handleSave = async (values: any) => {
    try {
      if (editingArticle) {
        await externalArticlesService.updateExternalArticle(editingArticle._id!, values);
        message.success('更新成功');
      } else {
        await externalArticlesService.createExternalArticle(values);
        message.success('创建成功');
      }
      closeModal();
      fetchArticles();
    } catch (error) {
      message.error('保存失败: ' + error);
    }
  };

  // 删除外部文章
  const handleDelete = async (id: string) => {
    try {
      await externalArticlesService.deleteExternalArticle(id);
      message.success('删除成功');
      fetchArticles();
    } catch (error) {
      message.error('删除失败: ' + error);
    }
  };

  // 保存分类
  const handleSaveCategory = async (values: any) => {
    try {
      if (editingCategory) {
        await externalArticleCategoriesService.updateCategory(editingCategory._id!, values);
        message.success('更新成功');
      } else {
        await externalArticleCategoriesService.createCategory(values);
        message.success('创建成功');
      }
      closeCategoryModal();
      fetchCategories();
    } catch (error) {
      message.error('保存失败: ' + error);
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id: string) => {
    try {
      await externalArticleCategoriesService.deleteCategory(id);
      message.success('删除成功');
      fetchCategories();
    } catch (error) {
      message.error('删除失败: ' + error);
    }
  };

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || '未知分类';
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: IExternalArticle) => (
        <a href={record.url} target="_blank" rel="noopener noreferrer">
          <LinkOutlined className="mr-2" />
          {text}
        </a>
      ),
    },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
          {url.length > 50 ? url.substring(0, 50) + '...' : url}
        </a>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: string) => getCategoryName(categoryId),
    },
    {
      title: '收录时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: IExternalArticle) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这篇外部文章吗？"
            onConfirm={() => handleDelete(record._id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">外部文章管理</h1>
          <Space>
            <Button
              icon={<FolderOutlined />}
              onClick={() => openCategoryModal()}
            >
              管理分类
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              收录外部文章
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={articles}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingArticle ? '编辑外部文章' : '收录外部文章'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="title"
            label="文章标题"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item
            name="url"
            label="文章链接"
            rules={[
              { required: true, message: '请输入文章链接' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input placeholder="https://example.com/article" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(category => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingArticle ? '更新' : '收录'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 分类管理弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={categoryModalVisible}
        onCancel={closeCategoryModal}
        footer={null}
        width={600}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleSaveCategory}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="分类描述"
          >
            <Input.TextArea placeholder="请输入分类描述（可选）" rows={3} />
          </Form.Item>

          <Form.Item
            name="color"
            label="分类颜色"
            initialValue="#3B82F6"
          >
            <Input placeholder="#3B82F6" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={closeCategoryModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 现有分类列表 */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-medium mb-4">现有分类</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-500">{category.description}</div>
                    )}
                  </div>
                </div>
                <Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openCategoryModal(category)}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定要删除这个分类吗？"
                    onConfirm={() => handleDeleteCategory(category._id!)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
