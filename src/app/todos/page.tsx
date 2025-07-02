"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button as UIButton } from "@/components/ui/button";
import { Select, Tag, message, Modal, Form, Input, DatePicker, Button, Tabs } from "antd";
import {
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Pause,
  Plus,
  Filter,
  Calendar,
  User,
  Sun,
  Target,
  TrendingUp,
  Edit,
  List,
  BarChart
} from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/todo";
import { todosBusiness } from "../business/todos";
import { IProjectRequirements } from "@/app/model/project-requirements";
import { projectRequirementsBusiness } from "../business/project-requirements";
import dayjs from "dayjs";

// 状态配置
const statusConfig = {
  [TodoStatus.TODO]: { label: "待办", color: "bg-gray-100 text-gray-700", icon: Square },
  [TodoStatus.IN_PROGRESS]: { label: "进行中", color: "bg-gray-200 text-gray-800", icon: Clock },
  [TodoStatus.COMPLETED]: { label: "已完成", color: "bg-gray-700 text-white", icon: CheckSquare },
  [TodoStatus.DELAYED]: { label: "已延期", color: "bg-gray-400 text-white", icon: Pause },
  [TodoStatus.CANCELLED]: { label: "已取消", color: "bg-gray-300 text-gray-800", icon: AlertCircle },
  [TodoStatus.DELETED]: { label: "已删除", color: "bg-gray-100 text-gray-500", icon: AlertCircle },
  [TodoStatus.ARCHIVED]: { label: "已归档", color: "bg-gray-600 text-white", icon: CheckSquare },
};

