"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Tag, message, Modal, Form, Input, DatePicker } from "antd";
import {
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Pause,
  Plus,
  Filter,
  Calendar,
  User
} from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/todo";
import { todosBusiness } from "../business/todos";

// 状态配置
const statusConfig = {
  [TodoStatus.TODO]: { label: "待办", color: "bg-gray-100 text-gray-800", icon: Square },
  [TodoStatus.IN_PROGRESS]: { label: "进行中", color: "bg-blue-100 text-blue-800", icon: Clock },
  [TodoStatus.COMPLETED]: { label: "已完成", color: "bg-green-100 text-green-800", icon: CheckSquare },
  [TodoStatus.DELAYED]: { label: "已延期", color: "bg-yellow-100 text-yellow-800", icon: Pause },
  [TodoStatus.CANCELLED]: { label: "已取消", color: "bg-red-100 text-red-800", icon: AlertCircle },
  [TodoStatus.DELETED]: { label: "已删除", color: "bg-gray-100 text-gray-500", icon: AlertCircle },
  [TodoStatus.ARCHIVED]: { label: "已归档", color: "bg-purple-100 text-purple-800", icon: CheckSquare },
};

// 优先级配置
const priorityConfig = {
  1: { label: "低", color: "bg-green-100 text-green-800" },
  2: { label: "中低", color: "bg-blue-100 text-blue-800" },
  3: { label: "中", color: "bg-yellow-100 text-yellow-800" },
  4: { label: "高", color: "bg-orange-100 text-orange-800" },
  5: { label: "紧急", color: "bg-red-100 text-red-800" },
};

// 获取状态颜色
const getStatusColor = (status: TodoStatus) => {
  switch (status) {
    case TodoStatus.TODO: return 'default';
    case TodoStatus.IN_PROGRESS: return 'blue';
    case TodoStatus.COMPLETED: return 'green';
    case TodoStatus.DELAYED: return 'orange';
    case TodoStatus.CANCELLED: return 'red';
    case TodoStatus.DELETED: return 'default';
    case TodoStatus.ARCHIVED: return 'purple';
    default: return 'default';
  }
};

// 获取优先级颜色
const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1: return 'green';
    case 2: return 'blue';
    case 3: return 'gold';
    case 4: return 'orange';
    case 5: return 'red';
    default: return 'default';
  }
};

// Todo 骨架屏组件
const TodoSkeleton = () => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
};

