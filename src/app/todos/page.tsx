"use client";

import { useState, useEffect, useCallback } from "react";
import { message, Button } from "antd";
import { Plus } from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { todosBusiness } from "../business/todos";
import { IProjectRequirements } from "@/app/model/types/project-requirements";
import { projectRequirementsBusiness } from "../business/project-requirements";


import { DailyTodoModule } from "./components/DailyTodoModule";
import { CreateTodoModal } from "./components/CreateTodoModal";
import { EditTodoModal } from "./components/EditTodoModal";
import { TodoSidebar } from "./components/TodoSidebar";
import { AllTodosTab } from "./components/AllTodosTab";
import { TimelineTab } from "./components/TimelineTab";

export default function TodosPage() {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<ITodo | null>(null);
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



  const handleTimelineClick = () => {
    setActiveTab('timeline');
    // 切换到时间线视图时，重新获取数据
    if (activeTab !== 'timeline') {
      fetchTodos();
    }
  };

  return (
    <main className="flex h-screen w-full box-border bg-white">
      {/* 左侧导航 */}
      <TodoSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
        onTimelineClick={handleTimelineClick}
      />

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
            <AllTodosTab
              loading={loading}
              todos={todos}
              timeGroupedTodos={timeGroupedTodos}
              selectedProject={selectedProject}
              selectedStatus={selectedStatus}
              projectRequirements={projectRequirements}
              onProjectChange={setSelectedProject}
              onStatusChange={setSelectedStatus}
              onTodoStatusChange={handleStatusChange}
              onTodoDelete={handleDelete}
              onTodoEdit={handleEditTodo}
              onCreateClick={() => setIsCreateModalOpen(true)}
            />
          )}

          {/* 时间线视图 - 仅在timeline tab下显示 */}
          {activeTab === 'timeline' && (
            <TimelineTab
              loading={loading}
              timelineTodos={timelineTodos}
              selectedProject={selectedProject}
              selectedStatus={selectedStatus}
              projectRequirements={projectRequirements}
              onProjectChange={setSelectedProject}
              onStatusChange={setSelectedStatus}
              onTodoStatusChange={handleStatusChange}
              onTodoEdit={handleEditTodo}
              onCreateClick={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* 弹窗组件 */}
      <CreateTodoModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTodo}
        projectRequirements={projectRequirements}
      />

      <EditTodoModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setCurrentTodo(null);
        }}
        onSubmit={handleUpdateTodo}
        todo={currentTodo}
        projectRequirements={projectRequirements}
      />
    </main>
  );
} 