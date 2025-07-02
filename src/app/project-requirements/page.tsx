"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button as UIButton } from "@/components/ui/button";
import { Select, Tag, message, Modal, Form, Input, DatePicker, Button } from "antd";
import dayjs from 'dayjs';

import {
  Target,
  Square,
  Clock,
  AlertCircle,
  Pause,
  Plus,
  Filter,
  Calendar,
  Code,
  Briefcase,
  User,
  Edit,
  FileText,
  Settings,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { IProjectRequirements, ProjectRequirementsStatus, ProjectRequirementsType } from "@/app/model/project-requirements";
import { projectRequirementsBusiness } from "../business/project-requirements";
import { ITodo, TodoStatus } from "@/app/model/todo";
import { todosBusiness } from "../business/todos";
import { IStack } from "@/app/model/stack";
import { stacksBusiness } from "../business/stacks";

// 状态配置
const statusConfig = {
  [ProjectRequirementsStatus.TODO]: { label: "待办", color: "bg-gray-100 text-gray-800", icon: Square },
  [ProjectRequirementsStatus.IN_PROGRESS]: { label: "进行中", color: "bg-blue-100 text-blue-800", icon: Clock },
  [ProjectRequirementsStatus.COMPLETED]: { label: "已完成", color: "bg-green-100 text-green-800", icon: Target },
  [ProjectRequirementsStatus.DELAYED]: { label: "已延期", color: "bg-yellow-100 text-yellow-800", icon: Pause },
  [ProjectRequirementsStatus.CANCELLED]: { label: "已取消", color: "bg-red-100 text-red-800", icon: AlertCircle },
  [ProjectRequirementsStatus.DELETED]: { label: "已删除", color: "bg-gray-100 text-gray-500", icon: AlertCircle },
  [ProjectRequirementsStatus.ARCHIVED]: { label: "已归档", color: "bg-purple-100 text-purple-800", icon: Target },
};

// 类型配置
const typeConfig = {
  [ProjectRequirementsType.work]: { label: "工作", color: "bg-blue-100 text-blue-800", icon: Briefcase },
  [ProjectRequirementsType.personal]: { label: "个人", color: "bg-green-100 text-green-800", icon: User },
};

// 难度级别配置
const difficultyConfig: Record<number, { label: string; color: string }> = {
  1: { label: "简单", color: "bg-green-100 text-green-800" },
  2: { label: "中等", color: "bg-yellow-100 text-yellow-800" },
  3: { label: "困难", color: "bg-orange-100 text-orange-800" },
  4: { label: "极难", color: "bg-red-100 text-red-800" },
};

// 获取状态颜色
const getStatusColor = (status: ProjectRequirementsStatus) => {
  switch (status) {
    case ProjectRequirementsStatus.TODO: return 'default';
    case ProjectRequirementsStatus.IN_PROGRESS: return 'blue';
    case ProjectRequirementsStatus.COMPLETED: return 'green';
    case ProjectRequirementsStatus.DELAYED: return 'orange';
    case ProjectRequirementsStatus.CANCELLED: return 'red';
    case ProjectRequirementsStatus.DELETED: return 'default';
    case ProjectRequirementsStatus.ARCHIVED: return 'purple';
    default: return 'default';
  }
};

// 获取类型颜色
const getTypeColor = (type: ProjectRequirementsType) => {
  switch (type) {
    case ProjectRequirementsType.work: return 'blue';
    case ProjectRequirementsType.personal: return 'green';
    default: return 'default';
  }
};

// 获取难度级别颜色
const getDifficultyColor = (level: number) => {
  switch (level) {
    case 1: return 'green';
    case 2: return 'gold';
    case 3: return 'orange';
    case 4: return 'red';
    default: return 'default';
  }
};

// Todo 优先级颜色配置
const getTodoPriorityColor = (priority: number) => {
  switch (priority) {
    case 1: return 'green';
    case 2: return 'blue';
    case 3: return 'gold';
    case 4: return 'orange';
    case 5: return 'red';
    default: return 'default';
  }
};

// Todo 状态颜色配置
const getTodoStatusColor = (status: TodoStatus) => {
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

// Todo 迷你展示组件
const TodoMiniItem = ({ todo, onStatusChange }: { todo: ITodo; onStatusChange?: (id: string, status: TodoStatus) => void }) => {
  const handleToggleComplete = () => {
    if (onStatusChange) {
      const newStatus = todo.status === TodoStatus.COMPLETED ? TodoStatus.TODO : TodoStatus.COMPLETED;
      onStatusChange(todo._id!, newStatus);
    }
  };

  return (
    <div className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded text-sm">
      <button
        onClick={handleToggleComplete}
        className="flex-shrink-0"
      >
        {todo.status === TodoStatus.COMPLETED ? (
          <CheckCircle size={14} className="text-green-600" />
        ) : (
          <Circle size={14} className="text-gray-400" />
        )}
      </button>
      <span className={`flex-1 truncate ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-500' : ''}`}>
        {todo.title}
      </span>
      <div className="flex gap-1">
        <Tag color={getTodoStatusColor(todo.status)}>
          {todo.status === TodoStatus.TODO ? '待办' :
            todo.status === TodoStatus.IN_PROGRESS ? '进行中' :
              todo.status === TodoStatus.COMPLETED ? '完成' : '其他'}
        </Tag>
        <Tag color={getTodoPriorityColor(todo.priority || 3)}>
          P{todo.priority || 3}
        </Tag>
      </div>
    </div>
  );
};

// 项目需求骨架屏组件
const ProjectRequirementSkeleton = () => {
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
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
};

// 时间线项目需求项组件
const TimelineRequirementItem = ({
  requirement,
  onStatusChange,
  onEdit,
  stacks
}: {
  requirement: IProjectRequirements;
  onStatusChange: (id: string, status: ProjectRequirementsStatus) => void;
  onEdit: (requirement: IProjectRequirements) => void;
  stacks: IStack[];
}) => {
  const StatusIcon = statusConfig[requirement.status].icon;
  const TypeIcon = typeConfig[requirement.type].icon;

  const handleStatusToggle = () => {
    const newStatus = requirement.status === ProjectRequirementsStatus.COMPLETED ?
      ProjectRequirementsStatus.TODO : ProjectRequirementsStatus.COMPLETED;
    onStatusChange(requirement._id!, newStatus);
  };

  // 获取项目相关的技术栈信息
  const getProjectStacks = () => {
    if (!requirement.techStack || requirement.techStack.length === 0) return [];
    return requirement.techStack
      .map(stackId => stacks.find(stack => stack._id === stackId))
      .filter((stack): stack is IStack => !!stack);
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex group">
      {/* 左侧时间线 */}
      <div className="flex flex-col items-center mr-4">
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-sm mb-1"></div>
        <div className="w-0.5 bg-gradient-to-b from-blue-200 to-gray-200 flex-1"></div>
      </div>

      {/* 需求内容 */}
      <div className="flex-1 bg-white border-0 shadow-sm rounded-xl p-5 mb-4 hover:shadow-lg hover:shadow-gray-100 transition-all duration-200">
        <div className="space-y-3">
          {/* 标题和状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={handleStatusToggle}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <StatusIcon size={18} className={requirement.status === ProjectRequirementsStatus.COMPLETED ? 'text-green-600' : 'text-gray-400'} />
              </button>
              <h3 className={`font-medium ${requirement.status === ProjectRequirementsStatus.COMPLETED ? 'line-through text-gray-500' : ''}`}>
                {requirement.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[requirement.status].color}`}>
                {statusConfig[requirement.status].label}
              </span>
              <button
                onClick={() => onEdit(requirement)}
                className="p-1 rounded-full hover:bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit size={14} />
              </button>
            </div>
          </div>

          {/* 描述 */}
          <div className="ml-10">
            <p className="text-sm text-gray-600">{requirement.description}</p>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between ml-10">
            <div className="flex items-center gap-2">
              {/* 类型 */}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${typeConfig[requirement.type].color}`}>
                <TypeIcon size={12} className="mr-1" />
                {typeConfig[requirement.type].label}
              </span>

              {/* 难度级别 */}
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${difficultyConfig[requirement.difficultyLevel || 2].color}`}>
                {difficultyConfig[requirement.difficultyLevel || 2].label}
              </span>

              {/* 技术栈信息 */}
              {getProjectStacks().length > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                  <Code size={12} className="mr-1" />
                  {getProjectStacks().length} 技术栈
                </span>
              )}

              {/* 技术难点 */}
              {requirement.difficulty && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                  <AlertCircle size={12} className="mr-1" />
                  有难点
                </span>
              )}
            </div>

            {/* 创建时间 */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
              <Calendar size={12} className="mr-1" />
              {formatDate(requirement.createdAt)}
            </span>
          </div>

          {/* 技术栈详情和技术难点 */}
          {(getProjectStacks().length > 0 || requirement.difficulty) && (
            <div className="ml-10 mt-3 pt-3 border-t border-gray-100">
              <div className="space-y-3">
                {/* 技术栈 */}
                {getProjectStacks().length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-2">相关技术栈</h5>
                    <div className="flex flex-wrap gap-2">
                      {getProjectStacks().map(stack => (
                        <div key={stack._id} className="flex items-center gap-2 py-1 px-3 bg-blue-50 rounded-lg text-sm">
                          {stack.iconSrc && (
                            <img
                              src={stack.iconSrc}
                              alt={stack.title}
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-blue-800 font-medium">{stack.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 技术难点 */}
                {requirement.difficulty && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-2">技术难点</h5>
                    <div className="p-2 bg-orange-50 rounded text-xs text-orange-800 border-l-2 border-orange-200">
                      {requirement.difficulty}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 项目需求项组件
const ProjectRequirementItem = ({
  requirement,
  onStatusChange,
  onDelete,
  onEdit,
  todoStat,
  onTodoUpdated,
  stacks
}: {
  requirement: IProjectRequirements;
  onStatusChange: (id: string, status: ProjectRequirementsStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (requirement: IProjectRequirements) => void;
  todoStat?: { total: number; completed: number };
  onTodoUpdated?: () => void;
    stacks: IStack[];
}) => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [showTodos, setShowTodos] = useState(false);

  const StatusIcon = statusConfig[requirement.status].icon;
  const TypeIcon = typeConfig[requirement.type].icon;
  const isOverdue = requirement.endDate && new Date(requirement.endDate) < new Date() &&
    requirement.status !== ProjectRequirementsStatus.COMPLETED &&
    requirement.status !== ProjectRequirementsStatus.CANCELLED;

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusToggle = () => {
    const newStatus = requirement.status === ProjectRequirementsStatus.COMPLETED ?
      ProjectRequirementsStatus.TODO : ProjectRequirementsStatus.COMPLETED;
    onStatusChange(requirement._id!, newStatus);
  };

  // 获取项目相关的技术栈信息
  const getProjectStacks = () => {
    if (!requirement.techStack || requirement.techStack.length === 0) return [];
    return requirement.techStack
      .map(stackId => stacks.find(stack => stack._id === stackId))
      .filter((stack): stack is IStack => !!stack);
  };

  // 获取项目相关的todo任务
  const fetchProjectTodos = async () => {
    if (!requirement._id) return;

    try {
      setLoadingTodos(true);
      const projectTodos = await todosBusiness.getProjectTodos(requirement._id);
      setTodos(projectTodos);
    } catch (error) {
      console.error("获取项目todo失败:", error);
    } finally {
      setLoadingTodos(false);
    }
  };

  // 处理todo状态变更
  const handleTodoStatusChange = async (todoId: string, status: TodoStatus) => {
    try {
      await todosBusiness.updateTodo(todoId, { status });
      // 重新获取todo列表
      await fetchProjectTodos();
      // 通知父组件更新统计
      onTodoUpdated?.();
    } catch (error) {
      console.error("更新todo状态失败:", error);
    }
  };

  // 切换显示todo列表
  const toggleShowTodos = () => {
    setShowTodos(!showTodos);
    if (!showTodos && todos.length === 0) {
      fetchProjectTodos();
    }
  };

  return (
    <Card className={`p-5 transition-all hover:shadow-lg hover:shadow-gray-100 border-0 bg-white rounded-xl ${isOverdue ? 'ring-2 ring-red-200 bg-red-50' : 'shadow-sm'}`}>
      <div className="space-y-3">
        {/* 标题和状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={handleStatusToggle}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <StatusIcon size={18} className={requirement.status === ProjectRequirementsStatus.COMPLETED ? 'text-green-600' : 'text-gray-400'} />
            </button>
            <h3 className={`font-medium ${requirement.status === ProjectRequirementsStatus.COMPLETED ? 'line-through text-gray-500' : ''}`}>
              {requirement.title}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[requirement.status].color}`}>
            {statusConfig[requirement.status].label}
          </span>
        </div>

        {/* 描述 */}
        <div className="ml-10">
          <p className="text-sm text-gray-600">{requirement.description}</p>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between ml-10">
          <div className="flex items-center gap-2">
            {/* 类型 */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${typeConfig[requirement.type].color}`}>
              <TypeIcon size={12} className="mr-1" />
              {typeConfig[requirement.type].label}
            </span>

            {/* 难度级别 */}
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${difficultyConfig[requirement.difficultyLevel || 2].color}`}>
              {difficultyConfig[requirement.difficultyLevel || 2].label}
            </span>

            {/* 结束日期 */}
            {requirement.endDate && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                <Calendar size={12} className="mr-1" />
                {formatDate(requirement.endDate)}
              </span>
            )}

            {/* 技术栈信息 */}
            {getProjectStacks().length > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                <Code size={12} className="mr-1" />
                {getProjectStacks().length} 技术栈
              </span>
            )}

            {/* 技术难点 */}
            {requirement.difficulty && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                <AlertCircle size={12} className="mr-1" />
                有难点
              </span>
            )}

            {/* 关联 Todo 数量 */}
            <div className="flex items-center gap-1 text-xs text-blue-600 cursor-pointer" onClick={toggleShowTodos}>
              <Target size={14} />
              <span>
                {showTodos ? todos.length : (todoStat?.total || 0)} 任务
                {todoStat && todoStat.total > 0 && (
                  <span className="text-green-600 ml-1">
                    ({todoStat.completed}/{todoStat.total})
                  </span>
                )}
              </span>
              {showTodos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>

            {/* 技术方案状态 */}
            {requirement.techSolutionOssPath && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Edit size={14} />
                有方案
              </div>
            )}

            {/* 反思笔记状态 */}
            {requirement.reflectionOssPath && (
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <FileText size={14} />
                有反思
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(requirement)}
              title="编辑基本信息"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <Settings size={12} className="mr-1.5" />
              编辑
            </button>
            <button
              onClick={() => window.location.href = `/admin/project-requirements/edit/${requirement._id}/tech-solution`}
              title={requirement.techSolutionOssPath ? "编辑技术方案" : "创建技术方案"}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${requirement.techSolutionOssPath
                ? "text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100"
                : "text-blue-600 bg-white border border-blue-200 hover:bg-blue-50"
                }`}
            >
              <Edit size={12} className="mr-1.5" />
              {requirement.techSolutionOssPath ? "方案✓" : "方案"}
            </button>
            <button
              onClick={() => window.location.href = `/admin/project-requirements/edit/${requirement._id}/reflection`}
              title={requirement.reflectionOssPath ? "编辑反思笔记" : "创建反思笔记"}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${requirement.reflectionOssPath
                ? "text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100"
                : "text-purple-600 bg-white border border-purple-200 hover:bg-purple-50"
                }`}
            >
              <FileText size={12} className="mr-1.5" />
              {requirement.reflectionOssPath ? "反思✓" : "反思"}
            </button>
            <button
              onClick={() => onStatusChange(requirement._id!, ProjectRequirementsStatus.IN_PROGRESS)}
              disabled={requirement.status === ProjectRequirementsStatus.IN_PROGRESS}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${requirement.status === ProjectRequirementsStatus.IN_PROGRESS
                ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                : "text-green-600 bg-white border border-green-200 hover:bg-green-50"
                }`}
            >
              开始
            </button>
            <button
              onClick={() => onDelete(requirement._id!)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              删除
            </button>
          </div>
        </div>

        {/* Todo 任务列表 */}
        {showTodos && (
          <div className="mt-4 pt-4 border-t border-gray-200 ml-10">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">相关任务</h4>
                {loadingTodos && <span className="text-xs text-gray-500">加载中...</span>}
              </div>

              {!loadingTodos && todos.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {todos.map(todo => (
                    <TodoMiniItem
                      key={todo._id}
                      todo={todo}
                      onStatusChange={handleTodoStatusChange}
                    />
                  ))}
                </div>
              ) : !loadingTodos && todos.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-2">
                  暂无相关任务
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* 技术栈详情和技术难点 */}
        {(getProjectStacks().length > 0 || requirement.difficulty) && (
          <div className="mt-4 pt-4 border-t border-gray-200 ml-10">
            <div className="space-y-4">
              {/* 技术栈 */}
              {getProjectStacks().length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">相关技术栈</h4>
                  <div className="flex flex-wrap gap-2">
                    {getProjectStacks().map(stack => (
                      <div key={stack._id} className="flex items-center gap-2 py-1 px-3 bg-blue-50 rounded-lg text-sm">
                        {stack.iconSrc && (
                          <img
                            src={stack.iconSrc}
                            alt={stack.title}
                            className="w-4 h-4 object-contain"
                            onError={(e) => {
                              // 如果图片加载失败，隐藏图片
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="text-blue-800 font-medium">{stack.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 技术难点 */}
              {requirement.difficulty && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">技术难点</h4>
                  <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-200">
                    <p className="text-sm text-orange-800">{requirement.difficulty}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default function ProjectRequirementsPage() {
  const [projectRequirements, setProjectRequirements] = useState<IProjectRequirements[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<IProjectRequirements | null>(null);
  const [editForm] = Form.useForm();
  const [todoStats, setTodoStats] = useState<Record<string, { total: number; completed: number }>>({});
  const [stacks, setStacks] = useState<IStack[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [timelineGrouped, setTimelineGrouped] = useState<{
    [year: string]: {
      [month: string]: IProjectRequirements[]
    }
  }>({});

  // 获取项目需求列表
  const fetchProjectRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (selectedType !== "all") {
        params.type = selectedType as ProjectRequirementsType;
      }

      if (selectedStatus !== "all") {
        params.status = selectedStatus as ProjectRequirementsStatus;
      }

      if (selectedDifficulty !== "all") {
        params.difficultyLevel = parseInt(selectedDifficulty);
      }

      const requirementsList = await projectRequirementsBusiness.getProjectRequirements(params);
      setProjectRequirements(requirementsList);

      // 如果是时间线视图，进行分组
      if (activeTab === 'timeline') {
        groupRequirementsByTimeline(requirementsList);
      }
    } catch (error) {
      message.error("获取项目需求失败: " + error);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatus, selectedDifficulty, activeTab]);

  // 按时间线分组项目需求
  const groupRequirementsByTimeline = (requirements: IProjectRequirements[]) => {
    const grouped: {
      [year: string]: {
        [month: string]: IProjectRequirements[]
      }
    } = {};

    // 按创建时间分组
    requirements.forEach(requirement => {
      const date = requirement.createdAt ? new Date(requirement.createdAt) : new Date();
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');

      if (!grouped[year]) {
        grouped[year] = {};
      }

      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }

      grouped[year][month].push(requirement);
    });

    // 对每个月内的需求按创建时间排序
    Object.keys(grouped).forEach(year => {
      Object.keys(grouped[year]).forEach(month => {
        grouped[year][month].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime(); // 最新的在前
        });
      });
    });

    setTimelineGrouped(grouped);
  };

  // 获取统计信息
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await projectRequirementsBusiness.getProjectRequirementsStats();
      setStats(statsData);
    } catch (error) {
      console.error("获取统计信息失败:", error);
    }
  }, []);

  // 获取所有项目的todo统计
  const fetchTodoStats = useCallback(async () => {
    try {
      const allProjectStats = await todosBusiness.getProjectsStats();
      const statsMap: Record<string, { total: number; completed: number }> = {};
      allProjectStats.forEach(stat => {
        statsMap[stat.projectId] = {
          total: stat.total,
          completed: stat.completed
        };
      });
      setTodoStats(statsMap);
    } catch (error) {
      console.error("获取todo统计失败:", error);
    }
  }, []);

  // 获取技术栈列表
  const fetchStacks = useCallback(async () => {
    try {
      const stacksList = await stacksBusiness.getStacks();
      setStacks(stacksList);
    } catch (error) {
      console.error("获取技术栈失败:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjectRequirements();
  }, [fetchProjectRequirements]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTodoStats();
  }, [fetchTodoStats]);

  useEffect(() => {
    fetchStacks();
  }, [fetchStacks]);

  // 处理状态变更
  const handleStatusChange = async (id: string, status: ProjectRequirementsStatus) => {
    try {
      await projectRequirementsBusiness.updateProjectRequirement(id, { status });
      message.success("状态更新成功");
      fetchProjectRequirements();
      fetchStats();
    } catch (error) {
      message.error("状态更新失败: " + error);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await projectRequirementsBusiness.deleteProjectRequirement(id);
      message.success("删除成功");
      fetchProjectRequirements();
      fetchStats();
    } catch (error) {
      message.error("删除失败: " + error);
    }
  };

  // 处理编辑
  const handleEdit = (requirement: IProjectRequirements) => {
    setEditingRequirement(requirement);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({
      title: requirement.title,
      description: requirement.description,
      type: requirement.type,
      difficultyLevel: requirement.difficultyLevel,
      difficulty: requirement.difficulty,
      startDate: requirement.startDate ? dayjs(requirement.startDate) : null,
      endDate: requirement.endDate ? dayjs(requirement.endDate) : null,
      techStack: requirement.techStack || [],
    });
  };

  // 处理编辑项目需求
  const handleEditProjectRequirement = async (values: any) => {
    if (!editingRequirement?._id) return;

    try {
      const requirementData = {
        title: values.title,
        description: values.description,
        type: values.type,
        difficultyLevel: values.difficultyLevel || 2,
        ...(values.startDate && { startDate: values.startDate.toDate() }),
        ...(values.endDate && { endDate: values.endDate.toDate() }),
        ...(values.difficulty && { difficulty: values.difficulty }),
        ...(values.techStack && { techStack: values.techStack }),
      };

      await projectRequirementsBusiness.updateProjectRequirement(editingRequirement._id, requirementData);
      message.success("更新成功");
      setIsEditModalOpen(false);
      setEditingRequirement(null);
      editForm.resetFields();
      fetchProjectRequirements();
      fetchStats();
    } catch (error) {
      message.error("更新失败: " + error);
    }
  };

  // 处理todo更新后的回调
  const handleTodoUpdated = useCallback(() => {
    fetchTodoStats();
  }, [fetchTodoStats]);

  // 处理创建项目需求
  const handleCreateProjectRequirement = async (values: any) => {
    try {
      const requirementData = {
        title: values.title,
        description: values.description,
        status: ProjectRequirementsStatus.TODO,
        type: values.type,
        difficultyLevel: values.difficultyLevel || 2,
        color: '#3B82F6',
        ...(values.startDate && { startDate: values.startDate.toDate() }),
        ...(values.endDate && { endDate: values.endDate.toDate() }),
        ...(values.difficulty && { difficulty: values.difficulty }),
        ...(values.techStack && { techStack: values.techStack }),
      };

      await projectRequirementsBusiness.createProjectRequirement(requirementData);
      message.success("创建成功");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchProjectRequirements();
      fetchStats();
    } catch (error) {
      message.error("创建失败: " + error);
    }
  };

  return (
    <main className="flex h-screen w-full box-border bg-white">
      {/* 左侧导航 */}
      <div className="w-64 border-r border-gray-200 h-full flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-800">项目需求</h1>
          <p className="text-sm text-gray-500 mt-1">管理您的项目需求和开发计划</p>
        </div>

        {/* 分类列表 */}
        <div className="py-4">
          <h3 className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">视图</h3>
          <div
            className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer mb-1 rounded-r-lg transition-colors ${activeTab === 'all'
              ? 'bg-gray-100 text-gray-800 border-l-2 border-gray-500'
              : 'hover:bg-gray-50 border-l-2 border-transparent'
              }`}
            onClick={() => setActiveTab('all')}
          >
            <div className={`p-1.5 rounded-md ${activeTab === 'all' ? 'bg-gray-200' : 'bg-transparent'}`}>
              <Target size={16} className={activeTab === 'all' ? 'text-gray-700' : 'text-gray-500'} />
            </div>
            <span className="text-sm font-medium">全部需求</span>
          </div>

          <div
            className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer mb-1 rounded-r-lg transition-colors ${activeTab === 'timeline'
              ? 'bg-gray-100 text-gray-800 border-l-2 border-gray-500'
              : 'hover:bg-gray-50 border-l-2 border-transparent'
              }`}
            onClick={() => {
              setActiveTab('timeline');
              if (activeTab !== 'timeline') {
                groupRequirementsByTimeline(projectRequirements);
              }
            }}
          >
            <div className={`p-1.5 rounded-md ${activeTab === 'timeline' ? 'bg-gray-200' : 'bg-transparent'}`}>
              <Calendar size={16} className={activeTab === 'timeline' ? 'text-gray-700' : 'text-gray-500'} />
            </div>
            <span className="text-sm font-medium">时间线</span>
          </div>
        </div>

        {/* 统计信息 */}
        {stats && (
          <div className="px-4 py-4 mt-2 border-t border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">统计信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-sm text-gray-600">总需求</span>
                </div>
                <span className="text-sm font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <span className="text-sm text-gray-600">已完成</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                  <span className="text-sm text-gray-600">进行中</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span className="text-sm text-gray-600">完成率</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{stats.completionRate}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 头部操作栏 */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">
            {activeTab === 'timeline' ? '时间线视图' : '全部需求'}
          </h2>
          <Button
            type="default"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus size={16} />}
          >
            新建需求
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 全部需求 - 仅在all tab下显示 */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {/* 筛选器 */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">筛选：</span>
                  </div>

                  <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <Select
                      value={selectedType}
                      onChange={setSelectedType}
                      style={{ width: 150 }}
                      placeholder="选择类型"
                    >
                      <Select.Option value="all">所有类型</Select.Option>
                      {Object.entries(typeConfig).map(([type, config]) => (
                        <Select.Option key={type} value={type}>
                          {config.label}
                        </Select.Option>
                      ))}
                    </Select>

                    <Select
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      style={{ width: 150 }}
                      placeholder="选择状态"
                    >
                      <Select.Option value="all">所有状态</Select.Option>
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <Select.Option key={status} value={status}>
                          {config.label}
                        </Select.Option>
                      ))}
                    </Select>

                    <Select
                      value={selectedDifficulty}
                      onChange={setSelectedDifficulty}
                      style={{ width: 150 }}
                      placeholder="选择难度"
                    >
                      <Select.Option value="all">所有难度</Select.Option>
                      {Object.entries(difficultyConfig).map(([level, config]) => (
                        <Select.Option key={level} value={level}>
                          {config.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* 项目需求列表 */}
              {loading ? (
                <div className="grid gap-4">
                  {Array(6).fill(0).map((_, index) => (
                    <ProjectRequirementSkeleton key={`skeleton-${index}`} />
                  ))}
                </div>
              ) : projectRequirements.length > 0 ? (
                <div className="grid gap-4">
                  {projectRequirements.map((requirement) => (
                    <ProjectRequirementItem
                      key={requirement._id}
                      requirement={requirement}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      todoStat={todoStats[requirement._id!]}
                      onTodoUpdated={handleTodoUpdated}
                      stacks={stacks}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Target size={40} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">暂无项目需求</h3>
                  <p className="text-gray-500">创建您的第一个项目需求开始规划吧！</p>
                </div>
              )}
            </div>
          )}

          {/* 时间线视图 - 仅在timeline tab下显示 */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* 筛选器 */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">筛选：</span>
                  </div>

                  <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <Select
                      value={selectedType}
                      onChange={setSelectedType}
                      style={{ width: 150 }}
                      placeholder="选择类型"
                    >
                      <Select.Option value="all">所有类型</Select.Option>
                      {Object.entries(typeConfig).map(([type, config]) => (
                        <Select.Option key={type} value={type}>
                          {config.label}
                        </Select.Option>
                      ))}
                    </Select>

                    <Select
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      style={{ width: 150 }}
                      placeholder="选择状态"
                    >
                      <Select.Option value="all">所有状态</Select.Option>
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <Select.Option key={status} value={status}>
                          {config.label}
                        </Select.Option>
                      ))}
                    </Select>

                    <Select
                      value={selectedDifficulty}
                      onChange={setSelectedDifficulty}
                      style={{ width: 150 }}
                      placeholder="选择难度"
                    >
                      <Select.Option value="all">所有难度</Select.Option>
                      {Object.entries(difficultyConfig).map(([level, config]) => (
                        <Select.Option key={level} value={level}>
                          {config.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* 时间线内容 */}
              {loading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, index) => (
                    <div key={`skeleton-${index}`} className="animate-pulse">
                      <div className="h-6 w-32 bg-gray-100 rounded mb-3"></div>
                      <div className="flex">
                        <div className="w-3 h-3 rounded-full bg-gray-100 mr-4"></div>
                        <div className="flex-1 h-20 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(timelineGrouped).length > 0 ? (
                <div className="space-y-8">
                  {Object.keys(timelineGrouped).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                    <div key={year} className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                        {year}年
                      </h3>

                      {Object.keys(timelineGrouped[year]).sort((a, b) => parseInt(b) - parseInt(a)).map(month => (
                        <div key={`${year}-${month}`} className="ml-4 space-y-4">
                          <h4 className="text-md font-medium text-gray-600">
                            {month}月 ({timelineGrouped[year][month].length}项)
                          </h4>

                          <div className="space-y-0">
                            {timelineGrouped[year][month].map(requirement => (
                              <TimelineRequirementItem
                                key={requirement._id}
                                requirement={requirement}
                                onStatusChange={handleStatusChange}
                                onEdit={handleEdit}
                                stacks={stacks}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  </div>
                ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">暂无项目需求</h3>
                  <p className="text-gray-500">创建您的第一个项目需求开始规划吧！</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 创建项目需求模态框 */}
      <Modal
        title="新建项目需求"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateProjectRequirement}
        >
          <Form.Item
            name="title"
            label="需求标题"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="输入需求标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="需求描述"
            rules={[{ required: true, message: '请输入需求描述' }]}
          >
            <Input.TextArea rows={3} placeholder="输入需求描述" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="type"
              label="需求类型"
              rules={[{ required: true, message: '请选择需求类型' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="选择需求类型">
                <Select.Option value={ProjectRequirementsType.work}>工作</Select.Option>
                <Select.Option value={ProjectRequirementsType.personal}>个人</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="difficultyLevel"
              label="难度级别"
              style={{ flex: 1 }}
            >
              <Select placeholder="选择难度级别">
                <Select.Option value={1}>简单</Select.Option>
                <Select.Option value={2}>中等</Select.Option>
                <Select.Option value={3}>困难</Select.Option>
                <Select.Option value={4}>极难</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="difficulty"
            label="技术难点"
          >
            <Input.TextArea rows={2} placeholder="描述技术难点（可选）" />
          </Form.Item>

          <Form.Item
            name="techStack"
            label="技术栈"
          >
            <Select
              mode="multiple"
              placeholder="选择相关技术栈"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {stacks.map(stack => (
                <Select.Option key={stack._id} value={stack._id}>
                  {stack.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="startDate"
              label="开始日期"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择开始日期"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="结束日期"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择结束日期"
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
                创建需求
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑项目需求模态框 */}
      <Modal
        title="编辑项目需求"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingRequirement(null);
          editForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditProjectRequirement}
        >
          <Form.Item
            name="title"
            label="需求标题"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="输入需求标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="需求描述"
            rules={[{ required: true, message: '请输入需求描述' }]}
          >
            <Input.TextArea rows={3} placeholder="输入需求描述" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="type"
              label="需求类型"
              rules={[{ required: true, message: '请选择需求类型' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="选择需求类型">
                <Select.Option value={ProjectRequirementsType.work}>工作</Select.Option>
                <Select.Option value={ProjectRequirementsType.personal}>个人</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="difficultyLevel"
              label="难度级别"
              style={{ flex: 1 }}
            >
              <Select placeholder="选择难度级别">
                <Select.Option value={1}>简单</Select.Option>
                <Select.Option value={2}>中等</Select.Option>
                <Select.Option value={3}>困难</Select.Option>
                <Select.Option value={4}>极难</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="difficulty"
            label="技术难点"
          >
            <Input.TextArea rows={2} placeholder="描述技术难点（可选）" />
          </Form.Item>

          <Form.Item
            name="techStack"
            label="技术栈"
          >
            <Select
              mode="multiple"
              placeholder="选择相关技术栈"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {stacks.map(stack => (
                <Select.Option key={stack._id} value={stack._id}>
                  {stack.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="startDate"
              label="开始日期"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择开始日期"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="结束日期"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择结束日期"
              />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsEditModalOpen(false);
                setEditingRequirement(null);
                editForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新需求
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
} 