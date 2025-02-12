'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleCategory } from '@/app/model/article';
import { Modal, Input, InputNumber, Checkbox, Select, Button, Space, Card, Tag, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

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
  const [newCategoryOrder, setNewCategoryOrder] = useState<number>(0);
  const [newCategoryIsTop, setNewCategoryIsTop] = useState<boolean>(false);
  const [newCategoryStatus, setNewCategoryStatus] = useState<'completed' | 'in_progress'>('in_progress');

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/articles/categories');
      if (!response.ok) throw new Error('获取分类列表失败');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败');
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
      message.error('分类名称不能为空');
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
          order: newCategoryOrder,
          isTop: newCategoryIsTop,
          status: newCategoryStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '添加分类失败');
      }

      message.success('添加分类成功');
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryOrder(0);
      setNewCategoryIsTop(false);
      setNewCategoryStatus('in_progress');
      fetchCategories();
      onCategoriesChange();
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 更新分类
  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      message.error('分类名称不能为空');
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
          order: newCategoryOrder,
          isTop: newCategoryIsTop,
          status: newCategoryStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新分类失败');
      }

      message.success('更新分类成功');
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryOrder(0);
      setNewCategoryIsTop(false);
      setNewCategoryStatus('in_progress');
      fetchCategories();
      onCategoriesChange();
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/articles/categories?id=${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || '删除分类失败');
          }

          message.success('删除分类成功');
          fetchCategories();
          onCategoriesChange();
        } catch (error: any) {
          message.error(error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 开始编辑分类
  const startEditing = (category: ArticleCategory) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setNewCategoryOrder(category.order || 0);
    setNewCategoryIsTop(category.isTop || false);
    setNewCategoryStatus(category.status || 'in_progress');
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryOrder(0);
    setNewCategoryIsTop(false);
    setNewCategoryStatus('in_progress');
  };

  return (
    <Modal
      title={
        <div>
          <Title level={5} style={{ margin: 0 }}>管理分类</Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            在这里管理文章分类，包括添加、编辑和删除操作。
          </Text>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
    >
      {/* 添加/编辑表单 */}
      <div className="mb-6 space-y-4">
        <Input
          placeholder="分类名称"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          disabled={loading}
        />
        <Input.TextArea
          placeholder="分类描述（可选）"
          value={newCategoryDescription}
          onChange={(e) => setNewCategoryDescription(e.target.value)}
          disabled={loading}
          rows={2}
        />
        <Space>
          <InputNumber
            placeholder="排序"
            value={newCategoryOrder}
            onChange={(value) => setNewCategoryOrder(value || 0)}
            disabled={loading}
            style={{ width: '100px' }}
          />
          <Checkbox
            checked={newCategoryIsTop}
            onChange={(e) => setNewCategoryIsTop(e.target.checked)}
            disabled={loading}
          >
            置顶
          </Checkbox>
          <Select
            value={newCategoryStatus}
            onChange={(value) => setNewCategoryStatus(value)}
            disabled={loading}
            style={{ width: '120px' }}
          >
            <Select.Option value="in_progress">进行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
          </Select>
        </Space>
        <Space>
          <Button
            type="primary"
            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            disabled={loading}
          >
            {editingCategory ? '更新分类' : '添加分类'}
          </Button>
          {editingCategory && (
            <Button onClick={cancelEditing} disabled={loading}>
              取消编辑
            </Button>
          )}
        </Space>
      </div>

      {/* 分类列表 */}
      <div className="space-y-2 max-h-[40vh] overflow-y-auto">
        {categories.map((category) => (
          <Card
            key={category._id?.toString()}
            size="small"
            className="mb-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <Space align="center">
                  <Text strong>{category.name}</Text>
                  {category.isTop && (
                    <Tag color="warning">置顶</Tag>
                  )}
                </Space>
                {category.description && (
                  <Paragraph type="secondary" style={{ marginBottom: 4 }}>
                    {category.description}
                  </Paragraph>
                )}
                <Space size="small">
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    排序: {category.order}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    状态: {category.status === 'completed' ? '已完成' : '进行中'}
                  </Text>
                </Space>
              </div>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => startEditing(category)}
                  disabled={loading}
                >
                  编辑
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleDeleteCategory(category._id!.toString())}
                  disabled={loading}
                >
                  删除
                </Button>
              </Space>
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  );
}
