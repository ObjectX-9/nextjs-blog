import { request } from "@/utils/request";
import { ITodo, TodoStatus } from "../model/todo";

interface GetTodosParams {
  projectId?: string;
  status?: TodoStatus;
  includeSubTasks?: boolean;
  priority?: number;
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
}

interface TodoStats {
  total: number;
  byStatus: Record<TodoStatus, number>;
  byPriority: Record<number, number>;
  overdue: number;
  dueToday: number;
  dueSoon: number; // 7天内到期
  completed: number;
  completionRate: number;
}

interface ProjectTodoStats {
  projectId: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

class TodosBusiness {
  /**
   * 获取 Todo 列表
   */
  async getTodos(params?: GetTodosParams): Promise<ITodo[]> {
    const queryParams: Record<string, string> = {};

    if (params?.projectId) {
      queryParams.projectId = params.projectId;
    }

    if (params?.status) {
      queryParams.status = params.status;
    }

    if (params?.includeSubTasks) {
      queryParams.includeSubTasks = 'true';
    }

    const response = await request.get<{ todos: ITodo[] }>('todos', queryParams);

    let todos = response.data.todos;

    // 客户端过滤（API 不支持的复杂筛选）
    if (params?.priority) {
      todos = todos.filter(todo => todo.priority === params.priority);
    }

    if (params?.dueDateRange) {
      todos = todos.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        const { start, end } = params.dueDateRange!;

        if (start && dueDate < start) return false;
        if (end && dueDate > end) return false;
        return true;
      });
    }