// 优先级配置
const priorityConfig: Record<number, { label: string; color: string }> = {
  1: { label: "低", color: "bg-gray-100 text-gray-700" },
  2: { label: "中低", color: "bg-gray-200 text-gray-800" },
  3: { label: "中", color: "bg-gray-300 text-gray-800" },
  4: { label: "高", color: "bg-gray-500 text-white" },
  5: { label: "紧急", color: "bg-gray-800 text-white" },
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

// 每日Todo简化项组件
const DailyTodoItem = ({
  todo,
  onStatusChange,
  onEdit,
  type,
  projectRequirements
}: {
  todo: ITodo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onEdit: (todo: ITodo) => void;
  type: 'today' | 'overdue' | 'upcoming';
  projectRequirements: IProjectRequirements[];
}) => {
  const handleToggleComplete = () => {
    const newStatus = todo.status === TodoStatus.COMPLETED ? TodoStatus.TODO : TodoStatus.COMPLETED;
    onStatusChange(todo._id!, newStatus);
  };

  // 根据类型获取颜色
  const getTypeColor = () => {
    switch (type) {
      case 'overdue': return 'hover:bg-gray-100';
      case 'today': return 'hover:bg-gray-50';
      case 'upcoming': return 'hover:bg-gray-50';
      default: return 'hover:bg-gray-50';
    }
  };

  // 获取项目名称
  const getProjectName = () => {
    if (!todo.projectId) return null;
    const project = projectRequirements.find(p => p._id === todo.projectId);
    return project?.title;
  };

  const projectName = getProjectName();

  return (
    <div className={`${getTypeColor()} transition-colors group`}>
      <div className="py-3 px-4 flex items-center gap-3">
        {/* 勾选按钮 */}
        <button
          onClick={handleToggleComplete}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white hover:shadow-sm transition-all"
        >
          {todo.status === TodoStatus.COMPLETED ? (
            <CheckSquare size={16} className="text-gray-600" />
          ) : (
            <Square size={16} className="text-gray-300 group-hover:text-gray-400" />
          )}
        </button>

        {/* 主体内容 */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onEdit(todo)}
        >
          <div className="flex items-center gap-2">
            <span className={`text-sm ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {todo.title}
            </span>
            {projectName && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 max-w-[120px] truncate flex-shrink-0">
                {projectName}
              </span>
            )}
          </div>
          {todo.description && (
            <div className={`text-xs mt-1 truncate ${todo.status === TodoStatus.COMPLETED ? 'text-gray-300' : 'text-gray-500'}`}>
              {todo.description}
            </div>
          )}
        </div>

        {/* 右侧信息 */}
        <div className="flex items-center gap-2 shrink-0">
          {todo.priority && todo.priority >= 4 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-xs font-medium text-gray-700">
              P{todo.priority}
            </span>
          )}
          {todo.dueDate && (
            <span className="text-xs text-gray-500">
              {new Date(todo.dueDate).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
            </span>
          )}

          {/* 编辑按钮 - 仅在悬停时显示 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            className="p-1 rounded-full hover:bg-white hover:shadow-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 每日Todo模块组件
const DailyTodoModule = ({
  onStatusChange,
  onEdit,
  refreshTrigger,
  projectRequirements
}: {
  onStatusChange: (id: string, status: TodoStatus) => void;
  onEdit: (todo: ITodo) => void;
  refreshTrigger?: number;
  projectRequirements: IProjectRequirements[];
}) => {
  const [todayTodos, setTodayTodos] = useState<ITodo[]>([]);
  const [overdueTodos, setOverdueTodos] = useState<ITodo[]>([]);
  const [upcomingTodos, setUpcomingTodos] = useState<ITodo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyTodos = useCallback(async () => {
    try {
      setLoading(true);
      const [today, overdue, upcoming] = await Promise.all([
        todosBusiness.getTodayDueTodos(),
        todosBusiness.getOverdueTodos(),
        todosBusiness.getUpcomingTodos()
      ]);

      setTodayTodos(today);
      setOverdueTodos(overdue);
      setUpcomingTodos(upcoming.slice(0, 3)); // 只显示前3个即将到期的任务
    } catch (error) {
      console.error("获取每日任务失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyTodos();
  }, [fetchDailyTodos]);

  // 监听外部刷新触发器
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchDailyTodos();
    }
  }, [refreshTrigger, fetchDailyTodos]);

  // 按项目分组逾期任务
  const groupOverdueByProject = () => {
    const groups: Record<string, { project: IProjectRequirements | null, todos: ITodo[] }> = {};

    // 先处理有项目的任务
    overdueTodos.forEach(todo => {
      if (todo.projectId) {
        const projectId = todo.projectId;
        if (!groups[projectId]) {
          const project = projectRequirements.find(p => p._id === projectId) || null;
          groups[projectId] = { project, todos: [] };
        }
        groups[projectId].todos.push(todo);
      }
    });

    // 再处理没有项目的任务
    const noProjectTodos = overdueTodos.filter(todo => !todo.projectId);
    if (noProjectTodos.length > 0) {
      groups['no-project'] = { project: null, todos: noProjectTodos };
    }

    return Object.values(groups);
  };

  const overdueProjectGroups = groupOverdueByProject();

  const today = new Date();
  const formatDate = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-6 w-40 bg-gray-100 rounded"></div>
          <div className="h-6 w-20 bg-gray-100 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 rounded p-4">
              <div className="flex justify-between mb-3">
                <div className="h-5 w-24 bg-gray-100 rounded"></div>
                <div className="h-5 w-10 bg-gray-100 rounded"></div>
              </div>
              <div className="space-y-2">
                {[1, 2].map(j => (
                  <div key={j} className="h-4 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalDailyTasks = todayTodos.length + overdueTodos.length;
  const completedTasks = [...todayTodos, ...overdueTodos].filter(t => t.status === TodoStatus.COMPLETED).length;
  const progressPercentage = totalDailyTasks > 0 ? Math.round((completedTasks / totalDailyTasks) * 100) : 0;

  return (
    <div>
      {/* 头部进度 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">{formatDate}</p>
          <div className="text-sm font-medium">{progressPercentage}% 完成</div>
        </div>
        <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {/* 今日待办 - 包含逾期和今日任务 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-gray-800 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-800">今日待办</h3>
            </div>
            <span className="text-sm text-gray-700 font-medium bg-gray-200 px-3 py-1 rounded-full">{overdueTodos.length + todayTodos.length}项</span>
          </div>

          {overdueTodos.length > 0 || todayTodos.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {/* 逾期任务 */}
              {overdueTodos.length > 0 && (
                <div className="py-3 px-5 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
                      <h4 className="text-xs font-medium text-gray-700">逾期任务 ({overdueTodos.length})</h4>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {overdueTodos.map(todo => (
                      <DailyTodoItem
                        key={todo._id}
                        todo={todo}
                        onStatusChange={onStatusChange}
                        onEdit={onEdit}
                        type="overdue"
                        projectRequirements={projectRequirements}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 今日任务 */}
              {todayTodos.length > 0 && (
                <div className="py-3 px-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-gray-500 rounded-full"></div>
                    <h4 className="text-xs font-medium text-gray-700">今日截止 ({todayTodos.length})</h4>
                  </div>
                  <div className="space-y-1">
                    {todayTodos.map(todo => (
                      <DailyTodoItem
                        key={todo._id}
                        todo={todo}
                        onStatusChange={onStatusChange}
                        onEdit={onEdit}
                        type="today"
                        projectRequirements={projectRequirements}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckSquare size={24} className="mx-auto mb-2 text-gray-300" />
              <div className="text-sm">今日无待办任务</div>
            </div>
          )}
        </div>

        {/* 逾期项目分类 */}
        {overdueTodos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-gray-700 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800">逾期项目分类</h3>
              </div>
              <span className="text-sm text-gray-700 font-medium bg-gray-300 px-3 py-1 rounded-full">{overdueProjectGroups.length}项</span>
            </div>

            <div className="divide-y divide-gray-100">
              {overdueProjectGroups.map((group, index) => (
                <div key={group.project?._id || 'no-project'} className="py-4 px-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {group.project ? (
                        <span className="text-sm font-medium text-gray-800">{group.project.title}</span>
                      ) : (
                          <span className="text-sm font-medium text-gray-600">未分类任务</span>
                      )}
                      <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600 font-medium">
                        {group.todos.length}项
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 pl-3">
                    {group.todos.map(todo => (
                      <DailyTodoItem
                        key={todo._id}
                        todo={todo}
                        onStatusChange={onStatusChange}
                        onEdit={onEdit}
                        type="overdue"
                        projectRequirements={projectRequirements}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 即将到期 */}
        {upcomingTodos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-gray-600 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800">即将到期</h3>
              </div>
              <span className="text-sm text-gray-700 font-medium bg-gray-200 px-3 py-1 rounded-full">{upcomingTodos.length}项</span>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingTodos.map(todo => (
                <DailyTodoItem
                  key={todo._id}
                  todo={todo}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  type="upcoming"
                  projectRequirements={projectRequirements}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Todo 骨架屏组件
const TodoSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-100 rounded"></div>
          <div className="h-5 w-16 bg-gray-100 rounded"></div>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded"></div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-6 w-12 bg-gray-100 rounded"></div>
            <div className="h-6 w-12 bg-gray-100 rounded"></div>
          </div>
          <div className="h-6 w-24 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  );
};

// Todo 项组件
const TodoItem = ({
  todo,
  onStatusChange,
  onDelete,
  onEdit
}: {
  todo: ITodo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: ITodo) => void;
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

  // 获取状态标签样式
  const getStatusTagStyle = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.COMPLETED: return 'bg-gray-100 text-gray-600';
      case TodoStatus.IN_PROGRESS: return 'bg-gray-200 text-gray-700';
      case TodoStatus.DELAYED: return 'bg-gray-300 text-gray-800';
      case TodoStatus.CANCELLED: return 'bg-gray-200 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-xl border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-5 hover:shadow-lg hover:shadow-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm`}>
      <div className="space-y-3">
        {/* 标题和状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={handleStatusToggle}
              className="p-1 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <StatusIcon size={18} className={todo.status === TodoStatus.COMPLETED ? 'text-green-600' : 'text-gray-400'} />
            </button>
            <h3 className={`font-medium ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {todo.title}
            </h3>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusTagStyle(todo.status)}`}>
            {statusConfig[todo.status].label}
          </span>
        </div>

        {/* 描述 */}
        {todo.description && (
          <p className="text-sm text-gray-600 ml-7 leading-relaxed">{todo.description}</p>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 优先级 */}
            {todo.priority && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${priorityConfig[todo.priority].color}`}>
                P{todo.priority} · {priorityConfig[todo.priority].label}
              </span>
            )}

            {/* 截止日期 */}
            {todo.dueDate && (
              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${isOverdue ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-700'}`}>
                <Calendar size={12} />
                {formatDate(todo.dueDate)}
              </div>
            )}

            {/* 子任务数量 */}
            {todo.subTasks && todo.subTasks.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gray-200 text-gray-700">
                <User size={12} />
                {todo.subTasks.length} 子任务
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              type="text"
              size="small"
              onClick={() => onStatusChange(todo._id!, TodoStatus.IN_PROGRESS)}
              disabled={todo.status === TodoStatus.IN_PROGRESS}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              开始
            </Button>
            <Button
              type="text"
              size="small"
              onClick={() => onEdit(todo)}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              编辑
            </Button>
            <Button
              type="text"
              size="small"
              onClick={() => onDelete(todo._id!)}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              删除
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 时间线任务项组件
const TimelineTaskItem = ({
  todo,
  onStatusChange,
  onEdit
}: {
  todo: ITodo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onEdit: (todo: ITodo) => void;
}) => {
  const handleToggleComplete = () => {
    const newStatus = todo.status === TodoStatus.COMPLETED ? TodoStatus.TODO : TodoStatus.COMPLETED;
    onStatusChange(todo._id!, newStatus);
  };

  // 获取状态标签样式
  const getStatusTagStyle = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.COMPLETED: return 'bg-gray-100 text-gray-600';
      case TodoStatus.IN_PROGRESS: return 'bg-gray-200 text-gray-700';
      case TodoStatus.DELAYED: return 'bg-gray-300 text-gray-800';
      case TodoStatus.CANCELLED: return 'bg-gray-200 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex group">
      {/* 左侧时间线 */}
      <div className="flex flex-col items-center mr-6">
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 shadow-sm mb-1 border-2 border-white"></div>
        <div className="w-0.5 bg-gray-200 flex-1"></div>
      </div>

      {/* 任务内容 */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-lg hover:shadow-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleComplete}
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {todo.status === TodoStatus.COMPLETED ? (
                <CheckSquare size={16} className="text-green-600" />
              ) : (
                <Square size={16} className="text-gray-300" />
              )}
            </button>
            <h4 className={`text-sm font-medium ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {todo.title}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {todo.priority && todo.priority >= 4 && (
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold ${priorityConfig[todo.priority].color}`}>
                P{todo.priority}
              </span>
            )}
            <button
              onClick={() => onEdit(todo)}
              className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <Edit size={14} />
            </button>
          </div>
        </div>
        {todo.description && (
          <p className="text-xs text-gray-600 ml-8 mb-3 leading-relaxed">{todo.description}</p>
        )}
        <div className="flex items-center justify-between ml-8">
          <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${getStatusTagStyle(todo.status)}`}>
            {statusConfig[todo.status].label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function TodosPage() {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<ITodo | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [projectRequirements, setProjectRequirements] = useState<IProjectRequirements[]>([]);
  const [dailyTodoRefresh, setDailyTodoRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("daily");
  const [timeGroupedTodos, setTimeGroupedTodos] = useState<{
    overdue: ITodo[];
    today: ITodo[];
    thisWeek: ITodo[];
    future: ITodo[];
    noDate: ITodo[];
  }>({
    overdue: [],
    today: [],
    thisWeek: [],
    future: [],
    noDate: []
  });
  const [timelineTodos, setTimelineTodos] = useState<{
    [year: string]: {
      [month: string]: {
        [day: string]: ITodo[]
      }
    }
  }>({});

  // 获取 Todo 列表
  const fetchTodos = useCallback(async () => {
    try {
      // 仅在全部任务tab下或时间线tab下加载数据
      if (activeTab !== 'all' && activeTab !== 'timeline') {
        return;
      }

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

      // 根据时间分组任务
      if (activeTab === 'all') {
        groupTodosByTime(todoList);
      } else if (activeTab === 'timeline') {
        groupTodosByTimeline(todoList);
      }
    } catch (error) {
      message.error("获取待办事项失败: " + error);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedStatus, activeTab]);

  // 根据时间分组任务
  const groupTodosByTime = (todoList: ITodo[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const grouped = {
      overdue: [] as ITodo[],
      today: [] as ITodo[],
      thisWeek: [] as ITodo[],
      future: [] as ITodo[],
      noDate: [] as ITodo[]
    };

    todoList.forEach(todo => {
      if (!todo.dueDate) {
        grouped.noDate.push(todo);
      } else {
        const dueDate = new Date(todo.dueDate);

        if (dueDate < today) {
          grouped.overdue.push(todo);
        } else if (dueDate < tomorrow) {
          grouped.today.push(todo);
        } else if (dueDate < nextWeek) {
          grouped.thisWeek.push(todo);
        } else {
          grouped.future.push(todo);
        }
      }
    });

    setTimeGroupedTodos(grouped);
  };

  // 根据时间线分组任务（年月日）
  const groupTodosByTimeline = (todoList: ITodo[]) => {
    const grouped: {
      [year: string]: {
        [month: string]: {
          [day: string]: ITodo[]
        }
      }
    } = {};

    // 按有截止日期和无截止日期分组
    const withDueDate = todoList.filter(todo => todo.dueDate);
    const withoutDueDate = todoList.filter(todo => !todo.dueDate);

    // 对有截止日期的任务按年月日分组
    withDueDate.forEach(todo => {
      const dueDate = new Date(todo.dueDate!);
      const year = dueDate.getFullYear().toString();
      const month = (dueDate.getMonth() + 1).toString().padStart(2, '0');
      const day = dueDate.getDate().toString().padStart(2, '0');

      if (!grouped[year]) {
        grouped[year] = {};
      }

      if (!grouped[year][month]) {
        grouped[year][month] = {};
      }

      if (!grouped[year][month][day]) {
        grouped[year][month][day] = [];
      }

      grouped[year][month][day].push(todo);
    });

    // 对无截止日期的任务，放在特殊分组
    if (withoutDueDate.length > 0) {
      if (!grouped['无截止日期']) {
        grouped['无截止日期'] = {};
      }

      if (!grouped['无截止日期']['00']) {
        grouped['无截止日期']['00'] = {};
      }

      if (!grouped['无截止日期']['00']['00']) {
        grouped['无截止日期']['00']['00'] = [];
      }

      withoutDueDate.forEach(todo => {
        grouped['无截止日期']['00']['00'].push(todo);
      });
    }

    // 对每个日期分组内的任务按状态和优先级排序
    Object.keys(grouped).forEach(year => {
      Object.keys(grouped[year]).forEach(month => {
        Object.keys(grouped[year][month]).forEach(day => {
          grouped[year][month][day].sort((a, b) => {
            // 先按状态排序：未完成的排在前面
            if (a.status !== b.status) {
              if (a.status === TodoStatus.COMPLETED) return 1;
              if (b.status === TodoStatus.COMPLETED) return -1;
            }

            // 再按优先级排序：高优先级排在前面
            return (b.priority || 3) - (a.priority || 3);
          });
        });
      });
    });

    setTimelineTodos(grouped);
  };

  // 获取统计信息
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await todosBusiness.getTodoStats();
      setStats(statsData);
    } catch (error) {
      console.error("获取统计信息失败:", error);
    }
  }, []);

  // 获取项目需求列表
  const fetchProjectRequirements = useCallback(async () => {
    try {
      const requirements = await projectRequirementsBusiness.getProjectRequirements();
      setProjectRequirements(requirements);
    } catch (error) {
      console.error("获取项目需求失败:", error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos, activeTab]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchProjectRequirements();
  }, [fetchProjectRequirements]);

  // 处理状态变更
  const handleStatusChange = async (id: string, status: TodoStatus) => {
    try {
      await todosBusiness.updateTodo(id, { status });
      message.success("状态更新成功");
      fetchTodos();
      fetchStats();
      setDailyTodoRefresh(prev => prev + 1);
    } catch (error) {
      message.error("状态更新失败: " + error);
    }
  };

  // 处理每日Todo状态变更
  const handleDailyTodoStatusChange = async (id: string, status: TodoStatus) => {
    try {
      await todosBusiness.updateTodo(id, { status });
      message.success("状态更新成功");
      // 重新获取数据以更新所有相关显示
      fetchTodos();
      fetchStats();
      // 触发每日Todo模块刷新
      setDailyTodoRefresh(prev => prev + 1);
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
      setDailyTodoRefresh(prev => prev + 1);
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
        projectId: values.projectId || undefined,
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
      setDailyTodoRefresh(prev => prev + 1);
    } catch (error) {
      message.error("创建失败: " + error);
    }
  };

  // 处理编辑 Todo
  const handleEditTodo = (todo: ITodo) => {
    setCurrentTodo(todo);
    editForm.setFieldsValue({
      title: todo.title,
      description: todo.description,
      projectId: todo.projectId,
      priority: todo.priority || 3,
      dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined,
      status: todo.status
    });
    setIsEditModalOpen(true);
  };

  // 处理更新 Todo
  const handleUpdateTodo = async (values: any) => {
    try {
      if (!currentTodo?._id) return;

      const todoData = {
        title: values.title,
        description: values.description,
        status: values.status,
        projectId: values.projectId || undefined,
        priority: values.priority || 3,
        ...(values.dueDate && { dueDate: values.dueDate.toDate() }),
      };

      await todosBusiness.updateTodo(currentTodo._id, todoData);
      message.success("更新成功");
      setIsEditModalOpen(false);
      fetchTodos();
      fetchStats();
      setDailyTodoRefresh(prev => prev + 1);
    } catch (error) {
      message.error("更新失败: " + error);
    }
  };

  // 获取项目列表（从项目需求中获取）
  const availableProjects = projectRequirements;

  return (
    <main className="flex h-screen w-full box-border bg-white">
      {/* 左侧导航 */}
      <div className="w-64 border-r border-gray-200 h-full flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-800">待办事项</h1>
          <p className="text-sm text-gray-500 mt-1">管理您的任务和项目</p>
        </div>

        {/* 分类列表 - 美化版 */}
        <div className="py-4 px-3">
          <h3 className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">视图</h3>
          <div className="space-y-2">
            <div
              className={`group relative flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${activeTab === 'daily'
                ? 'bg-white shadow-md border border-gray-300 text-gray-800'
                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              onClick={() => setActiveTab('daily')}
            >
              <div className={`relative p-2 rounded-lg transition-all duration-200 ${activeTab === 'daily'
                ? 'bg-gray-800 shadow-sm'
                : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                <Sun size={16} className={activeTab === 'daily' ? 'text-white' : 'text-gray-600'} />
              </div>
              <span className="text-sm font-medium">今日待办</span>
              {activeTab === 'daily' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-800 rounded-r"></div>
              )}
            </div>

            <div
              className={`group relative flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${activeTab === 'all'
                ? 'bg-white shadow-md border border-gray-300 text-gray-800'
                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              onClick={() => setActiveTab('all')}
            >
              <div className={`relative p-2 rounded-lg transition-all duration-200 ${activeTab === 'all'
                ? 'bg-gray-700 shadow-sm'
                : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                <List size={16} className={activeTab === 'all' ? 'text-white' : 'text-gray-600'} />
              </div>
              <span className="text-sm font-medium">全部任务</span>
              {activeTab === 'all' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-700 rounded-r"></div>
              )}
            </div>

            <div
              className={`group relative flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${activeTab === 'timeline'
                ? 'bg-white shadow-md border border-gray-300 text-gray-800'
                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              onClick={() => {
                setActiveTab('timeline');
                // 切换到时间线视图时，重新获取数据
                if (activeTab !== 'timeline') {
                  fetchTodos();
                }
              }}
            >
              <div className={`relative p-2 rounded-lg transition-all duration-200 ${activeTab === 'timeline'
                ? 'bg-gray-600 shadow-sm'
                : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                <BarChart size={16} className={activeTab === 'timeline' ? 'text-white' : 'text-gray-600'} />
              </div>
              <span className="text-sm font-medium">时间线</span>
              {activeTab === 'timeline' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-600 rounded-r"></div>
              )}
            </div>
          </div>
        </div>

        {/* 统计信息 - 美化版 */}
        {stats && (
          <div className="px-4 py-4 mt-2 border-t border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">统计信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-sm text-gray-600">总任务</span>
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
                  <span className="text-sm text-gray-600">逾期</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{stats.overdue}</span>
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
            {activeTab === 'daily' ? '今日待办' : activeTab === 'timeline' ? '时间线视图' : '全部任务'}
          </h2>
          <Button
            type="default"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus size={16} />}
          >
            新建任务
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 今日Todo模块 - 仅在daily tab下显示 */}
          {activeTab === 'daily' && (
            <DailyTodoModule
              onStatusChange={handleDailyTodoStatusChange}
              onEdit={handleEditTodo}
              refreshTrigger={dailyTodoRefresh}
              projectRequirements={projectRequirements}
            />
          )}

          {/* 全部任务 - 仅在all tab下显示 */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {/* 筛选器 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Filter size={16} className="text-gray-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">筛选条件</span>
                  </div>

                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Select
                      value={selectedProject}
                      onChange={setSelectedProject}
                      style={{ width: 200 }}
                      placeholder="选择项目"
                      className="rounded-lg"
                    >
                      <Select.Option value="all">所有项目</Select.Option>
                      {availableProjects.map(project => (
                        <Select.Option key={project._id} value={project._id!}>
                          {project.title}
                        </Select.Option>
                      ))}
                    </Select>

                    <Select
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      style={{ width: 200 }}
                      placeholder="选择状态"
                      className="rounded-lg"
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
              </div>

              {/* Todo 列表 - 按时间分组 */}
              {loading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, index) => (
                    <TodoSkeleton key={`skeleton-${index}`} />
                  ))}
                </div>
              ) : todos.length > 0 ? (
                <div className="space-y-6">
                  {/* 逾期任务 */}
                  {timeGroupedTodos.overdue.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-5 bg-gray-700 rounded-full"></div>
                        <h3 className="text-sm font-medium text-gray-700">逾期任务 ({timeGroupedTodos.overdue.length})</h3>
                      </div>
                      <div className="space-y-3">
                        {timeGroupedTodos.overdue.map((todo) => (
                          <TodoItem
                            key={todo._id}
                            todo={todo}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            onEdit={handleEditTodo}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 今日任务 */}
                  {timeGroupedTodos.today.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-5 bg-gray-600 rounded-full"></div>
                        <h3 className="text-sm font-medium text-gray-700">今日任务 ({timeGroupedTodos.today.length})</h3>
                      </div>
                      <div className="space-y-3">
                        {timeGroupedTodos.today.map((todo) => (
                          <TodoItem
                            key={todo._id}
                            todo={todo}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            onEdit={handleEditTodo}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 本周任务 */}
                  {timeGroupedTodos.thisWeek.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-5 bg-gray-500 rounded-full"></div>
                        <h3 className="text-sm font-medium text-gray-700">本周任务 ({timeGroupedTodos.thisWeek.length})</h3>
                      </div>
                      <div className="space-y-3">
                        {timeGroupedTodos.thisWeek.map((todo) => (
                          <TodoItem
                            key={todo._id}
                            todo={todo}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            onEdit={handleEditTodo}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 未来任务 */}
                  {timeGroupedTodos.future.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
                        <h3 className="text-sm font-medium text-gray-700">未来任务 ({timeGroupedTodos.future.length})</h3>
                      </div>
                      <div className="space-y-3">
                        {timeGroupedTodos.future.map((todo) => (
                          <TodoItem
                            key={todo._id}
                            todo={todo}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            onEdit={handleEditTodo}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 无截止日期 */}
                  {timeGroupedTodos.noDate.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-5 bg-gray-300 rounded-full"></div>
                        <h3 className="text-sm font-medium text-gray-700">无截止日期 ({timeGroupedTodos.noDate.length})</h3>
                      </div>
                      <div className="space-y-3">
                        {timeGroupedTodos.noDate.map((todo) => (
                          <TodoItem
                            key={todo._id}
                            todo={todo}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            onEdit={handleEditTodo}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckSquare size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无待办事项</h3>
                      <p className="text-gray-500 mb-6">创建您的第一个任务开始管理工作吧！</p>
                      <Button
                        type="primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={<Plus size={16} />}
                        className="bg-gray-800 hover:bg-gray-900 border-gray-800 hover:border-gray-900"
                      >
                        创建任务
                      </Button>
                </div>
              )}
            </div>
          )}

          {/* 时间线视图 - 仅在timeline tab下显示 */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* 筛选器 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Filter size={16} className="text-gray-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">筛选条件</span>
                  </div>

                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Select
                      value={selectedProject}
                      onChange={setSelectedProject}
                      style={{ width: 200 }}
                      placeholder="选择项目"
                      className="rounded-lg"
                    >
                      <Select.Option value="all">所有项目</Select.Option>
                      {availableProjects.map(project => (
                        <Select.Option key={project._id} value={project._id!}>
                          {project.title}
                        </Select.Option>
                      ))}
                    </Select>

                    <Select
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      style={{ width: 200 }}
                      placeholder="选择状态"
                      className="rounded-lg"
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
              ) : Object.keys(timelineTodos).length > 0 ? (
                <div className="space-y-8">
                  {Object.keys(timelineTodos).sort((a, b) => {
                    // 将"无截止日期"排在最后
                    if (a === '无截止日期') return 1;
                    if (b === '无截止日期') return -1;
                    // 其他按年份倒序排列
                    return parseInt(b) - parseInt(a);
                  }).map(year => (
                    <div key={year} className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                        {year === '无截止日期' ? '无截止日期' : `${year}年`}
                      </h3>

                      {Object.keys(timelineTodos[year]).sort((a, b) => {
                        if (a === '00') return 1;
                        if (b === '00') return -1;
                        return parseInt(b) - parseInt(a);
                      }).map(month => (
                        <div key={`${year}-${month}`} className="ml-4 space-y-4">
                          {month !== '00' && (
                            <h4 className="text-md font-medium text-gray-600">
                              {month}月
                            </h4>
                          )}

                          {Object.keys(timelineTodos[year][month]).sort((a, b) => {
                            if (a === '00') return 1;
                            if (b === '00') return -1;
                            return parseInt(b) - parseInt(a);
                          }).map(day => (
                            <div key={`${year}-${month}-${day}`} className="ml-4">
                              {day !== '00' && (
                                <h5 className="text-sm font-medium text-gray-500 mb-2">
                                  {day}日 ({timelineTodos[year][month][day].length}项)
                                </h5>
                              )}

                              <div className="space-y-0">
                                {timelineTodos[year][month][day].map(todo => (
                                  <TimelineTaskItem
                                    key={todo._id}
                                    todo={todo}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleEditTodo}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckSquare size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无待办事项</h3>
                      <p className="text-gray-500 mb-6">创建您的第一个任务开始管理工作吧！</p>
                      <Button
                        type="primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={<Plus size={16} />}
                        className="bg-gray-800 hover:bg-gray-900 border-gray-800 hover:border-gray-900"
                      >
                        创建任务
                      </Button>
                </div>
              )}
            </div>
          )}
        </div>
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
            <Select placeholder="选择所属项目（可选）" allowClear>
              {projectRequirements.map((requirement) => (
                <Select.Option key={requirement._id} value={requirement._id}>
                  {requirement.title}
                </Select.Option>
              ))}
            </Select>
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

      {/* 编辑 Todo 模态框 */}
      <Modal
        title="编辑任务"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setCurrentTodo(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateTodo}
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
            name="status"
            label="任务状态"
            rules={[{ required: true, message: '请选择任务状态' }]}
          >
            <Select placeholder="选择任务状态">
              {Object.entries(statusConfig).map(([status, config]) => (
                <Select.Option key={status} value={status}>
                  {config.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="projectId"
            label="所属项目"
          >
            <Select placeholder="选择所属项目（可选）" allowClear>
              {projectRequirements.map((requirement) => (
                <Select.Option key={requirement._id} value={requirement._id}>
                  {requirement.title}
                </Select.Option>
              ))}
            </Select>
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
                setIsEditModalOpen(false);
                setCurrentTodo(null);
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新任务
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
} 