// Todo 项组件
const TodoItem = ({
  todo,
  onStatusChange,
  onDelete
}: {
  todo: ITodo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
}) => {
  const StatusIcon = statusConfig[todo.status].icon;
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() &&
    todo.status !== TodoStatus.COMPLETED && todo.status !== TodoStatus.CANCELLED;

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusToggle = () => {
    const newStatus = todo.status === TodoStatus.COMPLETED ? TodoStatus.TODO : TodoStatus.COMPLETED;
    onStatusChange(todo._id!, newStatus);
  };

  return (
    <Card className={`p-4 transition-all hover:shadow-md ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="space-y-3">
        {/* 标题和状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={handleStatusToggle}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <StatusIcon size={18} className={todo.status === TodoStatus.COMPLETED ? 'text-green-600' : 'text-gray-400'} />
            </button>
            <h3 className={`font-medium ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-500' : ''}`}>
              {todo.title}
            </h3>
          </div>
          <Tag color={getStatusColor(todo.status)}>
            {statusConfig[todo.status].label}
          </Tag>
        </div>

        {/* 描述 */}
        <p className="text-sm text-gray-600 ml-7">{todo.description}</p>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 优先级 */}
            <Tag color={getPriorityColor(todo.priority || 3)}>
              {priorityConfig[todo.priority || 3].label}
            </Tag>

            {/* 截止日期 */}
            {todo.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                <Calendar size={14} />
                {formatDate(todo.dueDate)}
              </div>
            )}

            {/* 子任务数量 */}
            {todo.subTasks && todo.subTasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User size={14} />
                {todo.subTasks.length} 子任务
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(todo._id!, TodoStatus.IN_PROGRESS)}
              disabled={todo.status === TodoStatus.IN_PROGRESS}
            >
              开始
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(todo._id!)}
              className="text-red-600 hover:text-red-700"
            >
              删除
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function TodosPage() {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // 获取 Todo 列表
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { includeSubTasks: true };

      if (selectedProject !== "all") {
        params.projectId = selectedProject;
      }

      if (selectedStatus !== "all") {
        params.status = selectedStatus as TodoStatus;
      }

      const todoList = await todosBusiness.getTodos(params);
      setTodos(todoList);
    } catch (error) {
      message.error("获取待办事项失败: " + error);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedStatus]);

  // 获取统计信息
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await todosBusiness.getTodoStats();
      setStats(statsData);
    } catch (error) {
      console.error("获取统计信息失败:", error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 处理状态变更
  const handleStatusChange = async (id: string, status: TodoStatus) => {
    try {
      await todosBusiness.updateTodo(id, { status });
      message.success("状态更新成功");
      fetchTodos();
      fetchStats();
    } catch (error) {
      message.error("状态更新失败: " + error);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await todosBusiness.deleteTodo(id);
      message.success("删除成功");
      fetchTodos();
      fetchStats();
    } catch (error) {
      message.error("删除失败: " + error);
    }
  };

  // 处理创建 Todo
  const handleCreateTodo = async (values: any) => {
    try {
      const todoData = {
        title: values.title,
        description: values.description,
        status: TodoStatus.TODO,
        projectId: values.projectId || 'default-project',
        priority: values.priority || 3,
        color: '#3B82F6',
        ...(values.dueDate && { dueDate: values.dueDate.toDate() }),
      };

      await todosBusiness.createTodo(todoData);
      message.success("创建成功");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchTodos();
      fetchStats();
    } catch (error) {
      message.error("创建失败: " + error);
    }
  };

  // 获取项目列表（从 todos 中提取唯一项目ID）
  const projectIds = Array.from(new Set(todos.map(todo => todo.projectId).filter(Boolean)));

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto custom-scrollbar-thin">
      {/* 头部 */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">待办事项</h1>
            <p className="text-gray-600 mt-1">管理您的任务和项目进度</p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            新建任务
          </Button>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">总任务</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">已完成</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">逾期</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">完成率</div>
            </Card>
          </div>
        )}

        {/* 筛选器 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm font-medium">筛选：</span>
          </div>

          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 200 }}
            placeholder="选择项目"
          >
            <Select.Option value="all">所有项目</Select.Option>
            {projectIds.map(projectId => (
              <Select.Option key={projectId} value={projectId!}>
                项目 {projectId}
              </Select.Option>
            ))}
          </Select>

          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 200 }}
            placeholder="选择状态"
          >
            <Select.Option value="all">所有状态</Select.Option>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Select.Option key={status} value={status}>
                {config.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Todo 列表 */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="grid gap-4">
            {Array(6).fill(0).map((_, index) => (
              <TodoSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : todos.length > 0 ? (
          <div className="grid gap-4">
            {todos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待办事项</h3>
            <p className="text-gray-600">创建您的第一个任务开始管理工作吧！</p>
          </div>
        )}
      </div>

      {/* 创建 Todo 模态框 */}
      <Modal
        title="新建任务"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTodo}
        >
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="输入任务标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <Input.TextArea rows={3} placeholder="输入任务描述" />
          </Form.Item>

          <Form.Item
            name="projectId"
            label="所属项目"
          >
            <Input placeholder="输入项目ID（可选）" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="priority"
              label="优先级"
              style={{ flex: 1 }}
            >
              <Select placeholder="选择优先级">
                <Select.Option value={1}>低</Select.Option>
                <Select.Option value={2}>中低</Select.Option>
                <Select.Option value={3}>中</Select.Option>
                <Select.Option value={4}>高</Select.Option>
                <Select.Option value={5}>紧急</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="截止日期"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择截止日期"
              />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建任务
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
} 