    return todos;
  }

  /**
   * 获取单个 Todo
   */
  async getTodo(id: string): Promise<ITodo> {
    const response = await request.get<{ todo: ITodo }>(`todos/${id}`);
    return response.data.todo;
  }

  /**
   * 创建新 Todo
   */
  async createTodo(todo: Omit<ITodo, '_id' | 'createdAt' | 'updatedAt'>): Promise<ITodo> {
    const response = await request.post<{ todo: ITodo }>('todos', todo);
    return response.data.todo;
  }

  /**
   * 更新 Todo
   */
  async updateTodo(id: string, todo: Partial<ITodo>): Promise<ITodo> {
    const response = await request.put<{ todo: ITodo }>(`todos/${id}`, { _id: id, ...todo });
    return response.data.todo;
  }

  /**
   * 删除 Todo
   */
  async deleteTodo(id: string): Promise<void> {
    await request.delete<{ message: string }>(`todos/${id}`);
  }

  /**
   * 获取子任务列表
   */
  async getSubTasks(parentId: string): Promise<ITodo[]> {
    const response = await request.get<{ subTasks: ITodo[] }>(`todos/${parentId}/subtasks`);
    return response.data.subTasks;
  }

  /**
   * 为任务添加子任务
   */
  async addSubTask(parentId: string, subTask: Omit<ITodo, '_id' | 'createdAt' | 'updatedAt' | 'projectId'>): Promise<ITodo> {
    const response = await request.post<{ subTask: ITodo }>(`todos/${parentId}/subtasks`, subTask);
    return response.data.subTask;
  }

  /**
   * 删除子任务
   */
  async removeSubTask(parentId: string, subTaskId: string): Promise<void> {
    await request.delete<{ message: string }>(`todos/${parentId}/subtasks?subTaskId=${subTaskId}`);
  }

  /**
   * 批量更新 Todo 状态
   */
  async batchUpdateStatus(todoIds: string[], status: TodoStatus): Promise<ITodo[]> {
    const updatedTodos: ITodo[] = [];

    for (const id of todoIds) {
      try {
        const updatedTodo = await this.updateTodo(id, { status });
        updatedTodos.push(updatedTodo);
      } catch (error) {
        console.error(`Failed to update todo ${id}:`, error);
      }
    }

    return updatedTodos;
  }

  /**
   * 批量删除 Todo
   */
  async batchDeleteTodos(todoIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const id of todoIds) {
      try {
        await this.deleteTodo(id);
        success.push(id);
      } catch (error) {
        console.error(`Failed to delete todo ${id}:`, error);
        failed.push(id);
      }
    }

    return { success, failed };
  }

  /**
   * 搜索 Todo
   */
  async searchTodos(keyword: string, projectId?: string): Promise<ITodo[]> {
    const params: GetTodosParams = { includeSubTasks: true };
    if (projectId) {
      params.projectId = projectId;
    }

    const allTodos = await this.getTodos(params);

    if (!keyword.trim()) {
      return allTodos;
    }

    const lowerKeyword = keyword.toLowerCase();
    return allTodos.filter(todo =>
      todo.title.toLowerCase().includes(lowerKeyword) ||
      todo.description.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 获取项目的 Todo 列表
   */
  async getProjectTodos(projectId: string, includeSubTasks = false): Promise<ITodo[]> {
    return this.getTodos({ projectId, includeSubTasks });
  }

  /**
   * 获取逾期的 Todo
   */
  async getOverdueTodos(projectId?: string): Promise<ITodo[]> {
    const params: GetTodosParams = { includeSubTasks: false };
    if (projectId) {
      params.projectId = projectId;
    }

    const todos = await this.getTodos(params);
    const now = new Date();

    return todos.filter(todo =>
      todo.dueDate &&
      new Date(todo.dueDate) < now &&
      todo.status !== TodoStatus.COMPLETED &&
      todo.status !== TodoStatus.CANCELLED
    );
  }

  /**
   * 获取今天到期的 Todo
   */
  async getTodayDueTodos(projectId?: string): Promise<ITodo[]> {
    const params: GetTodosParams = { includeSubTasks: false };
    if (projectId) {
      params.projectId = projectId;
    }

    const todos = await this.getTodos(params);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  }

  /**
   * 获取即将到期的 Todo（7天内）
   */
  async getUpcomingTodos(projectId?: string, days = 7): Promise<ITodo[]> {
    const params: GetTodosParams = { includeSubTasks: false };
    if (projectId) {
      params.projectId = projectId;
    }

    const todos = await this.getTodos(params);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate >= now && dueDate <= futureDate &&
        todo.status !== TodoStatus.COMPLETED &&
        todo.status !== TodoStatus.CANCELLED;
    });
  }

  /**
   * 获取 Todo 统计信息
   */
  async getTodoStats(projectId?: string): Promise<TodoStats> {
    const todos = await this.getTodos({ projectId, includeSubTasks: false });

    const stats: TodoStats = {
      total: todos.length,
      byStatus: {
        [TodoStatus.TODO]: 0,
        [TodoStatus.IN_PROGRESS]: 0,
        [TodoStatus.COMPLETED]: 0,
        [TodoStatus.DELAYED]: 0,
        [TodoStatus.CANCELLED]: 0,
        [TodoStatus.DELETED]: 0,
        [TodoStatus.ARCHIVED]: 0,
      },
      byPriority: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      overdue: 0,
      dueToday: 0,
      dueSoon: 0,
      completed: 0,
      completionRate: 0,
    };

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);

    todos.forEach(todo => {
      // 状态统计
      stats.byStatus[todo.status]++;

      // 优先级统计
      const priority = todo.priority || 3;
      stats.byPriority[priority]++;

      // 日期相关统计
      if (todo.dueDate) {
        const dueDate = new Date(todo.dueDate);

        // 逾期
        if (dueDate < now && todo.status !== TodoStatus.COMPLETED && todo.status !== TodoStatus.CANCELLED) {
          stats.overdue++;
        }

        // 今天到期
        if (dueDate >= today && dueDate < tomorrow) {
          stats.dueToday++;
        }

        // 即将到期（7天内）
        if (dueDate >= now && dueDate <= weekLater &&
          todo.status !== TodoStatus.COMPLETED && todo.status !== TodoStatus.CANCELLED) {
          stats.dueSoon++;
        }
      }
    });

    stats.completed = stats.byStatus[TodoStatus.COMPLETED];
    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }

  /**
   * 获取所有项目的 Todo 统计
   */
  async getProjectsStats(): Promise<ProjectTodoStats[]> {
    const allTodos = await this.getTodos({ includeSubTasks: false });

    // 按项目分组
    const projectsMap = new Map<string, ITodo[]>();
    allTodos.forEach(todo => {
      if (!projectsMap.has(todo.projectId!)) {
        projectsMap.set(todo.projectId!, []);
      }
      projectsMap.get(todo.projectId!)!.push(todo);
    });

    // 计算每个项目的统计
    const projectStats: ProjectTodoStats[] = [];
    projectsMap.forEach((todos, projectId) => {
      const total = todos.length;
      const completed = todos.filter(t => t.status === TodoStatus.COMPLETED).length;
      const inProgress = todos.filter(t => t.status === TodoStatus.IN_PROGRESS).length;
      const pending = todos.filter(t => t.status === TodoStatus.TODO).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      projectStats.push({
        projectId,
        total,
        completed,
        inProgress,
        pending,
        completionRate,
      });
    });

    return projectStats.sort((a, b) => b.total - a.total);
  }

  /**
   * 快速创建 Todo（使用默认值）
   */
  async quickCreateTodo(title: string, projectId: string, description = '', priority = 3): Promise<ITodo> {
    return this.createTodo({
      title,
      description,
      status: TodoStatus.TODO,
      projectId,
      priority,
      color: '#3B82F6',
    });
  }

  /**
   * 标记 Todo 为完成
   */
  async completeTodo(id: string): Promise<ITodo> {
    return this.updateTodo(id, { status: TodoStatus.COMPLETED });
  }

  /**
   * 重新开始 Todo
   */
  async restartTodo(id: string): Promise<ITodo> {
    return this.updateTodo(id, { status: TodoStatus.TODO });
  }

  /**
   * 暂停 Todo（设为延期）
   */
  async pauseTodo(id: string): Promise<ITodo> {
    return this.updateTodo(id, { status: TodoStatus.DELAYED });
  }
}

export const todosBusiness = new TodosBusiness(); 